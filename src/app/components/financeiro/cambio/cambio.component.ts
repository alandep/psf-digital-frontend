import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services and Types
import { CambioContratsMockService } from '../../../../services/cambioContratsMockService';
import { CambioDetailDialogComponent } from './cambio-detail-dialog/cambio-detail-dialog.component';
import { CambioFormDialogComponent } from './cambio-form-dialog/cambio-form-dialog.component';
import {
  ContratoCambio,
  ContractStatus,
  QuotationData,
  SimulationResult,
  BankComparison,
  CambioFilters,
  CambioMetrics,
  FinancialKPIs
} from '../../../../types/cambio';

@Component({
  selector: 'app-cambio',
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
  templateUrl: './cambio.component.html',
  styleUrls: ['./cambio.component.scss']
})
export class CambioComponent implements OnInit, OnDestroy {

  // Services
  private cambioService = inject(CambioContratsMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // ViewChild
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Data State
  contracts: ContratoCambio[] = [];
  dataSource = new MatTableDataSource<ContratoCambio>([]);
  quotations: QuotationData[] = [];
  simulationResult: SimulationResult | null = null;
  bankComparisons: BankComparison[] = [];
  metrics: CambioMetrics | null = null;
  financialKPIs: FinancialKPIs | null = null;

  // UI State
  isLoading = false;
  isSimulating = false;
  isSimulationExpanded = false;

  // Forms
  filterForm!: FormGroup;
  simulationForm!: FormGroup;

  // Table columns
  displayedColumns: string[] = [
    'contractNumber', 'bank', 'currency', 'foreignValue',
    'exchangeRate', 'brlValue', 'status', 'liquidationDate',
    'aiFinancialScore', 'gainLoss', 'actions'
  ];

  // Dropdown data
  banks: string[] = [];
  currencies: string[] = [];
  statuses: ContractStatus[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.loadContracts();
    this.loadMetrics();
    this.loadQuotations();
    this.loadFinancialKPIs();
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
      bank: [''],
      currency: [''],
      dateStart: [null],
      dateEnd: [null],
      minValue: [null]
    });

    this.simulationForm = this.formBuilder.group({
      currency: ['USD', Validators.required],
      value: [100000, [Validators.required, Validators.min(1)]],
      term: [30, [Validators.required, Validators.min(1)]],
      bank: ['BTG Pactual', Validators.required],
      expectedDate: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), Validators.required]
    });
  }

  private loadDropdownData(): void {
    this.banks = this.cambioService.getBanks();
    this.currencies = this.cambioService.getCurrencies();
    this.statuses = this.cambioService.getStatuses();
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

  loadContracts(): void {
    this.isLoading = true;
    this.cambioService.getContracts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.contracts = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar contratos de câmbio', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.cambioService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  loadQuotations(): void {
    this.cambioService.getQuotations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.quotations = data);
  }

  loadFinancialKPIs(): void {
    this.cambioService.getFinancialKPIs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(kpis => this.financialKPIs = kpis);
  }

  applyFilters(): void {
    const filters: CambioFilters = this.filterForm.value;
    this.cambioService.getContracts(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.contracts = data;
        this.dataSource.data = data;
      });
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      status: '',
      bank: '',
      currency: '',
      dateStart: null,
      dateEnd: null,
      minValue: null
    });
  }

  selectContract(contract: ContratoCambio): void {
    this.dialog.open(CambioDetailDialogComponent, {
      data: { contract, quotations: this.quotations },
      panelClass: 'cambio-detail-dialog-panel',
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false
    });
  }

  createContract(): void {
    const dialogRef = this.dialog.open(CambioFormDialogComponent, {
      data: {
        banks: this.banks,
        currencies: this.currencies,
        statuses: this.statuses
      },
      panelClass: 'cambio-form-dialog-panel',
      width: '720px',
      maxWidth: '92vw',
      autoFocus: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: Partial<ContratoCambio> | undefined) => {
        if (!value) {
          return;
        }
        this.cambioService.createContract(value)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Contrato de câmbio criado com sucesso!', 'OK', { duration: 3000 });
              this.loadContracts();
              this.loadMetrics();
            },
            error: () => {
              this.snackBar.open('Erro ao criar contrato de câmbio', 'Fechar', { duration: 3000 });
            }
          });
      });
  }

  simulate(): void {
    if (this.simulationForm.invalid) {
      this.snackBar.open('Preencha todos os campos da simulação', 'OK', { duration: 3000 });
      return;
    }
    this.isSimulating = true;
    this.simulationResult = null;

    this.cambioService.simulate(this.simulationForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.simulationResult = result;
          this.isSimulating = false;
          this.snackBar.open('Simulação concluída com sucesso!', 'OK', { duration: 3000 });
        },
        error: () => {
          this.isSimulating = false;
          this.snackBar.open('Erro na simulação', 'Fechar', { duration: 3000 });
        }
      });
  }

  compareBanks(): void {
    const currency = this.simulationForm.get('currency')?.value || 'USD';
    const value = this.simulationForm.get('value')?.value || 100000;
    this.cambioService.compareBanks(currency, value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(comparisons => this.bankComparisons = comparisons);
  }

  refreshQuotations(): void {
    this.loadQuotations();
    this.snackBar.open('Cotações atualizadas', 'OK', { duration: 2000 });
  }

  exportPDF(): void {
    this.snackBar.open('Exportando relatório em PDF...', 'OK', { duration: 2000 });
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  formatCurrency(value: number, currency: string = 'BRL'): string {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  getStatusColor(status: ContractStatus): string {
    const map: Record<ContractStatus, string> = {
      'ABERTO': 'status-aberto',
      'FECHADO': 'status-fechado',
      'LIQUIDADO': 'status-liquidado',
      'VENCIDO': 'status-vencido',
      'CANCELADO': 'status-cancelado',
      'RENEGOCIADO': 'status-renegociado'
    };
    return map[status] || '';
  }

  getScoreColor(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
  }

  getTrendIcon(trend: string): string {
    const map: Record<string, string> = {
      'UP': 'trending_up',
      'DOWN': 'trending_down',
      'STABLE': 'trending_flat'
    };
    return map[trend] || 'trending_flat';
  }

  getTrendColor(trend: string): string {
    const map: Record<string, string> = {
      'UP': 'trend-up',
      'DOWN': 'trend-down',
      'STABLE': 'trend-stable'
    };
    return map[trend] || '';
  }

  getScenarioClass(type: string): string {
    const map: Record<string, string> = {
      'OTIMISTA': 'scenario-optimistic',
      'PROVÁVEL': 'scenario-probable',
      'CONSERVADOR': 'scenario-conservative'
    };
    return map[type] || '';
  }
}
