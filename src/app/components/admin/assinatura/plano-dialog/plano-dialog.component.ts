import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { SUBSCRIPTION_SERVICE } from '../../../../services/subscription/subscription-service.token';
import { DemoDialogComponent } from '../../../site/demo-dialog/demo-dialog.component';
import { extractErrorMessage } from '../../../../shared/payment/payment-errors';
import { ApiPlan, BillingIntervalCode, BillingPlanCode, SubscriptionView } from '../../../../../types/billing-api';

export interface PlanoDialogData {
  currentCode: BillingPlanCode;
  currentInterval: BillingIntervalCode;
}

type SelfServicePlanCode = Exclude<BillingPlanCode, 'ENTERPRISE'>;

/** Fecha com a SubscriptionView atualizada ao confirmar, ou sem valor ao cancelar. */
@Component({
  selector: 'app-plano-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatButtonToggleModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="plano-dialog">
      <div class="plano-header">
        <mat-icon aria-hidden="true">swap_horiz</mat-icon>
        <h2 mat-dialog-title>Alterar plano</h2>
      </div>

      <div class="plano-body">
        <mat-button-toggle-group class="interval-toggle" [value]="interval" (change)="interval = $event.value"
                                 aria-label="Periodicidade da cobrança" hideSingleSelectionIndicator>
          <mat-button-toggle value="MONTHLY">Mensal</mat-button-toggle>
          <mat-button-toggle value="ANNUAL">Anual</mat-button-toggle>
        </mat-button-toggle-group>

        <div class="loading" *ngIf="loading"><mat-spinner diameter="32"></mat-spinner></div>

        <div class="plan-grid" role="radiogroup" aria-label="Planos" *ngIf="!loading">
          <button type="button" role="radio" *ngFor="let p of plans"
                  class="plan-card"
                  [attr.aria-checked]="selected === p.code"
                  [class.selected]="selected === p.code"
                  [class.current]="isCurrent(p)"
                  (click)="selected = p.code">
            <span class="plan-top">
              <span class="plan-name">{{ p.name }}</span>
              <mat-icon *ngIf="selected === p.code" class="check" aria-hidden="true">check_circle</mat-icon>
            </span>
            <span class="plan-price">
              <strong>{{ price(p) | currency: 'BRL' }}</strong>
              <span>/{{ interval === 'ANNUAL' ? 'ano' : 'mês' }}</span>
            </span>
            <span class="plan-desc">{{ p.description }}</span>
            <span *ngIf="p.code === data.currentCode" class="current-tag">Plano atual</span>
          </button>
        </div>

        <p class="note">
          <mat-icon aria-hidden="true">info</mat-icon>
          O novo valor vale a partir da próxima cobrança; os recursos do novo plano são liberados imediatamente.
        </p>
        <button type="button" mat-button color="primary" class="sales-link" (click)="talkToSales()">
          Precisa do Enterprise? Fale com vendas
        </button>
      </div>

      <div class="plano-actions">
        <button mat-button [disabled]="saving" (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="!canConfirm || saving" (click)="confirm()">
          <mat-spinner *ngIf="saving" diameter="18" class="btn-spinner"></mat-spinner>
          Confirmar alteração
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./plano-dialog.component.scss']
})
export class PlanoDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<PlanoDialogComponent, SubscriptionView>);
  readonly data = inject<PlanoDialogData>(MAT_DIALOG_DATA);
  private readonly service = inject(SUBSCRIPTION_SERVICE);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  plans: ApiPlan[] = [];
  loading = true;
  saving = false;
  interval: BillingIntervalCode = this.data.currentInterval;
  selected: BillingPlanCode = this.data.currentCode;

  ngOnInit(): void {
    this.service
      .plans()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loading = false)))
      .subscribe({
        next: (plans) => (this.plans = plans.filter((p) => p.code !== 'ENTERPRISE')),
        error: (err: unknown) => this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 })
      });
  }

  price(p: ApiPlan): number {
    return this.interval === 'ANNUAL' ? p.annualPrice : p.monthlyPrice;
  }

  isCurrent(p: ApiPlan): boolean {
    return p.code === this.data.currentCode && this.interval === this.data.currentInterval;
  }

  get canConfirm(): boolean {
    return (
      this.selected !== 'ENTERPRISE' &&
      this.plans.some((p) => p.code === this.selected) &&
      (this.selected !== this.data.currentCode || this.interval !== this.data.currentInterval)
    );
  }

  talkToSales(): void {
    this.dialog.open(DemoDialogComponent, { width: '520px', data: { origem: 'TRIAL_BANNER' } });
  }

  confirm(): void {
    if (!this.canConfirm || this.selected === 'ENTERPRISE') { return; }
    this.saving = true;
    this.service
      .changePlan({ planCode: this.selected as SelfServicePlanCode, interval: this.interval })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (view) => this.dialogRef.close(view),
        error: (err: unknown) => this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 })
      });
  }
}
