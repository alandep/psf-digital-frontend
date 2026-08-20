import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Screening } from '../../../../types/due-diligence';

export interface ResolucaoDialogData {
  screening: Screening;
}

@Component({
  selector: 'app-resolucao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="dialog-header">
      <div class="header-content">
        <mat-icon class="header-icon">gavel</mat-icon>
        <div>
          <h2>Resolução de Screening</h2>
          <p>{{ data.screening.entityName }} - {{ data.screening.screeningType }}</p>
        </div>
      </div>
      <button mat-icon-button (click)="close()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <div class="dialog-body">
      <div class="screening-summary">
        <div class="summary-row">
          <span class="label">Entidade:</span>
          <span class="value">{{ data.screening.entityName }}</span>
        </div>
        <div class="summary-row">
          <span class="label">País:</span>
          <span class="value">{{ data.screening.country }}</span>
        </div>
        <div class="summary-row">
          <span class="label">Tipo:</span>
          <span class="value">{{ data.screening.screeningType }}</span>
        </div>
        <div class="summary-row" *ngIf="data.screening.matchedWatchlists.length > 0">
          <span class="label">Watchlists:</span>
          <span class="value watchlist">{{ data.screening.matchedWatchlists.join(', ') }}</span>
        </div>
      </div>

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ação</mat-label>
          <mat-select formControlName="resolution">
            <mat-option value="APPROVE">Aprovar</mat-option>
            <mat-option value="REJECT">Rejeitar</mat-option>
            <mat-option value="ESCALATE">Escalar</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Justificativa (mínimo 20 caracteres)</mat-label>
          <textarea matInput formControlName="justification" rows="5"
            placeholder="Descreva a justificativa para esta decisão..."></textarea>
          <mat-hint align="end">{{ form.get('justification')?.value?.length || 0 }} / 20 min</mat-hint>
        </mat-form-field>
      </form>
    </div>

    <div class="dialog-footer">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">
        <mat-icon>check</mat-icon> Confirmar Resolução
      </button>
    </div>
  `,
  styles: [`
    @use 'sass:color';

    $primary: #4527a0;
    $dark: #311b92;

    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 28px;
      background: linear-gradient(135deg, $primary 0%, $dark 100%);
      color: white;
      flex-shrink: 0;

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .header-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          padding: 6px;
        }

        h2 { margin: 0; font-size: 1.35rem; font-weight: 700; }
        p { margin: 2px 0 0; font-size: 0.85rem; opacity: 0.9; }
      }

      .close-btn { color: white; opacity: 0.9; &:hover { opacity: 1; } }
    }

    .dialog-body {
      flex: 1;
      padding: 24px 28px;
      overflow-y: auto;

      .screening-summary {
        background: #f5f5f5;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;

        .summary-row {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;

          &:last-child { margin-bottom: 0; }

          .label {
            font-weight: 600;
            color: #555;
            min-width: 100px;
          }

          .value {
            color: #333;

            &.watchlist {
              color: #c62828;
              font-weight: 500;
            }
          }
        }
      }

      .full-width {
        width: 100%;
        margin-bottom: 8px;
      }
    }

    .dialog-footer {
      flex-shrink: 0;
      padding: 16px 28px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class ResolucaoDialogComponent {
  private dialogRef = inject(MatDialogRef<ResolucaoDialogComponent>);
  public data: ResolucaoDialogData = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);

  form: FormGroup;

  constructor() {
    this.form = this.formBuilder.group({
      resolution: ['', Validators.required],
      justification: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}
