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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services and Types
import { CenariosMockService } from '../../../../services/cenariosMockService';
import { Cenario, CenarioComparison, CenariosMetrics, CenarioTipo } from '../../../../types/rentabilidade-cenarios';
import { NovoCenarioDialogComponent } from './novo-cenario-dialog/novo-cenario-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-cenarios',
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
    MatChipsModule,
    MatDialogModule,
    HasPermissionDirective
  ],
  templateUrl: './cenarios.component.html',
  styleUrls: ['./cenarios.component.scss']
})
export class CenariosComponent implements OnInit, OnDestroy {

  private cenariosService = inject(CenariosMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  @ViewChild('cenariosPaginator') cenariosPaginator!: MatPaginator;
  @ViewChild('cenariosSort') cenariosSort!: MatSort;

  dataSource = new MatTableDataSource<Cenario>([]);
  metrics: CenariosMetrics = {
    totalCenarios: 0, cenariosAtivos: 0, melhorMargem: 0,
    piorMargem: 0, margemMedia: 0, variacaoCambial: 0
  };
  comparisons: CenarioComparison[] = [];
  filterForm!: FormGroup;
  isLoading = false;

  displayedColumns: string[] = [
    'name', 'tipo', 'product', 'country', 'volume', 'exchangeRate',
    'margin', 'marginPercent', 'revenue', 'riskLevel', 'createdAt', 'createdBy'
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
      tipo: [''],
      product: ['']
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

    this.cenariosService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.cenariosService.getComparisons()
      .pipe(takeUntil(this.destroy$))
      .subscribe(comparisons => this.comparisons = comparisons);

    this.cenariosService.getCenarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cenarios => {
        this.dataSource.data = cenarios;
        setTimeout(() => {
          this.dataSource.paginator = this.cenariosPaginator;
          this.dataSource.sort = this.cenariosSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const { searchText, tipo, product } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: Cenario, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.searchText) {
        const search = filterObj.searchText.toLowerCase();
        match = match && (
          data.name.toLowerCase().includes(search) ||
          data.product.toLowerCase().includes(search) ||
          data.country.toLowerCase().includes(search) ||
          data.createdBy.toLowerCase().includes(search)
        );
      }
      if (filterObj.tipo) {
        match = match && data.tipo === filterObj.tipo;
      }
      if (filterObj.product) {
        match = match && data.product === filterObj.product;
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ searchText, tipo, product });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', tipo: '', product: '' });
  }

  novoCenario(): void {
    const dialogRef = this.dialog.open(NovoCenarioDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      autoFocus: false,
      panelClass: 'novo-cenario-dialog-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Partial<Cenario> | null) => {
        if (!result) {
          return;
        }

        const novo: Cenario = {
          id: 'CEN-' + Date.now(),
          name: result.name ?? 'Novo Cenário',
          tipo: (result.tipo as CenarioTipo) ?? 'BASE',
          description: result.description ?? '',
          product: result.product ?? '',
          country: result.country ?? '',
          volume: result.volume ?? 0,
          exchangeRate: result.exchangeRate ?? 0,
          freightCost: result.freightCost ?? 0,
          productPrice: result.productPrice ?? 0,
          margin: result.margin ?? 0,
          marginPercent: result.marginPercent ?? 0,
          revenue: result.revenue ?? 0,
          totalCost: result.totalCost ?? 0,
          riskLevel: result.riskLevel ?? 'Baixo',
          createdAt: new Date(),
          createdBy: 'Você'
        };

        this.dataSource.data = [novo, ...this.dataSource.data];
        setTimeout(() => {
          this.dataSource.paginator = this.cenariosPaginator;
          this.dataSource.sort = this.cenariosSort;
        });
        this.snackBar.open('Cenário criado com sucesso!', 'OK', { duration: 3000 });
      });
  }

  getTipoClass(tipo: CenarioTipo): string {
    switch (tipo) {
      case 'OTIMISTA': return 'tipo-otimista';
      case 'BASE': return 'tipo-base';
      case 'CONSERVADOR': return 'tipo-conservador';
      case 'ADVERSO': return 'tipo-adverso';
      default: return '';
    }
  }

  getRiskClass(riskLevel: string): string {
    switch (riskLevel) {
      case 'Baixo': return 'risk-baixo';
      case 'Médio': return 'risk-medio';
      case 'Alto': return 'risk-alto';
      case 'Crítico': return 'risk-critico';
      default: return '';
    }
  }

  getComparisonCellClass(metric: string, tipo: string): string {
    if (metric === 'Nível de Risco') {
      switch (tipo) {
        case 'otimista': return 'cell-success';
        case 'base': return 'cell-info';
        case 'conservador': return 'cell-warning';
        case 'adverso': return 'cell-danger';
        default: return '';
      }
    }
    if (metric.includes('Margem')) {
      switch (tipo) {
        case 'otimista': return 'cell-success';
        case 'base': return 'cell-info';
        case 'conservador': return 'cell-warning';
        case 'adverso': return 'cell-danger';
        default: return '';
      }
    }
    return '';
  }

  formatComparisonValue(value: number, unit: string): string {
    if (unit === 'USD' && value > 10000) {
      return 'USD ' + value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    }
    if (unit === '%') {
      return value + '%';
    }
    if (unit === 'BRL') {
      return 'R$ ' + value.toFixed(2);
    }
    if (unit === 'nível') {
      const levels = ['', 'Baixo', 'Médio', 'Alto', 'Crítico'];
      return levels[value] || '';
    }
    return value.toLocaleString('pt-BR');
  }

  getUniqueProducts(): string[] {
    const products = this.dataSource.data.map(c => c.product);
    return [...new Set(products)];
  }
}
