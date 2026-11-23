import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { AuthProfileService } from '../../../../services/authProfileService';
import { PublicBillingService } from '../../../services/public-billing/public-billing.service';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';
import {
  cnpjValidator,
  cpfValidator,
  onlyDigits,
  telefoneValidator,
} from '../../../shared/validators/br-document.validators';
import {
  HolderDefaults,
  PaymentMethodFormComponent,
} from '../../../shared/payment/payment-method-form.component';
import { extractErrorMessage } from '../../../shared/payment/payment-errors';
import { CARD_BRAND_LABELS, CardBrand } from '../../../shared/payment/card-utils';
import {
  ApiPlan,
  BillingIntervalCode,
  CheckoutRequest,
  CheckoutResponse,
  CouponValidation,
  PaymentMethodCode,
} from '../../../../types/billing-api';
import { DemoDialogComponent } from '../demo-dialog/demo-dialog.component';

type SelfServicePlan = 'START' | 'BUSINESS' | 'PRO';

/** Campos usados da resposta do BrasilAPI (CNPJ v1). */
interface BrasilApiCnpj {
  razao_social?: string;
  nome_fantasia?: string;
  ddd_telefone_1?: string;
  email?: string | null;
}

const TRIAL_DAYS = 14;
const LEGAL_VERSION = '2026-11';

const METHOD_LABELS: Record<PaymentMethodCode, string> = {
  CREDIT_CARD: 'Cartão de crédito',
  PIX: 'Pix',
  BOLETO: 'Boleto bancário',
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    InputMaskDirective,
    PaymentMethodFormComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private billing = inject(PublicBillingService);
  private authProfile = inject(AuthProfileService);
  private destroyRef = inject(DestroyRef);

  @ViewChild(PaymentMethodFormComponent) payForm?: PaymentMethodFormComponent;

  readonly trialDays = TRIAL_DAYS;
  readonly segmentos = ['Agro', 'Indústria', 'Trading', 'Serviços', 'Outros'];

  /** Planos self-service vindos da API (sem ENTERPRISE). */
  plans: ApiPlan[] = [];
  plansLoading = true;
  plansError = false;

  // Cupom
  coupon: CouponValidation | null = null;
  couponLoading = false;
  private couponCheck$ = new Subject<void>();

  // Consulta de CNPJ
  cnpjLookupLoading = false;

  // Pagamento
  metodo: PaymentMethodCode = 'CREDIT_CARD';
  holderDefaults: HolderDefaults | null = null;
  payError = '';
  submitAttempted = false;
  submitting = false;

  // Sucesso
  done = false;
  result: CheckoutResponse | null = null;
  accessing = false;
  accessError = '';

  /** Data da primeira cobrança prevista (hoje + 14 dias). */
  readonly firstChargeDate = addDays(new Date(), TRIAL_DAYS);

  empresa!: FormGroup;
  admin!: FormGroup;
  plano!: FormGroup;
  pagamento!: FormGroup;

  ngOnInit(): void {
    this.buildForms();
    this.applyQueryParams();
    this.wireCnpjLookup();
    this.wireCoupon();
    this.loadPlans();
  }

  // ---------- Formulários ----------

  private buildForms(): void {
    this.empresa = this.fb.group({
      cnpj: ['', [Validators.required, cnpjValidator()]],
      razaoSocial: ['', Validators.required],
      nomeFantasia: [''],
      telefone: ['', [Validators.required, telefoneValidator()]],
      email: ['', [Validators.required, Validators.email]],
      site: [''],
      segmento: ['', Validators.required],
    });

    this.admin = this.fb.group(
      {
        nome: ['', Validators.required],
        cpf: ['', [Validators.required, cpfValidator()]],
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', [Validators.required, telefoneValidator()]],
        senha: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
        confirmarSenha: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );

    this.plano = this.fb.group({
      interval: ['MONTHLY' as BillingIntervalCode, Validators.required],
      planCode: ['BUSINESS' as SelfServicePlan, Validators.required],
      coupon: [''],
    });

    // Apenas os aceites; os dados de pagamento ficam no PaymentMethodFormComponent.
    this.pagamento = this.fb.group({
      aceiteTermos: [false, Validators.requiredTrue],
      aceitePrivacidade: [false, Validators.requiredTrue],
      aceiteCobranca: [false, Validators.requiredTrue],
    });
  }

  private applyQueryParams(): void {
    const qp = this.route.snapshot.queryParamMap;
    const plan = qp.get('plan');
    const interval = qp.get('interval');
    const validPlans: string[] = ['START', 'BUSINESS', 'PRO'];
    if (plan && validPlans.includes(plan)) {
      this.plano.get('planCode')!.setValue(plan as SelfServicePlan);
    }
    if (interval === 'MONTHLY' || interval === 'ANNUAL') {
      this.plano.get('interval')!.setValue(interval);
    }
  }

  loadPlans(): void {
    this.plansLoading = true;
    this.plansError = false;
    this.billing
      .getPlans()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (plans) => {
          this.plans = plans.filter((p) => p.code !== 'ENTERPRISE');
          this.plansLoading = false;
          const code = this.plano.get('planCode')!.value as string;
          if (this.plans.length && !this.plans.some((p) => p.code === code)) {
            this.plano.get('planCode')!.setValue(this.plans[0].code as SelfServicePlan);
          }
          if (this.couponText) {
            this.couponCheck$.next();
          }
        },
        error: () => {
          this.plansLoading = false;
          this.plansError = true;
        },
      });
  }

  /** Ao preencher um CNPJ válido, consulta o BrasilAPI e preenche campos vazios (falhas são ignoradas). */
  private wireCnpjLookup(): void {
    this.empresa
      .get('cnpj')!
      .valueChanges.pipe(
        map((v: string | null) => onlyDigits(v)),
        distinctUntilChanged(),
        switchMap((digits) => {
          if (digits.length !== 14 || this.empresa.get('cnpj')!.invalid) {
            this.cnpjLookupLoading = false;
            return of<BrasilApiCnpj | null>(null);
          }
          this.cnpjLookupLoading = true;
          return this.http
            .get<BrasilApiCnpj>(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
            .pipe(catchError(() => of<BrasilApiCnpj | null>(null)));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => {
        this.cnpjLookupLoading = false;
        if (data) {
          this.prefillEmpresa(data);
        }
      });
  }

  private prefillEmpresa(data: BrasilApiCnpj): void {
    const fill = (name: string, value: string | null | undefined): void => {
      const c = this.empresa.get(name)!;
      const v = (value ?? '').trim();
      if (v && !c.value) {
        c.setValue(v);
      }
    };
    fill('razaoSocial', data.razao_social);
    fill('nomeFantasia', data.nome_fantasia);
    const phone = onlyDigits(data.ddd_telefone_1);
    if (phone.length === 10 || phone.length === 11) {
      fill('telefone', phone);
    }
    fill('email', data.email?.toLowerCase());
  }

  // ---------- Plano e cupom ----------

  private wireCoupon(): void {
    this.couponCheck$
      .pipe(
        switchMap(() => {
          const code = this.couponText;
          if (!code) {
            this.coupon = null;
            this.couponLoading = false;
            return of<CouponValidation | null>(null);
          }
          this.couponLoading = true;
          return this.billing.validateCoupon(code, this.planCode, this.interval).pipe(
            catchError(() =>
              of<CouponValidation>({
                valid: false,
                code,
                price: null,
                cycles: null,
                message: 'Não foi possível validar o cupom agora. Tente novamente.',
              })
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.couponLoading = false;
        this.coupon = res;
      });

    // Editar o texto invalida o resultado anterior até nova validação (blur/aplicar).
    this.plano
      .get('coupon')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.coupon = null));

    // Plano/ciclo alterados: revalida o cupom, se houver.
    for (const name of ['planCode', 'interval']) {
      this.plano
        .get(name)!
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.couponText) {
            this.coupon = null;
            this.couponCheck$.next();
          }
        });
    }
  }

  applyCoupon(): void {
    this.couponCheck$.next();
  }

  get couponText(): string {
    return ((this.plano.get('coupon')!.value as string | null) ?? '').trim().toUpperCase();
  }

  /** Cupom digitado que ainda não foi validado com sucesso impede avançar. */
  get couponBlocking(): boolean {
    return !!this.couponText && (this.couponLoading || !this.coupon?.valid);
  }

  get planCode(): SelfServicePlan {
    return this.plano.get('planCode')!.value as SelfServicePlan;
  }

  get selectedPlan(): ApiPlan | null {
    return this.plans.find((p) => p.code === this.planCode) ?? null;
  }

  get interval(): BillingIntervalCode {
    return this.plano.get('interval')!.value as BillingIntervalCode;
  }

  /** Preço cheio do plano no ciclo escolhido. */
  get fullPrice(): number {
    const p = this.selectedPlan;
    if (!p) {
      return 0;
    }
    return this.interval === 'ANNUAL' ? p.annualPrice : p.monthlyPrice;
  }

  get couponApplied(): boolean {
    return !!this.coupon?.valid && this.coupon.price !== null;
  }

  /** Valor das primeiras cobranças (promocional se houver cupom válido). */
  get effectivePrice(): number {
    return this.couponApplied ? (this.coupon!.price as number) : this.fullPrice;
  }

  get priceSuffix(): string {
    return this.interval === 'ANNUAL' ? '/ano' : '/mês';
  }

  get intervalLabel(): string {
    return this.interval === 'ANNUAL' ? 'Anual' : 'Mensal';
  }

  get metodoLabel(): string {
    return METHOD_LABELS[this.metodo];
  }

  selectPlan(code: string): void {
    this.plano.get('planCode')!.setValue(code as SelfServicePlan);
  }

  setInterval(value: BillingIntervalCode): void {
    this.plano.get('interval')!.setValue(value);
  }

  openSalesDialog(): void {
    this.dialog.open(DemoDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { origem: 'CHECKOUT' },
    });
  }

  // ---------- Pagamento ----------

  onStepChange(event: StepperSelectionEvent): void {
    if (event.selectedIndex === 3) {
      // Objeto novo só ao entrar no passo: evita reaplicar o titular a cada ciclo de detecção.
      this.holderDefaults = {
        nome: this.admin.get('nome')!.value,
        cpfCnpj: this.admin.get('cpf')!.value,
        email: this.admin.get('email')!.value,
        telefone: this.admin.get('telefone')!.value,
      };
    }
  }

  onMethodChange(m: PaymentMethodCode): void {
    this.metodo = m;
    this.payError = '';
  }

  submit(): void {
    if (this.submitting) {
      return;
    }
    this.submitAttempted = true;
    const pagamento = this.payForm?.value() ?? null;
    const plan = this.selectedPlan;
    const formsValid = this.empresa.valid && this.admin.valid && this.plano.valid && this.pagamento.valid;
    if (!formsValid || !pagamento || !plan || this.couponBlocking) {
      this.empresa.markAllAsTouched();
      this.admin.markAllAsTouched();
      this.pagamento.markAllAsTouched();
      this.payForm?.markAllAsTouched();
      this.payError = 'Revise os campos destacados antes de contratar.';
      return;
    }

    const e = this.empresa.getRawValue();
    const a = this.admin.getRawValue();
    const body: CheckoutRequest = {
      empresa: {
        cnpj: onlyDigits(e.cnpj),
        razaoSocial: (e.razaoSocial as string).trim(),
        nomeFantasia: ((e.nomeFantasia as string) ?? '').trim(),
        telefone: onlyDigits(e.telefone),
        email: (e.email as string).trim(),
        site: ((e.site as string) ?? '').trim(),
        segmento: e.segmento,
      },
      admin: {
        nome: (a.nome as string).trim(),
        cpf: onlyDigits(a.cpf),
        email: (a.email as string).trim(),
        telefone: onlyDigits(a.telefone),
        senha: a.senha,
      },
      plano: {
        planCode: this.planCode,
        interval: this.interval,
        coupon: this.coupon?.valid ? this.couponText : null,
      },
      pagamento,
      aceites: {
        termos: true,
        privacidade: true,
        cobranca: true,
        termsVersion: LEGAL_VERSION,
        privacyVersion: LEGAL_VERSION,
      },
    };

    this.submitting = true;
    this.payError = '';
    this.billing
      .checkout(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.result = res;
          this.done = true;
        },
        error: (err: unknown) => {
          // Mantém os dados nos formulários; apenas informa o erro no passo de pagamento.
          this.submitting = false;
          this.payError = extractErrorMessage(err);
        },
      });
  }

  // ---------- Sucesso ----------

  get successPlanName(): string {
    const code = this.result?.planCode ?? this.planCode;
    return this.plans.find((p) => p.code === code)?.name ?? String(code);
  }

  get successTrialEnd(): Date {
    return parseApiDate(this.result?.trialEnd) ?? this.firstChargeDate;
  }

  get successNextDue(): Date {
    return parseApiDate(this.result?.nextDueDate) ?? this.firstChargeDate;
  }

  get successPaymentLabel(): string {
    const r = this.result;
    if (!r) {
      return this.metodoLabel;
    }
    if (r.paymentMethod === 'CREDIT_CARD' && r.cardLast4) {
      const brand = r.cardBrand ? (CARD_BRAND_LABELS[r.cardBrand as CardBrand] ?? r.cardBrand) : 'Cartão';
      return `${brand} final ${r.cardLast4}`;
    }
    return METHOD_LABELS[r.paymentMethod] ?? this.metodoLabel;
  }

  accessEip(): void {
    if (this.accessing) {
      return;
    }
    this.accessing = true;
    this.accessError = '';
    this.authProfile
      .loadProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.accessing = false;
          void this.router.navigate(['/home-logged']);
        },
        error: (err: unknown) => {
          this.accessing = false;
          this.accessError = extractErrorMessage(
            err,
            'Não foi possível carregar seu perfil. Tente novamente ou faça login.'
          );
        },
      });
  }
}

// ===== Helpers e validadores (fora da classe) =====

function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** Interpreta datas da API ("yyyy-MM-dd" como data local; ISO completo normalmente). */
function parseApiDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Senha precisa conter letras e números. */
export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value as string | null) ?? '';
  if (!v) {
    return null;
  }
  return /[A-Za-z]/.test(v) && /\d/.test(v) ? null : { weakPassword: true };
}

/** Confirma que senha e confirmação coincidem. */
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('senha')?.value;
  const confirmar = group.get('confirmarSenha')?.value;
  if (confirmar && senha !== confirmar) {
    return { passwordMismatch: true };
  }
  return null;
}
