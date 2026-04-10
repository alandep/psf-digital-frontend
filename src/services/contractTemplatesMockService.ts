import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { 
  ContractTemplate, 
  TemplateFilters, 
  TemplateFilterOptions,
  TemplateValidationResult,
  ContractGenerationRequest,
  ContractGenerationResult,
  TemplateVariable,
  AIConfig,
  ContractType,
  Commodity,
  Currency,
  Incoterm,
  OrganizationStandard
} from '../types/contractTemplates';

@Injectable({
  providedIn: 'root'
})
export class ContractTemplatesMockService {
  private templates: ContractTemplate[] = [
    {
      template_id: '1',
      template_name: 'Exportação Soja China CIF',
      template_code: 'SOJA_CN_CIF_001',
      description: 'Template padrão para exportação de soja para China com termo CIF',
      contract_type: 'Export',
      commodity: 'Soja',
      commodity_grade: 'Soybean No.2 Yellow',
      organization_standard: 'GAFTA',
      version: 3,
      active: true,
      created_at: new Date('2024-01-15'),
      created_by: 'admin',
      updated_at: new Date('2024-02-20'),
      updated_by: 'jsilva',
      
      // Exportador
      exporter_id: 'exp_001',
      exporter_name: 'Agroexport Ltda',
      exporter_country: 'Brazil',
      exporter_tax_id: '12.345.678/0001-90',
      
      // Importador padrão
      default_importer_name: 'China National Cereals',
      importer_country: 'China',
      importer_region: 'Shandong',
      importer_type: 'Government',
      
      // Termos comerciais
      incoterm: 'CIF',
      incoterm_version: 'Incoterms 2020',
      port_origin: 'Santos, Brazil',
      port_destination: 'Qingdao, China',
      shipment_type: 'Bulk',
      
      // Financeiro
      currency: 'USD',
      price_type: 'Futures Based',
      default_price: 485.50,
      price_unit: 'USD/MT',
      payment_terms: 'Letter of Credit',
      payment_method: 'Letter of Credit',
      payment_days: 30,
      
      // Quantidade e logística
      quantity_min: 30000,
      quantity_max: 65000,
      quantity_unit: 'MT',
      tolerance_percent: 5,
      shipment_period_start: 45,
      shipment_period_end: 60,
      partial_shipment_allowed: true,
      transshipment_allowed: true,
      
      // Cláusulas
      contract_text_template: `CONTRATO DE COMPRA E VENDA DE {{commodity}}

Vendedor: {{exporter_name}}
Comprador: {{importer_name}}
Commodity: {{commodity}} - {{commodity_grade}}
Quantidade: {{quantity}} {{quantity_unit}} (±{{tolerance_percent}}%)
Preço: {{price}} {{price_unit}}
Embarque: {{shipment_date}}
Porto Origem: {{port_origin}}
Porto Destino: {{port_destination}}
Incoterm: {{incoterm}} {{incoterm_version}}

Este contrato está sujeito às regras GAFTA 127.`,
      quality_specification: `Protein: Minimum 34%
Oil Content: Minimum 18%
Moisture: Maximum 14%
Foreign Matter: Maximum 2%
Damaged Kernels: Maximum 3%`,
      inspection_standard: 'SGS',
      arbitration_clause: 'GAFTA',
      force_majeure_clause: 'Conforme cláusulas padrão GAFTA para força maior.',
      
      variables: [
        { variable_name: 'importer_name', variable_type: 'text', description: 'Nome do importador', default_value: '', required: true },
        { variable_name: 'quantity', variable_type: 'number', description: 'Quantidade contratada', default_value: '', required: true },
        { variable_name: 'price', variable_type: 'currency', description: 'Preço por unidade', default_value: '', required: true },
        { variable_name: 'shipment_date', variable_type: 'date', description: 'Data de embarque', default_value: '', required: true }
      ],
      
      ai_config: {
        ai_enabled: true,
        ai_auto_fill: true,
        ai_risk_analysis: true,
        ai_suggest_incoterm: true,
        ai_generate_contract_text: true,
        ai_compliance_check: true
      }
    },
    {
      template_id: '2', 
      template_name: 'Exportação Milho Europa FOB',
      template_code: 'MILHO_EU_FOB_001',
      description: 'Template para exportação de milho para países europeus com termo FOB',
      contract_type: 'Export',
      commodity: 'Milho',
      commodity_grade: 'Corn No.2 Yellow',
      organization_standard: 'FOSFA',
      version: 2,
      active: true,
      created_at: new Date('2024-01-20'),
      created_by: 'mcarlos',
      
      // Exportador
      exporter_id: 'exp_001',
      exporter_name: 'Agroexport Ltda',
      exporter_country: 'Brazil',
      exporter_tax_id: '12.345.678/0001-90',
      
      // Importador padrão
      default_importer_name: 'European Feed Co.',
      importer_country: 'Netherlands',
      importer_region: 'Rotterdam',
      importer_type: 'FeedMill',
      
      incoterm: 'FOB',
      incoterm_version: 'Incoterms 2020',
      port_origin: 'Santos, Brazil',
      port_destination: 'Rotterdam, Netherlands',
      shipment_type: 'Bulk',
      
      currency: 'USD',
      price_type: 'Fixed',
      default_price: 220.00,
      price_unit: 'USD/MT',
      payment_terms: 'Cash Against Documents',
      payment_method: 'Wire Transfer',
      payment_days: 15,
      
      quantity_min: 20000,
      quantity_max: 50000,
      quantity_unit: 'MT',
      tolerance_percent: 10,
      shipment_period_start: 30,
      shipment_period_end: 45,
      partial_shipment_allowed: true,
      transshipment_allowed: false,
      
      contract_text_template: `CORN EXPORT CONTRACT

Seller: {{exporter_name}}
Buyer: {{importer_name}}
Commodity: {{commodity}} - {{commodity_grade}}
Quantity: {{quantity}} {{quantity_unit}} (±{{tolerance_percent}}%)
Price: {{price}} {{price_unit}} {{incoterm}}

Subject to FOSFA standard terms.`,
      quality_specification: `Moisture: Maximum 14%
Foreign Matter: Maximum 3%
Broken Kernels: Maximum 5%
Test Weight: Minimum 72 kg/hl`,
      inspection_standard: 'SGS',
      arbitration_clause: 'FOSFA',
      force_majeure_clause: 'Standard FOSFA force majeure clause applies.',
      
      variables: [
        { variable_name: 'importer_name', variable_type: 'text', description: 'Nome do importador', default_value: '', required: true },
        { variable_name: 'quantity', variable_type: 'number', description: 'Quantidade', default_value: '25000', required: true },
        { variable_name: 'price', variable_type: 'currency', description: 'Preço FOB', default_value: '', required: true }
      ],
      
      ai_config: {
        ai_enabled: true,
        ai_auto_fill: false,
        ai_risk_analysis: true,
        ai_suggest_incoterm: false,
        ai_generate_contract_text: false,
        ai_compliance_check: true
      }
    },
    {
      template_id: '3',
      template_name: 'Farelo Soja Sudeste Asiático',
      template_code: 'FARELO_ASIA_CIF_001',
      description: 'Template para exportação de farelo de soja para países do sudeste asiático',
      contract_type: 'Export',
      commodity: 'Farelo de Soja',
      commodity_grade: 'Soybean Meal 46% Protein',
      organization_standard: 'ANEC',
      version: 1,
      active: true,
      created_at: new Date('2024-02-01'),
      created_by: 'asilva',
      
      exporter_id: 'exp_001',
      exporter_name: 'Agroexport Ltda',
      exporter_country: 'Brazil',
      exporter_tax_id: '12.345.678/0001-90',
      
      default_importer_name: 'Asia Feed Industries',
      importer_country: 'Vietnam',
      importer_region: 'Ho Chi Minh',
      importer_type: 'FeedMill',
      
      incoterm: 'CIF',
      incoterm_version: 'Incoterms 2020',
      port_origin: 'Paranaguá, Brazil',
      port_destination: 'Ho Chi Minh, Vietnam',
      shipment_type: 'Bulk',
      
      currency: 'USD',
      price_type: 'Basis',
      default_price: 395.00,
      price_unit: 'USD/MT',
      payment_terms: 'Letter of Credit',
      payment_method: 'Letter of Credit',
      payment_days: 45,
      
      quantity_min: 15000,
      quantity_max: 35000,
      quantity_unit: 'MT',
      tolerance_percent: 5,
      shipment_period_start: 20,
      shipment_period_end: 35,
      partial_shipment_allowed: false,
      transshipment_allowed: true,
      
      contract_text_template: `SOYBEAN MEAL EXPORT CONTRACT

Seller: {{exporter_name}}
Buyer: {{importer_name}}
Product: {{commodity}} ({{commodity_grade}})
Quantity: {{quantity}} MT ±{{tolerance_percent}}%
Price: {{price}} USD/MT CIF {{port_destination}}

Shipment: {{shipment_date}}
Quality as per ANEC standards.`,
      quality_specification: `Protein: Minimum 46%
Fiber: Maximum 3.5%
Fat: Maximum 2.0%
Moisture: Maximum 12%
Ash: Maximum 7%`,
      inspection_standard: 'Intertek',
      arbitration_clause: 'ICC',
      force_majeure_clause: 'ICC force majeure standard clause.',
      
      variables: [
        { variable_name: 'importer_name', variable_type: 'text', description: 'Nome do importador', default_value: '', required: true },
        { variable_name: 'quantity', variable_type: 'number', description: 'Quantidade', default_value: '', required: true },
        { variable_name: 'price', variable_type: 'currency', description: 'Preço CIF', default_value: '', required: true },
        { variable_name: 'shipment_date', variable_type: 'date', description: 'Data de embarque', default_value: '', required: true },
        { variable_name: 'port_destination', variable_type: 'text', description: 'Porto de destino', default_value: 'Ho Chi Minh', required: true }
      ],
      
      ai_config: {
        ai_enabled: false,
        ai_auto_fill: false,
        ai_risk_analysis: false,
        ai_suggest_incoterm: false,
        ai_generate_contract_text: false,
        ai_compliance_check: true
      }
    }
  ];

  private filterOptions: TemplateFilterOptions = {
    commodities: [
      { value: 'Soja', label: 'Soja' },
      { value: 'Milho', label: 'Milho' },
      { value: 'Farelo de Soja', label: 'Farelo de Soja' },
      { value: 'Óleo de Soja', label: 'Óleo de Soja' },
      { value: 'Trigo', label: 'Trigo' },
      { value: 'Algodão', label: 'Algodão' },
      { value: 'Açúcar', label: 'Açúcar' },
      { value: 'Café', label: 'Café' }
    ],
    countries: [
      { code: 'CN', name: 'China' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'VN', name: 'Vietnam' },
      { code: 'ID', name: 'Indonesia' },
      { code: 'EG', name: 'Egypt' },
      { code: 'TR', name: 'Turkey' },
      { code: 'DE', name: 'Germany' },
      { code: 'ES', name: 'Spain' }
    ],
    ports: [
      { code: 'BRSST', name: 'Santos', country: 'Brazil' },
      { code: 'BRPNG', name: 'Paranaguá', country: 'Brazil' },
      { code: 'BRRIO', name: 'Rio Grande', country: 'Brazil' },
      { code: 'CNQIN', name: 'Qingdao', country: 'China' },
      { code: 'CNSHA', name: 'Shanghai', country: 'China' },
      { code: 'NLRTM', name: 'Rotterdam', country: 'Netherlands' },
      { code: 'VNSGN', name: 'Ho Chi Minh', country: 'Vietnam' }
    ],
    exporters: [
      { id: 'exp_001', name: 'Agroexport Ltda' },
      { id: 'exp_002', name: 'Brasil Grãos Export' },
      { id: 'exp_003', name: 'Agrosul Trading' }
    ],
    currencies: [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
      { code: 'CNY', symbol: '¥', name: 'Yuan Chinês' }
    ]
  };

  constructor() {
    console.log('🏗️ ContractTemplatesMockService inicializado com', this.templates.length, 'templates');
  }

  // ========== CRUD OPERATIONS ==========

  getTemplates(filters?: TemplateFilters): Observable<ContractTemplate[]> {
    console.log('📋 Carregando templates com filtros:', filters);
    
    let filteredTemplates = [...this.templates];
    
    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredTemplates = filteredTemplates.filter(t => 
          t.template_name.toLowerCase().includes(search) ||
          t.template_code.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.commodity.toLowerCase().includes(search)
        );
      }
      
      if (filters.contract_type && filters.contract_type.length > 0) {
        filteredTemplates = filteredTemplates.filter(t => 
          filters.contract_type!.includes(t.contract_type)
        );
      }
      
      if (filters.commodity && filters.commodity.length > 0) {
        filteredTemplates = filteredTemplates.filter(t => 
          filters.commodity!.includes(t.commodity) 
        );
      }
      
      if (filters.currency && filters.currency.length > 0) {
        filteredTemplates = filteredTemplates.filter(t => 
          filters.currency!.includes(t.currency)
        );
      }
      
      if (filters.active !== undefined && filters.active !== null) {
        filteredTemplates = filteredTemplates.filter(t => t.active === filters.active);
      }
      
      if (filters.date_from) {
        filteredTemplates = filteredTemplates.filter(t => 
          t.created_at && t.created_at >= filters.date_from!
        );
      }
      
      if (filters.date_to) {
        filteredTemplates = filteredTemplates.filter(t => 
          t.created_at && t.created_at <= filters.date_to!
        );
      }
    }
    
    return of(filteredTemplates).pipe(delay(800));
  }

  getTemplate(id: string): Observable<ContractTemplate> {
    console.log('👁️ Carregando template:', id);
    
    const template = this.templates.find(t => t.template_id === id);
    if (!template) {
      return throwError(() => new Error(`Template ${id} não encontrado`));
    }
    
    return of(template).pipe(delay(300));
  }

  createTemplate(template: Omit<ContractTemplate, 'template_id' | 'created_at' | 'updated_at' | 'version'>): Observable<ContractTemplate> {
    console.log('➕ Criando novo template:', template.template_name);
    
    const newTemplate: ContractTemplate = {
      ...template,
      template_id: `template_${Date.now()}`,
      version: 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    this.templates.push(newTemplate);
    return of(newTemplate).pipe(delay(1000));
  }

  updateTemplate(id: string, updates: Partial<ContractTemplate>): Observable<ContractTemplate> {
    console.log('✏️ Atualizando template:', id, updates);
    
    const index = this.templates.findIndex(t => t.template_id === id);
    if (index === -1) {
      return throwError(() => new Error(`Template ${id} não encontrado`));
    }
    
    this.templates[index] = {
      ...this.templates[index],
      ...updates,
      updated_at: new Date()
    };
    
    return of(this.templates[index]).pipe(delay(800));
  }

  deleteTemplate(id: string): Observable<void> {
    console.log('🗑️ Excluindo template:', id);
    
    const index = this.templates.findIndex(t => t.template_id === id);
    if (index === -1) {
      return throwError(() => new Error(`Template ${id} não encontrado`));
    }
    
    this.templates.splice(index, 1);
    return of(undefined).pipe(delay(500));
  }

  duplicateTemplate(id: string, newName: string): Observable<ContractTemplate> {
    console.log('📄 Duplicando template:', id, 'como:', newName);
    
    const original = this.templates.find(t => t.template_id === id);
    if (!original) {
      return throwError(() => new Error(`Template ${id} não encontrado`));
    }
    
    const duplicate: ContractTemplate = {
      ...original,
      template_id: `template_${Date.now()}`,
      template_name: newName,
      template_code: `${original.template_code}_COPY`,
      version: 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    this.templates.push(duplicate);
    return of(duplicate).pipe(delay(1200));
  }

  createVersion(id: string): Observable<ContractTemplate> {
    console.log('🔄 Criando nova versão do template:', id);
    
    const original = this.templates.find(t => t.template_id === id);
    if (!original) {
      return throwError(() => new Error(`Template ${id} não encontrado`));
    }
    
    const newVersion: ContractTemplate = {
      ...original,
      template_id: `template_${Date.now()}`,
      version: original.version + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    this.templates.push(newVersion);
    return of(newVersion).pipe(delay(1000));
  }

  // ========== SPECIALIZED OPERATIONS ==========

  getFilterOptions(): Observable<TemplateFilterOptions> {
    console.log('🔍 Carregando opções de filtro para templates');
    return of(this.filterOptions).pipe(delay(200));
  }

  validateTemplate(template: ContractTemplate): Observable<TemplateValidationResult> {
    console.log('✅ Validando template:', template.template_name);
    
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Validações básicas
    if (!template.template_name || template.template_name.length < 3) {
      errors.push({ field: 'template_name', message: 'Nome deve ter pelo menos 3 caracteres', severity: 'error' });
    }
    
    if (!template.template_code || template.template_code.length < 3) {
      errors.push({ field: 'template_code', message: 'Código deve ter pelo menos 3 caracteres', severity: 'error' });
    }
    
    if (!template.contract_text_template || template.contract_text_template.length < 50) {
      errors.push({ field: 'contract_text_template', message: 'Texto do contrato muito curto', severity: 'error' });
    }
    
    if (template.quantity_min >= template.quantity_max) {
      errors.push({ field: 'quantity', message: 'Quantidade mínima deve ser menor que máxima', severity: 'error' });
    }
    
    // Validações de compliance
    if (template.commodity === 'Soja' && template.incoterm === 'EXW') {
      warnings.push({ field: 'incoterm', message: 'EXW não é recomendado para soja', suggestion: 'Use FOB ou CIF' });
    }
    
    if (template.currency !== 'USD' && template.contract_type === 'Export') {
      warnings.push({ field: 'currency', message: 'USD é recomendado para exportações', suggestion: 'Considere usar USD' });
    }
    
    return of({
      isValid: errors.length === 0,
      errors,
      warnings
    }).pipe(delay(600));
  }

  generateContract(request: ContractGenerationRequest): Observable<ContractGenerationResult> {
    console.log('📄 Gerando contrato a partir do template:', request.template_id);
    
    const template = this.templates.find(t => t.template_id === request.template_id);
    if (!template) {
      return throwError(() => new Error('Template não encontrado'));
    }
    
    // Simular geração
    return of({
      success: true,
      contract_id: `contract_${Date.now()}`,
      pdf_url: `/api/contracts/contract_${Date.now()}.pdf`,
      docx_url: `/api/contracts/contract_${Date.now()}.docx`
    }).pipe(delay(2000));
  }

  suggestIncoterm(commodity: Commodity, destination: string): Observable<Incoterm[]> {
    console.log('🤖 IA sugerindo incoterms para:', commodity, 'destino:', destination);
    
    let suggestions: Incoterm[] = [];
    
    if (destination.includes('China')) {
      suggestions = ['CIF', 'CFR'];
    } else if (destination.includes('Europe') || destination.includes('Netherlands')) {
      suggestions = ['FOB', 'CFR'];
    } else {
      suggestions = ['FOB', 'CIF'];
    }
    
    return of(suggestions).pipe(delay(800));
  }

  generateContractText(template: Partial<ContractTemplate>): Observable<string> {
    console.log('🤖 IA gerando texto de contrato para:', template.commodity);
    
    const generatedText = `CONTRATO DE EXPORTAÇÃO DE ${template.commodity?.toUpperCase()}

VENDEDOR: ${template.exporter_name || '{{exporter_name}}'}
COMPRADOR: {{importer_name}}

COMMODITY: ${template.commodity} - ${template.commodity_grade || 'Grau padrão'}
QUANTIDADE: {{quantity}} ${template.quantity_unit} (±${template.tolerance_percent}%)
PREÇO: {{price}} ${template.price_unit} ${template.incoterm}

EMBARQUE: {{shipment_date}}
PORTO DE ORIGEM: ${template.port_origin}
PORTO DE DESTINO: ${template.port_destination}

INCOTERM: ${template.incoterm} ${template.incoterm_version}
QUALIDADE: Conforme especificação anexa
INSPEÇÃO: ${template.inspection_standard || 'SGS'}

PAGAMENTO: ${template.payment_terms}
PRAZO: ${template.payment_days} dias

Este contrato está sujeito às regras ${template.organization_standard}.

Texto gerado automaticamente pela IA - ${new Date().toLocaleString()}`;

    return of(generatedText).pipe(delay(1500));
  }

  analyzeRisk(template: ContractTemplate): Observable<any> {
    console.log('⚠️ IA analisando riscos do template:', template.template_name);
    
    const risks = [];
    
    if (template.currency !== 'USD') {
      risks.push({
        type: 'currency',
        level: 'medium',
        message: 'Risco cambial elevado com moedas diferentes de USD',
        recommendation: 'Considere hedge cambial'
      });
    }
    
    if (template.payment_terms === 'Open Account') {
      risks.push({
        type: 'credit',
        level: 'high',
        message: 'Risco de crédito alto com conta aberta',
        recommendation: 'Exija garantias adicionais'
      });
    }
    
    if (template.quantity_max > 50000) {
      risks.push({
        type: 'logistics',
        level: 'medium',
        message: 'Volume alto pode implicar em riscos logísticos',
        recommendation: 'Verifique capacidade portuária'
      });
    }
    
    return of({
      overallRisk: risks.length > 0 ? 'medium' : 'low',
      risks,
      timestamp: new Date()
    }).pipe(delay(1000));
  }

  checkCompliance(template: ContractTemplate): Observable<any> {
    console.log('📋 IA verificando compliance do template:', template.template_name);
    
    const issues = [];
    const suggestions = [];
    
    if (template.organization_standard === 'GAFTA' && template.commodity !== 'Soja' && template.commodity !== 'Milho') {
      issues.push('GAFTA é específica para grãos - verifique adequação');
    }
    
    if (template.arbitration_clause !== template.organization_standard) {
      suggestions.push('Alinhe cláusula de arbitragem com padrão organizacional');
    }
    
    if (!template.quality_specification) {
      issues.push('Especificação de qualidade é obrigatória');
    }
    
    return of({
      compliant: issues.length === 0,
      issues,
      suggestions,
      timestamp: new Date()
    }).pipe(delay(800));
  }

  exportTemplate(id: string, format: 'PDF' | 'JSON' | 'DOCX'): Observable<{ url: string; filename: string }> {
    console.log('📤 Exportando template:', id, 'formato:', format);
    
    return of({
      url: `/api/templates/export/${id}.${format.toLowerCase()}`,
      filename: `template_${id}.${format.toLowerCase()}`
    }).pipe(delay(1500));
  }

  importTemplate(file: File): Observable<ContractTemplate> {
    console.log('📥 Importando template:', file.name);
    
    // Simular importação
    const importedTemplate: ContractTemplate = {
      template_id: `imported_${Date.now()}`,
      template_name: `Template Importado - ${file.name}`,
      template_code: 'IMPORTED_001',
      description: 'Template importado de arquivo externo',
      contract_type: 'Export',
      commodity: 'Soja',
      version: 1,
      active: true,
      created_at: new Date(),
      
      // Dados mínimos necessários
      exporter_id: 'exp_001',
      exporter_name: 'Importado',
      exporter_country: 'Brazil',
      exporter_tax_id: '00.000.000/0001-00',
      
      incoterm: 'FOB',
      incoterm_version: 'Incoterms 2020',
      port_origin: 'Santos',
      port_destination: 'Destino',
      shipment_type: 'Bulk',
      
      currency: 'USD',
      price_type: 'Fixed',
      price_unit: 'USD/MT',
      payment_terms: 'Letter of Credit',
      payment_method: 'Letter of Credit',
      
      quantity_min: 1000,
      quantity_max: 10000,
      quantity_unit: 'MT',
      partial_shipment_allowed: true,
      transshipment_allowed: true,
      
      contract_text_template: 'Template importado - texto a ser configurado',
      arbitration_clause: 'ICC',
      force_majeure_clause: 'Standard force majeure clause',
      
      variables: [],
      ai_config: {
        ai_enabled: false,
        ai_auto_fill: false,
        ai_risk_analysis: false,
        ai_suggest_incoterm: false,
        ai_generate_contract_text: false,
        ai_compliance_check: false
      }
    };
    
    return of(importedTemplate).pipe(delay(2000));
  }

  getTemplateHistory(id: string): Observable<ContractTemplate[]> {
    console.log('📊 Carregando histórico do template:', id);
    
    const versionsHistory = this.templates
      .filter(t => t.template_code.includes(id.split('_')[1]) || t.template_id === id)
      .sort((a, b) => (b.version || 0) - (a.version || 0));
    
    return of(versionsHistory).pipe(delay(400));
  }
}