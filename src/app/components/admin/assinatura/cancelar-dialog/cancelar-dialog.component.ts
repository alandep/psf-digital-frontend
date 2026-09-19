import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

export interface CancelarDialogData {
  currentPeriodEnd: Date;
}

const REASONS = [
  'Preço',
  'Não estou utilizando',
  'Faltam funcionalidades',
  'Problemas técnicos',
  'Migrei para outro sistema',
  'Outro'
];

@Component({
  selector: 'app-cancelar-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatRadioModule],
  template: `
    <div class="cancel-dialog">
      <div class="cancel-header">
        <mat-icon>cancel</mat-icon>
        <h2>Cancelar assinatura</h2>
      </div>

      <div class="cancel-body">
        <ng-container *ngIf="step === 'reason'">
          <p class="lead">Sentimos muito por ver você partir. Poderia nos contar o motivo?</p>
          <mat-radio-group class="reason-list" [(ngModel)]="reason">
            <mat-radio-button *ngFor="let r of reasons" [value]="r">{{ r }}</mat-radio-button>
          </mat-radio-group>
        </ng-container>

        <ng-container *ngIf="step === 'confirm'">
          <div class="warn-box">
            <mat-icon>info</mat-icon>
            <p>
              Sua assinatura permanecerá ativa até <strong>{{ data.currentPeriodEnd | date: 'dd/MM/yyyy' }}</strong>.
              Após essa data, sua empresa não poderá criar ou alterar operações.
              Seus dados serão mantidos pelo período contratualmente previsto para permitir sua exportação.
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
          <button mat-raised-button color="primary" (click)="dialogRef.close()">Manter assinatura</button>
          <button mat-button class="danger-text" (click)="dialogRef.close(reason)">Confirmar cancelamento</button>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./cancelar-dialog.component.scss']
})
export class CancelarDialogComponent {
  dialogRef = inject(MatDialogRef<CancelarDialogComponent>);
  reasons = REASONS;
  reason = '';
  step: 'reason' | 'confirm' = 'reason';

  constructor(@Inject(MAT_DIALOG_DATA) public data: CancelarDialogData) {}
}
