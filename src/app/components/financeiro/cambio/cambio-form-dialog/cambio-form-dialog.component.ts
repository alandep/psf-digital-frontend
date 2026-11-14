import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { startWith } from 'rxjs';
import { MarketQuoteService } from '../../../../services/market/market-quote.service';
import { bindLiveRate } from '../../../../services/market/live-rate';
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
  statuses?: ContractStatus[];
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
  private market = inject(MarketQuoteService);
  private destroyRef = inject(DestroyRef);
  taxaInfo = '';
  readonly data = inject<CambioFormDialogData>(MAT_DIALOG_DATA);

  banks: string[] = this.data.banks || [];
  currencies: string[] = this.data.currencies || [];
  statuses: ContractStatus[] = this.data.statuses || [];

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      side: ['VENDA', Validators.required],
      bank: [''],
      currency: ['USD', Validators.required],
      closingDate: [new Date(), Validators.required],
      liquidationDate: [null],
      foreignValue: [null, [Validators.required, Validators.min(0.01)]],
      exchangeRate: [null, [Validators.required, Validators.min(0.0001)]]
    });

    // Taxa sugerida = cotação real da moeda do contrato (editável: taxa negociada).
    const currency = this.form.get('currency')!;
    bindLiveRate(this.market, this.form.get('exchangeRate')!,
      currency.valueChanges.pipe(startWith(currency.value)), this.destroyRef, (m) => (this.taxaInfo = m));
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
      side: v.side,
      bank: v.bank,
      currency: v.currency,
      foreignValue,
      exchangeRate,
      brlValue: foreignValue * exchangeRate,
      closingDate: v.closingDate,
      liquidationDate: v.liquidationDate ?? undefined
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
