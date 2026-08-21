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
import { DueMockService } from '../../../../services/dueMockService';
import {
  DUE, DueStatus, DueFilters, DueMetrics
} from '../../../../types/due';
import { DueDetailDialogComponent, DueDetailDialogData } from './due-detail-dialog/due-detail-dialog.component';

@Component({
  selector: 'app-due',
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
  templateUrl: './due.component.html',
  styleUrls: ['./due.component.scss']
})
export class DueComponent implements OnInit, OnDestroy {

  // Services
  private dueService = inject(DueMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Data State
  dues: DUE[] = [];
  filteredDues: DUE[] = [];
  selectedDue: DUE | null = null;
  metrics: DueMetrics | null = null;

  // UI State
  isLoading = false;

  // Forms
  filterForm!: FormGroup;

  // Table Configuration
  displayedColumns = [
    'dueNumber', 'exporterName', 'importerName', 'destinationCountry',
    'productName', 'status', 'completionPercentage', 'aiComplianceScore', 'actions'
  ];

  // Filter Options
  exporters: string[] = [];
  countries: string[] = [];
  ports: string[] = [];
  statuses: { value: DueStatus; label: string }[] = [];
  productsList: string[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.loadFilterOptions();
    this.loadDues();
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
      portOrigin: [''],
      dateStart: [null],
      dateEnd: [null],
    });
  }

  private loadFilterOptions(): void {
    this.exporters = this.dueService.getExporters();
    this.countries = this.dueService.getCountries();
    this.ports = this.dueService.getPorts();
    this.statuses = this.dueService.getStatuses();
    this.productsList = this.dueService.getProducts_list();
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

  loadDues(): void {
    this.isLoading = true;
    this.dueService.getDues()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dues) => {
          this.dues = dues;
          this.filteredDues = dues;
          this.isLoading = false;
        },
        error: () => {
          this.showMessage('Erro ao carregar DU-Es', 'error');
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.dueService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => { this.metrics = metrics; },
        error: () => {}
      });
  }

  applyFilters(): void {
    const filters: DueFilters = this.filterForm.value;
    this.isLoading = true;
    this.dueService.getDues(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dues) => {
          this.filteredDues = dues;
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
    this.loadDues();
  }

  // ================================
  // DUE SELECTION & ACTIONS
  // ================================

  selectDue(due: DUE): void {
    this.selectedDue = due;
    const dialogRef = this.dialog.open(DueDetailDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'due-detail-dialog-panel',
      data: { due, statuses: this.statuses } as DueDetailDialogData,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.selectedDue = null;
        if (result === 'refresh') {
          this.loadDues();
          this.loadMetrics();
        }
      });
  }

  createDue(): void {
    this.dueService.createDue({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (due) => {
          this.showMessage(`DU-E ${due.dueNumber} criada com sucesso`, 'success');
          this.loadDues();
          this.loadMetrics();
        },
        error: () => this.showMessage('Erro ao criar DU-E', 'error')
      });
  }

  exportPDF(): void {
    this.showMessage('Exportando relatório PDF...', 'info');
  }

  exportXML(): void {
    this.showMessage('Exportando XML Siscomex...', 'info');
  }

  // ================================
  // UTILITY METHODS (grid presentation)
  // ================================

  getStatusColor(status: DueStatus): string {
    switch (status) {
      case 'CONCLUÍDO': case 'AVERBADO': case 'LIBERADO': return 'green';
      case 'REJEITADO': return 'red';
      case 'ENVIADO': case 'RECEBIDO': case 'EM_ANÁLISE': return 'blue';
      case 'PRONTO_ENVIO': case 'VALIDAÇÃO': return 'orange';
      case 'RASCUNHO': return 'grey';
      default: return 'grey';
    }
  }

  getStatusIcon(status: DueStatus): string {
    switch (status) {
      case 'CONCLUÍDO': return 'check_circle';
      case 'AVERBADO': return 'verified';
      case 'LIBERADO': return 'task_alt';
      case 'REJEITADO': return 'cancel';
      case 'ENVIADO': return 'send';
      case 'RECEBIDO': return 'inbox';
      case 'EM_ANÁLISE': return 'hourglass_top';
      case 'PRONTO_ENVIO': return 'rocket_launch';
      case 'VALIDAÇÃO': return 'fact_check';
      case 'RASCUNHO': return 'draft';
      default: return 'circle';
    }
  }

  getStatusLabel(status: DueStatus): string {
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
