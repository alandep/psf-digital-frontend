import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';

// Services e Types
import { NCMClassificationMockService } from '../../../../services/ncm-classification-mock.service';
import { 
  NCMClassification,
  NCMClassificationFilters,
  NCMClassificationStats,
  AIClassificationRequest,
  AIClassificationResponse,
  NCMValidation,
  CommodityType,
  ComplianceStatus,
  ClassificationSource,
  ClassificationStatus,
  ExportLicenseType,
  InspectionAgency,
  AIClassificationStatus,
  ApprovalStatus,
  COMMODITY_TYPE_LABELS_NCM,
  COMPLIANCE_STATUS_LABELS,
  CLASSIFICATION_SOURCE_LABELS,
  STATUS_LABELS,
  EXPORT_LICENSE_LABELS,
  INSPECTION_AGENCY_LABELS
} from '../../../../types/ncm-classification';

@Component({
  selector: 'app-ncm-classificacao',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule
  ],
  templateUrl: './ncm-classificacao.component.html',
  styleUrls: ['./ncm-classificacao.component.scss']
})
export class NCMClassificacaoComponent implements OnInit {
  private readonly clasificacaoService = inject(NCMClassificationMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  // === STATE MANAGEMENT ===
  public isLoading = false;
  public isLoadingStats = false;
  public isSaving = false;
  public isClassifyingWithAI = false;
  public isValidatingNCM = false;
  
  public showClassificationForm = false;
  public editingClassification: NCMClassification | null = null;
  public selectedTabIndex = 0;

  // === DATA ===
  public classifications: NCMClassification[] = [];
  public stats: NCMClassificationStats | null = null;
  public displayedColumns = [
    'compliance_status',
    'product_name', 
    'product_code',
    'ncm_code', 
    'ncm_description',
    'hs_code',
    'commodity_type',
    'ai_confidence_score',
    'classification_source',
    'status',
    'actions'
  ];

  // === FORMS ===
  public filtroForm: FormGroup;
  public classificacaoForm: FormGroup;
  public quickClassifyForm: FormGroup;

  // === CONSTANTES PARA TEMPLATE ===
  public readonly COMMODITY_TYPE_LABELS = COMMODITY_TYPE_LABELS_NCM;
  public readonly COMPLIANCE_STATUS_LABELS = COMPLIANCE_STATUS_LABELS;
  public readonly CLASSIFICATION_SOURCE_LABELS = CLASSIFICATION_SOURCE_LABELS;
  public readonly STATUS_LABELS = STATUS_LABELS;
  public readonly EXPORT_LICENSE_LABELS = EXPORT_LICENSE_LABELS;
  public readonly INSPECTION_AGENCY_LABELS = INSPECTION_AGENCY_LABELS;

  constructor() {
    console.log('🏷️ NCMClassificacaoComponent inicializado!');
    
    // Formulário de filtros
    this.filtroForm = this.fb.group({
      search: [''],
      commodity_types: [[]],
      compliance_status: [[]],
      classification_source: [[]],
      status: [[]],
      ai_confidence_min: [0],
      ai_confidence_max: [100],
      requires_license: [null],
      has_restrictions: [null]
    });

    // Formulário de classificação rápida com IA
    this.quickClassifyForm = this.fb.group({
      product_description: ['', [Validators.required, Validators.minLength(10)]],
      product_name: [''],
      scientific_name: [''],
      commodity_type: ['']
    });

    // Formulário completo das 5 abas
    this.classificacaoForm = this.fb.group({
      // ABA 1: Produto
      product_id: ['', Validators.required],
      product_name: ['', [Validators.required, Validators.minLength(3)]],
      product_description: ['', [Validators.required, Validators.minLength(10)]],
      scientific_name: [''],
      commodity_type: ['GRAO', Validators.required],
      origin_country: ['Brasil', Validators.required],

      // ABA 2: Classificação Fiscal
      ncm_code: ['', [Validators.required, Validators.pattern(/^\d{4}\.\d{2}\.\d{2}$/)]],
      ncm_description: ['', Validators.required],
      hs_code: ['', [Validators.required, Validators.minLength(4)]],
      hs_description: [''],
      ncm_chapter: [''],
      ncm_heading: [''],
      ncm_subheading: [''],
      ncm_item: [''],
      ncm_full_code: [''],
      common_ncm_examples: [''],

      // ABA 3: Compliance Exportação
      export_tax: [0, [Validators.min(0), Validators.max(100)]],
      export_license_required: [false],
      export_license_type: ['NONE'],
      lpco_required: [false],
      lpco_type: [''],
      requires_inspection: [false],
      inspection_agency: [''],
      export_restriction: [false],
      restriction_description: [''],

      // ABA 4: IA e Automação
      ai_suggested_ncm: [''],
      ai_alternative_ncm_codes: [[]],
      ai_confidence_score: [0],
      ai_classification_reason: [''],
      ai_data_sources: [[]],
      ai_auto_classification_enabled: [true],
      ai_requires_human_review: [false],
      ai_classification_status: ['PENDING'],

      // ABA 5: Histórico e Auditoria
      created_by: [''],
      approval_status: ['PENDING']
    });
  }

  ngOnInit(): void {
    console.log('📊 Carregando dados da Classificação NCM...');
    this.loadData();
    this.setupFormSubscriptions();
  }

  // === MÉTODOS DE CARREGAMENTO ===

  private loadData(): void {
    this.loadClassifications();
    this.loadStatistics();
  }

  private loadClassifications(): void {
    this.isLoading = true;
    const filters = this.buildFilters();
    
    this.clasificacaoService.getClassifications(filters).subscribe({
      next: (classifications: NCMClassification[]) => {
        console.log('✅ Classificações carregadas:', classifications.length);
        this.classifications = classifications;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar classificações:', error);
        this.snackBar.open('Erro ao carregar classificações', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private loadStatistics(): void {
    this.isLoadingStats = true;
    
    this.clasificacaoService.getStatistics().subscribe({
      next: (stats: NCMClassificationStats) => {
        console.log('📈 Estatísticas carregadas:', stats);
        this.stats = stats;
        this.isLoadingStats = false;
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar estatísticas:', error);
        this.isLoadingStats = false;
      }
    });
  }

  private buildFilters(): NCMClassificationFilters {
    const formValues = this.filtroForm.value;
    
    const filters: NCMClassificationFilters = {};
    
    if (formValues.search?.trim()) {
      filters.search = formValues.search.trim();
    }
    
    if (formValues.commodity_types?.length > 0) {
      filters.commodity_types = formValues.commodity_types;
    }
    
    if (formValues.compliance_status?.length > 0) {
      filters.compliance_status = formValues.compliance_status;
    }
    
    if (formValues.classification_source?.length > 0) {
      filters.classification_source = formValues.classification_source;
    }
    
    if (formValues.status?.length > 0) {
      filters.status = formValues.status;
    }
    
    if (formValues.ai_confidence_min > 0) {
      filters.ai_confidence_min = formValues.ai_confidence_min;
    }
    
    if (formValues.ai_confidence_max < 100) {
      filters.ai_confidence_max = formValues.ai_confidence_max;
    }
    
    if (formValues.requires_license !== null) {
      filters.requires_license = formValues.requires_license;
    }
    
    if (formValues.has_restrictions !== null) {
      filters.has_restrictions = formValues.has_restrictions;
    }
    
    return filters;
  }

  private setupFormSubscriptions(): void {
    // Observar mudanças nos filtros
    this.filtroForm.valueChanges.subscribe(() => {
      this.loadClassifications();
    });

    // Observar mudanças no NCM para validação automática
    this.classificacaoForm.get('ncm_code')?.valueChanges.subscribe(ncmCode => {
      if (ncmCode && ncmCode.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
        this.validateNCMWithReceita(ncmCode);
      }
    });
  }

  // === MÉTODOS DE CLASSIFICAÇÃO ===

  public createClassification(): void {
    console.log('➕ Criando nova classificação NCM');
    this.editingClassification = null;
    this.selectedTabIndex = 0;
    this.classificacaoForm.reset({
      commodity_type: 'GRAO',
      origin_country: 'Brasil',
      export_tax: 0,
      export_license_required: false,
      export_license_type: 'NONE',
      lpco_required: false,
      requires_inspection: false,
      export_restriction: false,
      ai_auto_classification_enabled: true,
      ai_requires_human_review: false,
      ai_classification_status: 'PENDING',
      ai_confidence_score: 0,
      approval_status: 'PENDING'
    });
    this.showClassificationForm = true;
    
    setTimeout(() => {
      document.getElementById('classification-form-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  public editClassification(classification: NCMClassification): void {
    console.log('📝 Editando classificação:', classification.classification_id);
    this.editingClassification = classification;
    this.selectedTabIndex = 0;
    this.classificacaoForm.patchValue(classification);
    this.showClassificationForm = true;
    
    setTimeout(() => {
      document.getElementById('classification-form-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  public closeClassificationForm(): void {
    this.showClassificationForm = false;
    this.editingClassification = null;
    this.selectedTabIndex = 0;
    this.classificacaoForm.reset();
    console.log('✖️ Formulário de classificação fechado');
  }

  public saveClassification(): void {
    if (this.classificacaoForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formData = this.classificacaoForm.value;
    
    // Preencher campos automáticos
    formData.created_by = formData.created_by || 'user_current';
    formData.classification_source = formData.ai_confidence_score > 0 ? 'IA' : 'MANUAL';
    formData.compliance_status = this.calculateComplianceStatus(formData);
    formData.status = formData.approval_status === 'APPROVED' ? 'ACTIVE' : 'PENDING';

    console.log('💾 Salvando classificação:', formData);

    if (this.editingClassification) {
      // Atualizar classificação existente
      this.clasificacaoService.updateClassification(this.editingClassification.classification_id, formData).subscribe({
        next: (classification: NCMClassification) => {
          console.log('✅ Classificação atualizada:', classification);
          this.snackBar.open('Classificação atualizada com sucesso!', 'Fechar', { duration: 3000 });
          this.loadData();
          this.closeClassificationForm();
          this.isSaving = false;
        },
        error: (error: any) => {
          console.error('❌ Erro ao atualizar classificação:', error);
          this.snackBar.open('Erro ao atualizar classificação', 'Fechar', { duration: 3000 });
          this.isSaving = false;
        }
      });
    } else {
      // Criar nova classificação
      this.clasificacaoService.createClassification(formData).subscribe({
        next: (classification: NCMClassification) => {
          console.log('✅ Classificação criada:', classification);
          this.snackBar.open('Classificação criada com sucesso!', 'Fechar', { duration: 3000 });
          this.loadData();
          this.closeClassificationForm();
          this.isSaving = false;
        },
        error: (error: any) => {
          console.error('❌ Erro ao criar classificação:', error);
          this.snackBar.open('Erro ao criar classificação', 'Fechar', { duration: 3000 });
          this.isSaving = false;
        }
      });
    }
  }

  public deleteClassification(classification: NCMClassification): void {
    if (confirm(`Tem certeza que deseja excluir a classificação "${classification.product_name}"?`)) {
      console.log('🗑️ Excluindo classificação:', classification.classification_id);
      
      this.clasificacaoService.deleteClassification(classification.classification_id).subscribe({
        next: () => {
          this.snackBar.open('Classificação excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadData();
        },
        error: (error: any) => {
          console.error('❌ Erro ao excluir classificação:', error);
          this.snackBar.open('Erro ao excluir classificação', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  // === MÉTODOS DE IA ===

  public quickClassifyWithAI(): void {
    if (this.quickClassifyForm.invalid) {
      this.snackBar.open('Por favor, preencha a descrição do produto', 'Fechar', { duration: 3000 });
      return;
    }

    this.isClassifyingWithAI = true;
    const request: AIClassificationRequest = this.quickClassifyForm.value;
    
    console.log('🤖 Classificação rápida com IA:', request);
    
    this.clasificacaoService.classifyWithAI(request).subscribe({
      next: (response: AIClassificationResponse) => {
        console.log('✅ Resposta da IA:', response);
        this.handleAIResponse(response);
        this.isClassifyingWithAI = false;
      },
      error: (error: any) => {
        console.error('❌ Erro na classificação IA:', error);
        this.snackBar.open('Erro na classificação com IA', 'Fechar', { duration: 3000 });
        this.isClassifyingWithAI = false;
      }
    });
  }

  public classifyCurrentFormWithAI(): void {
    const productDescription = this.classificacaoForm.get('product_description')?.value;
    
    if (!productDescription?.trim()) {
      this.snackBar.open('Preencha a descrição do produto primeiro', 'Fechar', { duration: 3000 });
      return;
    }

    this.isClassifyingWithAI = true;
    const request: AIClassificationRequest = {
      product_description: productDescription,
      product_name: this.classificacaoForm.get('product_name')?.value,
      scientific_name: this.classificacaoForm.get('scientific_name')?.value,
      commodity_type: this.classificacaoForm.get('commodity_type')?.value,
      origin_country: this.classificacaoForm.get('origin_country')?.value
    };
    
    this.clasificacaoService.classifyWithAI(request).subscribe({
      next: (response: AIClassificationResponse) => {
        this.applyAIResponseToForm(response);
        this.isClassifyingWithAI = false;
      },
      error: (error: any) => {
        console.error('❌ Erro na classificação IA:', error);
        this.snackBar.open('Erro na classificação com IA', 'Fechar', { duration: 3000 });
        this.isClassifyingWithAI = false;
      }
    });
  }

  private handleAIResponse(response: AIClassificationResponse): void {
    const suggestion = response.primary_suggestion;
    
    // Criar nova classificação automaticamente
    this.editingClassification = null;
    this.classificacaoForm.reset();
    this.classificacaoForm.patchValue({
      product_description: this.quickClassifyForm.get('product_description')?.value,
      product_name: this.quickClassifyForm.get('product_name')?.value || suggestion.ncm_description,
      scientific_name: this.quickClassifyForm.get('scientific_name')?.value,
      commodity_type: this.quickClassifyForm.get('commodity_type')?.value || 'GRAO',
      origin_country: 'Brasil',
      ncm_code: suggestion.ncm_code,
      ncm_description: suggestion.ncm_description,
      hs_code: suggestion.hs_code,
      ai_suggested_ncm: suggestion.ncm_code,
      ai_alternative_ncm_codes: response.alternative_suggestions.map((alt: any) => alt.ncm_code),
      ai_confidence_score: response.confidence_score,
      ai_classification_reason: response.classification_reason,
      ai_data_sources: response.data_sources,
      ai_auto_classification_enabled: true,
      ai_requires_human_review: response.confidence_score < 90,
      ai_classification_status: response.confidence_score >= 90 ? 'APPROVED' : 'PENDING'
    });

    // Mostrar formulário
    this.showClassificationForm = true;
    this.selectedTabIndex = 1; // Ir para aba de classificação fiscal
    
    // Limpar formulário rápido
    this.quickClassifyForm.reset();
    
    this.snackBar.open(
      `🤖 Classificação IA: ${suggestion.ncm_code} (${response.confidence_score.toFixed(1)}% confiança)`,
      'Fechar',
      { duration: 5000 }
    );

    setTimeout(() => {
      document.getElementById('classification-form-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  private applyAIResponseToForm(response: AIClassificationResponse): void {
    const suggestion = response.primary_suggestion;
    
    this.classificacaoForm.patchValue({
      ncm_code: suggestion.ncm_code,
      ncm_description: suggestion.ncm_description,
      hs_code: suggestion.hs_code,
      ai_suggested_ncm: suggestion.ncm_code,
      ai_alternative_ncm_codes: response.alternative_suggestions.map((alt: any) => alt.ncm_code),
      ai_confidence_score: response.confidence_score,
      ai_classification_reason: response.classification_reason,
      ai_data_sources: response.data_sources,
      ai_requires_human_review: response.confidence_score < 90,
      ai_classification_status: response.confidence_score >= 90 ? 'APPROVED' : 'PENDING'
    });

    this.snackBar.open(
      `🤖 Classificação IA aplicada: ${suggestion.ncm_code} (${response.confidence_score.toFixed(1)}% confiança)`,
      'Fechar',
      { duration: 4000 }
    );
  }

  // === MÉTODOS DE VALIDAÇÃO ===

  public validateNCMWithReceita(ncmCode: string): void {
    if (!ncmCode?.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      return;
    }

    this.isValidatingNCM = true;
    console.log('🏛️ Validando NCM com Receita Federal:', ncmCode);
    
    this.clasificacaoService.validateNCMWithReceita(ncmCode).subscribe({
      next: (validation: NCMValidation) => {
        console.log('✅ Validação Receita:', validation);
        
        if (validation.is_valid) {
          this.classificacaoForm.patchValue({
            ncm_description: validation.official_description,
            export_tax: validation.export_tax,
            export_license_required: validation.requires_license
          });
          
          this.snackBar.open(`✅ NCM validado: ${validation.official_description}`, 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open(`❌ NCM inválido: ${validation.official_description}`, 'Fechar', { duration: 4000 });
        }
        
        this.isValidatingNCM = false;
      },
      error: (error: any) => {
        console.error('❌ Erro na validação NCM:', error);
        this.snackBar.open('Erro ao validar NCM com Receita Federal', 'Fechar', { duration: 3000 });
        this.isValidatingNCM = false;
      }
    });
  }

  // === MÉTODOS AUXILIARES ===

  private calculateComplianceStatus(formData: any): ComplianceStatus {
    if (formData.ai_confidence_score >= 90 && !formData.export_restriction) {
      return 'VALID';
    } else if (formData.ai_confidence_score >= 70 || formData.export_restriction) {
      return 'WARNING';
    } else {
      return 'INVALID';
    }
  }

  public getComplianceStatusColor(status: ComplianceStatus): string {
    switch (status) {
      case 'VALID': return '#4caf50';
      case 'WARNING': return '#ff9800';
      case 'INVALID': return '#f44336';
      default: return '#666';
    }
  }

  public getConfidenceScoreColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  }

  public formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  // === MÉTODOS HELPER PARA LABELS ===

  public getComplianceStatusLabel(status: ComplianceStatus): string {
    return this.COMPLIANCE_STATUS_LABELS[status] || status;
  }

  public getCommodityTypeLabel(type: CommodityType): string {
    return this.COMMODITY_TYPE_LABELS[type] || type;
  }

  public getClassificationSourceLabel(source: ClassificationSource): string {
    return this.CLASSIFICATION_SOURCE_LABELS[source] || source;
  }

  public getStatusLabel(status: ClassificationStatus): string {
    return this.STATUS_LABELS[status] || status;
  }

  public getExportLicenseLabel(license: ExportLicenseType): string {
    return this.EXPORT_LICENSE_LABELS[license] || license;
  }

  public getInspectionAgencyLabel(agency: InspectionAgency): string {
    return this.INSPECTION_AGENCY_LABELS[agency] || agency;
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      search: '',
      commodity_types: [],
      compliance_status: [],
      classification_source: [],
      status: [],
      ai_confidence_min: 0,
      ai_confidence_max: 100,
      requires_license: null,
      has_restrictions: null
    });
  }
}