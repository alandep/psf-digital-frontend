import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { PagamentoPayload, PaymentMethodCode } from '../../../types/billing-api';
import { InputMaskDirective } from '../directives/input-mask.directive';
import { isValidCnpj, isValidCpf, onlyDigits } from '../validators/br-document.validators';
import {
  CARD_BRAND_LABELS,
  CardBrand,
  cardCvvValidator,
  cardExpiryValidator,
  cardNumberValidator,
  cepValidator,
  cvvLength,
  detectBrand,
  telefoneValidator,
  toGatewayCard
} from './card-utils';

/** Dados usados para pré-preencher o titular quando "titular igual ao administrador". */
export interface HolderDefaults {
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

/** CPF (11 dígitos) ou CNPJ (14 dígitos) válido. Erro: `cpfCnpj`. */
export function cpfCnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = onlyDigits(control.value as string | null);
    if (!v) {
      return null;
    }
    const ok = v.length === 11 ? isValidCpf(v) : v.length === 14 ? isValidCnpj(v) : false;
    return ok ? null : { cpfCnpj: true };
  };
}

const METHOD_LABELS: Record<PaymentMethodCode, string> = {
  CREDIT_CARD: 'Cartão de crédito',
  PIX: 'Pix',
  BOLETO: 'Boleto bancário'
};

/**
 * Formulário reutilizável de forma de pagamento (cartão / Pix / boleto).
 *
 * Uso:
 * ```html
 * <app-payment-method-form #pay [holderDefaults]="{nome, cpfCnpj, email, telefone}"
 *   [allowedMethods]="['CREDIT_CARD','PIX','BOLETO']" (valueChange)="onChange($event)">
 * </app-payment-method-form>
 * ```
 * ```ts
 * const pagamento = this.pay.value(); // PagamentoPayload | null (null se inválido)
 * ```
 *
 * API pública:
 * - Inputs: `allowedMethods`, `holderDefaults`, `showSavedCardOption`, `savedCardLabel`.
 * - Outputs: `valueChange` (PagamentoPayload | null a cada alteração) e `methodChange` (método escolhido).
 * - `form` (FormGroup): metodo, usarCartaoSalvo, cartao{holderName,number,expiry,ccv},
 *   titularIgualAdmin, titular{nome,cpfCnpj,email,telefone,cep,numero,complemento}.
 * - Métodos/getters: `value()`, `valid`, `markAllAsTouched()`, `usarCartaoSalvo`, `metodo`.
 *
 * Com `showSavedCardOption` e "usar cartão salvo" marcado, `value()` devolve apenas
 * `{ metodo: 'CREDIT_CARD' }` e `usarCartaoSalvo` é `true` (campo `usarCartaoSalvo` de POST /pacotes).
 * Dados de cartão nunca são persistidos nem logados por este componente.
 */
@Component({
  selector: 'app-payment-method-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    InputMaskDirective
  ],
  template: `
    <form [formGroup]="form" class="pm" (submit)="$event.preventDefault()">
      <div class="pm-title" id="pm-method-label">Forma de pagamento</div>
      <mat-radio-group formControlName="metodo" class="pm-methods" aria-labelledby="pm-method-label">
        @for (m of allowedMethods; track m) {
          <mat-radio-button [value]="m">{{ methodLabel(m) }}</mat-radio-button>
        }
      </mat-radio-group>

      @switch (metodo) {
        @case ('CREDIT_CARD') {
          @if (showSavedCardOption) {
            <mat-radio-group formControlName="usarCartaoSalvo" class="pm-saved" aria-label="Escolha do cartão">
              <mat-radio-button [value]="true">Usar {{ savedCardLabel }}</mat-radio-button>
              <mat-radio-button [value]="false">Usar outro cartão</mat-radio-button>
            </mat-radio-group>
          }

          @if (!usarCartaoSalvo) {
            <div formGroupName="cartao" class="pm-card">
              <mat-form-field appearance="outline" class="full">
                <mat-label>Número do cartão</mat-label>
                <input matInput formControlName="number" appMask="cartao" inputmode="numeric"
                       autocomplete="cc-number" placeholder="0000 0000 0000 0000" />
                @if (brandLabel) {
                  <span matSuffix class="brand-badge" aria-live="polite">{{ brandLabel }}</span>
                }
                @if (cartao.controls.number.hasError('required')) {
                  <mat-error>Informe o número do cartão</mat-error>
                } @else if (cartao.controls.number.hasError('cardNumber')) {
                  <mat-error>Número de cartão inválido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full">
                <mat-label>Nome impresso no cartão</mat-label>
                <input matInput formControlName="holderName" autocomplete="cc-name" />
                <mat-error>Informe o nome impresso no cartão</mat-error>
              </mat-form-field>

              <div class="grid-2">
                <mat-form-field appearance="outline">
                  <mat-label>Validade (MM/AA)</mat-label>
                  <input matInput formControlName="expiry" appMask="validade" inputmode="numeric"
                         autocomplete="cc-exp" placeholder="MM/AA" />
                  @if (cartao.controls.expiry.hasError('required')) {
                    <mat-error>Informe a validade</mat-error>
                  } @else {
                    <mat-error>Validade inválida ou vencida</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>CVV</mat-label>
                  <input matInput formControlName="ccv" appMask="cvv" inputmode="numeric"
                         autocomplete="cc-csc" [attr.maxlength]="cvvSize" />
                  @if (cartao.controls.ccv.hasError('required')) {
                    <mat-error>Informe o CVV</mat-error>
                  } @else {
                    <mat-error>CVV deve ter {{ cvvSize }} dígitos</mat-error>
                  }
                </mat-form-field>
              </div>
            </div>

            <mat-checkbox formControlName="titularIgualAdmin" color="primary" class="pm-same">
              O titular do cartão é o administrador da conta
            </mat-checkbox>

            <div formGroupName="titular" class="pm-holder">
              @if (showHolderFields) {
                <div class="grid-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Nome do titular</mat-label>
                    <input matInput formControlName="nome" autocomplete="name" />
                    <mat-error>Informe o nome do titular</mat-error>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>CPF ou CNPJ do titular</mat-label>
                    <input matInput formControlName="cpfCnpj" inputmode="numeric" maxlength="18" />
                    @if (titular.controls.cpfCnpj.hasError('required')) {
                      <mat-error>Informe o CPF ou CNPJ</mat-error>
                    } @else {
                      <mat-error>CPF ou CNPJ inválido</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>E-mail do titular</mat-label>
                    <input matInput formControlName="email" type="email" autocomplete="email" />
                    @if (titular.controls.email.hasError('required')) {
                      <mat-error>Informe o e-mail</mat-error>
                    } @else {
                      <mat-error>E-mail inválido</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Telefone do titular</mat-label>
                    <input matInput formControlName="telefone" appMask="telefone" inputmode="numeric"
                           autocomplete="tel" placeholder="(00) 00000-0000" />
                    @if (titular.controls.telefone.hasError('required')) {
                      <mat-error>Informe o telefone</mat-error>
                    } @else {
                      <mat-error>Telefone inválido</mat-error>
                    }
                  </mat-form-field>
                </div>
              }
              <div class="grid-2">
                <mat-form-field appearance="outline">
                  <mat-label>CEP</mat-label>
                  <input matInput formControlName="cep" appMask="cep" inputmode="numeric"
                         autocomplete="postal-code" placeholder="00000-000" />
                  @if (endereco) {
                    <mat-hint>{{ endereco }}</mat-hint>
                  }
                  @if (titular.controls.cep.hasError('required')) {
                    <mat-error>Informe o CEP</mat-error>
                  } @else {
                    <mat-error>CEP inválido</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Número</mat-label>
                  <input matInput formControlName="numero" />
                  <mat-error>Informe o número do endereço</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline" class="span-2">
                  <mat-label>Complemento (opcional)</mat-label>
                  <input matInput formControlName="complemento" />
                </mat-form-field>
              </div>
            </div>
          }

          <p class="pm-note">
            <mat-icon aria-hidden="true">lock</mat-icon>
            Seus dados de cartão são processados de forma segura e tokenizada. O EIP não armazena o número do seu cartão.
          </p>
        }
        @case ('PIX') {
          <p class="pm-note">
            <mat-icon aria-hidden="true">qr_code_2</mat-icon>
            O QR Code Pix é gerado em cada fatura. Basta pagar pelo app do seu banco; a confirmação é imediata.
          </p>
        }
        @case ('BOLETO') {
          <p class="pm-note">
            <mat-icon aria-hidden="true">receipt_long</mat-icon>
            O boleto é emitido a cada fatura, com vencimento na data da cobrança. A compensação pode levar até 3 dias úteis.
          </p>
        }
      }
    </form>
  `,
  styles: [
    `
      :host { display: block; }
      .pm-title { font-weight: 600; margin-bottom: 8px; }
      .pm-methods, .pm-saved { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-bottom: 12px; }
      .full { width: 100%; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
      .span-2 { grid-column: 1 / -1; }
      .pm-same { display: block; margin: 4px 0 12px; }
      .brand-badge { font-size: 0.75rem; font-weight: 700; color: #1565c0; padding-right: 8px; white-space: nowrap; }
      .pm-note { display: flex; gap: 8px; align-items: flex-start; font-size: 0.85rem; color: #6b7280; line-height: 1.4; margin: 8px 0 0; }
      .pm-note mat-icon { color: #1976d2; font-size: 18px; width: 18px; height: 18px; flex: none; }
      @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
    `
  ]
})
export class PaymentMethodFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  /** Métodos exibidos. O primeiro é selecionado se o atual não for permitido. */
  @Input() allowedMethods: PaymentMethodCode[] = ['CREDIT_CARD', 'PIX', 'BOLETO'];
  /** Dados do administrador usados quando "titular igual ao administrador" está marcado. */
  @Input() holderDefaults: HolderDefaults | null = null;
  /** Mostra a opção de usar o cartão já salvo (telas logadas). */
  @Input() showSavedCardOption = false;
  /** Descrição do cartão salvo, ex.: "Visa final 4242". */
  @Input() savedCardLabel = 'cartão salvo';
  /** Emite o payload atual (ou null se inválido) a cada alteração. */
  @Output() valueChange = new EventEmitter<PagamentoPayload | null>();
  /** Emite o método selecionado sempre que ele muda (útil para resumos de pedido). */
  @Output() methodChange = new EventEmitter<PaymentMethodCode>();

  /** Resumo do endereço retornado pelo ViaCEP (informativo). */
  endereco = '';

  readonly form = this.fb.group({
    metodo: this.fb.nonNullable.control<PaymentMethodCode>('CREDIT_CARD', Validators.required),
    usarCartaoSalvo: this.fb.nonNullable.control(false),
    cartao: this.fb.nonNullable.group({
      holderName: ['', Validators.required],
      number: ['', [Validators.required, cardNumberValidator()]],
      expiry: ['', [Validators.required, cardExpiryValidator()]],
      ccv: ['', [Validators.required, cardCvvValidator(() => this.brand)]]
    }),
    titularIgualAdmin: this.fb.nonNullable.control(true),
    titular: this.fb.nonNullable.group({
      nome: ['', Validators.required],
      cpfCnpj: ['', [Validators.required, cpfCnpjValidator()]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, telefoneValidator()]],
      cep: ['', [Validators.required, cepValidator()]],
      numero: ['', Validators.required],
      complemento: ['']
    })
  });

  constructor() {
    const f = this.form.controls;

    f.metodo.valueChanges.pipe(takeUntilDestroyed()).subscribe((m) => {
      this.updateEnabled();
      this.methodChange.emit(m);
    });
    f.usarCartaoSalvo.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.updateEnabled());
    f.titularIgualAdmin.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.syncHolder());

    // O tamanho do CVV depende da bandeira.
    this.cartao.controls.number.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cartao.controls.ccv.updateValueAndValidity({ emitEvent: false }));

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.valueChange.emit(this.value()));

    // Consulta de CEP (apenas informativa; falhas são ignoradas).
    this.titular.controls.cep.valueChanges
      .pipe(
        map((v) => onlyDigits(v)),
        distinctUntilChanged(),
        switchMap((digits) => {
          if (digits.length !== 8) {
            return of<ViaCepResponse | null>(null);
          }
          return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${digits}/json/`).pipe(
            map((r) => (r.erro ? null : r)),
            catchError(() => of<ViaCepResponse | null>(null))
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((r) => {
        this.endereco = r
          ? [r.logradouro, r.bairro, r.localidade && r.uf ? `${r.localidade}/${r.uf}` : r.localidade]
              .filter((p): p is string => !!p)
              .join(', ')
          : '';
      });

    this.updateEnabled();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allowedMethods'] && this.allowedMethods.length && !this.allowedMethods.includes(this.metodo)) {
      this.form.controls.metodo.setValue(this.allowedMethods[0]);
    }
    if (changes['showSavedCardOption'] && !this.showSavedCardOption && this.usarCartaoSalvo) {
      this.form.controls.usarCartaoSalvo.setValue(false);
    }
    if (changes['holderDefaults']) {
      this.syncHolder();
    }
  }

  // ---------- Estado público ----------

  get cartao() {
    return this.form.controls.cartao;
  }

  get titular() {
    return this.form.controls.titular;
  }

  get metodo(): PaymentMethodCode {
    return this.form.controls.metodo.value;
  }

  get usarCartaoSalvo(): boolean {
    return this.metodo === 'CREDIT_CARD' && this.showSavedCardOption && this.form.controls.usarCartaoSalvo.value;
  }

  get valid(): boolean {
    return this.form.valid;
  }

  /** Bandeira detectada pelo número digitado. */
  get brand(): CardBrand | null {
    return detectBrand(this.cartao.controls.number.value);
  }

  get brandLabel(): string {
    const b = this.brand;
    return b ? CARD_BRAND_LABELS[b] : '';
  }

  get cvvSize(): number {
    return cvvLength(this.brand);
  }

  /** Exibe os campos do titular quando não é o administrador ou quando os dados dele estão incompletos. */
  get showHolderFields(): boolean {
    if (!this.form.controls.titularIgualAdmin.value) {
      return true;
    }
    const t = this.titular.controls;
    return t.nome.invalid || t.cpfCnpj.invalid || t.email.invalid || t.telefone.invalid;
  }

  methodLabel(m: PaymentMethodCode): string {
    return METHOD_LABELS[m];
  }

  /** Marca todos os campos como tocados para exibir as mensagens de erro. */
  markAllAsTouched(): void {
    this.form.markAllAsTouched();
  }

  /** Objeto `pagamento` do contrato, ou null se o formulário for inválido. */
  value(): PagamentoPayload | null {
    if (this.form.invalid) {
      return null;
    }
    const metodo = this.metodo;
    if (metodo !== 'CREDIT_CARD' || this.usarCartaoSalvo) {
      return { metodo };
    }
    const t = this.titular.getRawValue();
    return {
      metodo,
      cartao: toGatewayCard(this.cartao.getRawValue()),
      titular: {
        nome: t.nome.trim(),
        cpfCnpj: onlyDigits(t.cpfCnpj),
        email: t.email.trim(),
        telefone: onlyDigits(t.telefone),
        cep: onlyDigits(t.cep),
        numero: t.numero.trim(),
        complemento: t.complemento.trim() || undefined
      }
    };
  }

  // ---------- Internos ----------

  private updateEnabled(): void {
    const needsCard = this.metodo === 'CREDIT_CARD' && !this.usarCartaoSalvo;
    for (const group of [this.cartao, this.titular]) {
      if (needsCard && group.disabled) {
        group.enable({ emitEvent: false });
      } else if (!needsCard && group.enabled) {
        group.disable({ emitEvent: false });
      }
    }
    if (needsCard) {
      this.syncHolder();
    }
    this.valueChange.emit(this.value());
  }

  private syncHolder(): void {
    const d = this.holderDefaults;
    if (!d || !this.form.controls.titularIgualAdmin.value) {
      return;
    }
    this.titular.patchValue({
      nome: d.nome ?? '',
      cpfCnpj: d.cpfCnpj ?? '',
      email: d.email ?? '',
      telefone: d.telefone ?? ''
    });
  }
}
