import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { Observable, startWith, debounceTime, map } from 'rxjs';
import { RecebimentosMockService } from '../../../services/recebimentosMockService';
import { 
  Recebimento, 
  RecebimentoFilters, 
  FiltroOptions,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  ContractBasic,
  BankAccount,
  ExchangeRate
} from '../../../types/recebimentos';
// TODO: Importar dialog quando necessário
// import { RecebimentoEditDialogComponent } from './recebimento-edit-dialog/recebimento-edit-dialog.component';

@Component({
  selector: 'app-contas-receber',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatBadgeModule
  ],
  templateUrl: './contas-receber.component.html',
  styleUrl: './contas-receber.component.scss'
})
export class ContasReceberComponent implements OnInit {
  private readonly recebimentosService = inject(RecebimentosMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public recebimentos: Recebimento[] = [];
  public filtroOptions: FiltroOptions | null = null;
  public isLoading = false;
  public totalAmount = 0;
  public pendingAmount = 0;
  public completedAmount = 0;

  public filtroForm: FormGroup;
  public displayedColumns: string[] = [
    'contract', 'amount', 'currency', 'payment_date', 
    'status', 'payment_method', 'bank_name', 'actions'
  ];

  public readonly statusLabels = STATUS_LABELS;
  public readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;

  constructor() {
    this.filtroForm = this.fb.group({
      status: [[]],
      currency: [[]],
      payment_method: [[]],
      contract: [[]],
      date_from: [null],
      date_to: [null],
      amount_min: [null],
      amount_max: [null],
      bank_account: [[]]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.setupFormSubscription();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Carregar opções de filtro
    this.recebimentosService.getFiltroOptions().subscribe({
      next: (options) => {
        this.filtroOptions = options;
      },
      error: (error) => {
        console.error('Erro ao carregar opções de filtro:', error);
        this.showSnackBar('Erro ao carregar opções de filtro', 'error');
      }
    });

    // Carregar recebimentos
    this.loadRecebimentos();
  }

  private loadRecebimentos(): void {
    const filtros = this.buildFiltersFromForm();
    
    this.recebimentosService.getRecebimentos(filtros).subscribe({
      next: (recebimentos) => {
        this.recebimentos = recebimentos;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar recebimentos:', error);
        this.showSnackBar('Erro ao carregar recebimentos', 'error');
        this.isLoading = false;
      }
    });
  }

  private setupFormSubscription(): void {
    this.filtroForm.valueChanges
      .pipe(
        startWith(null),
        debounceTime(500)
      )
      .subscribe(() => {
        this.loadRecebimentos();
      });
  }

  private buildFiltersFromForm(): RecebimentoFilters {
    const formValue = this.filtroForm.value;
    const filtros: RecebimentoFilters = {};

    if (formValue.status && formValue.status.length > 0) {
      filtros.status = formValue.status;
    }
    if (formValue.currency && formValue.currency.length > 0) {
      filtros.currency = formValue.currency;
    }
    if (formValue.payment_method && formValue.payment_method.length > 0) {
      filtros.payment_method = formValue.payment_method;
    }
    if (formValue.contract && formValue.contract.length > 0) {
      filtros.contract = formValue.contract;
    }
    if (formValue.date_from) {
      filtros.date_from = formValue.date_from;
    }
    if (formValue.date_to) {
      filtros.date_to = formValue.date_to;
    }
    if (formValue.amount_min) {
      filtros.amount_min = formValue.amount_min;
    }
    if (formValue.amount_max) {
      filtros.amount_max = formValue.amount_max;
    }
    if (formValue.bank_account && formValue.bank_account.length > 0) {
      filtros.bank_account = formValue.bank_account;
    }

    return filtros;
  }

  private calculateTotals(): void {
    this.totalAmount = this.recebimentos.reduce((sum, r) => {
      // Converter para BRL usando taxa de câmbio
      const exchangeRate = r.exchange_rate || 1;
      return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
    }, 0);

    this.pendingAmount = this.recebimentos
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => {
        const exchangeRate = r.exchange_rate || 1;
        return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
      }, 0);

    this.completedAmount = this.recebimentos
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => {
        const exchangeRate = r.exchange_rate || 1;
        return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
      }, 0);
  }

  public openCreateDialog(): void {
    // Import dinâmico para evitar dependência circular
    import('./recebimento-edit-dialog/recebimento-edit-dialog.component').then((module) => {
      const dialogRef = this.dialog.open(module.RecebimentoEditDialogComponent, {
        width: '800px',
        data: { 
          isEdit: false,
          filtroOptions: this.filtroOptions 
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.createRecebimento(result);
        }
      });
    }).catch(error => {
      console.error('Erro ao carregar dialog:', error);
      this.showSnackBar('Erro ao abrir formulario', 'error');
    });
  }

  public openEditDialog(recebimento: Recebimento): void {
    // Import dinâmico para evitar dependência circular
    import('./recebimento-edit-dialog/recebimento-edit-dialog.component').then((module) => {
      const dialogRef = this.dialog.open(module.RecebimentoEditDialogComponent, {
        width: '800px',
        data: { 
          isEdit: true, 
          recebimento: { ...recebimento },
          filtroOptions: this.filtroOptions 
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.updateRecebimento(recebimento.id!, result);
        }
      });
    }).catch(error => {
      console.error('Erro ao carregar dialog:', error);
      this.showSnackBar('Erro ao abrir formulario', 'error');
    });
  }

  private createRecebimento(data: Omit<Recebimento, 'id' | 'created_at' | 'updated_at'>): void {
    this.isLoading = true;
    
    this.recebimentosService.createRecebimento(data).subscribe({
      next: (recebimento) => {
        this.showSnackBar('Recebimento criado com sucesso!', 'success');
        this.loadRecebimentos();
      },
      error: (error) => {
        console.error('Erro ao criar recebimento:', error);
        this.showSnackBar('Erro ao criar recebimento', 'error');
        this.isLoading = false;
      }
    });
  }

  private updateRecebimento(id: string, data: Partial<Recebimento>): void {
    this.isLoading = true;
    
    this.recebimentosService.updateRecebimento(id, data).subscribe({
      next: (recebimento) => {
        this.showSnackBar('Recebimento atualizado com sucesso!', 'success');
        this.loadRecebimentos();
      },
      error: (error) => {
        console.error('Erro ao atualizar recebimento:', error);
        this.showSnackBar('Erro ao atualizar recebimento', 'error');
        this.isLoading = false;
      }
    });
  }

  public deleteRecebimento(recebimento: Recebimento): void {
    if (confirm(`Tem certeza que deseja excluir o recebimento de ${this.formatCurrency(recebimento.amount, recebimento.currency)}?`)) {
      this.isLoading = true;
      
      this.recebimentosService.deleteRecebimento(recebimento.id!).subscribe({
        next: (success) => {
          if (success) {
            this.showSnackBar('Recebimento excluído com sucesso!', 'success');
            this.loadRecebimentos();
          } else {
            this.showSnackBar('Erro ao excluir recebimento', 'error');
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Erro ao excluir recebimento:', error);
          this.showSnackBar('Erro ao excluir recebimento', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  public processarPagamento(recebimento: Recebimento): void {
    this.isLoading = true;
    
    this.recebimentosService.processarPagamentoBancario(recebimento.id!).subscribe({
      next: (result) => {
        if (result.success) {
          this.showSnackBar('Pagamento processado com sucesso!', 'success');
          // Atualizar status para processing
          this.updateRecebimento(recebimento.id!, { 
            status: 'processing',
            transaction_id: result.transactionId 
          });
        } else {
          this.showSnackBar(`Falha no processamento: ${result.message}`, 'error');
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Erro ao processar pagamento:', error);
        this.showSnackBar('Erro na integração bancária', 'error');
        this.isLoading = false;
      }
    });
  }

  public getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  public getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }

  public getPaymentMethodLabel(method: string): string {
    return this.paymentMethodLabels[method as keyof typeof this.paymentMethodLabels] || method;
  }

  public clearFilters(): void {
    this.filtroForm.reset();
  }

  public formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  public formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  public getContractName(contractId: string): string {
    if (!this.filtroOptions) return contractId;
    const contract = this.filtroOptions.contracts.find(c => c.id === contractId);
    return contract ? `${contract.number} - ${contract.client_name}` : contractId;
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}