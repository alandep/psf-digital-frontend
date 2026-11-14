import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { startWith } from 'rxjs';
import { MarketQuoteService } from '../../../services/market/market-quote.service';
import {
  RecebimentosHttpService,
  RecebimentoInput,
  RecebimentoItem
} from '../../../services/finance/recebimentos-http.service';
import { apiErrorMessage } from '../../../services/finance/finance-utils';
import { CURRENCY_LIST } from '../../../../types/recebimentos';
import { ContratoCambio } from '../../../../types/cambio';

export interface RecebimentoEditDialogData {
  /** Presente quando é edição. */
  recebimento: RecebimentoItem | null;
  /** Contratos de câmbio reais (GET /bff/financeiro/cambio). */
  contracts: ContratoCambio[];
  currencies?: string[];
}

@Component({
  selector: 'app-recebimento-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './recebimento-edit-dialog.component.html',
  styleUrl: './recebimento-edit-dialog.component.scss'
})
export class RecebimentoEditDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly recebimentos = inject(RecebimentosHttpService);
  private readonly market = inject(MarketQuoteService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<RecebimentoEditDialogComponent>);
  public readonly data = inject<RecebimentoEditDialogData>(MAT_DIALOG_DATA);

  public readonly isEdit = !!this.data.recebimento;
  public recebimentoForm: FormGroup;
  public isSubmitting = false;
  /** Cotação real vigente da moeda (null = indisponível; BRL não precisa). */
  public currentRate: number | null = null;
  public rateUnavailable = false;
  public convertedAmount = 0;

  public readonly currencyList = this.data.currencies?.length ? this.data.currencies : CURRENCY_LIST;

  constructor() {
    const r = this.data.recebimento;
    this.recebimentoForm = this.fb.group({
      cliente: [r?.cliente ?? '', [Validators.required]],
      referencia: [r?.referencia ?? ''],
      descricao: [r?.descricao ?? '', [Validators.required]],
      amount: [r?.amount ?? null, [Validators.required, Validators.min(0.01)]],
      currency: [r?.currency ?? 'USD', [Validators.required]],
      dueDate: [r?.dueDate ?? null, [Validators.required]],
      contratoCambioId: [r?.contratoCambioId ?? ''],
      contaBancaria: [r?.contaBancaria ?? ''],
      observacoes: [r?.observacoes ?? '']
    });
  }

  ngOnInit(): void {
    const currency = this.recebimentoForm.get('currency')!;
    const amount = this.recebimentoForm.get('amount')!;

    // Conversão informativa para BRL pela cotação real; sem cotação, avisa.
    currency.valueChanges
      .pipe(startWith(currency.value), takeUntilDestroyed(this.destroyRef))
      .subscribe((c: string) => this.loadRate(c));

    amount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.calculateConversion());
  }

  private loadRate(currency: string): void {
    this.currentRate = null;
    this.rateUnavailable = false;
    if (!currency || currency === 'BRL') {
      this.calculateConversion();
      return;
    }
    this.market.getRate(currency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rate) => {
        // ignora resposta atrasada de outra moeda
        if (this.recebimentoForm.get('currency')?.value !== currency) {
          return;
        }
        this.currentRate = rate;
        this.rateUnavailable = rate === null;
        this.calculateConversion();
      });
  }

  private calculateConversion(): void {
    const amount = Number(this.recebimentoForm.get('amount')?.value) || 0;
    const currency = this.recebimentoForm.get('currency')?.value;
    if (currency === 'BRL') {
      this.convertedAmount = amount;
    } else {
      this.convertedAmount = this.currentRate ? amount * this.currentRate : 0;
    }
  }

  public onSubmit(): void {
    if (this.recebimentoForm.invalid) {
      this.recebimentoForm.markAllAsTouched();
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }
    const v = this.recebimentoForm.getRawValue();
    const input: RecebimentoInput = {
      cliente: v.cliente,
      referencia: v.referencia,
      descricao: v.descricao,
      contaBancaria: v.contaBancaria,
      contratoCambioId: v.contratoCambioId || null,
      observacoes: v.observacoes,
      amount: Number(v.amount),
      currency: v.currency,
      dueDate: v.dueDate
    };

    this.isSubmitting = true;
    const call = this.data.recebimento
      ? this.recebimentos.update(this.data.recebimento.id, input)
      : this.recebimentos.create(input);
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (saved) => this.dialogRef.close(saved),
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(apiErrorMessage(err, 'Erro ao salvar recebimento'), 'Fechar', { duration: 5000 });
      }
    });
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }
}
