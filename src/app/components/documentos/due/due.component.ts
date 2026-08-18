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
  DUE, DueStatus, DueProduct, DueAttribute, DueDocument,
  DueValidation, DueTimelineEvent, DueAIInsights, DueAuditEntry,
  DueFilters, DueMetrics
} from '../../../../types/due';

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
  products: DueProduct[] = [];
  attributes: DueAttribute[] = [];
  documents: DueDocument[] = [];
  validations: DueValidation[] = [];
  timeline: DueTimelineEvent[] = [];
  aiInsights: DueAIInsights | null = null;
  audit: DueAuditEntry[] = [];
  metrics: DueMetrics | null = null;

  // UI State
  isLoading = false;
  isDetailOpen = false;

  // Forms
  filterForm!: FormGroup;

  // Table Configuration
  displayedColumns = [
    'dueNumber', 'exporterName', 'importerName', 'destinationCountry',
    'productName', 'status', 'completionPercentage', 'aiComplianceScore', 'actions'
  ];
  productColumns = ['productName', 'ncm', 'quantity', 'unit', 'unitPrice', 'totalValue', 'netWeight', 'grossWeight'];
  attributeColumns = ['attributeName', 'attributeValue', 'required', 'aiSuggested', 'aiConfidence', 'source'];
  documentColumns = ['documentType', 'documentNumber', 'status', 'issueDate'];
  auditColumns = ['timestamp', 'action', 'user', 'details', 'ip'];

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
    this.isDetailOpen = true;
    this.loadDueDetails(due.id);
  }

  private loadDueDetails(dueId: string): void {
    this.dueService.getProducts(dueId).pipe(takeUntil(this.destroy$)).subscribe(p => this.products = p);
    this.dueService.getAttributes(dueId).pipe(takeUntil(this.destroy$)).subscribe(a => this.attributes = a);
    this.dueService.getDocuments(dueId).pipe(takeUntil(this.destroy$)).subscribe(d => this.documents = d);
    this.dueService.getValidations(dueId).pipe(takeUntil(this.destroy$)).subscribe(v => this.validations = v);
    this.dueService.getTimeline(dueId).pipe(takeUntil(this.destroy$)).subscribe(t => this.timeline = t);
    this.dueService.getAIInsights(dueId).pipe(takeUntil(this.destroy$)).subscribe(i => this.aiInsights = i);
    this.dueService.getAudit(dueId).pipe(takeUntil(this.destroy$)).subscribe(a => this.audit = a);
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedDue = null;
    this.products = [];
    this.attributes = [];
    this.documents = [];
    this.validations = [];
    this.timeline = [];
    this.aiInsights = null;
    this.audit = [];
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

  sendToSiscomex(): void {
    if (!this.selectedDue) return;
    this.dueService.sendToSiscomex(this.selectedDue.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.showMessage(result.message, result.success ? 'success' : 'error');
          if (result.success) {
            this.loadDues();
            this.loadMetrics();
          }
        },
        error: () => this.showMessage('Erro ao enviar ao Siscomex', 'error')
      });
  }

  syncSiscomex(): void {
    if (!this.selectedDue) return;
    this.dueService.syncSiscomex(this.selectedDue.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (due) => {
          this.selectedDue = due;
          this.showMessage('Sincronização com Siscomex realizada', 'success');
        },
        error: () => this.showMessage('Erro na sincronização', 'error')
      });
  }

  exportPDF(): void {
    this.showMessage('Exportando relatório PDF...', 'info');
  }

  exportXML(): void {
    this.showMessage('Exportando XML Siscomex...', 'info');
  }

  // ================================
  // UTILITY METHODS
  // ================================

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

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

  getValidationColor(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return 'green';
      case 'fail': return 'red';
      case 'warning': return 'orange';
      default: return 'grey';
    }
  }

  getValidationIcon(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return 'check_circle';
      case 'fail': return 'cancel';
      case 'warning': return 'warning';
      default: return 'help';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'grey';
    }
  }

  getDocStatusColor(status: string): string {
    switch (status) {
      case 'valid': return 'green';
      case 'expired': return 'red';
      case 'pending': return 'orange';
      case 'missing': return 'grey';
      default: return 'grey';
    }
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
