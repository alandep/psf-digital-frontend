import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-registrar-certificacao-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="dialog-header">
      <div class="header-content">
        <mat-icon class="header-icon">verified</mat-icon>
        <div>
          <h2>Registrar Certificação</h2>
          <p>Adicionar nova certificação ESG</p>
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
            <mat-label>Tipo de Certificação</mat-label>
            <mat-select formControlName="type">
              <mat-option value="ORGANIC">Orgânico</mat-option>
              <mat-option value="FAIR_TRADE">Fair Trade</mat-option>
              <mat-option value="RAINFOREST_ALLIANCE">Rainforest Alliance</mat-option>
              <mat-option value="CARBON_NEUTRAL">Carbon Neutral</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Emissor</mat-label>
            <input matInput formControlName="issuer" placeholder="Organismo certificador">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Válido De</mat-label>
            <input matInput [matDatepicker]="validFrom" formControlName="validFrom">
            <mat-datepicker-toggle matIconSuffix [for]="validFrom"></mat-datepicker-toggle>
            <mat-datepicker #validFrom></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Válido Até</mat-label>
            <input matInput [matDatepicker]="validUntil" formControlName="validUntil">
            <mat-datepicker-toggle matIconSuffix [for]="validUntil"></mat-datepicker-toggle>
            <mat-datepicker #validUntil></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Número do Certificado</mat-label>
            <input matInput formControlName="certificateNumber" placeholder="Ex: ORG-2024-001">
          </mat-form-field>
        </div>
      </form>
    </div>

    <div class="dialog-footer">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">
        <mat-icon>save</mat-icon> Registrar
      </button>
    </div>
  `,
  styles: [`
    @use 'sass:color';

    $primary: #2e7d32;
    $dark: #1b5e20;

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
export class RegistrarCertificacaoDialogComponent {
  private dialogRef = inject(MatDialogRef<RegistrarCertificacaoDialogComponent>);
  private formBuilder = inject(FormBuilder);

  form: FormGroup;

  constructor() {
    this.form = this.formBuilder.group({
      type: ['', Validators.required],
      issuer: ['', Validators.required],
      validFrom: [null, Validators.required],
      validUntil: [null, Validators.required],
      certificateNumber: ['', Validators.required]
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
