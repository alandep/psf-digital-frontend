import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// Types
import { PaymentCategory, PaymentType } from '../../../../../types/pagamentos';

export interface PagamentoDialogData {
  beneficiaries: string[];
  categories: PaymentCategory[];
  banks: string[];
  currencies: string[];
}

@Component({
  selector: 'app-pagamento-dialog',
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
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule
  ],
  templateUrl: './pagamento-dialog.component.html',
  styleUrls: ['./pagamento-dialog.component.scss']
})
export class PagamentoDialogComponent {
  private dialogRef = inject(MatDialogRef<PagamentoDialogComponent>);
  public data: PagamentoDialogData = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);

  // Form
  paymentForm!: FormGroup;

  // Payment types for select
  paymentTypes: { value: PaymentType; label: string }[] = [
    { value: 'NACIONAL', label: 'Nacional' },
    { value: 'INTERNACIONAL', label: 'Internacional' }
  ];

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.paymentForm = this.formBuilder.group({
      // Dados Gerais
      paymentNumber: [{ value: this.generatePaymentNumber(), disabled: true }],
      company: ['PSF Exportadora Ltda'],
      beneficiary: ['', Validators.required],
      paymentType: ['NACIONAL'],
      category: ['', Validators.required],
      bank: ['', Validators.required],
      bankAccount: [''],
      currency: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      issueDate: [new Date()],
      dueDate: [null, Validators.required],
      costCenter: [''],
      observations: [''],

      // Internacional
      swift: [''],
      iban: [''],
      beneficiaryBank: [''],
      beneficiaryCountry: [''],

      // Vinculações
      linkedExportNumber: [''],
      linkedContractNumber: [''],
      linkedInvoiceNumber: [''],
      linkedDueNumber: ['']
    });
  }

  private generatePaymentNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return `PGT-${year}-${seq}`;
  }

  isInternational(): boolean {
    return this.paymentForm.get('paymentType')?.value === 'INTERNACIONAL';
  }

  close(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.paymentForm.invalid) return;

    const formValue = this.paymentForm.getRawValue();
    this.dialogRef.close(formValue);
  }
}
