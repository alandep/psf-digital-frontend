import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Services and Types
import { InvoiceMockService } from '../../../../services/invoiceMockService';
import {
  Invoice,
  InvoiceStatus,
  InvoiceFilters,
  InvoiceMetrics,
} from '../../../../types/invoice';
import { InvoiceDetailDialogComponent, InvoiceDetailDialogData } from './invoice-detail-dialog/invoice-detail-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-invoice',
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
    MatBadgeModule,
    MatTabsModule,
    MatListModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    HasPermissionDirective,
  ],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, OnDestroy {

  // Services
  private invoiceService = inject(InvoiceMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Data State
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;
  metrics: InvoiceMetrics | null = null;

  // UI State
  isLoading = false;

  // Forms
  filterForm!: FormGroup;

  // Table Configuration
  displayedColumns = [
    'invoiceNumber', 'buyerName', 'buyerCountry', 'totalValue',
    'currency', 'status', 'completionPercentage', 'aiDocScore', 'actions'
  ];

  // Filter Options
  statuses: { value: InvoiceStatus; label: string }[] = [];
  buyers: string[] = [];
  countries: string[] = [];
  currencies: string[] = [];
  ports: string[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.loadFilterOptions();
    this.loadInvoices();
    this.loadMetrics();
    this.setupFilterSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================================
  // INITIALIZATION
  // ================================

  private initializeForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      status: [''],
      buyerName: [''],
      buyerCountry: [''],
      currency: [''],
      portOrigin: [''],
      dateStart: [null],
      dateEnd: [null],
    });
  }

  private loadFilterOptions(): void {
    this.statuses = this.invoiceService.getStatuses();
    this.buyers = this.invoiceService.getBuyers();
    this.countries = this.invoiceService.getCountries();
    this.currencies = this.invoiceService.getCurrencies();
    this.ports = this.invoiceService.getPorts();
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  // ================================
  // DATA LOADING
  // ================================

  loadInvoices(): void {
    this.isLoading = true;
    this.invoiceService.getInvoices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invoices) => {
          this.invoices = invoices;
          this.filteredInvoices = invoices;
          this.isLoading = false;
        },
        error: () => {
          this.showMessage('Erro ao carregar invoices', 'error');
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.invoiceService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => { this.metrics = metrics; },
        error: () => {}
      });
  }

  applyFilters(): void {
    const filters: InvoiceFilters = this.filterForm.value;
    this.isLoading = true;
    this.invoiceService.getInvoices(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invoices) => {
          this.filteredInvoices = invoices;
          this.isLoading = false;
        },
        error: () => {
          this.showMessage('Erro ao aplicar filtros', 'error');
          this.isLoading = false;
        }
      });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadInvoices();
  }

  // ================================
  // INVOICE SELECTION & ACTIONS
  // ================================

  selectInvoice(inv: Invoice): void {
    this.selectedInvoice = inv;
    const dialogRef = this.dialog.open(InvoiceDetailDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'invoice-detail-dialog-panel',
      data: { invoice: inv, statuses: this.statuses } as InvoiceDetailDialogData,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.selectedInvoice = null;
        if (result === 'refresh') {
          this.loadInvoices();
          this.loadMetrics();
        }
      });
  }

  createInvoice(): void {
    this.invoiceService.createInvoice({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inv) => {
          this.showMessage(`Invoice ${inv.invoiceNumber} criada com sucesso`, 'success');
          this.loadInvoices();
          this.loadMetrics();
        },
        error: () => this.showMessage('Erro ao criar invoice', 'error')
      });
  }

  exportPDF(): void {
    this.showMessage('Exportando relatório PDF...', 'info');
  }

  exportDOCX(): void {
    this.showMessage('Exportando relatório DOCX...', 'info');
  }

  // ================================
  // UTILITY METHODS
  // ================================

  formatCurrency(value: number, currency: string): string {
    return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getStatusColor(status: InvoiceStatus): string {
    switch (status) {
      case 'RASCUNHO': return 'grey';
      case 'GERADA': return 'blue';
      case 'EDITADA': return 'orange';
      case 'VALIDADA': return 'purple';
      case 'APROVADA': return 'green';
      case 'ENVIADA': return 'teal';
      case 'UTILIZADA': return 'indigo';
      case 'ARQUIVADA': return 'brown';
      default: return 'grey';
    }
  }

  getStatusIcon(status: InvoiceStatus): string {
    switch (status) {
      case 'RASCUNHO': return 'edit_note';
      case 'GERADA': return 'description';
      case 'EDITADA': return 'edit';
      case 'VALIDADA': return 'fact_check';
      case 'APROVADA': return 'check_circle';
      case 'ENVIADA': return 'send';
      case 'UTILIZADA': return 'task_alt';
      case 'ARQUIVADA': return 'archive';
      default: return 'circle';
    }
  }

  getStatusLabel(status: InvoiceStatus): string {
    const found = this.statuses.find(s => s.value === status);
    return found ? found.label : status;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
