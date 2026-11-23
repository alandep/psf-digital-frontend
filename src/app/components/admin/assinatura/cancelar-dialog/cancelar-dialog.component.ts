import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { SUBSCRIPTION_SERVICE } from '../../../../services/subscription/subscription-service.token';
import { extractErrorMessage } from '../../../../shared/payment/payment-errors';
import { SubscriptionView } from '../../../../../types/billing-api';

export interface CancelarDialogData {
  /** Fim do período atual (ISO-8601) ou null. */
  currentPeriodEnd: string | null;
}

const REASONS = [
  'Preço',
  'Não estou utilizando',
  'Faltam funcionalidades',
  'Problemas técnicos',
  'Migrei para outro sistema',
  'Outro'
];

/** Fecha com a SubscriptionView atualizada após cancelar, ou sem valor se o usuário desistir. */
@Component({
  selector: 'app-cancelar-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatRadioModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="cancel-dialog">
      <div class="cancel-header">
        <mat-icon aria-hidden="true">cancel</mat-icon>
        <h2 mat-dialog-title>Cancelar assinatura</h2>
      </div>

      <div class="cancel-body">
        <ng-container *ngIf="step === 'reason'">
          <p class="lead">Sentimos muito por ver você partir. Poderia nos contar o motivo?</p>
          <mat-radio-group class="reason-list" [(ngModel)]="reason" aria-label="Motivo do cancelamento">
            <mat-radio-button *ngFor="let r of reasons" [value]="r">{{ r }}</mat-radio-button>
          </mat-radio-group>
          <mat-form-field appearance="outline" class="comment">
            <mat-label>Comentário (opcional)</mat-label>
            <textarea matInput rows="3" maxlength="500" [(ngModel)]="comment"></textarea>
          </mat-form-field>
        </ng-container>

        <ng-container *ngIf="step === 'confirm'">
          <div class="warn-box">
            <mat-icon aria-hidden="true">info</mat-icon>
            <p>
              <ng-container *ngIf="data.currentPeriodEnd; else noDate">
                Seu acesso continua até <strong>{{ data.currentPeriodEnd | date: 'dd/MM/yyyy' }}</strong>.
              </ng-container>
              <ng-template #noDate>Seu acesso continua até o fim do período já pago.</ng-template>
              Depois dessa data, sua empresa não poderá criar ou alterar dados, mas continuará podendo
              consultar e exportar tudo. Nenhuma nova cobrança será feita.
            </p>
          </div>
        </ng-container>
      </div>

      <div class="cancel-actions">
        <ng-container *ngIf="step === 'reason'">
          <button mat-button (click)="dialogRef.close()">Voltar</button>
          <button mat-raised-button color="warn" [disabled]="!reason" (click)="step = 'confirm'">Continuar</button>
        </ng-container>
        <ng-container *ngIf="step === 'confirm'">
          <button mat-raised-button color="primary" [disabled]="saving" (click)="dialogRef.close()">Manter assinatura</button>
          <button mat-button class="danger-text" [disabled]="saving" (click)="confirm()">
            <mat-spinner *ngIf="saving" diameter="18" class="btn-spinner"></mat-spinner>
            Confirmar cancelamento
          </button>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./cancelar-dialog.component.scss']
})
export class CancelarDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CancelarDialogComponent, SubscriptionView>);
  readonly data = inject<CancelarDialogData>(MAT_DIALOG_DATA);
  private readonly service = inject(SUBSCRIPTION_SERVICE);
  private readonly snackBar = inject(MatSnackBar);

  readonly reasons = REASONS;
  reason = '';
  comment = '';
  saving = false;
  step: 'reason' | 'confirm' = 'reason';

  confirm(): void {
    this.saving = true;
    const comment = this.comment.trim();
    this.service
      .cancel({ reason: this.reason, ...(comment ? { comment } : {}) })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (view) => this.dialogRef.close(view),
        error: (err: unknown) => this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 })
      });
  }
}
