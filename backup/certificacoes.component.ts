import { Component, OnInit, inject, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Services e Types
import { CertificationsMockService } from '../../../../services/certificationsMockService';
import { 
  CertificationData,
  CertificationFilters,
  CertificationSearchResult,
  CertificationFormData,
  AIAlert,
  AISuggestion,
  CertificationMetrics,
  ComplianceCheck,
  CertificationType,
  CertificationCategory,
  CertificationStatus,
  ComplianceStatus,
  AIRiskLevel,
  CountryCompliance
} from '../../../../types/certifications';

@Component({
  selector: 'app-certificacoes',
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
    MatCheckboxModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatSidenavModule,
    MatToolbarModule,
    MatExpansionModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatListModule,
    MatButtonToggleModule,
    DragDropModule
  ],
  templateUrl: './certificacoes.component.html',
  styleUrls: ['./certificacoes.component.premium.scss']
})
export class CertificacoesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Services
  private certificationsService = inject(CertificationsMockService);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  // Reactive Forms
  searchForm!: FormGroup;
  certificationForm!: FormGroup;
  
  // Data Properties
  certifications: CertificationData[] = [];
  filteredCertifications: CertificationData[] = [];
  selectedCertification: CertificationData | null = null;
  searchResult: CertificationSearchResult | null = null;
  metrics: CertificationMetrics | null = null;
  aiAlerts: AIAlert[] = [];
  aiSuggestions: AISuggestion[] = [];
  countryCompliances: CountryCompliance[] = [];
  
  // UI State
  isLoading = false;
  isDetailPanelOpen = false;
  currentView: 'grid' | 'cards' | 'timeline' = 'cards';
  isCreating = false;
  isEditing = false;
  selectedTabIndex = 0;
  realTimeUpdates = true;
  filtersExpanded = false;
  
  // Premium Features
  hasAlerts = false;
  criticalAlertsCount = 0;
  highAlertsCount = 0;
  
  // Filter Options
  certificationTypes: CertificationType[] = [];
  certificationCategories: CertificationCategory[] = [];
  certificationStatuses: CertificationStatus[] = [];
  complianceStatuses: ComplianceStatus[] = [];
  aiRiskLevels: AIRiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  issuingAuthorities: string[] = [];
  destinationCountries: { code: string; name: string; flag: string }[] = [];
  
  // Table Configuration
  displayedColumns = [
    'status_indicator',
    'product_name', 
    'certification_type',
    'certification_number',
    'issuing_authority',
    'issue_date',
    'expiry_date',
    'compliance_status',
    'ai_risk_score',
    'actions'
  ];
  
  // Risk Level Colors
  riskLevelColors = {
    LOW: 'primary',
    MEDIUM: 'accent', 
    HIGH: 'warn',
    CRITICAL: 'warn'
  };
  
  // Status Colors
  statusColors = {
    VALID: 'primary',
    EXPIRED: 'warn',
    PENDING: 'accent',
    INVALID: 'warn',
    EXPIRING_SOON: 'warn'
  };
  
  // Compliance Colors  
  complianceColors = {
    OK: 'primary',
    WARNING: 'accent',
    ERROR: 'warn',
    PENDING_VALIDATION: 'accent'
  };
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.loadInitialData();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    // Search Form
    this.searchForm = this.formBuilder.group({
      search_text: [''],
      certification_type: [''],
      certification_category: [''],
      certification_status: [''],
      compliance_status: [''],
      destination_country: [''],
      issuing_authority: [''],
      date_range_start: [''],
      date_range_end: [''],
      expiry_date_start: [''],
      expiry_date_end: [''],
      ai_risk_level: ['']
    });

    // Certification Form (6 Tabs)
    this.certificationForm = this.formBuilder.group({
      // ABA 1 - Identificação
      identification: this.formBuilder.group({
        product_id: ['', Validators.required],
        product_name: ['', Validators.required],
        certification_type: ['', Validators.required],
        certification_category: ['', Validators.required],
        description: ['']
      }),
      
      // ABA 2 - Dados do Certificado
      certificate_data: this.formBuilder.group({
        certification_number: ['', Validators.required],
        issuing_authority: ['', Validators.required],
        issuing_country: ['Brasil'],
        issue_date: ['', Validators.required],
        expiry_date: [''],
        certificate_file_url: [''],
        digital_signature: [false]
      }),
      
      // ABA 3 - Compliance por País
      country_compliance: this.formBuilder.array([]),
      
      // ABA 4 - Integração com Exportação
      export_integration: this.formBuilder.group({
        export_id: [''],
        shipment_id: [''],
        due_number: [''],
        auto_attach_to_export: [true]
      }),
      
      // ABA 5 - IA & Automação
      ai_automation: this.formBuilder.group({
        ai_generated: [false],
        ai_confidence_score: [0],
        ai_document_extracted: [false],
        ai_missing_fields: [[]],
        ai_compliance_check: [true],
        ai_risk_score: [0]
      }),
      
      // ABA 6 - Auditoria (readonly)
      audit: this.formBuilder.group({
        created_at: [{ value: '', disabled: true }],
        created_by: [{ value: '', disabled: true }],
        updated_at: [{ value: '', disabled: true }],
        updated_by: [{ value: '', disabled: true }]
      })
    });
  }

  private setupSearchSubscription(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private async loadInitialData(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Load filter options
      this.certificationTypes = this.certificationsService.getCertificationTypes();
      this.certificationCategories = ['SANITARIO', 'ORIGEM', 'LOGISTICO', 'COMERCIAL'];
      this.certificationStatuses = ['VALID', 'EXPIRED', 'PENDING', 'INVALID', 'EXPIRING_SOON'];
      this.complianceStatuses = ['OK', 'WARNING', 'ERROR', 'PENDING_VALIDATION'];
      this.issuingAuthorities = this.certificationsService.getIssuingAuthorities();
      this.destinationCountries = [
        { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸' },
        { code: 'CHN', name: 'China', flag: '🇨🇳' },
        { code: 'DEU', name: 'Alemanha', flag: '🇩🇪' },
        { code: 'JPN', name: 'Japão', flag: '🇯🇵' },
        { code: 'GBR', name: 'Reino Unido', flag: '🇬🇧' },
        { code: 'FRA', name: 'França', flag: '🇫🇷' },
        { code: 'ITA', name: 'Itália', flag: '🇮🇹' },
        { code: 'ESP', name: 'Espanha', flag: '🇪🇸' },
        { code: 'CAN', name: 'Canadá', flag: '🇨🇦' },
        { code: 'AUS', name: 'Austrália', flag: '🇦🇺' }
      ];
      
      // Load certifications
      const result = await this.certificationsService.getCertifications().toPromise();
      if (result) {
        this.searchResult = result;
        this.certifications = result.certifications;
        this.filteredCertifications = [...this.certifications];
        this.metrics = result.metrics;
      }
      
      // Load AI Alerts
      const alerts = await this.certificationsService.getAIAlerts().toPromise();
      if (alerts) {
        this.aiAlerts = alerts;
        this.hasAlerts = alerts.length > 0;
        this.criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL').length;
        this.highAlertsCount = alerts.filter(a => a.severity === 'HIGH').length;
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      this.showMessage('Erro ao carregar dados iniciais', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    const filters: CertificationFilters = this.searchForm.value;
    
    this.isLoading = true;
    this.certificationsService.getCertifications(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.searchResult = result;
          this.filteredCertifications = result.certifications;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao aplicar filtros:', error);
          this.showMessage('Erro ao aplicar filtros', 'error');
          this.isLoading = false;
        }
      });
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.loadInitialData();
  }

  // === CRUD OPERATIONS ===

  createCertification(): void {
    this.isCreating = true;
    this.isDetailPanelOpen = true;
    this.selectedCertification = null;
    this.selectedTabIndex = 0;
    this.certificationForm.reset();
  }

  editCertification(certification: CertificationData): void {
    this.isEditing = true;
    this.isDetailPanelOpen = true;
    this.selectedCertification = certification;
    this.selectedTabIndex = 0;
    this.populateForm(certification);
  }

  viewCertificationDetails(certification: CertificationData): void {
    this.selectedCertification = certification;
    this.isDetailPanelOpen = true;
    this.isCreating = false;
    this.isEditing = false;
    this.selectedTabIndex = 0;
    this.loadCertificationDetails(certification.certification_id);
  }

  private populateForm(certification: CertificationData): void {
    this.certificationForm.patchValue({
      identification: {
        product_id: certification.product_id,
        product_name: certification.product_name,
        certification_type: certification.certification_type,
        certification_category: certification.certification_category,
        description: certification.description
      },
      certificate_data: {
        certification_number: certification.certification_number,
        issuing_authority: certification.issuing_authority,
        issuing_country: certification.issuing_country,
        issue_date: certification.issue_date,
        expiry_date: certification.expiry_date,
        certificate_file_url: certification.certificate_file_url,
        digital_signature: certification.digital_signature
      },
      export_integration: {
        export_id: certification.export_id,
        shipment_id: certification.shipment_id,
        due_number: certification.due_number,
        auto_attach_to_export: certification.auto_attach_to_export
      },
      ai_automation: {
        ai_generated: certification.ai_generated,
        ai_confidence_score: certification.ai_confidence_score,
        ai_document_extracted: certification.ai_document_extracted,
        ai_missing_fields: certification.ai_missing_fields,
        ai_compliance_check: certification.ai_compliance_check,
        ai_risk_score: certification.ai_risk_score
      },
      audit: {
        created_at: certification.created_at,
        created_by: certification.created_by,
        updated_at: certification.updated_at,
        updated_by: certification.updated_by
      }
    });
  }

  private async loadCertificationDetails(certificationId: string): Promise<void> {
    try {
      // Load country compliances
      const compliances = await this.certificationsService.getCountryCompliances(certificationId).toPromise();
      if (compliances) {
        this.countryCompliances = compliances;
      }

      // Load AI suggestions
      if (this.selectedCertification) {
        const suggestions = await this.certificationsService.getAISuggestions(
          this.selectedCertification.product_id
        ).toPromise();
        if (suggestions) {
          this.aiSuggestions = suggestions;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  }

  async saveCertification(): Promise<void> {
    if (this.certificationForm.invalid) {
      this.showMessage('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      this.isLoading = true;
      const formData: CertificationFormData = this.certificationForm.value;

      if (this.isCreating) {
        const result = await this.certificationsService.createCertification(formData).toPromise();
        this.showMessage('Certificação criada com sucesso!', 'success');
      } else if (this.isEditing && this.selectedCertification) {
        const result = await this.certificationsService.updateCertification(
          this.selectedCertification.certification_id, 
          formData
        ).toPromise();
        this.showMessage('Certificação atualizada com sucesso!', 'success');
      }

      this.closeDetailPanel();
      this.loadInitialData();
    } catch (error) {
      console.error('Erro ao salvar certificação:', error);
      this.showMessage('Erro ao salvar certificação', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCertification(certification: CertificationData): Promise<void> {
    if (confirm(`Tem certeza que deseja excluir a certificação ${certification.certification_number}?`)) {
      try {
        this.isLoading = true;
        await this.certificationsService.deleteCertification(certification.certification_id).toPromise();
        this.showMessage('Certificação excluída com sucesso!', 'success');
        this.loadInitialData();
      } catch (error) {
        console.error('Erro ao excluir certificação:', error);
        this.showMessage('Erro ao excluir certificação', 'error');
      } finally {
        this.isLoading = false;
      }
    }
  }

  // === AI FUNCTIONS ===

  async processDocumentOCR(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.isLoading = true;
      this.showMessage('Processando documento com IA...', 'info');
      
      const ocrResult = await this.certificationsService.processDocumentOCR(file).toPromise();
      
      if (ocrResult?.extracted_data) {
        // Auto-fill form with OCR data
        this.certificationForm.patchValue({
          certificate_data: {
            certification_number: ocrResult.extracted_data.certification_number,
            issuing_authority: ocrResult.extracted_data.issuing_authority,
            issue_date: ocrResult.extracted_data.issue_date,
            expiry_date: ocrResult.extracted_data.expiry_date
          },
          identification: {
            product_name: ocrResult.extracted_data.product_name
          }
        });

        this.showMessage(
          `Documento processado com ${Math.round(ocrResult.confidence_score * 100)}% de confiança`, 
          'success'
        );
      }
    } catch (error) {
      console.error('Erro no processamento OCR:', error);
      this.showMessage('Erro ao processar documento', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async validateCompliance(productId: string, destinationCountry: string): Promise<void> {
    try {
      this.isLoading = true;
      const compliance = await this.certificationsService.validateCompliance(productId, destinationCountry).toPromise();
      
      if (compliance) {
        // Show compliance results
        this.showComplianceResults(compliance);
      }
    } catch (error) {
      console.error('Erro na validação de compliance:', error);
      this.showMessage('Erro ao validar compliance', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  private showComplianceResults(compliance: ComplianceCheck): void {
    // Implementation for showing compliance results in a dialog
    console.log('Compliance Results:', compliance);
  }

  // === UI METHODS ===

  changeView(view: 'grid' | 'cards' | 'timeline'): void {
    this.currentView = view;
  }

  closeDetailPanel(): void {
    this.isDetailPanelOpen = false;
    this.isCreating = false;
    this.isEditing = false;
    this.selectedCertification = null;
  }

  exportCertifications(): void {
    // Implementar exportação para Excel/PDF
    this.showMessage('Exportação em desenvolvimento', 'info');
  }

  refreshData(): void {
    this.loadInitialData();
    this.showMessage('Dados atualizados', 'success');
  }

  // === UTILITY METHODS ===

  getRiskColor(riskLevel?: AIRiskLevel): string {
    return riskLevel ? this.riskLevelColors[riskLevel] : 'primary';
  }

  getStatusColor(status: CertificationStatus): string {
    return this.statusColors[status] || 'primary';
  }

  getComplianceColor(status: ComplianceStatus): string {
    return this.complianceColors[status] || 'primary';
  }

  getRiskIcon(riskLevel?: AIRiskLevel): string {
    switch (riskLevel) {
      case 'LOW': return 'check_circle';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'dangerous';
      default: return 'help';
    }
  }

  getStatusIcon(status: CertificationStatus): string {
    switch (status) {
      case 'VALID': return 'verified';
      case 'EXPIRED': return 'expired';
      case 'PENDING': return 'pending';
      case 'INVALID': return 'cancel';
      case 'EXPIRING_SOON': return 'schedule';
      default: return 'help';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(value?: number): string {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatPercentage(value?: number): string {
    if (value === undefined || value === null) return '-';
    return `${(value * 100).toFixed(1)}%`;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  // === PREMIUM UI METHODS ===

  toggleRealTimeUpdates(): void {
    this.realTimeUpdates = !this.realTimeUpdates;
    if (this.realTimeUpdates) {
      this.showMessage('Atualizações em tempo real ativadas', 'success');
      // Aqui seria implementado um WebSocket ou polling
    } else {
      this.showMessage('Atualizações em tempo real desativadas', 'info');
    }
  }

  refreshData(): void {
    this.loadInitialData();
    this.showMessage('Dados atualizados', 'success');
  }

  hasActiveFilters(): boolean {
    const formValue = this.searchForm.value;
    return Object.values(formValue).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }

  getActiveFiltersCount(): number {
    const formValue = this.searchForm.value;
    return Object.values(formValue).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  }

  getAlertColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'warn';
      case 'HIGH': return 'accent';
      case 'MEDIUM': return 'primary';
      default: return 'primary';
    }
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'dangerous';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      default: return 'info';
    }
  }

  exportCertifications(): void {
    // Implementar exportação para Excel/PDF
    this.showMessage('Exportação em desenvolvimento', 'info');
  }

  // === EXISTING METHODS ===

  // === GETTERS FOR TEMPLATE ===

  get isFormValid(): boolean {
    return this.certificationForm.valid;
  }

  trackByCertId(index: number, cert: CertificationData): string {
    return cert.certification_id;
  }
}