import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nova-empresa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="nova-empresa-dialog">
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="header-icon">domain_add</mat-icon>
          <div>
            <h2>Nova Empresa</h2>
            <p class="header-subtitle">Preencha os dados para cadastrar uma nova empresa</p>
          </div>
        </div>
        <button mat-icon-button (click)="cancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-body">
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Razão Social</mat-label>
            <input matInput formControlName="razaoSocial" placeholder="Razão social da empresa">
            <mat-icon matPrefix>business</mat-icon>
            <mat-error>Razão Social é obrigatória</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nome Fantasia</mat-label>
            <input matInput formControlName="nomeFantasia" placeholder="Nome fantasia">
            <mat-icon matPrefix>store</mat-icon>
            <mat-error>Nome Fantasia é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>CNPJ</mat-label>
            <input matInput formControlName="cnpj" placeholder="00.000.000/0000-00">
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error>CNPJ é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipo">
              @for (t of tipos; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>category</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>País</mat-label>
            <input matInput formControlName="pais">
            <mat-icon matPrefix>public</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <input matInput formControlName="estado" placeholder="Ex: SP, RJ, MG">
            <mat-icon matPrefix>map</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Cidade</mat-label>
            <input matInput formControlName="cidade" placeholder="Cidade">
            <mat-icon matPrefix>location_city</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Responsável</mat-label>
            <input matInput formControlName="responsavel" placeholder="Nome do responsável">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error>Responsável é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="contato@empresa.com.br" type="email">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="telefone" placeholder="(11) 3456-7890">
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Plano</mat-label>
            <mat-select formControlName="plano">
              @for (p of planos; track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>workspace_premium</mat-icon>
          </mat-form-field>
        </form>
      </div>

      <div class="dialog-footer">
        <button mat-button (click)="cancel()" class="cancel-btn">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()" class="save-btn">
          <mat-icon>save</mat-icon> Salvar Empresa
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .nova-empresa-dialog {
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
export class NovaEmpresaDialogComponent {
  private dialogRef = inject(MatDialogRef<NovaEmpresaDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup;
  tipos = ['EXPORTADOR', 'TRADING', 'COOPERATIVA', 'INDÚSTRIA', 'OPERADOR_LOGÍSTICO'];
  planos = ['Starter', 'Professional', 'Enterprise'];

  constructor() {
    this.form = this.fb.group({
      razaoSocial: ['', Validators.required],
      nomeFantasia: ['', Validators.required],
      cnpj: ['', Validators.required],
      tipo: ['EXPORTADOR'],
      pais: ['Brasil'],
      estado: [''],
      cidade: [''],
      responsavel: ['', Validators.required],
      email: [''],
      telefone: [''],
      plano: ['Professional']
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
