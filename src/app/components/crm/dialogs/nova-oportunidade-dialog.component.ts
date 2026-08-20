import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-nova-oportunidade-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="nova-oportunidade-dialog">
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="header-icon">add_circle</mat-icon>
          <div>
            <h2>Nova Oportunidade</h2>
            <p class="header-subtitle">Registre uma nova oportunidade no pipeline</p>
          </div>
        </div>
        <button mat-icon-button (click)="cancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-body">
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Título</mat-label>
            <input matInput formControlName="title" placeholder="Ex: Contrato Soja 2025">
            <mat-icon matPrefix>title</mat-icon>
            <mat-error>Título é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Cliente</mat-label>
            <mat-select formControlName="customerName">
              @for (c of customers; track c) {
                <mat-option [value]="c">{{ c }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>business</mat-icon>
            <mat-error>Cliente é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Valor Estimado (USD)</mat-label>
            <input matInput formControlName="estimatedValue" type="number" placeholder="0.00">
            <mat-icon matPrefix>attach_money</mat-icon>
            <mat-error>Valor é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Probabilidade (%)</mat-label>
            <input matInput formControlName="probability" type="number" min="0" max="100" placeholder="50">
            <mat-icon matPrefix>percent</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Previsão de Fechamento</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="expectedCloseDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Responsável</mat-label>
            <mat-select formControlName="assignedUser">
              @for (u of users; track u) {
                <mat-option [value]="u">{{ u }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>
        </form>
      </div>

      <div class="dialog-footer">
        <button mat-button (click)="cancel()" class="cancel-btn">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()" class="save-btn">
          <mat-icon>save</mat-icon> Criar Oportunidade
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .nova-oportunidade-dialog {
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
      color: #1565c0;
      background: rgba(21, 101, 192, 0.08);
      border-radius: 50%;
      padding: 8px;
      box-sizing: content-box;
    }

    .dialog-header h2 {
      margin: 0;
      font-weight: 500;
      font-size: 1.4rem;
      color: #1565c0;
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
export class NovaOportunidadeDialogComponent {
  private dialogRef = inject(MatDialogRef<NovaOportunidadeDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup;

  customers = [
    'Cargill', 'Bunge', 'LDC', 'ADM', 'COFCO', 'Glencore', 'JBS', 'BRF',
    'Marfrig', 'Minerva', 'Olam', 'Wilmar', 'Amaggi', 'Toyota Tsusho', 'Viterra', 'Carrefour'
  ];

  users = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira'];

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      customerName: ['', Validators.required],
      estimatedValue: [null, [Validators.required, Validators.min(1)]],
      probability: [50],
      expectedCloseDate: [null],
      assignedUser: ['João Silva']
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
