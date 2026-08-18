import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  icon: string;
  iconColor: string;
  confirmText: string;
  confirmColor: string;
}

@Component({
  selector: 'app-confirmar-acao-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon" [style.background]="'rgba(' + getColorRgb(data.iconColor) + ', 0.1)'">
        <mat-icon [style.color]="data.iconColor">{{ data.icon }}</mat-icon>
      </div>
      <h3>{{ data.title }}</h3>
      <p>{{ data.message }}</p>
      <div class="confirm-actions">
        <button mat-button (click)="dialogRef.close(false)">Cancelar</button>
        <button mat-raised-button [color]="data.confirmColor" (click)="dialogRef.close(true)">
          {{ data.confirmText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 28px; text-align: center;
      .confirm-icon {
        width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 16px;
        display: flex; align-items: center; justify-content: center;
        mat-icon { font-size: 32px; width: 32px; height: 32px; }
      }
      h3 { margin: 0 0 8px; font-size: 1.2rem; font-weight: 500; color: #333; }
      p { margin: 0 0 24px; color: #666; font-size: 0.95rem; line-height: 1.5; }
      .confirm-actions { display: flex; justify-content: center; gap: 12px; }
    }
  `]
})
export class ConfirmarAcaoDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmarAcaoDialogComponent>);
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}

  getColorRgb(color: string): string {
    if (color === '#f44336') return '244, 67, 54';
    if (color === '#ff9800') return '255, 152, 0';
    if (color === '#4caf50') return '76, 175, 80';
    if (color === '#2196f3') return '33, 150, 243';
    return '100, 100, 100';
  }
}
