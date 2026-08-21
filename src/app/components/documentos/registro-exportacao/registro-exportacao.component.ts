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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services and Types
import { RegistroExportacaoMockService } from '../../../../services/registroExportacaoMockService';
import {
  RegistroExportacao, REStatus,
  REFilters, REMetrics
} from '../../../../types/registro-exportacao';
import { ReDetailDialogComponent, ReDetailDialogData } from './re-detail-dialog/re-detail-dialog.component';

@Component({
  selector: 'app-registro-exportacao',
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
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './registro-exportacao.component.html',
  styleUrls: ['./registro-exportacao.component.scss']
})
export class RegistroExportacaoComponent implements OnInit, OnDestroy {

  // Services
  private reService = inject(RegistroExportacaoMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Data State
  registros: RegistroExportacao[] = [];
  filteredRegistros: RegistroExportacao[] = [];
  selectedRE: RegistroExportacao | null = null;
  metrics: REMetrics | null = null;

  // UI State
  isLoading = false;

  // Forms
  filterForm!: FormGroup;

  // Table Configuration
  displayedColumns = [
    'reNumber', 'exporterName', 'clientName', 'destinationCountry',
    'productName', 'status', 'migrationScore', 'linkedDueNumber', 'actions'
  ];

  // Filter Options
  exporters: string[] = [];
  countries: string[] = [];
  statuses: { value: REStatus; label: string }[] = [];
  productsList: string[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.loadFilterOptions();
    this.loadREs();
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
      exporterName: [''],
      destinationCountry: [''],
      productName: [''],
      dateStart: [null],
      dateEnd: [null],
      linkedDue: [''],
    });
  }

  private loadFilterOptions(): void {
    this.exporters = this.reService.getExporters();
    this.countries = this.reService.getCountries();
    this.statuses = this.reService.getStatuses();
    this.productsList = this.reService.getProducts_list();
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

  loadREs(): void {
    this.isLoading = true;
    this.reService.getREs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registros) => {
          this.registros = registros;
          this.filteredRegistros = registros;
          this.isLoading = false;
        },
        error: () => {
          this.showMessage('Erro ao carregar Registros de Exportação', 'error');
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.reService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => { this.metrics = metrics; },
        error: () => {}
      });
  }

  applyFilters(): void {
    const filters: REFilters = this.filterForm.value;
    this.isLoading = true;
    this.reService.getREs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (registros) => {
          this.filteredRegistros = registros;
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
    this.loadREs();
  }

  // ================================
  // RE SELECTION & ACTIONS
  // ================================

  selectRE(re: RegistroExportacao): void {
    this.selectedRE = re;
    const dialogRef = this.dialog.open(ReDetailDialogComponent, {
      width: '1050px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 're-detail-dialog-panel',
      data: { re, statuses: this.statuses } as ReDetailDialogData,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.selectedRE = null;
        if (result === 'refresh') {
          this.loadREs();
          this.loadMetrics();
        }
      });
  }

  importRE(): void {
    this.reService.importRE({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (re) => {
          this.showMessage(`RE ${re.reNumber} importado com sucesso`, 'success');
          this.loadREs();
          this.loadMetrics();
        },
        error: () => this.showMessage('Erro ao importar RE', 'error')
      });
  }

  exportPDF(): void {
    this.showMessage('Exportando relatório PDF...', 'info');
  }

  // ================================
  // UTILITY METHODS (grid presentation)
  // ================================

  getStatusColor(status: REStatus): string {
    switch (status) {
      case 'CONVERTIDO': return 'green';
      case 'VALIDADO': return 'blue';
      case 'IMPORTADO': return 'purple';
      case 'PENDENTE': return 'orange';
      case 'DIVERGENTE': return 'red';
      case 'ARQUIVADO': return 'grey';
      default: return 'grey';
    }
  }

  getStatusIcon(status: REStatus): string {
    switch (status) {
      case 'CONVERTIDO': return 'check_circle';
      case 'VALIDADO': return 'verified';
      case 'IMPORTADO': return 'download_done';
      case 'PENDENTE': return 'hourglass_top';
      case 'DIVERGENTE': return 'warning';
      case 'ARQUIVADO': return 'archive';
      default: return 'circle';
    }
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
