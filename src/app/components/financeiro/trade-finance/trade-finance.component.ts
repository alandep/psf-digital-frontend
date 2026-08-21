import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TradeFinanceMockService } from '../../../../services/tradeFinanceMockService';
import { ExportService } from '../../../../services/exportService';
import {
  TradeFinanceInstrument,
  InstrumentType,
  InstrumentStatus,
  TradeFinanceKPIs,
  TradeFinanceFilters
} from '../../../../types/trade-finance';
import { TradeFinanceDetailDialogComponent } from './trade-finance-detail-dialog/trade-finance-detail-dialog.component';

@Component({
  selector: 'app-trade-finance',
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule,
    MatDialogModule
  ],
  templateUrl: './trade-finance.component.html',
  styleUrls: ['./trade-finance.component.scss']
})
export class TradeFinanceComponent implements OnInit, OnDestroy, AfterViewInit {

  private tradeFinanceService = inject(TradeFinanceMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  instruments: TradeFinanceInstrument[] = [];
  dataSource = new MatTableDataSource<TradeFinanceInstrument>([]);
  kpis: TradeFinanceKPIs | null = null;

  isLoading = false;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'instrumentNumber', 'type', 'status', 'bank', 'value', 'currency', 'expiryDate', 'linkedContract', 'actions'
  ];

  banks: string[] = [];
  types: InstrumentType[] = [];
  statuses: InstrumentStatus[] = [];
  currencies: string[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.loadInstruments();
    this.loadKPIs();
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

  private initForm(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      type: [''],
      status: [''],
      bank: [''],
      currency: ['']
    });
  }

  private loadDropdownData(): void {
    this.banks = this.tradeFinanceService.getBanks();
    this.types = this.tradeFinanceService.getTypes();
    this.statuses = this.tradeFinanceService.getStatuses();
    this.currencies = this.tradeFinanceService.getCurrencies();
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

  loadInstruments(): void {
    this.isLoading = true;
    this.tradeFinanceService.getInstruments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.instruments = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar instrumentos', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadKPIs(): void {
    this.tradeFinanceService.getKPIs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(kpis => this.kpis = kpis);
  }

  applyFilters(): void {
    const filters: TradeFinanceFilters = this.filterForm.value;
    this.tradeFinanceService.getInstruments(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.instruments = data;
        this.dataSource.data = data;
      });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', type: '', status: '', bank: '', currency: '' });
  }

  selectInstrument(instrument: TradeFinanceInstrument): void {
    this.dialog.open(TradeFinanceDetailDialogComponent, {
      data: { instrument },
      width: '900px',
      maxWidth: '92vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'trade-finance-detail-dialog-panel'
    });
  }

  openNovaLCDialog(): void {
    import('../dialogs/nova-lc-dialog.component').then(m => {
      this.dialog.open(m.NovaLcDialogComponent, {
        width: '700px',
        panelClass: 'novo-usuario-panel'
      }).afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Nova Carta de Crédito registrada com sucesso!', 'OK', { duration: 3000 });
          this.loadInstruments();
          this.loadKPIs();
        }
      });
    });
  }

  openNovaCobrancaDialog(): void {
    import('../dialogs/nova-cobranca-dialog.component').then(m => {
      this.dialog.open(m.NovaCobrancaDialogComponent, {
        width: '700px',
        panelClass: 'novo-usuario-panel'
      }).afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Nova Cobrança Documentária registrada!', 'OK', { duration: 3000 });
          this.loadInstruments();
          this.loadKPIs();
        }
      });
    });
  }

  openNovaGarantiaDialog(): void {
    import('../dialogs/nova-garantia-dialog.component').then(m => {
      this.dialog.open(m.NovaGarantiaDialogComponent, {
        width: '700px',
        panelClass: 'novo-usuario-panel'
      }).afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Nova Garantia Bancária registrada!', 'OK', { duration: 3000 });
          this.loadInstruments();
          this.loadKPIs();
        }
      });
    });
  }

  exportCSV(): void {
    const columns = [
      { key: 'instrumentNumber', label: 'Instrumento' },
      { key: 'type', label: 'Tipo' },
      { key: 'status', label: 'Status' },
      { key: 'bank', label: 'Banco' },
      { key: 'value', label: 'Valor' },
      { key: 'currency', label: 'Moeda' },
      { key: 'expiryDate', label: 'Vencimento' },
      { key: 'linkedContract', label: 'Contrato Vinculado' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'trade-finance-instruments');
    this.snackBar.open('Exportação CSV concluída!', 'OK', { duration: 2000 });
  }

  exportPDF(): void {
    const columns = [
      { key: 'instrumentNumber', label: 'Instrumento' },
      { key: 'type', label: 'Tipo' },
      { key: 'status', label: 'Status' },
      { key: 'bank', label: 'Banco' },
      { key: 'value', label: 'Valor' },
      { key: 'currency', label: 'Moeda' },
      { key: 'expiryDate', label: 'Vencimento' }
    ];
    this.exportService.exportToPDF('Relatório Trade Finance', this.dataSource.filteredData, columns, 'trade-finance-report');
  }

  isExpiringSoon(instrument: TradeFinanceInstrument): boolean {
    const now = new Date();
    const expiry = new Date(instrument.expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return diff <= 30 * 24 * 60 * 60 * 1000 && diff > 0;
  }

  getRowClass(instrument: TradeFinanceInstrument): string {
    return this.isExpiringSoon(instrument) ? 'row-warning' : '';
  }

  getTypeLabel(type: InstrumentType): string {
    const map: Record<InstrumentType, string> = {
      'LC': 'Carta de Crédito',
      'COBRANCA_DOCUMENTARIA': 'Cobrança Doc.',
      'GARANTIA_BANCARIA': 'Garantia Bancária',
      'SBLC': 'Standby LC',
      'AVAL': 'Aval Bancário'
    };
    return map[type] || type;
  }

  getStatusColor(status: InstrumentStatus): string {
    const map: Record<InstrumentStatus, string> = {
      'ATIVA': 'status-ativa',
      'PENDENTE': 'status-pendente',
      'VENCIDA': 'status-vencida',
      'CANCELADA': 'status-cancelada',
      'EM_NEGOCIACAO': 'status-negociacao',
      'UTILIZADA': 'status-utilizada'
    };
    return map[status] || '';
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
