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
  selector: 'app-nova-lc-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-header">
        <mat-icon>add_card</mat-icon>
        <div>
          <h2>Nova Carta de Crédito</h2>
          <p>Registrar novo instrumento LC</p>
        </div>
      </div>
      <div class="dialog-body">
        <form [formGroup]="form" class="dialog-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Banco Emissor</mat-label>
              <mat-select formControlName="bank">
                <mat-option value="HSBC">HSBC</mat-option>
                <mat-option value="Citibank">Citibank</mat-option>
                <mat-option value="Deutsche Bank">Deutsche Bank</mat-option>
                <mat-option value="Standard Chartered">Standard Chartered</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Moeda</mat-label>
              <mat-select formControlName="currency">
                <mat-option value="USD">USD</mat-option>
                <mat-option value="EUR">EUR</mat-option>
                <mat-option value="GBP">GBP</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Valor</mat-label>
              <input matInput type="number" formControlName="value">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Beneficiário</mat-label>
              <input matInput formControlName="beneficiary">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Solicitante (Applicant)</mat-label>
              <input matInput formControlName="applicant">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Contrato Vinculado</mat-label>
              <input matInput formControlName="linkedContract">
            </mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Data Vencimento</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="expiryDate">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Incoterm</mat-label>
              <mat-select formControlName="incoterm">
                <mat-option value="FOB">FOB</mat-option>
                <mat-option value="CIF">CIF</mat-option>
                <mat-option value="CFR">CFR</mat-option>
                <mat-option value="DAP">DAP</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descrição</mat-label>
            <textarea matInput formControlName="description" rows="2"></textarea>
          </mat-form-field>
        </form>
      </div>
      <div class="dialog-footer">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSubmit()">Registrar LC</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-wrapper { display: flex; flex-direction: column; height: 100%; }
    .dialog-header { display: flex; align-items: center; gap: 16px; padding: 24px 24px 16px; border-bottom: 1px solid #e0e0e0; mat-icon { font-size: 32px; width: 32px; height: 32px; color: #512da8; } h2 { margin: 0; font-size: 1.3rem; } p { margin: 4px 0 0; color: #666; font-size: 0.85rem; } }
    .dialog-body { flex: 1; padding: 24px; overflow-y: auto; }
    .dialog-form { display: flex; flex-direction: column; gap: 8px; }
    .form-row { display: flex; gap: 16px; mat-form-field { flex: 1; } }
    .full-width { width: 100%; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; flex-shrink: 0; background: #fafafa; border-top: 1px solid #e0e0e0; }
  `]
})
export class NovaLcDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<NovaLcDialogComponent>);

  form: FormGroup = this.fb.group({
    bank: ['', Validators.required],
    currency: ['USD', Validators.required],
    value: [null, [Validators.required, Validators.min(1)]],
    beneficiary: ['', Validators.required],
    applicant: ['', Validators.required],
    linkedContract: [''],
    expiryDate: [null, Validators.required],
    incoterm: ['FOB'],
    description: ['']
  });

  onSubmit(): void { if (this.form.valid) this.dialogRef.close(this.form.value); }
  onCancel(): void { this.dialogRef.close(); }
}
