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
  CommodityType,
  ComplianceStatus,
  ClassificationSource,
  ClassificationStatus,
  ExportLicenseType,
  InspectionAgency,
  COMMODITY_TYPE_LABELS_NCM,
  COMPLIANCE_STATUS_LABELS,
  CLASSIFICATION_SOURCE_LABELS,
  STATUS_LABELS,
  EXPORT_LICENSE_LABELS,
  INSPECTION_AGENCY_LABELS
} from '../../../../types/ncm-classification';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';
import {
  ClassificacaoFormDialogComponent,
  ClassificacaoFormDialogData
} from './classificacao-form-dialog/classificacao-form-dialog.component';
import {
  ConfirmarAcaoDialogComponent,
  ConfirmDialogData
} from '../../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';

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
    MatStepperModule,
    HasPermissionDirective
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
  public isClassifyingWithAI = false;

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
  public quickClassifyForm: FormGroup;

  // === CONSTANTES PARA TEMPLATE ===
  public readonly COMMODITY_TYPE_LABELS = COMMODITY_TYPE_LABELS_NCM;
  public readonly COMPLIANCE_STATUS_LABELS = COMPLIANCE_STATUS_LABELS;
  public readonly CLASSIFICATION_SOURCE_LABELS = CLASSIFICATION_SOURCE_LABELS;
  public readonly STATUS_LABELS = STATUS_LABELS;
  public readonly EXPORT_LICENSE_LABELS = EXPORT_LICENSE_LABELS;
  public readonly INSPECTION_AGENCY_LABELS = INSPECTION_AGENCY_LABELS;

  constructor() {
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
  }

  ngOnInit(): void {
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
        this.classifications = classifications;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar classificações', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private loadStatistics(): void {
    this.isLoadingStats = true;
    
    this.clasificacaoService.getStatistics().subscribe({
      next: (stats: NCMClassificationStats) => {
        this.stats = stats;
        this.isLoadingStats = false;
      },
      error: () => {
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
  }

  // === MÉTODOS DE CLASSIFICAÇÃO ===

  public createClassification(): void {
    this.openClassificationDialog(null, null);
  }

  public editClassification(classification: NCMClassification): void {
    this.openClassificationDialog(classification, classification);
  }

  /**
   * Abre o dialog centralizado (ESC) do formulário de classificação.
   * `seed` popula o formulário; `editing` (quando existente) determina update x create.
   * Ao fechar com um valor, o pai persiste (create/update) e recarrega a lista.
   */
  private openClassificationDialog(
    seed: NCMClassification | null,
    editing: NCMClassification | null
  ): void {
    const data: ClassificacaoFormDialogData = { classification: seed };

    const dialogRef = this.dialog.open(ClassificacaoFormDialogComponent, {
      width: '1000px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false,
      panelClass: 'classificacao-form-dialog-panel',
      data
    });

    dialogRef.afterClosed().subscribe((formData: any) => {
      if (!formData) {
        return;
      }
      this.persistClassification(formData, editing);
    });
  }

  private persistClassification(formData: any, editing: NCMClassification | null): void {
    if (editing) {
      this.clasificacaoService.updateClassification(editing.classification_id, formData).subscribe({
        next: () => {
          this.snackBar.open('Classificação atualizada com sucesso!', 'Fechar', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Erro ao atualizar classificação', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      this.clasificacaoService.createClassification(formData).subscribe({
        next: () => {
          this.snackBar.open('Classificação criada com sucesso!', 'Fechar', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Erro ao criar classificação', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  public deleteClassification(classification: NCMClassification): void {
    const data: ConfirmDialogData = {
      title: 'Excluir Classificação',
      message: `Tem certeza que deseja excluir a classificação "${classification.product_name}"? Esta ação não pode ser desfeita.`,
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

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed !== true) {
        return;
      }

      this.clasificacaoService.deleteClassification(classification.classification_id).subscribe({
        next: () => {
          this.snackBar.open('Classificação excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadData();
        },
        error: () => {
          this.snackBar.open('Erro ao excluir classificação', 'Fechar', { duration: 3000 });
        }
      });
    });
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
        this.handleAIResponse(response);
        this.isClassifyingWithAI = false;
      },
      error: () => {
        this.snackBar.open('Erro na classificação com IA', 'Fechar', { duration: 3000 });
        this.isClassifyingWithAI = false;
      }
    });
  }

  /**
   * Recebe a sugestão da IA e abre o dialog pré-populado com a semente derivada.
   * O painel de classificação rápida permanece na página.
   */
  private handleAIResponse(response: AIClassificationResponse): void {
    const suggestion = response.primary_suggestion;

    // Semente derivada da IA (tratada como "classification" de criação pelo dialog).
    const seed = {
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
    } as unknown as NCMClassification;

    this.snackBar.open(
      `🤖 Classificação IA: ${suggestion.ncm_code} (${response.confidence_score.toFixed(1)}% confiança)`,
      'Fechar',
      { duration: 5000 }
    );

    // Limpar formulário rápido e abrir o dialog (modo criação) com a sugestão.
    this.quickClassifyForm.reset();
    this.openClassificationDialog(seed, null);
  }

  // === MÉTODOS AUXILIARES ===

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