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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { AI_SERVICE } from '../../../../services/ai/ai-service.token';
import { IAiService } from '../../../../services/ai/ai-service.interface';
import { PRODUTO_SERVICE } from '../../../../services/produto/produto-service.token';
import { IProdutoService } from '../../../../services/produto/produto-service.interface';
import { CurrentUserService } from '../../../../services/user/current-user.service';
import { NCM_CLASSIFICACAO_SERVICE } from '../../../../services/ncm-classificacao/ncm-classificacao-service.token';
import { INcmClassificacaoService } from '../../../../services/ncm-classificacao/ncm-classificacao-service.interface';
import { ProdutoFormDialogComponent } from '../../../exportacao/produto-form-dialog/produto-form-dialog.component';
import { Produto } from '../../../../../types/produto';
import { NcmValidacaoResult } from '../../../../../types/ncm-classificacao-api';
import { NcmClassificationResult } from '../../../../../types/ai-hub';
import {
  NCMClassification,
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
    MatAutocompleteModule,
    MatSnackBarModule
  ],
  templateUrl: './classificacao-form-dialog.component.html',
  styleUrls: ['./classificacao-form-dialog.component.scss']
})
export class ClassificacaoFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  // A sugestão de NCM por IA passa a vir do backend real via AI_SERVICE.
  private readonly ai = inject<IAiService>(AI_SERVICE);
  // Catálogo de produtos reutilizável (combo e cadastro rápido).
  private readonly produtoService = inject<IProdutoService>(PRODUTO_SERVICE);
  // Usuário atual para preencher auditoria ("Criado por").
  private readonly currentUserService = inject(CurrentUserService);
  // Validação real de NCM (formato + orientação por IA) via backend.
  private readonly ncmService = inject<INcmClassificacaoService>(NCM_CLASSIFICACAO_SERVICE);
  // Diálogo para cadastro rápido de produto.
  private readonly dialog = inject(MatDialog);
  public readonly dialogRef = inject(MatDialogRef<ClassificacaoFormDialogComponent>);

  public readonly editingClassification: NCMClassification | null;
  public selectedTabIndex = 0;
  public isSaving = false;
  public isClassifyingWithAI = false;
  public isValidatingNCM = false;
  public classificacaoForm: FormGroup;

  // Catálogo de produtos carregado para o combo filtrável.
  public produtos: Produto[] = [];
  // Termo digitado no autocomplete de produtos.
  public produtoFiltro = '';
  // Notas da validação de NCM (orientação por IA) exibidas no template.
  public ncmValidationNotes: string | null = null;

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
    // Carregar catálogo de produtos para o combo filtrável.
    this.produtoService.listar().subscribe(p => (this.produtos = p ?? []));

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

      // Preencher "Criado por" com o id do usuário atual (apenas em criação).
      this.currentUserService.me().subscribe(u => {
        if (u) {
          this.classificacaoForm.patchValue({ created_by: u.userId });
        }
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

  // === COMBO DE PRODUTOS ===

  /** Filtra o catálogo por nome ou NCM (case-insensitive). Termo vazio → todos. */
  public filtrarProdutos(term: string): Produto[] {
    const t = (term ?? '').trim().toLowerCase();
    if (!t) {
      return this.produtos;
    }
    return this.produtos.filter(p =>
      (p.name ?? '').toLowerCase().includes(t) ||
      (p.ncm ?? '').toLowerCase().includes(t)
    );
  }

  /** Seleciona um produto do catálogo e reaproveita seus dados no formulário. */
  public onProdutoSelecionado(produtoId: string): void {
    const p = this.produtos.find(prod => prod.id === produtoId);
    if (!p) {
      return;
    }

    const patch: Record<string, unknown> = {
      product_id: p.id,
      product_name: p.name ?? '',
      product_description: p.description ?? this.classificacaoForm.get('product_description')?.value,
      origin_country: p.originCountry ?? 'Brasil'
    };
    if (p.ncm) {
      patch['ncm_code'] = p.ncm;
    }

    this.classificacaoForm.patchValue(patch);
    this.produtoFiltro = p.name ?? '';
  }

  /** Abre o diálogo de cadastro rápido e seleciona o produto criado. */
  public abrirNovoProduto(): void {
    const ref = this.dialog.open(ProdutoFormDialogComponent, {
      width: '560px',
      maxWidth: '92vw'
    });

    ref.afterClosed().subscribe((created: Produto | undefined) => {
      if (created) {
        this.produtos = [...this.produtos, created];
        this.onProdutoSelecionado(created.id);
      }
    });
  }

  // === NAVEGAÇÃO ENTRE ABAS ===

  /** Avança para a próxima aba (limite superior: 4). */
  public proximaAba(): void {
    if (this.selectedTabIndex < 4) {
      this.selectedTabIndex = this.selectedTabIndex + 1;
    }
  }

  /** Volta para a aba anterior (limite inferior: 0). */
  public abaAnterior(): void {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex = this.selectedTabIndex - 1;
    }
  }

  /** Navega diretamente para a aba informada. */
  public irParaAba(i: number): void {
    this.selectedTabIndex = i;
  }

  public saveClassification(): void {
    if (this.classificacaoForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formData = this.classificacaoForm.value;

    // "Criado por": usa o valor do formulário; se vazio, resolve o usuário atual.
    this.currentUserService.me().subscribe(u => {
      formData.created_by = formData.created_by || u?.userId || '';
      formData.classification_source = formData.ai_confidence_score > 0 ? 'IA' : 'MANUAL';
      formData.compliance_status = this.calculateComplianceStatus(formData);
      formData.status = formData.approval_status === 'APPROVED' ? 'ACTIVE' : 'PENDING';

      // O componente pai persiste (create/update) e recarrega a lista.
      this.dialogRef.close(formData);
    });
  }

  // === MÉTODOS DE IA ===

  // Limiar de confiança (fração 0..1) abaixo do qual a sugestão de IA exige
  // revisão humana explícita. O backend devolve confidence em 0..1.
  private static readonly AI_REVIEW_THRESHOLD = 0.9;

  public classifyCurrentFormWithAI(): void {
    const productDescription = this.classificacaoForm.get('product_description')?.value;

    // Bloquear envio sem descrição (Req 14.5).
    if (!productDescription?.trim()) {
      this.snackBar.open('Preencha a descrição do produto primeiro', 'Fechar', { duration: 3000 });
      return;
    }

    this.isClassifyingWithAI = true;

    // Sugestão de NCM via backend real (não mais pelo mock de IA).
    this.ai
      .classificarNcm({
        description: productDescription,
        productName: this.classificacaoForm.get('product_name')?.value || undefined,
        scientificName: this.classificacaoForm.get('scientific_name')?.value || undefined,
        commodityType: this.classificacaoForm.get('commodity_type')?.value || undefined
      })
      .subscribe({
        next: (result: NcmClassificationResult) => {
          this.applyAIResponseToForm(result);
          this.isClassifyingWithAI = false;
        },
        error: (err: unknown) => {
          this.snackBar.open(this.mensagemErroIa(err), 'Fechar', { duration: 4000 });
          this.isClassifyingWithAI = false;
        }
      });
  }

  /**
   * Aplica a sugestão TIPADA da IA (ncm/confidence/rationale/alternativas) nos
   * campos do formulário para REVISÃO humana. A sugestão não é salva
   * automaticamente: o usuário revisa e confirma com "Salvar" (humano no
   * circuito, Req 14.8).
   */
  private applyAIResponseToForm(result: NcmClassificationResult): void {
    // confidence vem como fração 0..1; o formulário usa percentual 0..100.
    const confidencePercent = Math.round((result.confidence ?? 0) * 1000) / 10;
    const needsReview = (result.confidence ?? 0) < ClassificacaoFormDialogComponent.AI_REVIEW_THRESHOLD;

    this.classificacaoForm.patchValue({
      ncm_code: result.ncm,
      ai_suggested_ncm: result.ncm,
      ai_alternative_ncm_codes: (result.alternatives ?? []).map(alt => alt.ncm),
      ai_confidence_score: confidencePercent,
      ai_classification_reason: result.rationale,
      ai_requires_human_review: needsReview,
      ai_classification_status: needsReview ? 'PENDING' : 'APPROVED'
    });

    const reviewHint = needsReview ? ' — revisão humana recomendada' : '';
    this.snackBar.open(
      `🤖 NCM sugerido pela IA: ${result.ncm} (${confidencePercent.toFixed(1)}% confiança)${reviewHint}`,
      'Fechar',
      { duration: 4000 }
    );
  }

  // Mapeia o Erro_IA para uma mensagem simples pt-BR via snackBar, sem fallback
  // mock (Req 14.11).
  private mensagemErroIa(err: unknown): string {
    const e = err as { status?: number; code?: string; message?: string };
    if (e?.status === 402 || e?.code === 'AI_QUOTA_EXCEEDED') {
      return 'Seus créditos de IA acabaram. Compre créditos para continuar.';
    }
    switch (e?.status) {
      case 403:
        return 'Acesso negado: você não tem permissão para usar a IA.';
      case 422:
        return 'A resposta da IA foi inválida para a solicitação enviada.';
      case 429:
        return 'Limite de uso de IA atingido. Aguarde e tente novamente.';
      case 502:
      case 503:
        return 'O serviço de IA está temporariamente indisponível. Tente novamente em instantes.';
      case 504:
        return 'O serviço de IA demorou para responder. Tente novamente.';
      default:
        return e?.message || 'Erro na classificação com IA.';
    }
  }

  // === MÉTODOS DE VALIDAÇÃO ===

  public validateNCMWithReceita(ncmCode: string): void {
    if (!ncmCode?.match(/^\d{4}\.\d{2}\.\d{2}$/)) {
      return;
    }

    this.isValidatingNCM = true;

    this.ncmService
      .validarNcm(ncmCode, this.classificacaoForm.get('product_description')?.value)
      .subscribe({
        next: (res: NcmValidacaoResult) => {
          this.ncmValidationNotes = res.notes;

          if (res.formatValid) {
            this.classificacaoForm.patchValue({
              ncm_description: this.classificacaoForm.get('ncm_description')?.value || res.notes
            });
            this.snackBar.open('NCM validado (orientação por IA). Veja as notas.', 'Fechar', { duration: 3500 });
          } else {
            this.snackBar.open('Formato de NCM inválido (0000.00.00).', 'Fechar', { duration: 4000 });
          }

          this.isValidatingNCM = false;
        },
        error: (err: unknown) => {
          this.snackBar.open(this.mensagemErroIa(err), 'Fechar', { duration: 4000 });
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
