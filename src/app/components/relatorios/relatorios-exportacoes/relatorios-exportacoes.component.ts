import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Types
import { RelatoriosMockService } from '../../../../services/relatoriosMockService';
import { ExportService } from '../../../../services/exportService';
import {
  ExportReport,
  ReportMetrics,
  CountryBreakdown,
  ProductBreakdown
} from '../../../../types/relatorios';

@Component({
  selector: 'app-relatorios-exportacoes',
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './relatorios-exportacoes.component.html',
  styleUrls: ['./relatorios-exportacoes.component.scss']
})
export class RelatoriosExportacoesComponent implements OnInit, OnDestroy {

  // Services
  private relatoriosService = inject(RelatoriosMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private exportService = inject(ExportService);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // ViewChild references
  @ViewChild('exportPaginator') exportPaginator!: MatPaginator;
  @ViewChild('exportSort') exportSort!: MatSort;

  // Data State
  metrics: ReportMetrics | null = null;
  countryBreakdowns: CountryBreakdown[] = [];
  productBreakdowns: ProductBreakdown[] = [];

  // Table DataSource
  exportDataSource = new MatTableDataSource<ExportReport>([]);

  // UI State
  isLoading = false;

  // Forms
  filterForm!: FormGroup;

  // Table columns
  exportDisplayedColumns: string[] = [
    'exportNumber', 'client', 'country', 'product', 'volume',
    'totalValue', 'incoterm', 'port', 'shipDate', 'status', 'margin', 'dueNumber'
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadData();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: ['']
    });
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

  private loadData(): void {
    this.isLoading = true;

    this.relatoriosService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.relatoriosService.getCountryBreakdowns()
      .pipe(takeUntil(this.destroy$))
      .subscribe(breakdowns => this.countryBreakdowns = breakdowns);

    this.relatoriosService.getProductBreakdowns()
      .pipe(takeUntil(this.destroy$))
      .subscribe(breakdowns => this.productBreakdowns = breakdowns);

    this.relatoriosService.getExports()
      .pipe(takeUntil(this.destroy$))
      .subscribe(exports => {
        this.exportDataSource.data = exports;
        setTimeout(() => {
          this.exportDataSource.paginator = this.exportPaginator;
          this.exportDataSource.sort = this.exportSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const search = this.filterForm.get('searchText')?.value?.toLowerCase() || '';
    this.exportDataSource.filter = search;
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '' });
  }

  exportPDF(): void {
    const columns = [
      { key: 'exportNumber', label: 'Nº Exportação' },
      { key: 'client', label: 'Cliente' },
      { key: 'country', label: 'País' },
      { key: 'product', label: 'Produto' },
      { key: 'volume', label: 'Volume' },
      { key: 'totalValue', label: 'Valor Total' },
      { key: 'incoterm', label: 'Incoterm' },
      { key: 'port', label: 'Porto' },
      { key: 'shipDate', label: 'Data Embarque' },
      { key: 'status', label: 'Status' },
      { key: 'margin', label: 'Margem (%)' },
      { key: 'dueNumber', label: 'Nº DUE' }
    ];
    this.exportService.exportToPDF('Relatório de Exportações', this.exportDataSource.filteredData, columns, 'relatorio-exportacoes');
    this.snackBar.open('Relatório PDF gerado com sucesso!', 'OK', { duration: 3000 });
  }

  exportExcel(): void {
    const columns = [
      { key: 'exportNumber', label: 'Nº Exportação' },
      { key: 'client', label: 'Cliente' },
      { key: 'country', label: 'País' },
      { key: 'product', label: 'Produto' },
      { key: 'volume', label: 'Volume' },
      { key: 'totalValue', label: 'Valor Total' },
      { key: 'incoterm', label: 'Incoterm' },
      { key: 'port', label: 'Porto' },
      { key: 'shipDate', label: 'Data Embarque' },
      { key: 'status', label: 'Status' },
      { key: 'margin', label: 'Margem (%)' },
      { key: 'dueNumber', label: 'Nº DUE' }
    ];
    this.exportService.exportToCSV(this.exportDataSource.filteredData, columns, 'relatorio-exportacoes');
    this.snackBar.open('Arquivo CSV exportado com sucesso!', 'OK', { duration: 3000 });
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  formatCurrency(value: number, currency: string = 'USD'): string {
    return `${currency} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  formatVolume(volume: number, unit: string): string {
    return `${volume.toLocaleString('pt-BR')} ${unit}`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Embarcado': 'status-embarcado',
      'Em Trânsito': 'status-transito',
      'Aguardando Embarque': 'status-aguardando',
      'Entregue': 'status-entregue'
    };
    return map[status] || '';
  }

  getMarginClass(margin: number): string {
    if (margin >= 20) return 'margin-high';
    if (margin >= 15) return 'margin-medium';
    return 'margin-low';
  }
}
