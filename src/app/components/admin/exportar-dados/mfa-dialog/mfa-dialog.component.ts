import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mfa-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="mfa-dialog">
      <div class="mfa-header">
        <mat-icon>verified_user</mat-icon>
        <h2>Confirmar identidade</h2>
      </div>

      <div class="mfa-body">
        <p class="lead">Confirme sua identidade para gerar o pacote</p>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Código de verificação (6 dígitos)</mat-label>
          <input matInput [(ngModel)]="code" maxlength="6" placeholder="000000" inputmode="numeric">
        </mat-form-field>
        <p class="hint">Ambiente de demonstração — qualquer código de 6 dígitos é aceito.</p>
      </div>

      <div class="mfa-actions">
        <button mat-button (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="!isValid()" (click)="dialogRef.close(true)">
          Confirmar
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./mfa-dialog.component.scss']
})
export class MfaDialogComponent {
  dialogRef = inject(MatDialogRef<MfaDialogComponent>);
  code = '';

  isValid(): boolean {
    return /^\d{6}$/.test(this.code.trim());
  }
}
