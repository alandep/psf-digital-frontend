import { Component, OnInit, OnDestroy, AfterViewInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';
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
import { PAGAMENTOS_SERVICE } from '../../../services/finance/pagamentos-service.token';
import { CAMBIO_SERVICE } from '../../../services/finance/cambio-service.token';
import { apiErrorMessage } from '../../../services/finance/finance-utils';
import { PagamentoDialogComponent } from './pagamento-dialog/pagamento-dialog.component';
import { PagamentoDetailDialogComponent } from './pagamento-detail-dialog/pagamento-detail-dialog.component';
import {
  Pagamento,
  PaymentMetrics,
  CashFlowProjection,
  PaymentFilters,
  PaymentStatus
} from '../../../../types/pagamentos';
import { ContratoCambio } from '../../../../types/cambio';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

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
    MatDialogModule,
    HasPermissionDirective
  ],
  templateUrl: './pagamentos.component.html',
  styleUrls: ['./pagamentos.component.scss']
})
export class PagamentosComponent implements OnInit, OnDestroy, AfterViewInit {

  // Services
  private pagamentosService = inject(PAGAMENTOS_SERVICE);
  private cambioService = inject(CAMBIO_SERVICE);
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
    'paymentNumber', 'beneficiary', 'amount',
    'currency', 'dueDate', 'status', 'paymentType', 'actions'
  ];

  // Dropdown data
  beneficiaries: string[] = [];
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
      paymentType: [''],
      beneficiary: [''],
      currency: [''],
      dateStart: [null],
      dateEnd: [null]
    });
  }

  private loadDropdownData(): void {
    this.beneficiaries = this.pagamentosService.getBeneficiaries();
    this.currencies = this.pagamentosService.getCurrencies();
    this.statuses = this.pagamentosService.getStatuses();
    this.pagamentosService.loadCurrencies()
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => this.currencies = list);
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
          this.beneficiaries = this.pagamentosService.getBeneficiaries();
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open(apiErrorMessage(err, 'Erro ao carregar pagamentos'), 'Fechar', { duration: 4000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.pagamentosService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: metrics => this.metrics = metrics, error: () => this.metrics = null });
  }

  loadCashFlow(): void {
    this.pagamentosService.getCashFlowProjection()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: cf => this.cashFlow = cf, error: () => this.cashFlow = null });
  }

  private reloadAll(): void {
    this.loadPayments();
    this.loadMetrics();
    this.loadCashFlow();
  }

  applyFilters(): void {
    const filters: PaymentFilters = {
      searchText: this.filterForm.value.searchText ?? '',
      status: this.filterForm.value.status ?? '',
      category: '',
      paymentType: this.filterForm.value.paymentType ?? '',
      beneficiary: this.filterForm.value.beneficiary ?? '',
      currency: this.filterForm.value.currency ?? '',
      bank: '',
      dateStart: this.filterForm.value.dateStart ?? null,
      dateEnd: this.filterForm.value.dateEnd ?? null
    };
    this.pagamentosService.getPayments(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.payments = data;
          this.dataSource.data = data;
        },
        error: (err) => this.snackBar.open(apiErrorMessage(err, 'Erro ao filtrar pagamentos'), 'Fechar', { duration: 4000 })
      });
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      status: '',
      paymentType: '',
      beneficiary: '',
      currency: '',
      dateStart: null,
      dateEnd: null
    });
  }

  selectPayment(payment: Pagamento): void {
    this.selectedPayment = payment;
    this.dialog.open(PagamentoDetailDialogComponent, {
      data: { payment },
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'pagamento-detail-dialog-panel'
    });
  }

  // Abre o formulário (novo ou edição) já com os contratos de câmbio reais.
  private openForm(payment?: Pagamento): void {
    this.cambioService.getContracts()
      .pipe(catchError(() => of([] as ContratoCambio[])), takeUntil(this.destroy$))
      .subscribe(contracts => {
        const dialogRef = this.dialog.open(PagamentoDialogComponent, {
          width: '90vw',
          maxWidth: '760px',
          maxHeight: '90vh',
          disableClose: false,
          panelClass: 'pagamento-dialog-container',
          data: {
            currencies: this.currencies,
            exchangeContracts: contracts.filter(c => c.status !== 'CANCELADO'),
            payment: payment ?? null
          }
        });

        dialogRef.afterClosed()
          .pipe(takeUntil(this.destroy$))
          .subscribe((result: Partial<Pagamento> | null) => {
            if (!result) {
              return;
            }
            this.isLoading = true;
            const call = payment
              ? this.pagamentosService.updatePayment(payment.id, result)
              : this.pagamentosService.createPayment(result);
            call.pipe(takeUntil(this.destroy$)).subscribe({
              next: () => {
                this.snackBar.open(payment ? 'Pagamento atualizado' : 'Pagamento criado com sucesso!', 'OK', { duration: 3000 });
                this.isLoading = false;
                this.reloadAll();
              },
              error: (err) => {
                this.snackBar.open(apiErrorMessage(err, 'Erro ao salvar pagamento'), 'Fechar', { duration: 5000 });
                this.isLoading = false;
              }
            });
          });
      });
  }

  createPayment(): void {
    this.openForm();
  }

  editPayment(payment: Pagamento): void {
    this.openForm(payment);
  }

  markAsPaid(payment: Pagamento): void {
    this.pagamentosService.payPayment(payment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(`Pagamento ${payment.paymentNumber || payment.beneficiary} marcado como pago`, 'OK', { duration: 3000 });
          this.reloadAll();
        },
        error: (err) => this.snackBar.open(apiErrorMessage(err, 'Erro ao marcar pagamento como pago'), 'Fechar', { duration: 4000 })
      });
  }

  cancelPayment(payment: Pagamento): void {
    if (!window.confirm('Cancelar este pagamento?')) {
      return;
    }
    this.pagamentosService.cancelPayment(payment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Pagamento cancelado', 'OK', { duration: 3000 });
          this.reloadAll();
        },
        error: (err) => this.snackBar.open(apiErrorMessage(err, 'Erro ao cancelar pagamento'), 'Fechar', { duration: 4000 })
      });
  }

  isOpen(payment: Pagamento): boolean {
    return payment.status === 'PENDENTE' || payment.status === 'VENCIDO';
  }

  maxMonthTotal(): number {
    const totals = (this.cashFlow?.byMonth ?? []).map(m => m.total);
    return totals.length ? Math.max(...totals) : 0;
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

  isOverdue(payment: Pagamento): boolean {
    return payment.status === 'VENCIDO';
  }

  isDueSoon(payment: Pagamento): boolean {
    if (payment.status !== 'PENDENTE') return false;
    const diff = (new Date(payment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }
}
