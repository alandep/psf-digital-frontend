import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface ConvidarResult {
  email: string;
  perfil: string;
}

const PERFIS = ['Administrador', 'Comex', 'Financeiro', 'Logística', 'Compliance', 'Operador', 'Consulta'];

@Component({
  selector: 'app-convidar-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  template: `
    <div class="convidar-dialog">
      <div class="conv-header">
        <mat-icon>group_add</mat-icon>
        <h2>Convidar usuário</h2>
      </div>

      <div class="conv-body">
        <div class="free-badge">
          <mat-icon>check_circle</mat-icon> Sem custo adicional — usuários ilimitados
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>E-mail</mat-label>
          <input matInput [(ngModel)]="email" type="email" placeholder="usuario@empresa.com.br">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Perfil</mat-label>
          <mat-select [(ngModel)]="perfil">
            <mat-option *ngFor="let p of perfis" [value]="p">{{ p }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="conv-actions">
        <button mat-button (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="!isValid()" (click)="confirm()">
          <mat-icon>send</mat-icon> Enviar convite
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./convidar-dialog.component.scss']
})
export class ConvidarDialogComponent {
  dialogRef = inject(MatDialogRef<ConvidarDialogComponent>);
  perfis = PERFIS;
  email = '';
  perfil = '';

  isValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()) && !!this.perfil;
  }

  confirm(): void {
    this.dialogRef.close({ email: this.email.trim(), perfil: this.perfil });
  }
}
