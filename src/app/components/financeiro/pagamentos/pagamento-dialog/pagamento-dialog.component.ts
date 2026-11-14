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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// Types
import { Pagamento } from '../../../../../types/pagamentos';
import { ContratoCambio } from '../../../../../types/cambio';

export interface PagamentoDialogData {
  currencies: string[];
  /** Contratos de câmbio reais (GET /bff/financeiro/cambio) para vincular. */
  exchangeContracts: ContratoCambio[];
  /** Presente quando o diálogo é de edição. */
  payment?: Pagamento | null;
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

  readonly editing = !!this.data.payment;
  paymentForm!: FormGroup;

  constructor() {
    const p = this.data.payment;
    this.paymentForm = this.formBuilder.group({
      beneficiary: [p?.beneficiary ?? '', Validators.required],
      description: [p?.description ?? '', Validators.required],
      paymentNumber: [p?.paymentNumber ?? ''],
      bankAccount: [p?.bankAccount ?? ''],
      currency: [p?.currency ?? 'BRL', Validators.required],
      amount: [p?.amount ?? null, [Validators.required, Validators.min(0.01)]],
      dueDate: [p?.dueDate ?? null, Validators.required],
      linkedExchangeContractId: [p?.linkedExchangeContractId ?? ''],
      observations: [p?.observations ?? '']
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const v = this.paymentForm.getRawValue();
    const result: Partial<Pagamento> = {
      beneficiary: v.beneficiary,
      description: v.description,
      paymentNumber: v.paymentNumber,
      bankAccount: v.bankAccount,
      currency: v.currency,
      amount: Number(v.amount),
      dueDate: v.dueDate,
      linkedExchangeContractId: v.linkedExchangeContractId || null,
      linkedExportId: this.data.payment?.linkedExportId ?? null,
      observations: v.observations
    };
    this.dialogRef.close(result);
  }
}
