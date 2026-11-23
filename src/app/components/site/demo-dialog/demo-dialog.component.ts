import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicBillingService } from '../../../services/public-billing/public-billing.service';
import { InputMaskDirective } from '../../../shared/directives/input-mask.directive';
import { cnpjValidator, onlyDigits, telefoneValidator } from '../../../shared/validators/br-document.validators';
import { extractErrorMessage } from '../../../shared/payment/payment-errors';
import { DemoOrigin, DemoRequestBody } from '../../../../types/billing-api';

export interface DemoDialogData {
  origem: DemoOrigin;
}

/**
 * Diálogo "Agendar demonstração / Falar com vendas".
 * Abrir com: dialog.open(DemoDialogComponent, { width: '520px', data: { origem: 'SITE' } })
 */
@Component({
  selector: 'app-demo-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    InputMaskDirective
  ],
  template: `
    <h2 mat-dialog-title>Agendar demonstração</h2>

    @if (sent) {
      <mat-dialog-content>
        <p class="ok" role="status">
          <mat-icon aria-hidden="true">check_circle</mat-icon>
          Recebemos sua solicitação! Nosso time entrará em contato em até 1 dia útil.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-flat-button color="primary" (click)="ref.close(true)">Fechar</button>
      </mat-dialog-actions>
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-dialog-content class="content">
          <p class="intro">Deixe seus dados e nossa equipe comercial entrará em contato.</p>

          <mat-form-field appearance="outline">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="nome" autocomplete="name" />
            <mat-error>Informe seu nome</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>E-mail</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
            @if (form.controls.email.hasError('required')) {
              <mat-error>Informe seu e-mail</mat-error>
            } @else {
              <mat-error>E-mail inválido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="telefone" appMask="telefone" inputmode="numeric"
                   autocomplete="tel" placeholder="(00) 00000-0000" />
            @if (form.controls.telefone.hasError('required')) {
              <mat-error>Informe seu telefone</mat-error>
            } @else {
              <mat-error>Telefone inválido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Empresa</mat-label>
            <input matInput formControlName="empresa" autocomplete="organization" />
            <mat-error>Informe o nome da empresa</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>CNPJ (opcional)</mat-label>
            <input matInput formControlName="cnpj" appMask="cnpj" inputmode="numeric" placeholder="00.000.000/0000-00" />
            <mat-error>CNPJ inválido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mensagem (opcional)</mat-label>
            <textarea matInput rows="3" formControlName="mensagem" maxlength="1000"></textarea>
          </mat-form-field>

          @if (error) {
            <p class="err" role="alert"><mat-icon aria-hidden="true">error_outline</mat-icon>{{ error }}</p>
          }
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="ref.close()" [disabled]="sending">Cancelar</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="sending">
            @if (sending) {
              <mat-spinner diameter="18" class="spin"></mat-spinner>
              Enviando...
            } @else {
              Solicitar contato
            }
          </button>
        </mat-dialog-actions>
      </form>
    }
  `,
  styles: [
    `
      .content { display: flex; flex-direction: column; gap: 2px; min-width: min(440px, 80vw); }
      .intro { color: #4b5563; margin: 0 0 8px; }
      .ok { display: flex; gap: 8px; align-items: center; color: #166534; }
      .err { display: flex; gap: 6px; align-items: center; color: #b3261e; margin: 0; }
      .spin { display: inline-block; margin-right: 8px; vertical-align: middle; }
    `
  ]
})
export class DemoDialogComponent {
  readonly ref = inject<MatDialogRef<DemoDialogComponent, boolean>>(MatDialogRef);
  private readonly data = inject<DemoDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly billing = inject(PublicBillingService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  sending = false;
  sent = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, telefoneValidator()]],
    empresa: ['', Validators.required],
    cnpj: ['', cnpjValidator()],
    mensagem: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body: DemoRequestBody = {
      nome: v.nome.trim(),
      email: v.email.trim(),
      telefone: onlyDigits(v.telefone),
      empresa: v.empresa.trim(),
      cnpj: v.cnpj ? onlyDigits(v.cnpj) : undefined,
      mensagem: v.mensagem.trim() || undefined,
      origem: this.data?.origem ?? 'SITE'
    };
    this.sending = true;
    this.error = '';
    this.billing
      .requestDemo(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.sending = false;
          this.sent = true;
        },
        error: (err: unknown) => {
          this.sending = false;
          this.error = extractErrorMessage(err, 'Não foi possível enviar sua solicitação. Tente novamente em instantes.');
        }
      });
  }
}
