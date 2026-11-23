import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { SUBSCRIPTION_SERVICE } from '../../../../services/subscription/subscription-service.token';
import { AuthProfileService } from '../../../../../services/authProfileService';
import { PaymentMethodFormComponent } from '../../../../shared/payment/payment-method-form.component';
import { extractErrorMessage } from '../../../../shared/payment/payment-errors';
import { ApiPlan, BillingIntervalCode, BillingPlanCode, SubscriptionView } from '../../../../../types/billing-api';
import { holderDefaultsFrom } from '../holder-defaults';

export interface AtivarDialogData {
  currentCode: BillingPlanCode | null;
  currentInterval: BillingIntervalCode | null;
  /** Fim da avaliação (ISO-8601); a primeira cobrança acontece no máximo nessa data. */
  trialEnd: string | null;
}

/** Fecha com a SubscriptionView após ativar, ou sem valor ao cancelar. */
@Component({
  selector: 'app-ativar-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatButtonToggleModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule, PaymentMethodFormComponent
  ],
  template: `
    <div class="ativar-dialog">
      <div class="ativar-header">
        <mat-icon aria-hidden="true">rocket_launch</mat-icon>
        <h2 mat-dialog-title>Ativar assinatura</h2>
      </div>

      <div class="ativar-body">
        <mat-button-toggle-group class="interval-toggle" [value]="interval" (change)="interval = $event.value"
                                 aria-label="Periodicidade da cobrança" hideSingleSelectionIndicator>
          <mat-button-toggle value="MONTHLY">Mensal</mat-button-toggle>
          <mat-button-toggle value="ANNUAL">Anual</mat-button-toggle>
        </mat-button-toggle-group>

        <div class="loading" *ngIf="loading"><mat-spinner diameter="32"></mat-spinner></div>

        <div class="plan-grid" role="radiogroup" aria-label="Planos" *ngIf="!loading">
          <button type="button" role="radio" class="plan-card" *ngFor="let p of plans"
                  [attr.aria-checked]="selected === p.code"
                  [class.selected]="selected === p.code"
                  (click)="selected = p.code">
            <span class="plan-name">{{ p.name }}</span>
            <span class="plan-price">
              <strong>{{ price(p) | currency: 'BRL' }}</strong>/{{ interval === 'ANNUAL' ? 'ano' : 'mês' }}
            </span>
            <span class="plan-desc">{{ p.description }}</span>
          </button>
        </div>

        <mat-form-field appearance="outline" class="coupon">
          <mat-label>Cupom (opcional)</mat-label>
          <input matInput [(ngModel)]="coupon" autocomplete="off" maxlength="40" />
        </mat-form-field>

        <app-payment-method-form #pay [holderDefaults]="holder"></app-payment-method-form>

        <p class="note" *ngIf="data.trialEnd">
          <mat-icon aria-hidden="true">event</mat-icon>
          A primeira cobrança acontece em {{ data.trialEnd | date: 'dd/MM/yyyy' }} ou hoje, se a avaliação já tiver terminado.
        </p>
      </div>

      <div class="ativar-actions">
        <button mat-button [disabled]="saving" (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="saving || loading || !selected" (click)="confirm()">
          <mat-spinner *ngIf="saving" diameter="18" class="btn-spinner"></mat-spinner>
          Ativar assinatura
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ativar-header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: #fff; padding: 20px 24px; display: flex; align-items: center; gap: 12px;
    }
    .ativar-header h2 { margin: 0; font-size: 1.25rem; font-weight: 500; padding: 0; }
    .ativar-header h2::before { display: none; }
    .ativar-body { padding: 24px 24px 0; max-height: 65vh; overflow-y: auto; }
    .interval-toggle { margin-bottom: 16px; }
    .loading { display: flex; justify-content: center; padding: 24px; }
    .plan-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .plan-card {
      display: flex; flex-direction: column; gap: 6px; text-align: left; font: inherit; background: #fff;
      border: 2px solid #e0e0e0; border-radius: 12px; padding: 14px; cursor: pointer;
    }
    .plan-card:hover { border-color: #90caf9; }
    .plan-card.selected { border-color: #1976d2; box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2); }
    .plan-name { font-weight: 600; color: #1565c0; }
    .plan-price strong { font-size: 1.3rem; color: #333; }
    .plan-desc { font-size: 0.8rem; color: #666; }
    .coupon { width: 100%; }
    .note { display: flex; gap: 8px; align-items: center; font-size: 0.85rem; color: #546e7a; }
    .note mat-icon { color: #1976d2; font-size: 18px; width: 18px; height: 18px; }
    .ativar-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px 20px; }
    .ativar-actions button { display: inline-flex; align-items: center; }
    .btn-spinner { display: inline-block; margin-right: 8px; }
  `]
})
export class AtivarDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<AtivarDialogComponent, SubscriptionView>);
  readonly data = inject<AtivarDialogData>(MAT_DIALOG_DATA);
  private readonly service = inject(SUBSCRIPTION_SERVICE);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  readonly holder = holderDefaultsFrom(inject(AuthProfileService));

  @ViewChild('pay') private pay?: PaymentMethodFormComponent;

  plans: ApiPlan[] = [];
  loading = true;
  saving = false;
  interval: BillingIntervalCode = this.data.currentInterval ?? 'MONTHLY';
  selected: BillingPlanCode | null = null;
  coupon = '';

  ngOnInit(): void {
    this.service
      .plans()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loading = false)))
      .subscribe({
        next: (plans) => {
          this.plans = plans.filter((p) => p.code !== 'ENTERPRISE');
          const current = this.plans.find((p) => p.code === this.data.currentCode);
          this.selected = (current ?? this.plans.find((p) => p.highlighted) ?? this.plans[0])?.code ?? null;
        },
        error: (err: unknown) => this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 })
      });
  }

  price(p: ApiPlan): number {
    return this.interval === 'ANNUAL' ? p.annualPrice : p.monthlyPrice;
  }

  confirm(): void {
    if (!this.selected || this.selected === 'ENTERPRISE' || !this.pay) { return; }
    const pagamento = this.pay.value();
    if (!pagamento) {
      this.pay.markAllAsTouched();
      return;
    }
    const coupon = this.coupon.trim().toUpperCase();
    this.saving = true;
    this.service
      .activate({
        planCode: this.selected,
        interval: this.interval,
        coupon: coupon || null,
        pagamento
      })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (view) => this.dialogRef.close(view),
        error: (err: unknown) => this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 })
      });
  }
}
