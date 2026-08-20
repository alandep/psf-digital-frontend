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
  selector: 'app-novo-fornecedor-dialog',
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
    <div class="novo-fornecedor-dialog">
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="header-icon">add_business</mat-icon>
          <div>
            <h2>Novo Fornecedor</h2>
            <p class="header-subtitle">Cadastre um novo fornecedor na base</p>
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
            <input matInput formControlName="companyName" placeholder="Nome da empresa fornecedora">
            <mat-icon matPrefix>business</mat-icon>
            <mat-error>Razão Social é obrigatória</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>CNPJ / Tax ID</mat-label>
            <input matInput formControlName="taxId" placeholder="00.000.000/0001-00">
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error>CNPJ é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>País</mat-label>
            <mat-select formControlName="country">
              @for (c of countries; track c) {
                <mat-option [value]="c">{{ c }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>public</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Categoria</mat-label>
            <mat-select formControlName="category">
              @for (cat of categories; track cat.value) {
                <mat-option [value]="cat.value">{{ cat.label }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>category</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Nome do Contato</mat-label>
            <input matInput formControlName="contactName" placeholder="Nome do responsável">
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="contato&#64;empresa.com" type="email">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="phone" placeholder="+55 11 99999-9999">
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>
        </form>
      </div>

      <div class="dialog-footer">
        <button mat-button (click)="cancel()" class="cancel-btn">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()" class="save-btn">
          <mat-icon>save</mat-icon> Salvar Fornecedor
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .novo-fornecedor-dialog {
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
      color: #f57c00;
      background: rgba(245, 124, 0, 0.08);
      border-radius: 50%;
      padding: 8px;
      box-sizing: content-box;
    }

    .dialog-header h2 {
      margin: 0;
      font-weight: 500;
      font-size: 1.4rem;
      color: #e65100;
    }

    .dialog-header .header-subtitle {
      margin: 2px 0 0;
      font-size: 0.85rem;
      color: #666;
    }

    .dialog-header .close-btn { color: #999; }
    .dialog-header .close-btn:hover { color: #333; }

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

    .form-grid .full-width { grid-column: 1 / -1; }

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

    .dialog-footer .cancel-btn { color: #666; }
    .dialog-footer .save-btn { min-width: 180px; height: 40px; font-weight: 500; }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class NovoFornecedorDialogComponent {
  private dialogRef = inject(MatDialogRef<NovoFornecedorDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup;

  countries = ['Brasil', 'China', 'Alemanha', 'Índia', 'Argentina', 'Chile', 'EUA', 'Vietnã', 'Turquia', 'Nigéria', 'Rússia'];
  categories = [
    { value: 'RAW_MATERIAL', label: 'Matéria-Prima' },
    { value: 'PACKAGING', label: 'Embalagem' },
    { value: 'LOGISTICS', label: 'Logística' },
    { value: 'SERVICES', label: 'Serviços' },
    { value: 'EQUIPMENT', label: 'Equipamentos' }
  ];

  constructor() {
    this.form = this.fb.group({
      companyName: ['', Validators.required],
      taxId: ['', Validators.required],
      country: ['Brasil'],
      category: ['RAW_MATERIAL'],
      contactName: [''],
      email: [''],
      phone: ['']
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
