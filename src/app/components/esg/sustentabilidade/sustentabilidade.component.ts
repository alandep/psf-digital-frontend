import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EsgMockService } from '../../../../services/esgMockService';
import { ExportService } from '../../../../services/exportService';
import { EsgOperation, EsgMetrics } from '../../../../types/esg';
import { RegistrarCertificacaoDialogComponent } from '../dialogs/registrar-certificacao-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-sustentabilidade',
  standalone: true,
  imports: [
    HasPermissionDirective,
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './sustentabilidade.component.html',
  styleUrls: ['./sustentabilidade.component.scss']
})
export class SustentabilidadeComponent implements OnInit, OnDestroy {

  private esgService = inject(EsgMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  operations: EsgOperation[] = [];
  dataSource = new MatTableDataSource<EsgOperation>([]);
  metrics: EsgMetrics | null = null;
  emissionsBreakdown: { production: number; transport: number; processing: number; packaging: number } | null = null;

  isLoading = false;
  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'exportId', 'product', 'destination', 'carbonFootprint',
    'traceabilityStatus', 'certifications', 'esgRating'
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadOperations();
    this.loadMetrics();
    this.loadEmissionsBreakdown();
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
      rating: [''],
      traceability: [''],
      certification: ['']
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

  loadOperations(): void {
    this.isLoading = true;
    this.esgService.getOperations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.operations = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar operações ESG', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.esgService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  loadEmissionsBreakdown(): void {
    this.esgService.getEmissionsBreakdown()
      .pipe(takeUntil(this.destroy$))
      .subscribe(breakdown => this.emissionsBreakdown = breakdown);
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.esgService.getOperations(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.operations = data;
        this.dataSource.data = data;
      });
  }

  openCertificacaoDialog(): void {
    const dialogRef = this.dialog.open(RegistrarCertificacaoDialogComponent, {
      width: '90vw',
      maxWidth: '700px',
      height: '80vh',
      maxHeight: '600px',
      disableClose: false,
      panelClass: 'novo-usuario-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.esgService.createCertification(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Certificação registrada com sucesso!', 'OK', { duration: 3000 });
              this.loadMetrics();
              this.isLoading = false;
            },
            error: () => {
              this.snackBar.open('Erro ao registrar certificação', 'Fechar', { duration: 5000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  exportCSV(): void {
    const columns = [
      { key: 'exportId', label: 'Export ID' },
      { key: 'product', label: 'Produto' },
      { key: 'destination', label: 'Destino' },
      { key: 'carbonFootprint', label: 'Pegada Carbono (kg CO2)' },
      { key: 'traceabilityStatus', label: 'Rastreabilidade' },
      { key: 'esgRating', label: 'Rating ESG' }
    ];
    this.exportService.exportToCSV(this.operations, columns, 'esg-operacoes');
  }

  // Helper methods
  getTraceabilityLabel(status: string): string {
    const map: Record<string, string> = { 'FULL': 'Completa', 'PARTIAL': 'Parcial', 'NONE': 'Nenhuma' };
    return map[status] || status;
  }

  getTraceabilityClass(status: string): string {
    return `trace-${status.toLowerCase()}`;
  }

  getRatingClass(rating: string): string {
    return `rating-${rating.toLowerCase()}`;
  }

  getCertLabel(cert: string): string {
    const map: Record<string, string> = {
      'ORGANIC': 'Orgânico',
      'FAIR_TRADE': 'Fair Trade',
      'RAINFOREST_ALLIANCE': 'Rainforest',
      'CARBON_NEUTRAL': 'Carbon Neutral'
    };
    return map[cert] || cert;
  }

  getTraceabilityPercent(): number {
    if (!this.metrics) return 0;
    return Math.round((this.metrics.operationsWithTraceability / this.metrics.totalOperations) * 100);
  }

  formatCarbon(value: number): string {
    return value.toLocaleString('pt-BR') + ' kg CO₂';
  }
}
