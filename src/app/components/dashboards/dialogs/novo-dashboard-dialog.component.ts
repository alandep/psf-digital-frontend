import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DashboardLayout } from '../../../../types/dashboard-builder';

@Component({
  selector: 'app-novo-dashboard-dialog',
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
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>Novo Dashboard</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <form [formGroup]="form" class="dialog-body">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome do Dashboard</mat-label>
          <input matInput formControlName="name" placeholder="Ex: Visão Geral Exportações">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Descreva o objetivo do dashboard"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Layout</mat-label>
          <mat-select formControlName="layout">
            <mat-option value="1-COLUMN">1 Coluna</mat-option>
            <mat-option value="2-COLUMN">2 Colunas</mat-option>
            <mat-option value="3-COLUMN">3 Colunas</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Layout Preview -->
        <div class="layout-preview">
          <span class="preview-label">Preview do Layout:</span>
          <div class="preview-grid" [class]="'layout-' + form.get('layout')?.value">
            <div class="preview-col" *ngFor="let col of getLayoutCols()"></div>
          </div>
        </div>
      </form>

      <div class="dialog-footer">
        <button mat-button (click)="close()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">
          <mat-icon>add</mat-icon>
          Criar Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;

      h2 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #00695c;
      }
    }

    .dialog-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .layout-preview {
      margin-top: 8px;
    }

    .preview-label {
      font-size: 0.82rem;
      color: #666;
      margin-bottom: 8px;
      display: block;
    }

    .preview-grid {
      display: grid;
      gap: 8px;
      height: 60px;

      &.layout-1-COLUMN {
        grid-template-columns: 1fr;
      }
      &.layout-2-COLUMN {
        grid-template-columns: 1fr 1fr;
      }
      &.layout-3-COLUMN {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    .preview-col {
      background: rgba(0, 105, 92, 0.1);
      border: 2px dashed #00695c;
      border-radius: 8px;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      flex-shrink: 0;
    }
  `]
})
export class NovoDashboardDialogComponent {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NovoDashboardDialogComponent>);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    layout: ['2-COLUMN' as DashboardLayout, Validators.required]
  });

  getLayoutCols(): number[] {
    const layout = this.form.get('layout')?.value;
    switch (layout) {
      case '1-COLUMN': return [1];
      case '2-COLUMN': return [1, 2];
      case '3-COLUMN': return [1, 2, 3];
      default: return [1, 2];
    }
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
