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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Types
import { RelatorioRentabilidadeMockService } from '../../../../services/relatorioRentabilidadeMockService';
import { ExportService } from '../../../../services/exportService';
import { RentabilidadeReport, RentabilidadeMetrics, MarginByProduct, MarginByClient } from '../../../../types/relatorio-rentabilidade';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-relatorios-rentabilidade',
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    HasPermissionDirective
  ],
  templateUrl: './relatorios-rentabilidade.component.html',
  styleUrls: ['./relatorios-rentabilidade.component.scss']
})
export class RelatoriosRentabilidadeComponent implements OnInit, OnDestroy {

  private rentabilidadeService = inject(RelatorioRentabilidadeMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private exportService = inject(ExportService);
  private destroy$ = new Subject<void>();

  @ViewChild('rentabilidadePaginator') rentabilidadePaginator!: MatPaginator;
  @ViewChild('rentabilidadeSort') rentabilidadeSort!: MatSort;

  dataSource = new MatTableDataSource<RentabilidadeReport>([]);
  metrics: RentabilidadeMetrics = {
    totalRevenue: 0, totalCost: 0, avgMargin: 0, bestProduct: '',
    bestClient: '', worstMarginOp: '', operationsAboveTarget: 0, operationsBelowTarget: 0
  };
  productMargins: MarginByProduct[] = [];
  clientMargins: MarginByClient[] = [];
  filterForm!: FormGroup;
  isLoading = false;

  displayedColumns: string[] = [
    'operation', 'client', 'product', 'country', 'volume', 'revenue',
    'totalCost', 'grossMargin', 'marginPercent', 'logisticsCost', 'financialCost', 'incoterm'
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      product: [''],
      client: ['']
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

    this.rentabilidadeService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.rentabilidadeService.getMarginByProduct()
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => this.productMargins = products);

    this.rentabilidadeService.getMarginByClient()
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => this.clientMargins = clients);

    this.rentabilidadeService.getReports()
      .pipe(takeUntil(this.destroy$))
      .subscribe(reports => {
        this.dataSource.data = reports;
        setTimeout(() => {
          this.dataSource.paginator = this.rentabilidadePaginator;
          this.dataSource.sort = this.rentabilidadeSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const { searchText, product, client } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: RentabilidadeReport, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.searchText) {
        const search = filterObj.searchText.toLowerCase();
        match = match && (
          data.operation.toLowerCase().includes(search) ||
          data.client.toLowerCase().includes(search) ||
          data.product.toLowerCase().includes(search) ||
          data.country.toLowerCase().includes(search)
        );
      }
      if (filterObj.product) {
        match = match && data.product === filterObj.product;
      }
      if (filterObj.client) {
        match = match && data.client === filterObj.client;
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ searchText, product, client });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', product: '', client: '' });
  }

  exportPDF(): void {
    const columns = [
      { key: 'operation', label: 'Operação' },
      { key: 'client', label: 'Cliente' },
      { key: 'product', label: 'Produto' },
      { key: 'country', label: 'País' },
      { key: 'volume', label: 'Volume' },
      { key: 'revenue', label: 'Receita' },
      { key: 'totalCost', label: 'Custo Total' },
      { key: 'grossMargin', label: 'Margem Bruta' },
      { key: 'marginPercent', label: 'Margem (%)' },
      { key: 'logisticsCost', label: 'Custo Logístico' },
      { key: 'financialCost', label: 'Custo Financeiro' },
      { key: 'incoterm', label: 'Incoterm' }
    ];
    this.exportService.exportToPDF('Relatório de Rentabilidade', this.dataSource.filteredData, columns, 'relatorio-rentabilidade');
    this.snackBar.open('Relatório PDF gerado com sucesso!', 'OK', { duration: 3000 });
  }

  exportExcel(): void {
    const columns = [
      { key: 'operation', label: 'Operação' },
      { key: 'client', label: 'Cliente' },
      { key: 'product', label: 'Produto' },
      { key: 'country', label: 'País' },
      { key: 'volume', label: 'Volume' },
      { key: 'revenue', label: 'Receita' },
      { key: 'totalCost', label: 'Custo Total' },
      { key: 'grossMargin', label: 'Margem Bruta' },
      { key: 'marginPercent', label: 'Margem (%)' },
      { key: 'logisticsCost', label: 'Custo Logístico' },
      { key: 'financialCost', label: 'Custo Financeiro' },
      { key: 'incoterm', label: 'Incoterm' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'relatorio-rentabilidade');
    this.snackBar.open('Arquivo CSV exportado com sucesso!', 'OK', { duration: 3000 });
  }

  getMaxProductMargin(): number {
    return Math.max(...this.productMargins.map(p => p.marginPercent));
  }

  getMaxClientMargin(): number {
    return Math.max(...this.clientMargins.map(c => c.marginPercent));
  }

  getMarginColorClass(marginPercent: number): string {
    if (marginPercent >= 25) return 'margin-good';
    if (marginPercent >= 15) return 'margin-warning';
    return 'margin-danger';
  }
}
