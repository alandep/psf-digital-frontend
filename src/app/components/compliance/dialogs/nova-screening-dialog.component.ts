import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-nova-screening-dialog',
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
        <mat-icon class="header-icon">policy</mat-icon>
        <div>
          <h2>Nova Screening</h2>
          <p>Criar nova verificação de due diligence</p>
        </div>
      </div>
      <button mat-icon-button (click)="close()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <div class="dialog-body">
      <form [formGroup]="form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Nome da Entidade</mat-label>
            <input matInput formControlName="entityName" placeholder="Nome completo">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo de Entidade</mat-label>
            <mat-select formControlName="entityType">
              <mat-option value="INDIVIDUAL">Pessoa Física</mat-option>
              <mat-option value="COMPANY">Pessoa Jurídica</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>País</mat-label>
            <mat-select formControlName="country">
              <mat-option *ngFor="let c of countries" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>CPF/CNPJ/Tax ID</mat-label>
            <input matInput formControlName="taxId" placeholder="Documento fiscal">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Tipo de Screening</mat-label>
            <mat-select formControlName="screeningType">
              <mat-option value="KYC">KYC</mat-option>
              <mat-option value="AML">AML</mat-option>
              <mat-option value="SANCTIONS">Sanções</mat-option>
              <mat-option value="PEP">PEP</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </form>
    </div>

    <div class="dialog-footer">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">
        <mat-icon>add</mat-icon> Criar Screening
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

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
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
export class NovaScreeningDialogComponent {
  private dialogRef = inject(MatDialogRef<NovaScreeningDialogComponent>);
  private formBuilder = inject(FormBuilder);

  form: FormGroup;

  countries: string[] = [
    'China', 'EUA', 'Alemanha', 'Japão', 'Arábia Saudita', 'Rússia',
    'Argentina', 'Holanda', 'Turquia', 'Irã', 'Coreia do Norte', 'Belarus',
    'Colômbia', 'Emirados Árabes', 'Singapura', 'Suécia', 'Venezuela',
    'Austrália', 'Suíça', 'Mali', 'Moçambique', 'Portugal', 'Itália'
  ];

  constructor() {
    this.form = this.formBuilder.group({
      entityName: ['', Validators.required],
      entityType: ['', Validators.required],
      country: ['', Validators.required],
      taxId: ['', Validators.required],
      screeningType: ['', Validators.required]
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
