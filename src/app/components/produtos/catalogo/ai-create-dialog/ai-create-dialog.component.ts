import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-ai-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  template: `
    <div class="ai-create-dialog">
      <!-- ===== Portos gradient hero header ===== -->
      <div class="dialog-header">
        <div class="dialog-header__left">
          <div class="dialog-header__badge">
            <mat-icon>auto_awesome</mat-icon>
          </div>
          <h2 class="dialog-header__title">Criar Produto com IA</h2>
        </div>
        <button
          mat-icon-button
          class="dialog-header__close"
          mat-dialog-close
          matTooltip="Fechar"
          aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- ===== Body ===== -->
      <mat-dialog-content class="dialog-content">
        <p class="dialog-hint">
          Descreva o produto em linguagem natural e a IA irá preencher os dados automaticamente.
        </p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descreva o produto</mat-label>
          <textarea
            matInput
            rows="4"
            [formControl]="descriptionCtrl"
            placeholder="Ex.: Soja em grão para exportação, Milho amarelo #2, Café arábica Santos"></textarea>
          <mat-icon matSuffix>psychology</mat-icon>
        </mat-form-field>
      </mat-dialog-content>

      <!-- ===== Footer ===== -->
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-stroked-button mat-dialog-close>Cancelar</button>
        <button
          mat-raised-button
          color="primary"
          class="confirm-btn"
          [disabled]="!descriptionCtrl.value.trim()"
          (click)="confirm()">
          <mat-icon>auto_awesome</mat-icon>
          Criar com IA
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .ai-create-dialog {
      display: flex;
      flex-direction: column;
      width: 520px;
      max-width: 92vw;
      border-radius: 16px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      margin: 0;
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: white;
      flex-shrink: 0;
    }

    .dialog-header__left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .dialog-header__badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dialog-header__badge mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .dialog-header__title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: white;
    }

    .dialog-header__close {
      color: white;
    }

    .dialog-content {
      padding: 20px 24px 4px;
    }

    .dialog-hint {
      margin: 0 0 16px;
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .full-width {
      width: 100%;
    }

    .dialog-actions {
      padding: 8px 24px 18px;
      margin: 0;
      gap: 12px;
    }

    .confirm-btn {
      background: linear-gradient(135deg, #9c27b0, #7b1fa2);
      color: white;
    }

    @media (max-width: 600px) {
      .ai-create-dialog {
        width: 100%;
      }
    }
  `]
})
export class AiCreateDialogComponent {
  public readonly dialogRef = inject(MatDialogRef<AiCreateDialogComponent, string>);
  public readonly descriptionCtrl = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  public confirm(): void {
    const description = this.descriptionCtrl.value?.trim();
    if (description) {
      this.dialogRef.close(description);
    }
  }
}
