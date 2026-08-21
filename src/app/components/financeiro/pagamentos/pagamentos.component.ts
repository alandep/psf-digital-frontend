import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services and Types
import { PagamentosMockService } from '../../../../services/pagamentosMockService';
import { PagamentoDialogComponent } from './pagamento-dialog/pagamento-dialog.component';
import { PagamentoDetailDialogComponent } from './pagamento-detail-dialog/pagamento-detail-dialog.component';
import {
  Pagamento,
  PaymentMetrics,
  CashFlowProjection,
  PaymentFilters,
  PaymentStatus,
  PaymentCategory
} from '../../../../types/pagamentos';

@Component({
  selector: 'app-pagamentos',
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
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './pagamentos.component.html',
  styleUrls: ['./pagamentos.component.scss']
})
export class PagamentosComponent implements OnInit, OnDestroy {

  // Services
  private pagamentosService = inject(PagamentosMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // ViewChild
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data State
  payments: Pagamento[] = [];
  dataSource = new MatTableDataSource<Pagamento>([]);
  selectedPayment: Pagamento | null = null;
  metrics: PaymentMetrics | null = null;
  cashFlow: CashFlowProjection | null = null;

  // UI State
  isLoading = false;

  // Forms
  filterForm!: FormGroup;

  // Table columns
  displayedColumns: string[] = [
    'paymentNumber', 'beneficiary', 'category', 'amount',
    'currency', 'dueDate', 'status', 'paymentType',
    'aiFinancialScore', 'actions'
  ];

  // Dropdown data
  beneficiaries: string[] = [];
  categories: PaymentCategory[] = [];
  banks: string[] = [];
  currencies: string[] = [];
  statuses: PaymentStatus[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.loadPayments();
    this.loadMetrics();
    this.loadCashFlow();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      status: [''],
      category: [''],
      paymentType: [''],
      beneficiary: [''],
      currency: [''],
      bank: [''],
      dateStart: [null],
      dateEnd: [null]
    });
  }

  private loadDropdownData(): void {
    this.beneficiaries = this.pagamentosService.getBeneficiaries();
    this.categories = this.pagamentosService.getCategories();
    this.banks = this.pagamentosService.getBanks();
    this.currencies = this.pagamentosService.getCurrencies();
    this.statuses = this.pagamentosService.getStatuses();
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
  }

  loadPayments(): void {
    this.isLoading = true;
    this.pagamentosService.getPayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.payments = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar pagamentos', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.pagamentosService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  loadCashFlow(): void {
    this.pagamentosService.getCashFlowProjection()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cf => this.cashFlow = cf);
  }

  applyFilters(): void {
    const filters: PaymentFilters = this.filterForm.value;
    this.pagamentosService.getPayments(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.payments = data;
        this.dataSource.data = data;
      });
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      status: '',
      category: '',
      paymentType: '',
      beneficiary: '',
      currency: '',
      bank: '',
      dateStart: null,
      dateEnd: null
    });
  }

  selectPayment(payment: Pagamento): void {
    this.selectedPayment = payment;
    const dialogRef = this.dialog.open(PagamentoDetailDialogComponent, {
      data: { payment },
      width: '1080px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'pagamento-detail-dialog-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === 'refresh') {
          this.loadPayments();
          this.loadMetrics();
        }
      });
  }

  createPayment(): void {
    const dialogRef = this.dialog.open(PagamentoDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      height: '85vh',
      maxHeight: '750px',
      disableClose: false,
      panelClass: 'pagamento-dialog-container',
      data: {
        beneficiaries: this.beneficiaries,
        categories: this.categories,
        banks: this.banks,
        currencies: this.currencies
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.pagamentosService.createPayment(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Pagamento criado com sucesso!', 'OK', { duration: 3000 });
              this.loadPayments();
              this.loadMetrics();
              this.loadCashFlow();
              this.isLoading = false;
            },
            error: () => {
              this.snackBar.open('Erro ao criar pagamento', 'Fechar', { duration: 5000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  approvePayment(payment: Pagamento): void {
    this.pagamentosService.approvePayment(payment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(`Pagamento ${payment.paymentNumber} aprovado com sucesso`, 'OK', { duration: 3000 });
          this.loadPayments();
          this.loadMetrics();
        },
        error: () => {
          this.snackBar.open('Erro ao aprovar pagamento', 'Fechar', { duration: 3000 });
        }
      });
  }

  reconcilePayment(payment: Pagamento): void {
    this.pagamentosService.reconcilePayment(payment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(`Pagamento ${payment.paymentNumber} conciliado com sucesso`, 'OK', { duration: 3000 });
          this.loadPayments();
          this.loadMetrics();
        },
        error: () => {
          this.snackBar.open('Erro ao conciliar pagamento', 'Fechar', { duration: 3000 });
        }
      });
  }

  exportPDF(): void {
    this.snackBar.open('Exportando relatório de pagamentos em PDF...', 'OK', { duration: 2000 });
  }

  simulateCashFlow(): void {
    this.snackBar.open('Simulação de fluxo de caixa em desenvolvimento', 'OK', { duration: 3000 });
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  formatCurrency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  getStatusColor(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      'PENDENTE': 'status-pendente',
      'APROVADO': 'status-aprovado',
      'PAGO': 'status-pago',
      'VENCIDO': 'status-vencido',
      'CANCELADO': 'status-cancelado',
      'CONCILIADO': 'status-conciliado'
    };
    return map[status] || '';
  }

  getCategoryColor(category: PaymentCategory): string {
    const map: Record<PaymentCategory, string> = {
      'FRETE': 'cat-frete',
      'ARMAZENAGEM': 'cat-armazenagem',
      'DESPACHANTE': 'cat-despachante',
      'SEGURO': 'cat-seguro',
      'COMISSÃO': 'cat-comissao',
      'TAXAS_PORTUÁRIAS': 'cat-portuarias',
      'TAXAS_BANCÁRIAS': 'cat-bancarias',
      'CERTIFICADOS': 'cat-certificados',
      'TRANSPORTE': 'cat-transporte',
      'TRIBUTOS': 'cat-tributos',
      'FORNECEDORES': 'cat-fornecedores',
      'OUTROS': 'cat-outros'
    };
    return map[category] || '';
  }

  getCategoryLabel(category: PaymentCategory): string {
    const map: Record<PaymentCategory, string> = {
      'FRETE': 'Frete',
      'ARMAZENAGEM': 'Armazenagem',
      'DESPACHANTE': 'Despachante',
      'SEGURO': 'Seguro',
      'COMISSÃO': 'Comissão',
      'TAXAS_PORTUÁRIAS': 'Taxas Portuárias',
      'TAXAS_BANCÁRIAS': 'Taxas Bancárias',
      'CERTIFICADOS': 'Certificados',
      'TRANSPORTE': 'Transporte',
      'TRIBUTOS': 'Tributos',
      'FORNECEDORES': 'Fornecedores',
      'OUTROS': 'Outros'
    };
    return map[category] || category;
  }

  getScoreColor(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
  }

  isOverdue(payment: Pagamento): boolean {
    return payment.status === 'VENCIDO' || (payment.status === 'PENDENTE' && new Date(payment.dueDate) < new Date());
  }

  isDueSoon(payment: Pagamento): boolean {
    if (payment.status !== 'PENDENTE' && payment.status !== 'APROVADO') return false;
    const dueDate = new Date(payment.dueDate);
    const now = new Date();
    const diff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }
}
