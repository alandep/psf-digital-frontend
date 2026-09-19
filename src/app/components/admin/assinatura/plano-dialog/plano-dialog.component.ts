import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SaasPlan, PlanCode } from '../../../../../types/saas-billing';

export interface PlanoDialogData {
  plans: SaasPlan[];
  currentCode: PlanCode;
}

@Component({
  selector: 'app-plano-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="plano-dialog">
      <div class="plano-header">
        <mat-icon>swap_horiz</mat-icon>
        <h2>Alterar plano</h2>
      </div>

      <div class="plano-body">
        <div class="plan-grid">
          <div
            *ngFor="let p of plans"
            class="plan-card"
            [class.selected]="selected === p.code"
            [class.current]="p.code === data.currentCode"
            (click)="selected = p.code">
            <div class="plan-top">
              <span class="plan-name">{{ p.name }}</span>
              <mat-icon *ngIf="selected === p.code" class="check">check_circle</mat-icon>
            </div>
            <div class="plan-price">
              <strong>{{ p.monthlyPrice | currency: 'BRL' }}</strong>
              <span>/mês</span>
            </div>
            <p class="plan-desc">{{ p.description }}</p>
            <span *ngIf="p.code === data.currentCode" class="current-tag">Plano atual</span>
          </div>
        </div>
      </div>

      <div class="plano-actions">
        <button mat-button (click)="dialogRef.close()">Cancelar</button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!selected || selected === data.currentCode"
          (click)="dialogRef.close(selected)">
          Confirmar alteração
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./plano-dialog.component.scss']
})
export class PlanoDialogComponent {
  dialogRef = inject(MatDialogRef<PlanoDialogComponent>);
  plans: SaasPlan[];
  selected: PlanCode;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PlanoDialogData) {
    // Only the self-service plans (Start/Business/Pro).
    this.plans = data.plans.filter((p) => p.code !== 'ENTERPRISE');
    this.selected = data.currentCode;
  }
}
