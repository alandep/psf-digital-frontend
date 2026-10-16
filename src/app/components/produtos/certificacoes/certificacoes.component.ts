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
import { CERTIFICACAO_SERVICE } from '../../../services/certificacao/certificacao-service.token';
import { ICertificacaoService } from '../../../services/certificacao/certificacao-service.interface';
import { CertificacaoApi, SalvarCertificacao } from '../../../../types/certificacao-api';
import { CertificationDialogComponent } from './certification-dialog/certification-dialog.component';
import { ConfirmarAcaoDialogComponent, ConfirmDialogData } from '../../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { 
  CertificationData,
  CertificationSearchResult,
  AIAlert,
  AISuggestion,
  CertificationMetrics,
  CertificationType,
  CertificationCategory,
  CertificationStatus,
  ComplianceStatus,
  AIRiskLevel,
  CountryCompliance
} from '../../../../types/certifications';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

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
    DragDropModule,
    HasPermissionDirective
  ],
  templateUrl: './certificacoes.component.html',
  styleUrls: ['./certificacoes.component.premium.scss']
})
export class CertificacoesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Services
  private certificacaoService = inject<ICertificacaoService>(CERTIFICACAO_SERVICE);
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

  // === BACKEND MAPPERS ===

  /** Converte 'yyyy-MM-dd' (ou ISO) -> Date; retorna undefined se vazio/invalido. */
  private toIsoDate(d?: Date | string | null): string | null {
    if (!d) return null;
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /** Deriva o status de UI a partir do ciclo de vida do backend + validade. */
  private mapStatus(status?: string | null, validaAte?: string | null): CertificationStatus {
    const uiStatuses: CertificationStatus[] = ['VALID', 'EXPIRED', 'EXPIRING_SOON', 'PENDING', 'INVALID'];
    // Se o backend ja mandou um status compativel com a union de UI, usa direto.
    if (status && uiStatuses.includes(status as CertificationStatus)) {
      return status as CertificationStatus;
    }

    // Caso contrario, deriva pela data de validade quando disponivel.
    if (validaAte) {
      const expiry = new Date(validaAte);
      if (!isNaN(expiry.getTime())) {
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'EXPIRED';
        if (diffDays <= 30) return 'EXPIRING_SOON';
        // Dentro da validade: considera VALID se o ciclo backend indica ativo/valido.
        const upper = (status || '').toUpperCase();
        if (upper === 'ATIVA' || upper === 'VALIDA') return 'VALID';
        return 'VALID';
      }
    }

    return 'PENDING';
  }

  /** Normaliza o complianceStatus do backend para a union de UI. */
  private mapComplianceStatus(compliance?: string | null): ComplianceStatus {
    if (!compliance) return 'PENDING_VALIDATION';
    const upper = compliance.toUpperCase();
    if (upper === 'APROVADO') return 'OK';
    if (upper === 'EM_ANALISE') return 'PENDING_VALIDATION';
    const uiStatuses: ComplianceStatus[] = ['OK', 'WARNING', 'ERROR', 'PENDING_VALIDATION'];
    if (uiStatuses.includes(upper as ComplianceStatus)) {
      return upper as ComplianceStatus;
    }
    return 'PENDING_VALIDATION';
  }

  /** camelCase (backend) -> tipo rico do front (snake_case). */
  private toCertificationData(api: CertificacaoApi): CertificationData {
    return {
      // Identificacao
      certification_id: api.id,
      product_id: api.productId ?? '',
      product_name: api.productName ?? api.name,
      certification_type: (api.tipo as CertificationType) ?? 'ORIGEM',
      certification_category: (api.categoria as CertificationCategory) ?? 'ORIGEM',
      description: api.descricao ?? '',

      // Dados do Certificado
      certification_number: api.numero ?? '',
      issuing_authority: api.orgaoEmissor ?? '',
      issuing_country: api.paisEmissor ?? 'Brasil',
      issue_date: api.emitidaEm ? new Date(api.emitidaEm) : new Date(),
      expiry_date: api.validaAte ? new Date(api.validaAte) : undefined,
      digital_signature: api.assinaturaDigital ?? false,

      // Status e Compliance
      certification_status: this.mapStatus(api.status, api.validaAte),
      compliance_status: this.mapComplianceStatus(api.complianceStatus),

      // Integracao com Exportacao
      export_id: api.exportId ?? undefined,
      due_number: api.dueNumber ?? undefined,
      auto_attach_to_export: false,

      // IA e Automacao
      ai_generated: api.aiGenerated ?? false,
      ai_confidence_score: api.aiConfidenceScore ?? 0,
      ai_document_extracted: false,
      ai_compliance_check: true,
      ai_risk_score: api.aiRiskScore ?? 0,
      ai_risk_level: (api.aiRiskLevel as AIRiskLevel) ?? 'LOW',

      // Auditoria
      created_by: api.createdBy ?? '',
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: ''
    };
  }

  /** Form do dialog (grupos aninhados OU plano) -> payload do backend. */
  private toSalvar(formData: any): SalvarCertificacao {
    const id = formData?.identification ?? formData ?? {};
    const cert = formData?.certificate ?? formData?.certificate_data ?? formData ?? {};
    const exp = formData?.export_integration ?? formData ?? {};
    const ai = formData?.ai_automation ?? formData ?? {};

    const productName = id.product_name ?? formData?.product_name ?? 'Certificação';

    return {
      name: productName,
      tipo: id.certification_type ?? formData?.certification_type ?? null,
      orgaoEmissor: cert.issuing_authority ?? formData?.issuing_authority ?? null,
      numero: cert.certification_number ?? formData?.certification_number ?? null,
      status: null,
      emitidaEm: this.toIsoDate(cert.issue_date ?? formData?.issue_date),
      validaAte: this.toIsoDate(cert.expiry_date ?? formData?.expiry_date),
      productId: id.product_id ?? formData?.product_id ?? null,
      productName: id.product_name ?? formData?.product_name ?? null,
      categoria: id.certification_category ?? formData?.certification_category ?? null,
      descricao: id.description ?? formData?.description ?? null,
      paisEmissor: cert.issuing_country ?? formData?.issuing_country ?? null,
      paisDestino: null,
      assinaturaDigital: (cert.digital_signature ?? formData?.digital_signature) ?? false,
      complianceStatus: null,
      exportId: exp.export_id ?? formData?.export_id ?? null,
      dueNumber: exp.due_number ?? formData?.due_number ?? null,
      aiGenerated: (ai.ai_generated ?? formData?.ai_generated) ?? false,
      aiConfidenceScore: ai.ai_confidence_score ?? formData?.ai_confidence_score ?? null,
      aiRiskScore: ai.ai_risk_score ?? formData?.ai_risk_score ?? null,
      aiRiskLevel: ai.ai_risk_level ?? formData?.ai_risk_level ?? null
    };
  }

  /** Deriva metricas localmente a partir da lista mapeada. */
  private computeMetrics(list: CertificationData[]): CertificationMetrics {
    const total = list.length;
    const valid = list.filter(c => c.certification_status === 'VALID').length;
    const expired = list.filter(c => c.certification_status === 'EXPIRED').length;
    const expiringSoon = list.filter(c => c.certification_status === 'EXPIRING_SOON').length;
    const pending = list.filter(c => c.certification_status === 'PENDING').length;
    const invalid = list.filter(c => c.certification_status === 'INVALID').length;
    const complianceOk = list.filter(c => c.compliance_status === 'OK').length;

    return {
      total_certifications: total,
      valid_certifications: valid,
      expired_certifications: expired,
      expiring_soon_certifications: expiringSoon,
      pending_certifications: pending,
      invalid_certifications: invalid,
      compliance_rate: total > 0 ? complianceOk / total : 0,
      ai_accuracy_rate: 0,
      ai_predictions_count: 0,
      compliance_ok_count: complianceOk,
      countries_covered_count: new Set(list.map(c => c.issuing_country).filter(Boolean)).size,
      compliance_score: total > 0 ? complianceOk / total : 0,
      average_processing_time_days: 0,
      cost_savings_usd: 0,
      error_reduction_percentage: 0
    };
  }

  private loadInitialData(): void {
    this.isLoading = true;

    // Load filter options (static UI options)
    this.certificationTypes = [
      'SANITARIO', 'FITOSSANITARIO', 'ORIGEM', 'QUALIDADE', 'HALAL',
      'KOSHER', 'ORGANICO', 'NON_GMO', 'BRC', 'SIF', 'HACCP'
    ];
    this.certificationCategories = ['SANITARIO', 'ORIGEM', 'LOGISTICO', 'COMERCIAL'];
    this.certificationStatuses = ['VALID', 'EXPIRED', 'PENDING', 'INVALID', 'EXPIRING_SOON'];
    this.complianceStatuses = ['OK', 'WARNING', 'ERROR', 'PENDING_VALIDATION'];
    this.issuingAuthorities = [
      'MAPA', 'ANVISA', 'INMETRO', 'IBAMA', 'Receita Federal',
      'FIESP', 'IBD Certificações', 'SGS', 'Intertek'
    ];
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

    // AI alerts/suggestions/compliance eram fabricados no mock; honestamente vazios.
    // A analise de IA real e disparada a partir do dialog (verificarCompliance).
    this.aiAlerts = [];
    this.aiSuggestions = [];
    this.countryCompliances = [];
    this.hasAlerts = false;
    this.criticalAlertsCount = 0;
    this.highAlertsCount = 0;

    // Load certifications from the real backend service
    this.loadCertifications();
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
    const filters = this.searchForm.value;

    this.isLoading = true;
    this.certificacaoService.listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apis: CertificacaoApi[]) => {
          const list = apis.map(api => this.toCertificationData(api));
          this.certifications = list;
          this.metrics = this.computeMetrics(list);

          const searchText = (filters.search_text || '').toString().trim().toLowerCase();
          const type = filters.certification_type || '';
          const status = filters.certification_status || '';

          this.filteredCertifications = list.filter(cert => {
            const matchesSearch = !searchText || [
              cert.product_name,
              cert.certification_number,
              cert.issuing_authority
            ].some(field => (field || '').toLowerCase().includes(searchText));
            const matchesType = !type || cert.certification_type === type;
            const matchesStatus = !status || cert.certification_status === status;
            return matchesSearch && matchesType && matchesStatus;
          });

          this.isLoading = false;
        },
        error: () => {
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
    } catch {
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

    const formData = this.certificationForm.value;

    if (this.isCreating) {
      this.certificacaoService.criar(this.toSalvar(formData))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMessage('Certificação criada com sucesso', 'success');
            this.closeDetailPanel();
            this.loadInitialData();
          },
          error: () => {
            this.showMessage('Erro ao criar certificação', 'error');
          }
        });
    } else if (this.isEditing && this.selectedCertification) {
      this.certificacaoService.atualizar(this.selectedCertification.certification_id, this.toSalvar(formData))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMessage('Certificação atualizada com sucesso', 'success');
            this.closeDetailPanel();
            this.loadInitialData();
          },
          error: () => {
            this.showMessage('Erro ao atualizar certificação', 'error');
          }
        });
    }
  }

  deleteCertification(certification: CertificationData): void {
    const data: ConfirmDialogData = {
      title: 'Excluir Certificação',
      message: 'Tem certeza que deseja remover a certificação ' + certification.certification_number + '? Esta ação não pode ser desfeita.',
      icon: 'delete',
      iconColor: '#f44336',
      confirmText: 'Excluir',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '420px',
      autoFocus: false,
      data
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed === true) {
          this.certificacaoService.excluir(certification.certification_id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showMessage('Certificação removida com sucesso', 'success');
                this.loadInitialData();
              },
              error: () => {
                this.showMessage('Erro ao remover certificação', 'error');
              }
            });
        }
      });
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
    this.certificacaoService.criar(this.toSalvar(certificationData))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage('Certificação criada com sucesso!', 'success');
          this.loadCertifications();
        },
        error: () => {
          this.showMessage('Erro ao criar certificação', 'error');
        }
      });
  }

  // Manipular certificação atualizada pelo diálogo  
  handleCertificationUpdated(certificationData: any): void {
    if (this.selectedCertification) {
      this.certificacaoService.atualizar(
        this.selectedCertification.certification_id,
        this.toSalvar(certificationData)
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMessage('Certificação atualizada com sucesso!', 'success');
            this.loadCertifications();
          },
          error: () => {
            this.showMessage('Erro ao atualizar certificação', 'error');
          }
        });
    }
  }

  // Carregar certificações
  loadCertifications(): void {
    this.isLoading = true;
    this.certificacaoService.listar()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apis: CertificacaoApi[]) => {
          const list = apis.map(api => this.toCertificationData(api));
          this.certifications = list;
          this.metrics = this.computeMetrics(list);
          this.updateFilteredCertifications();
          this.isLoading = false;
        },
        error: () => {
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