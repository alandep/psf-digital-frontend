import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminUser } from '../../../../../types/admin-usuarios';

@Component({
  selector: 'app-editar-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSlideToggleModule
  ],
  template: `
    <div class="edit-dialog">
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="header-icon">edit</mat-icon>
          <div>
            <h2>Editar Usuário</h2>
            <p class="header-subtitle">{{ data.name }}</p>
          </div>
        </div>
        <button mat-icon-button (click)="cancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-body">
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nome Completo</mat-label>
            <input matInput formControlName="name">
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Perfil de Acesso</mat-label>
            <mat-select formControlName="role">
              @for (r of roles; track r) {
                <mat-option [value]="r">{{ r }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              @for (s of statuses; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Empresa</mat-label>
            <mat-select formControlName="empresa">
              @for (e of empresas; track e) {
                <mat-option [value]="e">{{ e }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Departamento</mat-label>
            <input matInput formControlName="departamento">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="phone">
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <div class="toggle-row">
            <mat-slide-toggle formControlName="mfaEnabled" color="primary">
              MFA Habilitado
            </mat-slide-toggle>
          </div>
        </form>
      </div>

      <div class="dialog-footer">
        <button mat-button (click)="cancel()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid || !form.dirty" (click)="save()">
          <mat-icon>save</mat-icon> Salvar Alterações
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .edit-dialog {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 80vh;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px 14px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }

    .dialog-header .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .dialog-header .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #283593;
      background: rgba(40, 53, 147, 0.08);
      border-radius: 50%;
      padding: 8px;
      box-sizing: content-box;
    }

    .dialog-header h2 {
      margin: 0;
      font-weight: 500;
      font-size: 1.3rem;
      color: #283593;
    }

    .dialog-header .header-subtitle {
      margin: 2px 0 0;
      font-size: 0.85rem;
      color: #666;
    }

    .dialog-header .close-btn {
      color: #999;
    }

    .dialog-body {
      padding: 20px 28px;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 20px;
    }

    .form-grid .full-width {
      grid-column: 1 / -1;
    }

    .toggle-row {
      grid-column: 1 / -1;
      padding: 8px 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding: 16px 28px;
      border-top: 1px solid #e0e0e0;
      flex-shrink: 0;
      background: #fafafa;
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EditarUsuarioDialogComponent {
  private dialogRef = inject(MatDialogRef<EditarUsuarioDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup;
  roles = ['ADMIN', 'GERENTE', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR', 'COMPLIANCE', 'FINANCEIRO'];
  statuses = ['ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE'];
  empresas = ['PSF Exportações', 'Trade Solutions', 'Global Commodities', 'AgroTrade Brasil'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: AdminUser) {
    this.form = this.fb.group({
      name: [data.name, Validators.required],
      email: [data.email, [Validators.required, Validators.email]],
      role: [data.role, Validators.required],
      status: [data.status, Validators.required],
      empresa: [data.empresa, Validators.required],
      departamento: [data.departamento],
      phone: [data.phone],
      mfaEnabled: [data.mfaEnabled]
    });
  }

  cancel(): void { this.dialogRef.close(null); }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.data, ...this.form.value });
    }
  }
}
