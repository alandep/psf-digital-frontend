import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Angular Material Imports
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
import { CertificationDialogComponent } from './certification-dialog/certification-dialog.component';
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
  productCategories: string[] = [];
  
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
      issuing_country: [''], // Campo para país emissor no filtro
      date_range_start: [''],
      date_range_end: [''],
      expiry_date_start: [''],
      expiry_date_end: [''],
      ai_risk_level: [''],
      // Campos adicionais para filtros avançados
      ai_generated: [false],
      expiring_soon: [false],
      with_digital_signature: [false]
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
      this.productCategories = [
        'ALIMENTOS',
        'BEBIDAS', 
        'COSMÉTICOS',
        'MEDICAMENTOS',
        'QUÍMICOS',
        'TÊXTIL',
        'ELETRÔNICOS',
        'AUTOMOBILÍSTICO',
        'METALÚRGICOS',
        'OUTROS'
      ];
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
      
      // Initialize AI suggestions and compliance data
      this.aiSuggestions = [
        {
          id: '1',
          certification_type: 'SANITARIO',
          reason: 'Considere renovar certificação próxima ao vencimento',
          confidence_score: 0.85,
          required_for_countries: ['USA'],
          issuing_authorities: ['FDA'],
          estimated_processing_time_days: 30,
          priority: 'HIGH'
        },
        {
          id: '2',
          certification_type: 'SANITARIO',
          reason: 'Documentação adicional pode ser necessária para EUA',
          confidence_score: 0.75,
          required_for_countries: ['USA'],
          issuing_authorities: ['FDA', 'USDA'],
          estimated_processing_time_days: 45,
          priority: 'MEDIUM'
        },
        {
          id: '3',
          certification_type: 'ORIGEM',
          reason: 'OCR disponível para extração automática',
          confidence_score: 0.92,
          required_for_countries: ['CHN', 'EUR'],
          issuing_authorities: ['Receita Federal'],
          estimated_processing_time_days: 15,
          priority: 'LOW'
        }
      ];
      
      this.countryCompliances = [
        {
          id: '1',
          certification_id: '',
          destination_country: 'Estados Unidos',
          country_code: 'USA',
          mandatory: true,
          regulatory_requirement: 'FDA Approval',
          issuing_agency_required: 'FDA',
          compliance_status: 'OK',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          certification_id: '',
          destination_country: 'União Europeia',
          country_code: 'EUR',
          mandatory: true,
          regulatory_requirement: 'CE Marking',
          issuing_agency_required: 'Notified Body',
          compliance_status: 'WARNING',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '3',
          certification_id: '',
          destination_country: 'China',
          country_code: 'CHN',
          mandatory: false,
          regulatory_requirement: 'CCC',
          issuing_agency_required: 'CNCA',
          compliance_status: 'ERROR',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      this.showMessage('Erro ao carregar dados iniciais', 'error');
    } finally {
      this.isLoading = false;
    }
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

  exportCertifications(): void {
    // Implementar exportação para Excel/PDF
    this.showMessage('Exportação em desenvolvimento', 'info');
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
    this.isEditing = false;
    this.selectedCertification = null;
    this.openCertificationDialog();
  }

  editCertification(certification: CertificationData): void {
    this.selectedCertification = certification;
    this.isCreating = false;
    this.isEditing = true;
    this.openCertificationDialog();
  }

  viewCertificationDetails(certification: CertificationData): void {
    this.selectedCertification = certification;
    this.isCreating = false;
    this.isEditing = false;
    this.openCertificationDialog();
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
      this.isLoading = true;
      // Simular carregamento de detalhes
      this.countryCompliances = [];
      this.aiSuggestions = [];
      this.showMessage('Detalhes carregados', 'success');
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      this.showMessage('Erro ao carregar detalhes da certificação', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  saveCertification(): void {
    if (!this.certificationForm.valid) {
      this.showMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const formData: CertificationFormData = this.certificationForm.value;
    
    if (this.isCreating) {
      this.certificationsService.createCertification(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.showMessage('Certificação criada com sucesso', 'success');
            this.closeDetailPanel();
            this.loadInitialData();
          },
          error: (error) => {
            console.error('Erro ao criar certificação:', error);
            this.showMessage('Erro ao criar certificação', 'error');
          }
        });
    } else if (this.isEditing && this.selectedCertification) {
      this.certificationsService.updateCertification(this.selectedCertification.certification_id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.showMessage('Certificação atualizada com sucesso', 'success');
            this.closeDetailPanel();
            this.loadInitialData();
          },
          error: (error) => {
            console.error('Erro ao atualizar certificação:', error);
            this.showMessage('Erro ao atualizar certificação', 'error');
          }
        });
    }
  }

  deleteCertification(certification: CertificationData): void {
    if (confirm(`Deseja remover a certificação ${certification.certification_number}?`)) {
      this.certificationsService.deleteCertification(certification.certification_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMessage('Certificação removida com sucesso', 'success');
            this.loadInitialData();
          },
          error: (error) => {
            console.error('Erro ao remover certificação:', error);
            this.showMessage('Erro ao remover certificação', 'error');
          }
        });
    }
  }

  closeDetailPanel(): void {
    this.isDetailPanelOpen = false;
    this.isCreating = false;
    this.isEditing = false;
    this.selectedCertification = null;
  }

  // Métodos para suporte aos chips de status premium
  getStatusChipClass(status: string): string {
    switch (status) {
      case 'VALID': return 'green';
      case 'EXPIRING_SOON': return 'orange';
      case 'EXPIRED': return 'red';
      case 'PENDING': return 'blue';
      case 'BLOCKED': return 'red';
      default: return 'grey';
    }
  }

  getRiskChipClass(riskLevel: string): string {
    switch (riskLevel) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      case 'LOW': return 'low';
      default: return 'low';
    }
  }

  // Exportar dados filtrados
  exportFiltered(): void {
    if (this.filteredCertifications.length === 0) {
      this.showMessage('Nenhuma certificação para exportar', 'info');
      return;
    }
    this.showMessage(`Exportando ${this.filteredCertifications.length} certificações...`, 'info');
    // Implementar lógica de exportação
  }

  // Abrir diálogo de criação
  openCreateDialog(): void {
    this.isCreating = true;
    this.isDetailPanelOpen = true;
    this.initializeForms();
  }

  // Propriedade dashboardData para o template
  get dashboardData() {
    return {
      certificates_expiring_count: this.filteredCertifications.filter(c => c.certification_status === 'EXPIRING_SOON').length,
      compliance_issues_count: this.filteredCertifications.filter(c => c.compliance_status === 'ERROR').length
    };
  }

  // Abrir modal de certificação
  openCertificationDialog(): void {
    const dialogRef = this.dialog.open(CertificationDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      disableClose: false,
      panelClass: 'certification-dialog-container',
      data: {
        certification: this.selectedCertification,
        isCreating: this.isCreating,
        isEditing: this.isEditing,
        certificationTypes: this.certificationTypes,
        productCategories: this.productCategories,
        destinationCountries: this.destinationCountries,
        issuingAuthorities: this.issuingAuthorities,
        certificationCategories: this.certificationCategories,
        countryCompliances: this.countryCompliances,
        aiSuggestions: this.aiSuggestions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.isCreating) {
          this.handleCertificationCreated(result);
        } else if (this.isEditing) {
          this.handleCertificationUpdated(result);
        }
      }
      this.resetDialogState();
    });
  }

  // Reset do estado do diálogo
  resetDialogState(): void {
    this.isCreating = false;
    this.isEditing = false;
    this.selectedCertification = null;
  }

  // Manipular certificação criada pelo diálogo
  handleCertificationCreated(certificationData: any): void {
    this.certificationsService.createCertification(certificationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.showMessage('Certificação criada com sucesso!', 'success');
          this.loadCertifications();
        },
        error: (error) => {
          console.error('Erro ao criar certificação:', error);
          this.showMessage('Erro ao criar certificação', 'error');
        }
      });
  }

  // Manipular certificação atualizada pelo diálogo  
  handleCertificationUpdated(certificationData: any): void {
    if (this.selectedCertification) {
      this.certificationsService.updateCertification(
        this.selectedCertification.certification_id,
        certificationData
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.showMessage('Certificação atualizada com sucesso!', 'success');
            this.loadCertifications();
          },
          error: (error) => {
            console.error('Erro ao atualizar certificação:', error);
            this.showMessage('Erro ao atualizar certificação', 'error');
          }
        });
    }
  }

  // Carregar certificações
  loadCertifications(): void {
    this.isLoading = true;
    this.certificationsService.getCertifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: CertificationSearchResult) => {
          this.certifications = result.certifications;
          this.searchResult = result;
          this.metrics = result.metrics;
          this.updateFilteredCertifications();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar certificações:', error);
          this.showMessage('Erro ao carregar certificações', 'error');
          this.isLoading = false;
        }
      });
  }

  // Mudança de visualização
  onViewChange(event: any): void {
    this.currentView = event.value;
  }

  // Processar documento OCR (método placeholder)
  processDocumentOCR(event: any): void {
    this.showMessage('Processamento OCR iniciado. Aguarde...', 'info');
    // Implementação do OCR será feita posteriormente
  }

  // Atualizar certificações filtradas
  updateFilteredCertifications(): void {
    this.filteredCertifications = [...this.certifications];
    // Aplicar filtros se necessário
  }

  // === UTILITY METHODS ===

  getRiskColor(riskLevel?: AIRiskLevel): string {
    return riskLevel ? this.riskLevelColors[riskLevel] : 'primary';
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

  getStatusColor(status: CertificationStatus): string {
    return this.statusColors[status] || 'primary';
  }

  getStatusIcon(status: CertificationStatus): string {
    switch (status) {
      case 'VALID': return 'check_circle';
      case 'EXPIRED': return 'error';
      case 'PENDING': return 'hourglass_empty';
      case 'INVALID': return 'cancel';
      case 'EXPIRING_SOON': return 'schedule';
      default: return 'help';
    }
  }

  getComplianceColor(status: ComplianceStatus): string {
    return this.complianceColors[status] || 'primary';
  }

  formatDate(date?: Date | string): string {
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

  // === GETTERS FOR TEMPLATE ===

  get isFormValid(): boolean {
    return this.certificationForm.valid;
  }

  trackByCertId(index: number, cert: CertificationData): string {
    return cert.certification_id;
  }
}