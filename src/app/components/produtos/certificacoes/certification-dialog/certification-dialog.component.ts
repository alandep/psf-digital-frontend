import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { PaisComboComponent } from '../../../shared/pais-combo/pais-combo.component';

// AI Hub (OCR real via upload multipart direto + análise de risco)
import { AI_SERVICE } from '../../../../services/ai/ai-service.token';
import { IAiService } from '../../../../services/ai/ai-service.interface';
import { PRODUTO_SERVICE } from '../../../../services/produto/produto-service.token';
import { IProdutoService } from '../../../../services/produto/produto-service.interface';
import { EXPORTACAO_SERVICE } from '../../../../services/exportacao/exportacao-service.token';
import { IExportacaoService } from '../../../../services/exportacao/exportacao-service.interface';
import { LOGISTICS_SERVICE } from '../../../../services/logistics/logistics-service.token';
import { ILogisticsService } from '../../../../services/logistics/logistics-service.interface';
import { OcrExtractionResult } from '../../../../../types/ai-hub';
import { Produto } from '../../../../../types/produto';
import { Exportacao } from '../../../../../types/exportacao';
import { Embarque } from '../../../../../types/embarque';

// Interfaces
interface CertificationDialogData {
  certification?: any;
  isCreating?: boolean;
  isEditing?: boolean;
  certificationTypes?: string[];
  productCategories?: string[];
  destinationCountries?: string[];
  issuingAuthorities?: string[];
  certificationCategories?: string[];
  countryCompliances?: any[];
  aiSuggestions?: any[];
}

@Component({
  selector: 'app-certification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatListModule,
    MatExpansionModule,
    DragDropModule,
    PaisComboComponent
  ],
  templateUrl: './certification-dialog.component.html',
  styleUrls: ['./certification-dialog.component.scss']
})
export class CertificationDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  certificationForm!: FormGroup;
  selectedTabIndex = 0;
  isLoading = false;
  // Controla a exibição do conteúdo do modal: enquanto false, um indicador de
  // carregamento cobre o painel (evita a área em branco durante o carregamento
  // do chunk lazy e a primeira renderização). O formulário é construído no
  // construtor e populado sincronamente no ngOnInit, então torna-se true ao
  // final do ngOnInit.
  isReady = false;

  // Catálogo de produtos cadastrados carregado para o combo filtrável.
  produtos: Produto[] = [];
  // Termo digitado no autocomplete de produtos.
  produtoFiltro = '';

  // Catálogo de exportações carregado para o combo filtrável da aba Exportação.
  exportacoes: Exportacao[] = [];
  // Termo digitado no autocomplete de exportações (também usado para exibir o
  // número da exportação selecionada).
  exportacaoFiltro = '';

  // Catálogo de embarques carregado para o combo filtrável da aba Exportação.
  embarques: Embarque[] = [];
  // Termo digitado no autocomplete de embarques (também usado para exibir o
  // número do embarque selecionado).
  embarqueFiltro = '';

  // Estado da análise de compliance assistida por IA (Tab Compliance)
  isAnalyzingCompliance = false;
  complianceResult: string | null = null;

  // Allowlist de formatos aceitos pelo OCR real. Validado no front ANTES de
  // qualquer upload/chamada ao provedor.
  private readonly ocrAllowedMediaTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg'
  ];

  // Dados do diálogo
  certification: any;
  isCreating: boolean = false;
  isEditing: boolean = false;
  certificationTypes: string[] = [];
  productCategories: string[] = [];
  destinationCountries: string[] = [];
  issuingAuthorities: string[] = [];
  certificationCategories: string[] = [];
  countryCompliances: any[] = [];
  aiSuggestions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    @Inject(AI_SERVICE) private ai: IAiService,
    @Inject(PRODUTO_SERVICE) private produtoService: IProdutoService,
    @Inject(EXPORTACAO_SERVICE) private exportacaoService: IExportacaoService,
    @Inject(LOGISTICS_SERVICE) private logisticsService: ILogisticsService,
    public dialogRef: MatDialogRef<CertificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CertificationDialogData | null
  ) {
    // Inicializar dados do diálogo com valores padrão seguros
    this.certification = data?.certification || null;
    this.isCreating = data?.isCreating ?? true; // Default to true for new certification
    this.isEditing = data?.isEditing ?? false;
    
    this.certificationTypes = data?.certificationTypes || ['SANITARIO', 'ORIGEM', 'LOGISTICO', 'COMERCIAL'];
    this.productCategories = data?.productCategories || ['ALIMENTOS', 'BEBIDAS', 'COSMÉTICOS'];
    this.destinationCountries = data?.destinationCountries || [];
    this.issuingAuthorities = data?.issuingAuthorities || ['ANVISA', 'RECEITA FEDERAL'];
    this.certificationCategories = data?.certificationCategories || ['SANITARIO', 'ORIGEM'];
    this.countryCompliances = data?.countryCompliances || [];
    this.aiSuggestions = data?.aiSuggestions || [];

    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.certification && (this.isEditing || !this.isCreating)) {
      this.populateForm(this.certification);
    }

    // Carregar catálogo de produtos cadastrados para o combo filtrável. Em caso
    // de erro, o combo apenas fica vazio (produtos devem estar pré-cadastrados).
    this.produtoService.listar().subscribe({
      next: (p) => this.produtos = p ?? [],
      error: () => { /* silent; combo stays empty */ }
    });

    // Carregar exportações e embarques reais para os combos filtráveis da aba
    // Exportação. Em caso de erro, o combo apenas fica vazio.
    this.exportacaoService.getExportacoes().subscribe({
      next: (e) => this.exportacoes = e ?? [],
      error: () => { /* silent; combo stays empty */ }
    });
    this.logisticsService.getEmbarques().subscribe({
      next: (s) => this.embarques = s ?? [],
      error: () => { /* silent; combo stays empty */ }
    });

    // Form já construído (constructor) e populado sincronamente acima: libera o
    // conteúdo do modal substituindo o indicador de carregamento.
    this.isReady = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // === COMBO DE PRODUTOS (produtos devem estar pré-cadastrados) ===

  /** Filtra o catálogo por nome ou NCM (case-insensitive). Termo vazio → todos. */
  filtrarProdutos(term: string): Produto[] {
    const t = (term ?? '').trim().toLowerCase();
    if (!t) {
      return this.produtos;
    }
    return this.produtos.filter(p =>
      (p.name ?? '').toLowerCase().includes(t) ||
      (p.ncm ?? '').toLowerCase().includes(t)
    );
  }

  /** Seleciona um produto do catálogo e preenche a identificação do formulário. */
  onProdutoSelecionado(produtoId: string): void {
    const p = this.produtos.find(x => x.id === produtoId);
    if (!p) {
      return;
    }

    this.certificationForm.get('identification')?.patchValue({
      product_id: p.id,
      product_name: p.name ?? ''
    });

    // Preenche a descrição apenas se estiver vazia e o produto tiver uma.
    const descCtrl = this.certificationForm.get('identification.description');
    if (p.description && !(descCtrl?.value)) {
      descCtrl?.patchValue(p.description);
    }

    // Mostra o nome selecionado no input do autocomplete.
    this.produtoFiltro = p.name ?? '';
  }

  // === COMBO DE EXPORTAÇÕES / EMBARQUES (aba Exportação) ===

  /** Filtra as exportações por número ou id (case-insensitive). Termo vazio → todas. */
  filtrarExportacoes(term: string): Exportacao[] {
    const t = (term ?? '').trim().toLowerCase();
    if (!t) {
      return this.exportacoes;
    }
    return this.exportacoes.filter(e =>
      (e.export_number ?? '').toLowerCase().includes(t) ||
      (e.export_id ?? '').toLowerCase().includes(t)
    );
  }

  /** Filtra os embarques por número ou id (case-insensitive). Termo vazio → todos. */
  filtrarEmbarques(term: string): Embarque[] {
    const t = (term ?? '').trim().toLowerCase();
    if (!t) {
      return this.embarques;
    }
    return this.embarques.filter(s =>
      (s.shipment_number ?? '').toLowerCase().includes(t) ||
      (s.shipment_id ?? '').toLowerCase().includes(t)
    );
  }

  /**
   * Seleciona uma exportação do catálogo: preenche o export_id e AUTO-PREENCHE
   * o número da DUE derivado da exportação selecionada (read-only no template).
   */
  onExportacaoSelecionada(exportId: string): void {
    const exp = this.exportacoes.find(x => x.export_id === exportId);
    if (!exp) {
      return;
    }

    this.certificationForm.get('export_integration')?.patchValue({
      export_id: exp.export_id,
      due_number: exp.due_number ?? ''
    });

    // Mostra o número (ou id) da exportação selecionada no input do autocomplete.
    this.exportacaoFiltro = exp.export_number ?? exp.export_id;
  }

  /** Seleciona um embarque do catálogo e preenche o shipment_id do formulário. */
  onEmbarqueSelecionado(shipmentId: string): void {
    const emb = this.embarques.find(x => x.shipment_id === shipmentId);
    if (!emb) {
      return;
    }

    this.certificationForm.get('export_integration')?.patchValue({
      shipment_id: emb.shipment_id
    });

    // Mostra o número (ou id) do embarque selecionado no input do autocomplete.
    this.embarqueFiltro = emb.shipment_number ?? emb.shipment_id;
  }

  private initializeForm(): void {
    this.certificationForm = this.fb.group({
      // TAB 1: Identificação
      identification: this.fb.group({
        product_id: ['', Validators.required],
        product_name: ['', Validators.required],
        certification_type: ['', Validators.required],
        certification_category: ['', Validators.required],
        description: ['']
      }),

      // TAB 2: Certificado
      certificate: this.fb.group({
        certification_number: ['', Validators.required],
        issuing_authority: ['', Validators.required],
        issuing_country: ['', Validators.required],
        issue_date: ['', Validators.required],
        expiry_date: [''],
        digital_signature: [false]
      }),

      // TAB 3: Integração Export
      export_integration: this.fb.group({
        export_id: [''],
        shipment_id: [''],
        due_number: [''],
        auto_attach_to_export: [false]
      }),

      // TAB 4: IA & Automação
      ai_automation: this.fb.group({
        ai_generated: [false],
        ai_document_extracted: [false],
        ai_compliance_check: [true],
        ai_confidence_score: [0],
        ai_risk_score: [0],
        ai_risk_level: ['LOW']
      }),

      // Auditoria
      audit: this.fb.group({
        created_at: [{ value: new Date().toISOString(), disabled: true }],
        created_by: [{ value: 'Sistema', disabled: true }],
        updated_at: [{ value: new Date().toISOString(), disabled: true }],
        updated_by: [{ value: 'Sistema', disabled: true }]
      })
    });
  }

  // Garante que um valor persistido esteja presente na lista de opções do
  // mat-select correspondente. Sem isso, um valor salvo que não faz parte das
  // opções padrão (ex.: órgão emissor "Camara de Comercio") faria o select
  // renderizar vazio mesmo com o form control preenchido.
  private ensureOption(list: string[], value?: string | null): string[] {
    const v = (value ?? '').toString().trim();
    if (!v) { return list; }
    return list.includes(v) ? list : [...list, v];
  }

  private populateForm(certification: any): void {
    if (certification) {
      // Mostra o nome do produto já selecionado no input do autocomplete.
      this.produtoFiltro = certification.product_name || '';
      // Exibe os valores já vinculados nos combos da aba Exportação. A lista de
      // exportações/embarques pode não estar carregada neste momento, então o
      // fallback simples é mostrar o id persistido.
      this.exportacaoFiltro = certification.export_id || '';
      this.embarqueFiltro = certification.shipment_id || '';

      // Mescla os valores salvos nas listas dos selects (identificação +
      // certificado) para que apareçam selecionados ao editar.
      this.certificationTypes = this.ensureOption(this.certificationTypes, certification.certification_type);
      this.certificationCategories = this.ensureOption(this.certificationCategories, certification.certification_category);
      this.issuingAuthorities = this.ensureOption(this.issuingAuthorities, certification.issuing_authority);

      // Converte datas defensivamente para Date (datepickers esperam Date).
      const toDate = (v: any) => { if (!v) return ''; const d = v instanceof Date ? v : new Date(v); return isNaN(d.getTime()) ? '' : d; };

      this.certificationForm.patchValue({
        identification: {
          product_id: certification.product_id || '',
          product_name: certification.product_name || '',
          certification_type: certification.certification_type || '',
          certification_category: certification.certification_category || '',
          description: certification.description || ''
        },
        certificate: {
          certification_number: certification.certification_number || '',
          issuing_authority: certification.issuing_authority || '',
          issuing_country: certification.issuing_country || '',
          issue_date: toDate(certification.issue_date),
          expiry_date: toDate(certification.expiry_date),
          digital_signature: certification.digital_signature || false
        },
        export_integration: {
          export_id: certification.export_id || '',
          shipment_id: certification.shipment_id || '',
          due_number: certification.due_number || '',
          auto_attach_to_export: certification.auto_attach_to_export || false
        },
        ai_automation: {
          ai_generated: certification.ai_generated || false,
          ai_document_extracted: certification.ai_document_extracted || false,
          ai_compliance_check: certification.ai_compliance_check || true,
          ai_confidence_score: certification.ai_confidence_score || 0,
          ai_risk_score: certification.ai_risk_score || 0,
          ai_risk_level: certification.ai_risk_level || 'LOW'
        }
      });
    }
  }

  // Validação do formulário
  get isFormValid(): boolean {
    return this.certificationForm.valid;
  }

  // Salvar certificação. Devolve o payload cru do formulário ao componente pai,
  // que persiste via backend real (handleCertificationCreated/Updated). A
  // identidade (id) é atribuída pelo backend — nada é fabricado aqui.
  saveCertification(): void {
    if (this.isFormValid && !this.isLoading) {
      this.dialogRef.close(this.certificationForm.getRawValue());
    } else {
      this.certificationForm.markAllAsTouched();
      this.showMessage('Por favor, preencha todos os campos obrigatórios', 'error');
    }
  }

  // Cancelar diálogo
  onCancel(): void {
    this.dialogRef.close();
  }

  // Upload de documento com OCR real (AI Hub). O binário é enviado diretamente ao
  // BFF via multipart (POST /bff/ai/ocr/upload), que armazena o arquivo e executa
  // o agente OCR. Isso elimina o PUT cross-origin do navegador que causava
  // "Failed to fetch". Nenhum dado é fabricado: somente os campos efetivamente
  // extraídos são aplicados ao formulário.
  processDocumentOCR(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    // Valida o formato no front ANTES de qualquer upload/chamada ao provedor.
    if (!this.ocrAllowedMediaTypes.includes(file.type)) {
      input.value = '';
      this.showMessage('Formato não suportado. Envie PDF, PNG ou JPEG.', 'error');
      return;
    }

    this.isLoading = true;
    this.showMessage('Processamento OCR + IA iniciado...', 'info');

    this.ai.ocrUpload(file, 'CERTIFICATE')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: OcrExtractionResult) => {
          this.isLoading = false;
          input.value = '';
          this.applyOcrExtraction(result);
        },
        error: (error: unknown) => {
          console.error('Erro no processamento OCR:', error);
          this.isLoading = false;
          input.value = '';
          this.showMessage(this.mensagemErroIa(error), 'error');
        }
      });
  }

  // Mapeia os campos efetivamente presentes na extração do OCR para o grupo
  // 'certificate' do formulário. Campos ausentes NÃO são preenchidos (sem mock).
  private applyOcrExtraction(result: OcrExtractionResult): void {
    const extraction = (result?.extraction ?? {}) as Record<string, unknown>;

    const certificatePatch: Record<string, unknown> = {};
    const num = extraction['certification_number'] ?? extraction['certificate_number'] ?? extraction['number'];
    const authority = extraction['issuing_authority'] ?? extraction['authority'];
    const country = extraction['issuing_country'] ?? extraction['country'];
    const issueDate = extraction['issue_date'] ?? extraction['issued_at'];
    const expiryDate = extraction['expiry_date'] ?? extraction['expires_at'];

    if (typeof num === 'string' && num) { certificatePatch['certification_number'] = num; }
    if (typeof authority === 'string' && authority) { certificatePatch['issuing_authority'] = authority; }
    if (typeof country === 'string' && country) { certificatePatch['issuing_country'] = country; }
    if (typeof issueDate === 'string' && issueDate) { certificatePatch['issue_date'] = issueDate; }
    if (typeof expiryDate === 'string' && expiryDate) { certificatePatch['expiry_date'] = expiryDate; }

    if (Object.keys(certificatePatch).length > 0) {
      this.certificationForm.get('certificate')?.patchValue(certificatePatch);
    }

    // Marca que houve extração via OCR e registra a confiança (0..1) a partir do
    // completenessScore (0..100) retornado pelo provedor.
    this.certificationForm.get('ai_automation')?.patchValue({
      ai_document_extracted: true,
      ai_confidence_score: Math.max(0, Math.min(1, (result?.completenessScore ?? 0) / 100))
    });

    if (result?.needsReview) {
      this.showMessage(
        `OCR concluído — completude ${result.completenessScore}%. Revise os dados extraídos.`,
        'info'
      );
    } else {
      this.showMessage('Documento processado com sucesso! Dados extraídos via IA/OCR.', 'success');
    }
  }

  // Verificação de compliance com IA (AI Hub). Monta um input pt-BR a partir do
  // formulário atual e chama a tarefa de análise de risco; o resultado textual é
  // exibido no painel da aba Compliance.
  verificarComplianceComIa(): void {
    if (this.isAnalyzingCompliance) {
      return;
    }

    const identification = this.certificationForm.get('identification')?.value ?? {};
    const certificate = this.certificationForm.get('certificate')?.value ?? {};

    const linhas = [
      `Produto: ${identification.product_name || 'não informado'}`,
      `Tipo de certificação: ${identification.certification_type || 'não informado'}`,
      `Categoria: ${identification.certification_category || 'não informado'}`,
      `Órgão emissor: ${certificate.issuing_authority || 'não informado'}`,
      `País emissor: ${certificate.issuing_country || 'não informado'}`
    ];
    const input = `Analise o risco e a conformidade regulatória da seguinte certificação para exportação.\n${linhas.join('\n')}`;

    this.isAnalyzingCompliance = true;
    this.complianceResult = null;

    this.ai
      .analisar({ task: 'RISK_ANALYSIS', input })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isAnalyzingCompliance = false;
          this.complianceResult = res.output;
          this.certificationForm.get('ai_automation')?.patchValue({ ai_compliance_check: true });
        },
        error: (error: unknown) => {
          console.error('Erro na análise de compliance:', error);
          this.isAnalyzingCompliance = false;
          this.showMessage(this.mensagemErroIa(error), 'error');
        }
      });
  }

  // Mapeia o Erro_IA (já normalizado pelo errorInterceptor) para uma mensagem
  // simples pt-BR, sem fallback mock.
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
        return e?.message || 'Erro ao processar a solicitação com IA.';
    }
  }

  formatPercentage(value: number): string {
    return (value * 100).toFixed(0) + '%';
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Formata data+hora em pt-BR; retorna '—' quando vazio/inválido.
  formatDateTime(value: string | Date | null | undefined): string {
    if (!value) { return '—'; }
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) { return '—'; }
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  get auditInfo(): { createdAt: string; createdBy: string; updatedAt: string; updatedBy: string } {
    const a = this.certificationForm?.getRawValue()?.audit ?? {};
    return {
      createdAt: this.formatDateTime(a.created_at),
      createdBy: a.created_by || 'Sistema',
      updatedAt: this.formatDateTime(a.updated_at),
      updatedBy: a.updated_by || 'Sistema'
    };
  }

  getRiskColor(riskLevel: string): string {
    switch (riskLevel?.toUpperCase()) {
      case 'LOW': return 'primary';
      case 'MEDIUM': return 'accent';
      case 'HIGH': return 'warn';
      default: return 'primary';
    }
  }

  getComplianceColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'OK': return 'green';
      case 'WARNING': return 'orange';
      case 'ERROR': return 'red';
      default: return 'grey';
    }
  }

  trackByCertId(index: number, item: any): any {
    return item.certification_id || index;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 4000,
      panelClass: [`snack-${type}`]
    });
  }
}