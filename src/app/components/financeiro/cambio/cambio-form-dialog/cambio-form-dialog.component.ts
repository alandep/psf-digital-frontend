import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ContractStatus } from '../../../../../types/cambio';

interface CambioFormDialogData {
  banks: string[];
  currencies: string[];
  statuses: ContractStatus[];
}

@Component({
  selector: 'app-cambio-form-dialog',
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
  templateUrl: './cambio-form-dialog.component.html',
  styleUrls: ['./cambio-form-dialog.component.scss']
})
export class CambioFormDialogComponent implements OnInit {

  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CambioFormDialogComponent>);
  readonly data = inject<CambioFormDialogData>(MAT_DIALOG_DATA);

  banks: string[] = this.data.banks || [];
  currencies: string[] = this.data.currencies || [];
  statuses: ContractStatus[] = this.data.statuses || [];

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      contractNumber: ['', Validators.required],
      bank: ['', Validators.required],
      exporterName: ['', Validators.required],
      currency: ['USD', Validators.required],
      foreignValue: [100000, [Validators.required, Validators.min(1)]],
      exchangeRate: [5.18, [Validators.required, Validators.min(0.0001)]],
      status: ['ABERTO', Validators.required],
      closingDate: [new Date(), Validators.required],
      liquidationDate: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Validators.required],
      linkedExportNumber: [''],
      linkedInvoiceNumber: [''],
      linkedDueNumber: ['']
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const foreignValue = Number(v.foreignValue) || 0;
    const exchangeRate = Number(v.exchangeRate) || 0;
    this.dialogRef.close({
      ...v,
      foreignValue,
      exchangeRate,
      brlValue: foreignValue * exchangeRate,
      spread: 0,
      aiFinancialScore: 0,
      gainLoss: 0
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
