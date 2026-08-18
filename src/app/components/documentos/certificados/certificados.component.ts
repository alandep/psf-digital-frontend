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

// Services and Types
import { CertificadosExportacaoMockService } from '../../../../services/certificadosExportacaoMockService';
import {
  CertificadoExportacao,
  CertificadoTipo,
  CertificadoStatus,
  CertificadoFilters,
  CertificadoMetrics,
  CertificadoValidation,
  CertificadoTimelineEvent,
  CertificadoRelatedDoc,
  CertificadoAIInsights,
  CountryRequirement,
  RequirementLevel,
} from '../../../../types/certificados-exportacao';

@Component({
  selector: 'app-certificados-exportacao',
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
  ],
  templateUrl: './certificados.component.html',
  styleUrls: ['./certificados.component.scss']
})
export class CertificadosExportacaoComponent implements OnInit, OnDestroy {

  // Services
  private certificadosService = inject(CertificadosExportacaoMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Data State
  certificados: CertificadoExportacao[] = [];
  filteredCertificados: CertificadoExportacao[] = [];
  selectedCertificado: CertificadoExportacao | null = null;
  validations: CertificadoValidation[] = [];
  timeline: CertificadoTimelineEvent[] = [];
  relatedDocs: CertificadoRelatedDoc[] = [];
  aiInsights: CertificadoAIInsights | null = null;
  countryRequirements: CountryRequirement[] = [];
  metrics: CertificadoMetrics | null = null;

  // UI State
  isLoading = false;
  isDetailOpen = false;

  // Forms
  filterForm!: FormGroup;

  // Table Configuration
  displayedColumns = [
    'certificateNumber', 'tipo', 'productName', 'destinationCountry',
    'status', 'issueDate', 'expiryDate', 'aiComplianceScore', 'actions'
  ];
  requirementColumns = ['certificateType', 'level', 'issuingAuthority', 'estimatedProcessingDays', 'validityMonths', 'notes'];
  relatedDocsColumns = ['documentType', 'documentNumber', 'entity'];

  // Filter Options
  tipos: { value: CertificadoTipo; label: string }[] = [];
  statuses: { value: CertificadoStatus; label: string }[] = [];
  countries: string[] = [];
  products: string[] = [];
  authorities: string[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.loadFilterOptions();
    this.loadCertificados();
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
      tipo: [''],
      status: [''],
      destinationCountry: [''],
      productName: [''],
      issuingAuthority: [''],
      expiryStart: [null],
      expiryEnd: [null],
    });
  }

  private loadFilterOptions(): void {
    this.tipos = this.certificadosService.getTypes();
    this.statuses = this.certificadosService.getStatuses();
    this.countries = this.certificadosService.getCountries();
    this.products = this.certificadosService.getProducts();
    this.authorities = this.certificadosService.getAuthorities();
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

  loadCertificados(): void {
    this.isLoading = true;
    this.certificadosService.getCertificados()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (certificados) => {
          this.certificados = certificados;
          this.filteredCertificados = certificados;
          this.isLoading = false;
        },
        error: () => {
          this.showMessage('Erro ao carregar certificados', 'error');
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.certificadosService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => { this.metrics = metrics; },
        error: () => {}
      });
  }

  applyFilters(): void {
    const filters: CertificadoFilters = this.filterForm.value;
    this.isLoading = true;
    this.certificadosService.getCertificados(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (certificados) => {
          this.filteredCertificados = certificados;
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
    this.loadCertificados();
  }

  // ================================
  // CERTIFICATE SELECTION & ACTIONS
  // ================================

  selectCertificado(cert: CertificadoExportacao): void {
    this.selectedCertificado = cert;
    this.isDetailOpen = true;
    this.loadCertificadoDetails(cert.id);
    this.checkCountryRequirements(cert.destinationCountry, cert.productName);
  }

  private loadCertificadoDetails(certId: string): void {
    this.certificadosService.getValidations(certId).pipe(takeUntil(this.destroy$)).subscribe(v => this.validations = v);
    this.certificadosService.getTimeline(certId).pipe(takeUntil(this.destroy$)).subscribe(t => this.timeline = t);
    this.certificadosService.getRelatedDocuments(certId).pipe(takeUntil(this.destroy$)).subscribe(d => this.relatedDocs = d);
    this.certificadosService.getAIInsights(certId).pipe(takeUntil(this.destroy$)).subscribe(i => this.aiInsights = i);
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedCertificado = null;
    this.validations = [];
    this.timeline = [];
    this.relatedDocs = [];
    this.aiInsights = null;
    this.countryRequirements = [];
  }

  createCertificado(): void {
    this.certificadosService.createCertificado({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cert) => {
          this.showMessage(`Certificado ${cert.certificateNumber} criado com sucesso`, 'success');
          this.loadCertificados();
          this.loadMetrics();
        },
        error: () => this.showMessage('Erro ao criar certificado', 'error')
      });
  }

  renewCertificate(): void {
    if (!this.selectedCertificado) return;
    this.certificadosService.renewCertificate(this.selectedCertificado.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.showMessage(result.message, result.success ? 'success' : 'error');
          if (result.success) {
            this.loadCertificados();
            this.loadMetrics();
          }
        },
        error: () => this.showMessage('Erro ao renovar certificado', 'error')
      });
  }

  validateCertificate(): void {
    if (!this.selectedCertificado) return;
    this.certificadosService.validateCertificate(this.selectedCertificado.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (validations) => {
          this.validations = validations;
          this.showMessage('Validação realizada com sucesso', 'success');
        },
        error: () => this.showMessage('Erro ao validar certificado', 'error')
      });
  }

  checkCountryRequirements(country?: string, product?: string): void {
    const c = country || this.selectedCertificado?.destinationCountry || '';
    const p = product || this.selectedCertificado?.productName || '';
    if (!c || !p) return;
    this.certificadosService.getCountryRequirements(c, p)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reqs) => { this.countryRequirements = reqs; },
        error: () => {}
      });
  }

  exportPDF(): void {
    this.showMessage('Exportando relatório PDF...', 'info');
  }

  // ================================
  // UTILITY METHODS
  // ================================

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStatusColor(status: CertificadoStatus): string {
    switch (status) {
      case 'VÁLIDO': case 'VINCULADO': return 'green';
      case 'VENCIDO': return 'red';
      case 'PENDENTE': case 'SOLICITADO': return 'orange';
      case 'EMITIDO': return 'blue';
      case 'ARQUIVADO': return 'grey';
      default: return 'grey';
    }
  }

  getStatusIcon(status: CertificadoStatus): string {
    switch (status) {
      case 'VÁLIDO': return 'check_circle';
      case 'VENCIDO': return 'cancel';
      case 'PENDENTE': return 'hourglass_top';
      case 'SOLICITADO': return 'send';
      case 'EMITIDO': return 'task_alt';
      case 'VINCULADO': return 'link';
      case 'ARQUIVADO': return 'archive';
      default: return 'circle';
    }
  }

  getStatusLabel(status: CertificadoStatus): string {
    const found = this.statuses.find(s => s.value === status);
    return found ? found.label : status;
  }

  getTipoLabel(tipo: CertificadoTipo): string {
    const found = this.tipos.find(t => t.value === tipo);
    return found ? found.label : tipo;
  }

  getTipoColor(tipo: CertificadoTipo): string {
    switch (tipo) {
      case 'FITOSSANITÁRIO': return 'green';
      case 'ORIGEM': return 'blue';
      case 'QUALIDADE': return 'purple';
      case 'ANÁLISE_LABORATORIAL': return 'orange';
      case 'HALAL': return 'teal';
      case 'KOSHER': return 'indigo';
      case 'ORGÂNICO': return 'lime';
      case 'SANITÁRIO': return 'red';
      case 'FUMIGAÇÃO': return 'brown';
      default: return 'grey';
    }
  }

  getRequirementLevelColor(level: RequirementLevel): string {
    switch (level) {
      case 'OBRIGATÓRIO': return 'red';
      case 'RECOMENDADO': return 'orange';
      case 'OPCIONAL': return 'blue';
      case 'NÃO_APLICÁVEL': return 'grey';
      default: return 'grey';
    }
  }

  getRequirementLevelLabel(level: RequirementLevel): string {
    switch (level) {
      case 'OBRIGATÓRIO': return 'Obrigatório';
      case 'RECOMENDADO': return 'Recomendado';
      case 'OPCIONAL': return 'Opcional';
      case 'NÃO_APLICÁVEL': return 'N/A';
      default: return level;
    }
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

  getRiskColor(risk: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    switch (risk) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'orange';
      case 'HIGH': return 'red';
      default: return 'grey';
    }
  }

  getRiskLabel(risk: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    switch (risk) {
      case 'LOW': return 'Baixo';
      case 'MEDIUM': return 'Médio';
      case 'HIGH': return 'Alto';
      default: return risk;
    }
  }

  isExpiringSoon(date: Date | string): boolean {
    const expiry = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return diffDays > 0 && diffDays <= 30;
  }

  getDaysToExpiry(date: Date | string): number {
    const expiry = new Date(date);
    const now = new Date();
    return Math.floor((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
