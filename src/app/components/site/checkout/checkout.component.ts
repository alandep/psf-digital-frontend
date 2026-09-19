import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import {
  SaasPlan,
  PlanCode,
  BillingInterval,
  TenantCompany,
} from '../../../../types/saas-billing';

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
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private billing = inject(SaasBillingMockService);

  plans: SaasPlan[] = this.billing.getPlans().filter((p) => p.code !== 'ENTERPRISE');
  segmentos = ['Agro', 'Indústria', 'Trading', 'Serviços', 'Outros'];

  submitting = false;
  done = false;
  activatedPlanName = '';

  empresa!: FormGroup;
  admin!: FormGroup;
  plano!: FormGroup;
  pagamento!: FormGroup;

  ngOnInit(): void {
    this.buildForms();
    this.applyQueryParams();
    this.wireCnpjAutofill();
  }

  private buildForms(): void {
    this.empresa = this.fb.group({
      cnpj: ['', [Validators.required, cnpjValidator]],
      razaoSocial: ['', Validators.required],
      nomeFantasia: [''],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      site: [''],
      segmento: ['', Validators.required],
    });

    this.admin = this.fb.group(
      {
        nome: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefone: ['', Validators.required],
        senha: ['', [Validators.required, Validators.minLength(8)]],
        confirmarSenha: ['', Validators.required],
        mfa: [false],
      },
      { validators: passwordMatchValidator }
    );

    this.plano = this.fb.group({
      interval: ['MONTHLY' as BillingInterval, Validators.required],
      planCode: ['BUSINESS' as PlanCode, Validators.required],
      coupon: [''],
    });

    this.pagamento = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardName: ['', Validators.required],
      cardExpiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      aceiteTermos: [false, Validators.requiredTrue],
      aceitePrivacidade: [false, Validators.requiredTrue],
      aceiteCobranca: [false, Validators.requiredTrue],
    });
  }

  private applyQueryParams(): void {
    const qp = this.route.snapshot.queryParamMap;
    const plan = qp.get('plan') as PlanCode | null;
    const interval = qp.get('interval') as BillingInterval | null;
    const validPlans: PlanCode[] = ['START', 'BUSINESS', 'PRO'];
    if (plan && validPlans.includes(plan)) {
      this.plano.get('planCode')!.setValue(plan);
    }
    if (interval === 'MONTHLY' || interval === 'ANNUAL') {
      this.plano.get('interval')!.setValue(interval);
    }
  }

  private wireCnpjAutofill(): void {
    this.empresa.get('cnpj')!.valueChanges.subscribe((raw: string) => {
      const formatted = formatCnpj(raw ?? '');
      if (formatted !== raw) {
        this.empresa.get('cnpj')!.setValue(formatted, { emitEvent: false });
      }
      const digits = onlyDigits(formatted);
      const razao = this.empresa.get('razaoSocial')!;
      if (digits.length === 14 && !cnpjValidator(this.empresa.get('cnpj')!) && !razao.value) {
        razao.setValue(`Empresa ${formatted} LTDA`);
      }
    });
  }

  get cnpjDuplicate(): boolean {
    return onlyDigits(this.empresa.get('cnpj')?.value ?? '') === '00000000000000';
  }

  get selectedPlan(): SaasPlan {
    const code = this.plano.get('planCode')!.value as PlanCode;
    return this.plans.find((p) => p.code === code) ?? this.plans[0];
  }

  get interval(): BillingInterval {
    return this.plano.get('interval')!.value as BillingInterval;
  }

  get founderApplies(): boolean {
    const coupon = (this.plano.get('coupon')!.value ?? '').trim().toUpperCase();
    return coupon === 'FOUNDERS2026' && this.selectedPlan.code === 'BUSINESS';
  }

  get effectivePrice(): number {
    if (this.interval === 'ANNUAL') {
      return this.selectedPlan.annualPrice;
    }
    return this.founderApplies ? 1790 : this.selectedPlan.monthlyPrice;
  }

  get priceSuffix(): string {
    return this.interval === 'ANNUAL' ? '/ano' : '/mês';
  }

  selectPlan(code: PlanCode): void {
    this.plano.get('planCode')!.setValue(code);
  }

  setInterval(value: BillingInterval): void {
    this.plano.get('interval')!.setValue(value);
  }

  get canSubmit(): boolean {
    return (
      this.empresa.valid &&
      !this.cnpjDuplicate &&
      this.admin.valid &&
      this.plano.valid &&
      this.pagamento.valid &&
      !this.submitting
    );
  }

  private deriveCardBrand(cardNumber: string): string {
    const digits = onlyDigits(cardNumber);
    if (digits.startsWith('4')) return 'Visa';
    if (digits.startsWith('5')) return 'Mastercard';
    return 'Cartão';
  }

  submit(): void {
    if (!this.canSubmit) {
      this.empresa.markAllAsTouched();
      this.admin.markAllAsTouched();
      this.plano.markAllAsTouched();
      this.pagamento.markAllAsTouched();
      return;
    }
    this.submitting = true;

    const digits = onlyDigits(this.pagamento.get('cardNumber')!.value);
    // MOCK: só brand + last4 são mantidos (tokenização simulada).
    const paymentBrand = this.deriveCardBrand(digits);
    const paymentLast4 = digits.slice(-4);

    const company: TenantCompany = {
      id: '',
      cnpj: this.empresa.get('cnpj')!.value,
      razaoSocial: this.empresa.get('razaoSocial')!.value,
      nomeFantasia: this.empresa.get('nomeFantasia')!.value,
      email: this.empresa.get('email')!.value,
      phone: this.empresa.get('telefone')!.value,
      segment: this.empresa.get('segmento')!.value,
    };

    const planCode = this.selectedPlan.code as PlanCode;
    const interval = this.interval;

    this.billing.createCheckout(company, planCode, interval).subscribe((res) => {
      const sub = res.subscription;
      sub.paymentBrand = paymentBrand;
      sub.paymentLast4 = paymentLast4;
      this.activatedPlanName = sub.planName;
      this.billing
        .acceptTerms({
          documentType: 'TERMS',
          version: '1.0',
          acceptedAt: new Date(),
          ip: 'mock-ip',
          userName: this.admin.get('nome')!.value,
        })
        .subscribe(() => {
          this.submitting = false;
          this.done = true;
        });
    });
  }
}

// ===== Helpers e validadores (fora da classe) =====

function onlyDigits(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

function formatCnpj(value: string): string {
  const d = onlyDigits(value).slice(0, 14);
  let out = d;
  if (d.length > 12) {
    out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  } else if (d.length > 8) {
    out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  } else if (d.length > 5) {
    out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  } else if (d.length > 2) {
    out = `${d.slice(0, 2)}.${d.slice(2)}`;
  }
  return out;
}

// Validação de CNPJ (14 dígitos + dígitos verificadores).
export function cnpjValidator(control: AbstractControl): ValidationErrors | null {
  const cnpj = onlyDigits(control.value ?? '');
  if (!cnpj) return null;
  if (cnpj.length !== 14) return { cnpjInvalid: true };
  if (/^(\d)\1{13}$/.test(cnpj)) return { cnpjInvalid: true };

  const calc = (base: string, weights: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, i) => acc + Number(digit) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = calc(cnpj.slice(0, 12), w1);
  const d2 = calc(cnpj.slice(0, 12) + d1, w2);

  if (d1 !== Number(cnpj[12]) || d2 !== Number(cnpj[13])) {
    return { cnpjInvalid: true };
  }
  return null;
}

// Confirma que senha e confirmação coincidem.
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('senha')?.value;
  const confirmar = group.get('confirmarSenha')?.value;
  if (confirmar && senha !== confirmar) {
    return { passwordMismatch: true };
  }
  return null;
}
