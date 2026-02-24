import { Component, OnInit, inject, Inject } from '@angular/core';
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
import { RecebimentosMockService } from '../../../../services/recebimentosMockService';
import { 
  Recebimento, 
  FiltroOptions,
  CURRENCY_LIST,
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS,
  ExchangeRate
} from '../../../../types/recebimentos';

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
    MatDividerModule
  ],
  templateUrl: './recebimento-edit-dialog.component.html',
  styleUrl: './recebimento-edit-dialog.component.scss'
})
export class RecebimentoEditDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly recebimentosService = inject(RecebimentosMockService);
  private readonly dialogRef = inject(MatDialogRef<RecebimentoEditDialogComponent>);

  public recebimentoForm: FormGroup;
  public isSubmitting = false;
  public currentExchangeRate: ExchangeRate | null = null;
  public convertedAmount = 0;

  public readonly currencyList = CURRENCY_LIST;
  public readonly paymentMethods = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }));
  public readonly statusList = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      isEdit: boolean; 
      recebimento?: Recebimento; 
      filtroOptions: FiltroOptions 
    }
  ) {
    this.recebimentoForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', [Validators.required]],
      payment_date: [null, [Validators.required]],
      contract: ['', [Validators.required]],
      payment_method: ['wire_transfer', [Validators.required]],
      status: ['pending', [Validators.required]],
      bank_account: [''],
      transaction_id: [''],
      // Campos de controle cambial
      exchange_rate: [null],
      original_amount: [null],
      original_currency: [''],
      created_by: ['financeiro@psf.com']
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.recebimento) {
      this.populateForm(this.data.recebimento);
    }

    this.setupFormSubscriptions();
  }

  private populateForm(recebimento: Recebimento): void {
    this.recebimentoForm.patchValue({
      amount: recebimento.amount,
      currency: recebimento.currency,
      payment_date: new Date(recebimento.payment_date),
      contract: recebimento.contract,
      payment_method: recebimento.payment_method,
      status: recebimento.status,
      bank_account: recebimento.bank_account || '',
      transaction_id: recebimento.transaction_id || '',
      exchange_rate: recebimento.exchange_rate || null,
      original_amount: recebimento.original_amount || null,
      original_currency: recebimento.original_currency || '',
      created_by: recebimento.created_by || 'financeiro@psf.com'
    });

    if (recebimento.currency !== 'BRL' && recebimento.exchange_rate) {
      this.convertedAmount = recebimento.amount * recebimento.exchange_rate;
    }
  }

  private setupFormSubscriptions(): void {
    // Monitorar mudanças na moeda para buscar taxa de câmbio
    this.recebimentoForm.get('currency')?.valueChanges.subscribe(currency => {
      if (currency && currency !== 'BRL') {
        this.loadExchangeRate(currency);
      } else {
        this.currentExchangeRate = null;
        this.convertedAmount = 0;
        this.recebimentoForm.patchValue({
          exchange_rate: null,
          original_amount: null,
          original_currency: ''
        });
      }
    });

    // Monitorar mudanças no valor para calcular conversão
    this.recebimentoForm.get('amount')?.valueChanges.subscribe(amount => {
      this.calculateConversion();
    });

    // Monitorar mudanças na taxa de câmbio
    this.recebimentoForm.get('exchange_rate')?.valueChanges.subscribe(() => {
      this.calculateConversion();
    });
  }

  private loadExchangeRate(currency: string): void {
    this.recebimentosService.getTaxaCambio(currency, 'BRL').subscribe({
      next: (rate) => {
        if (rate) {
          this.currentExchangeRate = rate;
          this.recebimentoForm.patchValue({
            exchange_rate: rate.rate,
            original_currency: currency
          });
          this.calculateConversion();
        }
      },
      error: (error) => {
        console.error('Erro ao buscar taxa de câmbio:', error);
        this.showSnackBar('Erro ao buscar taxa de câmbio', 'error');
      }
    });
  }

  private calculateConversion(): void {
    const amount = this.recebimentoForm.get('amount')?.value;
    const exchangeRate = this.recebimentoForm.get('exchange_rate')?.value;

    if (amount && exchangeRate) {
      this.convertedAmount = amount * exchangeRate;
      this.recebimentoForm.patchValue({
        original_amount: amount
      });
    } else {
      this.convertedAmount = 0;
    }
  }

  public refreshExchangeRate(): void {
    const currency = this.recebimentoForm.get('currency')?.value;
    if (currency && currency !== 'BRL') {
      this.loadExchangeRate(currency);
      this.showSnackBar('Taxa de câmbio atualizada', 'success');
    }
  }

  public onSubmit(): void {
    if (this.recebimentoForm.valid) {
      this.isSubmitting = true;
      
      const formData = { ...this.recebimentoForm.value };
      
      // Converter data para formato ISO
      if (formData.payment_date) {
        formData.payment_date = formData.payment_date.toISOString();
      }

      // Remove campos vazios
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === null) {
          delete formData[key];
        }
      });

      this.dialogRef.close(formData);
    } else {
      this.showSnackBar('Por favor, preencha todos os campos obrigatórios', 'error');
    }
  }

  public onCancel(): void {
    this.dialogRef.close();
  }

  public getFieldError(fieldName: string): string {
    const field = this.recebimentoForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} deve ser maior que zero`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      amount: 'Valor',
      currency: 'Moeda',
      payment_date: 'Data de Pagamento',
      contract: 'Contrato',
      payment_method: 'Forma de Pagamento',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  public formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}