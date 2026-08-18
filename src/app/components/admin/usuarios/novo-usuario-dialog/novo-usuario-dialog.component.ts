import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-novo-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="novo-usuario-dialog">
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="header-icon">person_add</mat-icon>
          <div>
            <h2>Novo Usuário</h2>
            <p class="header-subtitle">Preencha os dados para cadastrar um novo usuário</p>
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
            <input matInput formControlName="name" placeholder="Nome completo do usuário">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error>Nome é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="usuario&#64;empresa.com.br" type="email">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error>Email válido é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Perfil de Acesso</mat-label>
            <mat-select formControlName="role">
              @for (r of roles; track r) {
                <mat-option [value]="r">{{ r }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>badge</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Empresa</mat-label>
            <mat-select formControlName="empresa">
              @for (e of empresas; track e) {
                <mat-option [value]="e">{{ e }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>business</mat-icon>
            <mat-error>Empresa é obrigatória</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Departamento</mat-label>
            <input matInput formControlName="departamento" placeholder="Ex: Exportação, Logística">
            <mat-icon matPrefix>apartment</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="phone" placeholder="(11) 99999-9999">
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <div class="toggle-row">
            <mat-slide-toggle formControlName="mfaEnabled" color="primary">
              Habilitar MFA (Autenticação Multifator)
            </mat-slide-toggle>
            <span class="toggle-hint">Recomendado para perfis administrativos</span>
          </div>
        </form>
      </div>

      <div class="dialog-footer">
        <button mat-button (click)="cancel()" class="cancel-btn">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()" class="save-btn">
          <mat-icon>save</mat-icon> Salvar Usuário
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .novo-usuario-dialog {
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
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #283593;
      background: rgba(40, 53, 147, 0.08);
      border-radius: 50%;
      padding: 8px;
      box-sizing: content-box;
    }

    .dialog-header h2 {
      margin: 0;
      font-weight: 500;
      font-size: 1.4rem;
      color: #283593;
      line-height: 1.2;
    }

    .dialog-header .header-subtitle {
      margin: 2px 0 0;
      font-size: 0.85rem;
      color: #666;
    }

    .dialog-header .close-btn {
      color: #999;
    }

    .dialog-header .close-btn:hover {
      color: #333;
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
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0 4px;
    }

    .toggle-row .toggle-hint {
      font-size: 0.8rem;
      color: #888;
      font-style: italic;
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

    .dialog-footer .cancel-btn {
      color: #666;
    }

    .dialog-footer .save-btn {
      min-width: 160px;
      height: 40px;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .dialog-header {
        padding: 16px 20px 12px;
      }
      .dialog-body {
        padding: 16px 20px;
      }
      .dialog-footer {
        padding: 12px 20px;
      }
    }
  `]
})
export class NovoUsuarioDialogComponent {
  private dialogRef = inject(MatDialogRef<NovoUsuarioDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup;
  roles = ['ADMIN', 'GERENTE', 'ANALISTA', 'OPERADOR', 'VISUALIZADOR', 'COMPLIANCE', 'FINANCEIRO'];
  empresas = ['PSF Exportações', 'Trade Solutions', 'Global Commodities', 'AgroTrade Brasil'];

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['ANALISTA', Validators.required],
      empresa: ['', Validators.required],
      departamento: [''],
      phone: [''],
      mfaEnabled: [false]
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
