import { Component, OnInit, Inject, ViewChild, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { EXPORTACAO_SERVICE } from '../../../services/exportacao/exportacao-service.token';
import { IExportacaoService } from '../../../services/exportacao/exportacao-service.interface';
import { Exportacao, ExportacaoDocumento, ExportacaoItem, AIAssistantMessage } from '../../../../types/exportacao';
import {
  AiAssistantDialogComponent,
  AiAssistantDialogData
} from '../ai-assistant-dialog/ai-assistant-dialog.component';
import { ImportadorFormDialogComponent } from '../importador-form-dialog/importador-form-dialog.component';
import { IMPORTADOR_SERVICE } from '../../../services/importador/importador-service.token';
import { IImportadorService } from '../../../services/importador/importador-service.interface';
import { Importador } from '../../../../types/importador';
import { ProdutoFormDialogComponent } from '../produto-form-dialog/produto-form-dialog.component';
import { PRODUTO_SERVICE } from '../../../services/produto/produto-service.token';
import { IProdutoService } from '../../../services/produto/produto-service.interface';
import { Produto } from '../../../../types/produto';
import { PaisComboComponent } from '../../shared/pais-combo/pais-combo.component';

// Imports Angular Material
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-exportacao-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    PaisComboComponent
  ],
  templateUrl: './exportacao-form.component.html',
  styleUrls: ['./exportacao-form.component.scss']
})
export class ExportacaoFormComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  // Forms para cada step
  basicInfoForm!: FormGroup;
  productInfoForm!: FormGroup;
  logisticsForm!: FormGroup;
  documentsForm!: FormGroup;
  reviewForm!: FormGroup;

  // Estados
  loading = false;
  saving = false;
  aiProcessing = false;
  isEditMode = false;

  // Dados para autocompletes e selects
  currencies: string[] = [];
  incoterms: string[] = [];
  paymentTerms: string[] = [];
  packagingTypes: string[] = [];
  transportModes: string[] = [];
  ports: string[] = [];
  ncmCodes: any[] = [];

  // Importadores reutilizáveis (combo + modal de cadastro)
  importadores: Importador[] = [];
  importadoresLoading = false;

  // Produtos reutilizáveis do catálogo (combo com filtro + modal de cadastro)
  produtos: Produto[] = [];
  produtosLoading = false;
  // Termo digitado no autocomplete de produto (filtra por nome ou NCM).
  produtoFiltro = '';

  // Produtos da exportação
  exportItems: ExportacaoItem[] = [];
  displayedItemColumns = ['product_name', 'ncm_code', 'quantity', 'unit_price', 'total_value', 'actions'];

  // Documentos
  documents: ExportacaoDocumento[] = [];
  documentTypes = [
    'Commercial Invoice',
    'Packing List',
    'Bill of Lading',
    'Certificate of Origin',
    'Phytosanitary Certificate',
    'Health Certificate',
    'Insurance Certificate',
    'Export License'
  ];

  // IA Assistente
  aiSuggestions: any[] = [];
  aiChat: string = '';
  aiMessages: AIAssistantMessage[] = [];

  // Observables para autocompletes
  filteredNcmCodes: Observable<any[]> = of([]);

  // Controla se está sendo usado como dialog ou página
  isDialog: boolean = false;
  exportacaoId?: string;

  // Exportação atualmente carregada em modo edição (via rota ou dialog),
  // usada para preservar o export_id e campos de auditoria ao salvar.
  private loadedExportacao?: Exportacao;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(EXPORTACAO_SERVICE) private exportacaoService: IExportacaoService,
    @Inject(IMPORTADOR_SERVICE) private importadorService: IImportadorService,
    @Inject(PRODUTO_SERVICE) private produtoService: IProdutoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    @Optional() public dialogRef?: MatDialogRef<ExportacaoFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { exportacao?: Exportacao, mode: 'create' | 'edit' }
  ) {
    this.isDialog = !!dialogRef;

    if (this.isDialog && this.data) {
      this.isEditMode = this.data.mode === 'edit';
    } else {
      // Modo página independente
      this.exportacaoId = this.route.snapshot.params['id'];
      this.isEditMode = !!this.exportacaoId;
    }

    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadFormData();
    this.carregarImportadores();
    this.carregarProdutos();
    this.setupAutocompletes();

    if (this.isEditMode) {
      if (this.isDialog && this.data?.exportacao) {
        this.populateFormsWithExportacao(this.data.exportacao);
      } else if (!this.isDialog && this.exportacaoId) {
        this.loadExportacaoById(this.exportacaoId);
      }
    } else {
      // Garante que o loading seja false se estamos criando uma nova exportação
      this.loading = false;
    }

    // IA Auto-suggestions
    this.setupAISuggestions();
  }

  private initializeForms(): void {
    // Step 1: Informações Básicas
    this.basicInfoForm = this.formBuilder.group({
      // Número da exportação é gerado/gerenciado pelo backend: campo somente
      // leitura (disabled), sem validadores. Em edição é preenchido com o valor
      // existente; na criação permanece vazio e o backend o atribui.
      export_number: [{ value: '', disabled: true }],
      export_type: ['Regular', Validators.required],
      priority: ['Normal', Validators.required],
      is_urgent: [false],
      created_by: ['', Validators.required],
      // Importador reutilizável selecionado via combo (substitui os antigos
      // campos de texto livre importer_name/document/address/contact).
      customer_id: ['', Validators.required],
      destination_country: ['', Validators.required],
      destination_port: [''],
      origin_port: [''],
      payment_terms: ['', Validators.required],
      currency: ['USD', Validators.required],
      exchange_rate: [1, [Validators.required, Validators.min(0.01)]],
      incoterm: ['FOB', Validators.required],
      estimated_value: [0, [Validators.required, Validators.min(0.01)]],
      description: ['']
    });

    // Step 2: Produtos
    this.productInfoForm = this.formBuilder.group({
      items: this.formBuilder.array([]),
      total_weight: [0, [Validators.required, Validators.min(0)]],
      total_volume: [0, [Validators.required, Validators.min(0)]],
      packaging_type: ['Container 20ft', Validators.required],
      special_handling: [''],
      hazardous_material: [false],
      temperature_controlled: [false],
      min_temperature: [null],
      max_temperature: [null]
    });

    // Step 3: Logística
    this.logisticsForm = this.formBuilder.group({
      transport_mode: ['Maritime', Validators.required],
      carrier_name: [''],
      vessel_flight: [''],
      container_number: [''],
      seal_number: [''],
      etd: [null, Validators.required],
      eta: [null],
      route_description: [''],
      pickup_address: [''],
      delivery_address: [''],
      insurance_required: [false],
      insurance_value: [0],
      customs_broker: [''],
      freight_forwarder: ['']
    });

    // Step 4: Documentação
    this.documentsForm = this.formBuilder.group({
      commercial_invoice_required: [true],
      packing_list_required: [true],
      bill_of_lading_required: [true],
      certificate_origin_required: [false],
      phytosanitary_required: [false],
      health_certificate_required: [false],
      export_license_required: [false],
      additional_documents: [''],
      special_instructions: ['']
    });

    // Step 5: Revisão
    this.reviewForm = this.formBuilder.group({
      // Custo total da exportação (Custo_Exportacao, Req 5.5). Opcional e, quando
      // informado, não-negativo (ausente ⇒ zero no backend).
      total_cost: [null, [Validators.min(0)]],
      final_review: [false, Validators.requiredTrue],
      terms_accepted: [false, Validators.requiredTrue],
      submit_to_siscomex: [true],
      ai_validation_enabled: [true]
    });
  }

  private async loadFormData(): Promise<void> {
    // Só ativa o loading se estivermos editando (carregando dados existentes)
    if (this.isEditMode) {
      this.loading = true;
    }

    try {
      // Carregar dados para dropdowns
      const masterData = await this.exportacaoService.getMasterData().toPromise();

      this.currencies = masterData?.currencies || ['USD', 'EUR', 'BRL', 'CNY', 'JPY'];
      this.incoterms = masterData?.incoterms || ['FOB', 'CIF', 'EXW', 'DDP', 'FCA'];
      this.paymentTerms = masterData?.payment_terms || ['Advance Payment', 'Letter of Credit', '30 days', '60 days'];
      this.packagingTypes = masterData?.packaging_types || ['Container 20ft', 'Container 40ft', 'Pallet', 'Boxes'];
      this.transportModes = masterData?.transport_modes || ['Maritime', 'Air', 'Road', 'Rail'];
      this.ports = masterData?.ports || ['Santos', 'Paranaguá', 'Rio Grande', 'Vitória'];
      this.ncmCodes = masterData?.ncm_codes || [];

    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
      this.showError('Erro ao carregar dados do formulário');
    } finally {
      this.loading = false;
    }
  }

  /** Carrega a lista de importadores reutilizáveis para o combo. */
  private carregarImportadores(): void {
    this.importadoresLoading = true;
    this.importadorService.listar().subscribe({
      next: (importadores) => {
        this.importadores = importadores ?? [];
        this.importadoresLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar importadores:', error);
        this.showError('Erro ao carregar importadores');
        this.importadoresLoading = false;
      }
    });
  }

  /** Importador atualmente selecionado no combo (para exibir detalhes). */
  get importadorSelecionado(): Importador | undefined {
    return this.importadores.find(
      (i) => i.id === this.basicInfoForm.get('customer_id')?.value
    );
  }

  /**
   * Abre o diálogo de cadastro de novo importador. Ao retornar um importador
   * criado, adiciona-o à lista e o seleciona automaticamente no combo.
   */
  abrirNovoImportador(): void {
    const dialogRef = this.dialog.open(ImportadorFormDialogComponent, {
      width: '520px',
      maxWidth: '92vw',
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((created?: Importador) => {
      if (created) {
        this.importadores = [...this.importadores, created];
        this.basicInfoForm.patchValue({ customer_id: created.id });
      }
    });
  }

  /** Carrega a lista de produtos reutilizáveis do catálogo para o combo. */
  private carregarProdutos(): void {
    this.produtosLoading = true;
    this.produtoService.listar().subscribe({
      next: (produtos) => {
        this.produtos = produtos ?? [];
        this.produtosLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.showError('Erro ao carregar produtos');
        this.produtosLoading = false;
      }
    });
  }

  /**
   * Filtra os produtos do catálogo pelo termo digitado, comparando nome e NCM
   * de forma case-insensitive. Sem termo, retorna a lista completa.
   */
  filtrarProdutos(term: string): Produto[] {
    const t = (term ?? '').trim().toLowerCase();
    if (!t) {
      return this.produtos;
    }
    return this.produtos.filter((p) => {
      const name = (p.name ?? '').toLowerCase();
      const ncm = (p.ncm ?? '').toLowerCase();
      return name.includes(t) || ncm.includes(t);
    });
  }

  /**
   * Ao selecionar um produto no combo, reutiliza seus dados cadastrais no item
   * da exportação (nome, NCM, descrição, unidade, preço e origem). Apenas a
   * quantidade continua editável pelo usuário.
   */
  onProdutoSelecionado(item: ExportacaoItem, produtoId: string): void {
    const p = this.produtos.find((prod) => prod.id === produtoId);
    if (!p) {
      return;
    }
    item.product_id = p.id;
    item.product_name = p.name ?? '';
    item.ncm_code = p.ncm ?? '';
    item.product_description = p.description ?? '';
    item.unit = p.unit ?? item.unit;
    item.unit_price = p.standardPrice ?? 0;
    item.country_of_origin = p.originCountry ?? item.country_of_origin;
    this.updateProductValue(item);
  }

  /**
   * Abre o diálogo de cadastro de novo produto. Ao retornar um produto criado,
   * adiciona-o à lista e, quando um item é informado, o seleciona
   * automaticamente para aquele item da exportação.
   */
  abrirNovoProduto(item?: ExportacaoItem): void {
    const dialogRef = this.dialog.open(ProdutoFormDialogComponent, {
      width: '560px',
      maxWidth: '92vw',
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((created?: Produto) => {
      if (created) {
        this.produtos = [...this.produtos, created];
        if (item) {
          this.onProdutoSelecionado(item, created.id);
        }
      }
    });
  }

  private setupAutocompletes(): void {
    // Filtro para NCM
    this.filteredNcmCodes = this.productInfoForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => {
        return of(this.ncmCodes.slice(0, 20));
      })
    );
  }

  private setupAISuggestions(): void {
    // Configurar sugestões IA baseadas nos dados do form
    this.basicInfoForm.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(values => {
      if (values.destination_country && values.customer_id) {
        this.getAISuggestions(values);
      }
    });
  }

  private async getAISuggestions(formData: any): Promise<void> {
    try {
      this.aiProcessing = true;
      const suggestions = await this.exportacaoService.getAISuggestions(formData).toPromise();
      this.aiSuggestions = suggestions || [];
    } catch (error) {
      console.error('Erro ao obter sugestões IA:', error);
    } finally {
      this.aiProcessing = false;
    }
  }

  private populateFormsWithExportacao(exportacao: Exportacao): void {
    // Guarda a exportação carregada para preservar id/auditoria ao salvar
    // (funciona tanto no modo dialog quanto no modo rota).
    this.loadedExportacao = exportacao;

    // Preencher Step 1
    this.basicInfoForm.patchValue({
      export_number: exportacao.export_number,
      export_type: exportacao.export_type,
      priority: exportacao.priority,
      is_urgent: exportacao.is_urgent,
      created_by: exportacao.created_by,
      // Limitação conhecida: a ExportacaoView do backend ainda não retorna
      // customer_id ao front, logo em edição o combo pode ficar vazio até que
      // o usuário selecione novamente o importador.
      customer_id: exportacao.customer_id ?? '',
      destination_country: exportacao.destination_country,
      destination_port: exportacao.destination_port,
      origin_port: exportacao.origin_port,
      payment_terms: exportacao.payment_terms,
      currency: exportacao.currency,
      exchange_rate: exportacao.exchange_rate,
      incoterm: exportacao.incoterm,
      estimated_value: exportacao.estimated_value,
      description: exportacao.description
    });

    // Preencher Step 2 (produtos)
    if (exportacao.items && exportacao.items.length > 0) {
      this.exportItems = [...exportacao.items];
      this.updateProductTotals();
    }

    // Preencher o custo total (Req 5.5) no step de revisão.
    this.reviewForm.patchValue({
      total_cost: exportacao.total_cost ?? null
    });

    // Preencher Step 3 (logística)
    this.logisticsForm.patchValue({
      transport_mode: exportacao.transport_mode,
      carrier_name: exportacao.carrier_name,
      etd: exportacao.etd ? new Date(exportacao.etd) : null,
      eta: exportacao.eta ? new Date(exportacao.eta) : null
    });

    // Preencher documentos
    if (exportacao.documents && exportacao.documents.length > 0) {
      this.documents = [...exportacao.documents];
    }
  }

  // Produtos - Add/Remove/Edit
  addProduct(): void {
    const newItem: ExportacaoItem = {
      item_id: this.generateId(),
      product_id: '',
      product_name: '',
      product_description: '',
      ncm_code: '',
      quantity: 0,
      unit: 'MT',
      unit_price: 0,
      total_value: 0,
      weight: 0,
      volume: 0,
      country_of_origin: 'Brasil'
    };

    this.exportItems.push(newItem);
    this.updateProductTotals();
  }

  removeProduct(index: number): void {
    this.exportItems.splice(index, 1);
    this.updateProductTotals();
  }

  updateProductValue(item: ExportacaoItem): void {
    item.total_value = item.quantity * item.unit_price;
    this.updateProductTotals();
  }

  private updateProductTotals(): void {
    const totalWeight = this.exportItems.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalVolume = this.exportItems.reduce((sum, item) => sum + (item.volume || 0), 0);
    const totalValue = this.exportItems.reduce((sum, item) => sum + item.total_value, 0);

    this.productInfoForm.patchValue({
      total_weight: totalWeight,
      total_volume: totalVolume
    });

    this.basicInfoForm.patchValue({
      estimated_value: totalValue
    });
  }

  // Documentos
  addDocument(type: 'Invoice' | 'Packing List' | 'DU-E' | 'Certificate' | 'Bill of Lading' | 'Other'): void {
    const newDoc: ExportacaoDocumento = {
      document_id: this.generateId(),
      document_type: type,
      document_name: `${type}_${new Date().getTime()}`,
      file_url: '',
      generated_at: new Date(),
      status: 'Generated'
    };

    this.documents.push(newDoc);
  }

  removeDocument(index: number): void {
    this.documents.splice(index, 1);
  }

  // IA Chat
  sendAIMessage(): void {
    if (this.aiChat.trim()) {
      this.aiProcessing = true;

      // Simular processamento IA
      setTimeout(() => {
        const response = this.generateAIResponse(this.aiChat);
        this.aiSuggestions.push({
          type: 'chat',
          message: response,
          timestamp: new Date()
        });
        this.aiChat = '';
        this.aiProcessing = false;
      }, 1000);
    }
  }

  /** Abre o assistente de IA em um diálogo centralizado e responsivo. */
  openAIAssistant(): void {
    const data: AiAssistantDialogData = {
      messages: this.aiMessages,
      onSend: (query: string) => {
        const response = this.generateAIResponse(query);
        const assistantMessage: AIAssistantMessage = {
          id: this.generateId(),
          type: 'assistant',
          message: response,
          timestamp: new Date()
        };
        return of([assistantMessage]);
      },
      secondaryActionLabel: 'Preencher com IA',
      onSecondaryAction: () => this.autoFillWithAI()
    };

    this.dialog.open(AiAssistantDialogComponent, {
      data,
      width: '560px',
      maxWidth: '92vw',
      autoFocus: true,
      panelClass: 'ai-assistant-dialog-panel'
    });
  }

  private generateAIResponse(message: string): string {
    // Simulação de resposta IA baseada na mensagem
    if (message.toLowerCase().includes('ncm')) {
      return 'Com base no produto informado, sugiro o NCM 1234.56.78. Verificar se há requisitos especiais para este código.';
    } else if (message.toLowerCase().includes('documento')) {
      return 'Para este destino, são necessários: Commercial Invoice, Packing List e Certificate of Origin. Posso gerar automaticamente?';
    } else if (message.toLowerCase().includes('prazo')) {
      return 'Considerando o destino e modal de transporte, o prazo estimado é de 15-20 dias úteis.';
    } else {
      return 'Como posso ajudá-lo com esta exportação? Posso auxiliar com NCM, documentação, prazos e validações.';
    }
  }

  // Auto-fill com IA
  async autoFillWithAI(): Promise<void> {
    const basicData = this.basicInfoForm.getRawValue();
    if (!basicData.destination_country || !basicData.customer_id) {
      this.showError('Informe pelo menos o país de destino e importador para usar a IA');
      return;
    }

    this.aiProcessing = true;
    try {
      const aiData = await this.exportacaoService.generateExportWithAI(basicData).toPromise();

      if (aiData) {
        // Aplicar sugestões nos forms
        this.applyAISuggestions(aiData);
        this.showSuccess('Formulário preenchido automaticamente pela IA');
      }
    } catch (error) {
      console.error('Erro no preenchimento IA:', error);
      this.showError('Erro no preenchimento automático');
    } finally {
      this.aiProcessing = false;
    }
  }

  private applyAISuggestions(aiData: any): void {
    // Aplicar sugestões no Step 2 (produtos)
    if (aiData.suggested_products && aiData.suggested_products.length > 0) {
      this.exportItems = [...aiData.suggested_products];
      this.updateProductTotals();
    }

    // Aplicar sugestões no Step 3 (logística)
    this.logisticsForm.patchValue({
      transport_mode: aiData.suggested_transport_mode || 'Maritime',
      etd: aiData.suggested_etd ? new Date(aiData.suggested_etd) : null,
      eta: aiData.suggested_eta ? new Date(aiData.suggested_eta) : null
    });

    // Aplicar sugestões no Step 4 (documentos)
    if (aiData.required_documents && aiData.required_documents.length > 0) {
      aiData.required_documents.forEach((docType: 'Invoice' | 'Packing List' | 'DU-E' | 'Certificate' | 'Bill of Lading' | 'Other') => {
        this.addDocument(docType);
      });
    }
  }

  // Navegação do Stepper
  nextStep(): void {
    if (this.stepper.selectedIndex < 4) {
      this.stepper.next();
    }
  }

  previousStep(): void {
    if (this.stepper.selectedIndex > 0) {
      this.stepper.previous();
    }
  }

  // Validações dos Steps
  isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0: return this.basicInfoForm.valid;
      case 1: return this.productInfoForm.valid && this.exportItems.length > 0;
      case 2: return this.logisticsForm.valid;
      case 3: return this.documentsForm.valid;
      case 4: return this.reviewForm.valid;
      default: return false;
    }
  }

  // Submit
  async onSubmit(): Promise<void> {
    if (!this.isAllFormsValid()) {
      this.showError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.saving = true;
    try {
      const exportacaoData = this.buildExportacaoData();

      if (this.isEditMode) {
        await this.exportacaoService.updateExportacao(exportacaoData.export_id!, exportacaoData).toPromise();
        this.showSuccess('Exportação atualizada com sucesso');
      } else {
        await this.exportacaoService.createExportacao(exportacaoData).toPromise();
        this.showSuccess('Exportação criada com sucesso');
      }

      if (this.isDialog && this.dialogRef) {
        this.dialogRef.close(true);
      } else {
        this.router.navigate(['/home-logged/exportacoes/gerenciar']);
      }

    } catch (error) {
      console.error('Erro ao salvar exportação:', error);
      this.showError('Erro ao salvar exportação');
    } finally {
      this.saving = false;
    }
  }

  private isAllFormsValid(): boolean {
    return this.basicInfoForm.valid &&
           this.productInfoForm.valid &&
           this.logisticsForm.valid &&
           this.documentsForm.valid &&
           this.reviewForm.valid &&
           this.exportItems.length > 0;
  }

  private buildExportacaoData(): Exportacao {
    // getRawValue inclui controles desabilitados (ex.: export_number).
    const basicInfo = this.basicInfoForm.getRawValue();
    const productInfo = this.productInfoForm.value;
    const logistics = this.logisticsForm.value;
    const review = this.reviewForm.value;

    // Exportação sendo editada, seja via dialog (this.data) ou via rota
    // (this.loadedExportacao). Usada para preservar o id e os campos de
    // auditoria em ambos os modos de edição.
    const editing = this.isEditMode ? (this.data?.exportacao ?? this.loadedExportacao) : undefined;

    return {
      export_id: editing ? editing.export_id : this.generateId(),
      // Número gerenciado pelo backend: em edição preserva o número existente;
      // na criação envia vazio para que o backend o gere.
      export_number: editing ? editing.export_number : (basicInfo.export_number || ''),
      // Importador selecionado (mapeado para customerId no serviço real).
      customer_id: basicInfo.customer_id,
      contract_id: 'cnt_' + this.generateId(), // Required field
      exporter_id: 'exp_' + this.generateId(), // Required field
      exporter_name: basicInfo.exporter_name || 'Exportadora Padrão', // Required field
      // Nome legível derivado do importador selecionado (campo de texto livre removido).
      importer_name: this.importadorSelecionado?.name ?? '',
      importer_country: basicInfo.destination_country || '', // Required field
      destination_country: basicInfo.destination_country,

      // Product required fields
      product_id: this.exportItems.length > 0 ? this.exportItems[0].product_id : 'prod_' + this.generateId(),
      product_name: this.exportItems.length > 0 ? this.exportItems[0].product_name : '',
      ncm_code: this.exportItems.length > 0 ? this.exportItems[0].ncm_code : '',
      quantity: this.exportItems.reduce((sum, item) => sum + item.quantity, 0),
      unit: this.exportItems.length > 0 ? (this.exportItems[0].unit as 'MT' | 'KG' | 'TON') : 'MT',
      packaging_type: productInfo.packaging_type || 'Container',

      // Commercial required fields
      incoterm: basicInfo.incoterm || 'FOB',
      currency: basicInfo.currency || 'USD',
      unit_price: this.exportItems.length > 0 ? this.exportItems[0].unit_price : 0,
      total_value: this.exportItems.reduce((sum, item) => sum + item.total_value, 0),
      // Custo total (Custo_Exportacao, Req 5.5): número não-negativo e opcional.
      // Vazio/none ⇒ undefined (backend trata como zero).
      total_cost:
        review.total_cost === null || review.total_cost === undefined || review.total_cost === ''
          ? undefined
          : Number(review.total_cost),
      payment_method: basicInfo.payment_method || 'L/C',
      payment_terms: basicInfo.payment_terms || '30 days',

      // Logistics required fields
      port_origin: basicInfo.origin_port || 'Santos',
      port_destination: basicInfo.destination_port || '',
      transport_mode: logistics.transport_mode || 'Marítimo',

      // Status fields
      export_status: editing ? editing.export_status : 'Draft',
      export_date: editing ? editing.export_date : undefined,
      export_type: basicInfo.export_type,
      priority: basicInfo.priority,
      description: basicInfo.description,

      // Compliance required fields
      compliance_status: 'Pending',
      export_license_required: false,
      mapa_approval: false,
      vigiagro_status: 'Not Required',

      // AI fields
      ai_generated: false,
      ai_confidence_score: 0,
      ai_risk_score: 0,
      ai_missing_fields: [],
      ai_suggestions: this.aiSuggestions || [],
      ai_auto_fill_enabled: true,
      ai_document_generation: true,
      ai_compliance_check: true,

      // Audit fields
      created_at: editing ? editing.created_at : new Date(),
      updated_at: new Date(),
      created_by: basicInfo.created_by || 'current_user',
      created_by_name: basicInfo.created_by_name || 'Usuário Atual',
      updated_by: 'current_user',
      updated_by_name: 'Usuário Atual',

      // Optional fields that may exist
      is_urgent: basicInfo.is_urgent,
      completion_percentage: 25,
      items: this.exportItems,
      documents: this.documents,
      carrier_name: logistics.carrier_name,
      etd: logistics.etd,
      eta: logistics.eta,
      siscomex_status: 'Not Sent'
    };
  }

  // Utilitários
  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  onCancel(): void {
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/home-logged/exportacoes/gerenciar']);
    }
  }

  private loadExportacaoById(id: string): void {
    this.loading = true;
    this.exportacaoService.getExportacaoById(id).subscribe({
      next: (exportacao: any) => {
        if (exportacao) {
          this.populateFormsWithExportacao(exportacao);
        } else {
          this.showError('Exportação não encontrada');
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar exportação:', error);
        this.showError('Erro ao carregar dados da exportação');
        this.loading = false;
      }
    });
  }
}
