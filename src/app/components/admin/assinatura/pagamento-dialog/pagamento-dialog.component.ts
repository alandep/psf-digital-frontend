import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { SUBSCRIPTION_SERVICE } from '../../../../services/subscription/subscription-service.token';
import { AuthProfileService } from '../../../../../services/authProfileService';
import { PaymentMethodFormComponent } from '../../../../shared/payment/payment-method-form.component';
import { extractErrorMessage } from '../../../../shared/payment/payment-errors';
import { SubscriptionView } from '../../../../../types/billing-api';
import { holderDefaultsFrom } from '../holder-defaults';

/** Fecha com a SubscriptionView atualizada ao salvar, ou sem valor ao cancelar. */
@Component({
  selector: 'app-pagamento-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule, PaymentMethodFormComponent
  ],
  template: `
    <div class="pgto-dialog">
      <div class="pgto-header">
        <mat-icon aria-hidden="true">credit_card</mat-icon>
        <h2 mat-dialog-title>Alterar forma de pagamento</h2>
      </div>

      <div class="pgto-body">
        <p class="lead">A nova forma de pagamento será usada nas próximas cobranças da assinatura.</p>
        <app-payment-method-form #pay [holderDefaults]="holder"></app-payment-method-form>
      </div>

      <div class="pgto-actions">
        <button mat-button [disabled]="saving" (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="saving" (click)="save()">
          <mat-spinner *ngIf="saving" diameter="18" class="btn-spinner"></mat-spinner>
          Salvar forma de pagamento
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./pagamento-dialog.component.scss']
})
export class PagamentoDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PagamentoDialogComponent, SubscriptionView>);
  private readonly service = inject(SUBSCRIPTION_SERVICE);
  private readonly snackBar = inject(MatSnackBar);
  readonly holder = holderDefaultsFrom(inject(AuthProfileService));

  @ViewChild('pay') private pay?: PaymentMethodFormComponent;

  saving = false;

  save(): void {
    if (!this.pay) { return; }
    const pagamento = this.pay.value();
    if (!pagamento) {
      this.pay.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.service
      .changePaymentMethod(pagamento)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (view) => this.dialogRef.close(view),
        error: (err: unknown) => this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 })
      });
  }
}
