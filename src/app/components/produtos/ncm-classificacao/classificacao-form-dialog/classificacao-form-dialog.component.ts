import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { NCMClassificationMockService } from '../../../../../services/ncm-classification-mock.service';
import {
  NCMClassification,
  AIClassificationRequest,
  AIClassificationResponse,
  NCMValidation,
  CommodityType,
  ComplianceStatus,
  ExportLicenseType,
  InspectionAgency,
  COMMODITY_TYPE_LABELS_NCM,
  EXPORT_LICENSE_LABELS,
  INSPECTION_AGENCY_LABELS
} from '../../../../../types/ncm-classification';

export interface ClassificacaoFormDialogData {
  classification: NCMClassification | null;
}

@Component({
  selector: 'app-classificacao-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatSnackBarModule
  ],
  templateUrl: './classificacao-form-dialog.component.html',
  styleUrls: ['./classificacao-form-dialog.component.scss']
})
export class ClassificacaoFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly clasificacaoService = inject(NCMClassificationMockService);
  public readonly dialogRef = inject(MatDialogRef<ClassificacaoFormDialogComponent>);

  public readonly editingClassification: NCMClassification | null;
  public selectedTabIndex = 0;
  public isSaving = false;
  public isClassifyingWithAI = false;
  public isValidatingNCM = false;
  public classificacaoForm: FormGroup;

  // === CONSTANTES PARA TEMPLATE ===
  public readonly COMMODITY_TYPE_LABELS = COMMODITY_TYPE_LABELS_NCM;
  public readonly EXPORT_LICENSE_LABELS = EXPORT_LICENSE_LABELS;
  public readonly INSPECTION_AGENCY_LABELS = INSPECTION_AGENCY_LABELS;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ClassificacaoFormDialogData) {
    this.editingClassification = data.classification;

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
    if (this.editingClassification) {
      this.classificacaoForm.patchValue(this.editingClassification);
    } else {
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
    }

    // Observar mudanças no NCM para validação automática
    this.classificacaoForm.get('ncm_code')?.valueChanges.subscribe(ncmCode => {
      if (ncmCode && ncmCode.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
        this.validateNCMWithReceita(ncmCode);
      }
    });
  }

  public get headerTitle(): string {
    return this.editingClassification ? 'Editar Classificação' : 'Nova Classificação';
  }

  public close(): void {
    this.dialogRef.close();
  }

  public saveClassification(): void {
    if (this.classificacaoForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formData = this.classificacaoForm.value;

    // Preencher campos automáticos (derivação mantida no dialog antes de fechar)
    formData.created_by = formData.created_by || 'user_current';
    formData.classification_source = formData.ai_confidence_score > 0 ? 'IA' : 'MANUAL';
    formData.compliance_status = this.calculateComplianceStatus(formData);
    formData.status = formData.approval_status === 'APPROVED' ? 'ACTIVE' : 'PENDING';

    // O componente pai persiste (create/update) e recarrega a lista.
    this.dialogRef.close(formData);
  }

  // === MÉTODOS DE IA ===

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
      error: () => {
        this.snackBar.open('Erro na classificação com IA', 'Fechar', { duration: 3000 });
        this.isClassifyingWithAI = false;
      }
    });
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

    this.clasificacaoService.validateNCMWithReceita(ncmCode).subscribe({
      next: (validation: NCMValidation) => {
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
      error: () => {
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

  public getConfidenceScoreColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  }

  public formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  public getCommodityTypeLabel(type: CommodityType): string {
    return this.COMMODITY_TYPE_LABELS[type] || type;
  }

  public getExportLicenseLabel(license: ExportLicenseType): string {
    return this.EXPORT_LICENSE_LABELS[license] || license;
  }

  public getInspectionAgencyLabel(agency: InspectionAgency): string {
    return this.INSPECTION_AGENCY_LABELS[agency] || agency;
  }
}
