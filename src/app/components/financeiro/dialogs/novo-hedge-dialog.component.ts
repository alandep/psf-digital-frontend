import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-novo-hedge-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <mat-icon>shield</mat-icon>
        <div>
          <h2>Novo Contrato de Hedge</h2>
          <p>Registrar novo derivativo cambial</p>
        </div>
      </div>
      <div class="dialog-body">
        <form [formGroup]="form" class="dialog-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type">
                <mat-option value="NDF">NDF</mat-option>
                <mat-option value="FORWARD">Forward</mat-option>
                <mat-option value="OPTION_CALL">Opção Call</mat-option>
                <mat-option value="OPTION_PUT">Opção Put</mat-option>
                <mat-option value="SWAP">Swap</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Banco</mat-label>
              <mat-select formControlName="bank">
                <mat-option value="BTG Pactual">BTG Pactual</mat-option>
                <mat-option value="Itaú BBA">Itaú BBA</mat-option>
                <mat-option value="Bradesco BBI">Bradesco BBI</mat-option>
                <mat-option value="J.P. Morgan">J.P. Morgan</mat-option>
                <mat-option value="Goldman Sachs">Goldman Sachs</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Par Cambial</mat-label>
              <mat-select formControlName="currencyPair">
                <mat-option value="USD/BRL">USD/BRL</mat-option>
                <mat-option value="EUR/BRL">EUR/BRL</mat-option>
                <mat-option value="GBP/BRL">GBP/BRL</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Direção</mat-label>
              <mat-select formControlName="direction">
                <mat-option value="BUY">Compra</mat-option>
                <mat-option value="SELL">Venda</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Valor Nocional</mat-label>
              <input matInput type="number" formControlName="notionalValue">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Taxa Strike</mat-label>
              <input matInput type="number" step="0.0001" formControlName="strikeRate">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Data Vencimento</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="maturityDate">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Contraparte</mat-label>
              <input matInput formControlName="counterparty">
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notas</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>
        </form>
      </div>
      <div class="dialog-footer">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">Registrar Hedge</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrapper { display: flex; flex-direction: column; height: 100%; }
    .dialog-header { display: flex; align-items: center; gap: 16px; padding: 24px 24px 16px; border-bottom: 1px solid #e0e0e0; mat-icon { font-size: 32px; width: 32px; height: 32px; color: #ff8f00; } h2 { margin: 0; font-size: 1.3rem; } p { margin: 4px 0 0; color: #666; font-size: 0.85rem; } }
    .dialog-body { flex: 1; padding: 24px; overflow-y: auto; }
    .dialog-form { display: flex; flex-direction: column; gap: 8px; }
    .form-row { display: flex; gap: 16px; mat-form-field { flex: 1; } }
    .full-width { width: 100%; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; flex-shrink: 0; background: #fafafa; border-top: 1px solid #e0e0e0; }
  `]
})
export class NovoHedgeDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NovoHedgeDialogComponent>);

  form: FormGroup = this.fb.group({
    type: ['NDF', Validators.required],
    bank: ['', Validators.required],
    currencyPair: ['USD/BRL', Validators.required],
    direction: ['SELL', Validators.required],
    notionalValue: [null, [Validators.required, Validators.min(1)]],
    strikeRate: [null, [Validators.required, Validators.min(0.01)]],
    maturityDate: [null, Validators.required],
    counterparty: ['', Validators.required],
    notes: ['']
  });

  onSubmit(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
  onCancel(): void { this.dialogRef.close(); }
}
