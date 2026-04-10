import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { 
  Exportacao, 
  ExportacaoFilterOptions, 
  ExportacaoDashboard, 
  RiskAlert,
  AIAssistantMessage,
  SiscomexIntegration,
  AISuggestion,
  ExportacaoDocumento 
} from '../types/exportacao';

@Injectable({
  providedIn: 'root'
})
export class ExportacaoMockService {

  // Mock de dados para demonstração
  private exportacoes: Exportacao[] = [
    {
      export_id: 'exp_001',
      export_number: 'EXP-2026-0001',
      contract_id: 'cnt_001',
      contract_number: 'CNT-2026-0001',
      exporter_id: 'exp_comp_001',
      exporter_name: 'Agro Export Brasil Ltda',
      importer_name: 'Global Grain Corp',
      importer_country: 'United States',
      destination_country: 'United States',
      
      product_id: 'prod_001',
      product_name: 'Soja em Grão',
      ncm_code: '12019000',
      quantity: 5000,
      unit: 'MT',
      packaging_type: 'Bulk',
      
      incoterm: 'FOB',
      currency: 'USD',
      unit_price: 425.50,
      total_value: 2127500.00,
      payment_method: 'L/C',
      payment_terms: '30 days after B/L date',
      
      shipment_id: 'ship_001',
      shipment_number: 'SHIP-2026-0001',
      port_origin: 'Santos, SP',
      port_destination: 'New Orleans, USA',
      transport_mode: 'Marítimo',
      etd: new Date('2026-05-15'),
      eta: new Date('2026-06-02'),
      
      due_number: 'DUE26040001',
      invoice_number: 'INV-2026-0001',
      packing_list: 'PL-2026-0001',
      certificate_origin: 'CO-2026-0001',
      phytosanitary_certificate: 'FITO-2026-0001',
      
      export_status: 'Processing',
      export_date: new Date('2026-04-01'),
      
      compliance_status: 'OK',
      export_license_required: false,
      mapa_approval: true,
      vigiagro_status: 'Approved',
      
      ai_generated: false,
      ai_confidence_score: 92.5,
      ai_risk_score: 15.2,
      ai_missing_fields: [],
      ai_suggestions: [
        {
          field: 'phytosanitary_certificate',
          suggestion: 'Adicionar certificado fitossanitário',
          confidence: 0.95,
          reason: 'Produto agrícola requer certificação'
        }
      ],
      ai_auto_fill_enabled: true,
      ai_document_generation: true,
      ai_compliance_check: true,
      
      siscomex_status: 'Approved',
      siscomex_sent_date: new Date('2026-04-05'),
      siscomex_response: 'DU-E aprovada automaticamente',
      
      created_at: new Date('2026-04-01'),
      created_by: 'user_001',
      created_by_name: 'João Silva',
      updated_at: new Date('2026-04-08'),
      updated_by: 'user_001',
      updated_by_name: 'João Silva',
      
      is_urgent: false,
      days_until_etd: 37,
      completion_percentage: 85
    },
    {
      export_id: 'exp_002',
      export_number: 'EXP-2026-0002',
      contract_id: 'cnt_002',
      contract_number: 'CNT-2026-0002',
      exporter_id: 'exp_comp_002',
      exporter_name: 'Mining Export SA',
      importer_name: 'European Steel Industries',
      importer_country: 'Germany',
      destination_country: 'Germany',
      
      product_id: 'prod_002',
      product_name: 'Minério de Ferro',
      ncm_code: '26011100',
      quantity: 8500,
      unit: 'MT',
      packaging_type: 'Bulk',
      
      incoterm: 'CIF',
      currency: 'EUR',
      unit_price: 95.75,
      total_value: 813875.00,
      payment_method: 'T/T',
      payment_terms: '15 days advance payment',
      
      port_origin: 'Vitória, ES',
      port_destination: 'Hamburg, Germany',
      transport_mode: 'Marítimo',
      etd: new Date('2026-04-25'),
      eta: new Date('2026-05-20'),
      
      due_number: 'DUE26040002',
      invoice_number: 'INV-2026-0002',
      
      export_status: 'Draft',
      export_date: new Date('2026-04-02'),
      
      compliance_status: 'Warning',
      export_license_required: true,
      mapa_approval: false,
      vigiagro_status: 'Not Required',
      
      ai_generated: true,
      ai_confidence_score: 87.3,
      ai_risk_score: 32.1,
      ai_missing_fields: ['packing_list', 'certificate_origin'],
      ai_suggestions: [
        {
          field: 'export_license',
          suggestion: 'Solicitar licença de exportação',
          confidence: 0.98,
          reason: 'Minério requer licença específica'
        }
      ],
      ai_auto_fill_enabled: true,
      ai_document_generation: true,
      ai_compliance_check: true,
      
      siscomex_status: 'Not Sent',
      
      created_at: new Date('2026-04-02'),
      created_by: 'ai_system',
      created_by_name: 'Sistema IA',
      updated_at: new Date('2026-04-08'),
      updated_by: 'user_002',
      updated_by_name: 'Maria Santos',
      
      is_urgent: false,
      days_until_etd: 17,
      completion_percentage: 65
    },
    {
      export_id: 'exp_003',
      export_number: 'EXP-2026-0003',
      contract_id: 'cnt_003',
      contract_number: 'CNT-2026-0003',
      exporter_id: 'exp_comp_003',
      exporter_name: 'Café do Brasil Export',
      importer_name: 'Coffee Roasters Inc',
      importer_country: 'United States',
      destination_country: 'United States',
      
      product_id: 'prod_003',
      product_name: 'Café Verde em Grão',
      ncm_code: '09011100',
      quantity: 300,
      unit: 'MT',
      packaging_type: 'Bag',
      
      incoterm: 'FOB',
      currency: 'USD',
      unit_price: 4250.00,
      total_value: 1275000.00,
      payment_method: 'L/C',
      payment_terms: 'LC at sight',
      
      shipment_id: 'ship_003',
      shipment_number: 'SHIP-2026-0003',
      port_origin: 'Santos, SP',
      port_destination: 'Miami, USA',
      transport_mode: 'Marítimo',
      etd: new Date('2026-04-20'),
      eta: new Date('2026-05-05'),
      
      due_number: 'DUE26040003',
      invoice_number: 'INV-2026-0003',
      packing_list: 'PL-2026-0003',
      certificate_origin: 'CO-2026-0003',
      phytosanitary_certificate: 'FITO-2026-0003',
      
      export_status: 'Approved',
      export_date: new Date('2026-03-28'),
      
      compliance_status: 'OK',
      export_license_required: false,
      mapa_approval: true,
      vigiagro_status: 'Approved',
      
      ai_generated: false,
      ai_confidence_score: 96.8,
      ai_risk_score: 8.5,
      ai_missing_fields: [],
      ai_suggestions: [],
      ai_auto_fill_enabled: true,
      ai_document_generation: true,
      ai_compliance_check: true,
      
      siscomex_status: 'Approved',
      siscomex_sent_date: new Date('2026-03-30'),
      siscomex_response: 'DU-E aprovada',
      
      created_at: new Date('2026-03-28'),
      created_by: 'user_003',
      created_by_name: 'Pedro Costa',
      updated_at: new Date('2026-04-05'),
      updated_by: 'user_003',
      updated_by_name: 'Pedro Costa',
      
      is_urgent: true,
      days_until_etd: 12,
      completion_percentage: 100
    }
  ];

  // Dashboard metrics mock
  private dashboardData: ExportacaoDashboard = {
    totalExportacoes: 156,
    totalValue: 89450000.00,
    exportacoesPendentes: 23,
    exportacoesAprovadas: 45,
    exportacoesEmAndamento: 67,
    exportacoesCompletas: 18,
    exportacoesBloqueadas: 3,
    aiAutomationRate: 87.5,
    complianceScore: 94.2,
    averageProcessingTime: 5.3,
    topDestinationCountries: [
      { country: 'United States', count: 45, totalValue: 25600000, percentage: 28.6 },
      { country: 'Germany', count: 32, totalValue: 18900000, percentage: 21.1 },
      { country: 'China', count: 28, totalValue: 22100000, percentage: 24.7 },
      { country: 'Netherlands', count: 21, totalValue: 12850000, percentage: 14.4 },
      { country: 'Japan', count: 18, totalValue: 10000000, percentage: 11.2 }
    ],
    topProducts: [
      { product: 'Soja em Grão', count: 42, totalQuantity: 245000, totalValue: 35600000, percentage: 39.8 },
      { product: 'Minério de Ferro', count: 28, totalQuantity: 890000, totalValue: 28900000, percentage: 32.3 },
      { product: 'Café Verde', count: 35, totalQuantity: 12500, totalValue: 15200000, percentage: 17.0 },
      { product: 'Açúcar Cristal', count: 22, totalQuantity: 78000, totalValue: 9750000, percentage: 10.9 }
    ],
    riskAlerts: [
      {
        id: 'alrt_001',
        export_id: 'exp_002',
        export_number: 'EXP-2026-0002',
        type: 'compliance',
        severity: 'medium',
        message: 'Licença de exportação pendente',
        details: 'Minério de ferro requer licença específica do DNPM',
        created_at: new Date('2026-04-08'),
        resolved: false
      },
      {
        id: 'alrt_002',
        export_id: 'exp_003',
        export_number: 'EXP-2026-0003',
        type: 'deadline',
        severity: 'high',
        message: 'ETD em 12 dias - preparar documentos',
        details: 'Embarque confirmado para 20/04/2026',
        created_at: new Date('2026-04-08'),
        resolved: false
      }
    ],
    siscomexIntegrationHealth: 98.5
  };

  constructor() { }

  // ================================
  // MÉTODOS PRINCIPAIS DE CRUD
  // ================================

  getExportacoes(filters?: ExportacaoFilterOptions): Observable<Exportacao[]> {
    let filteredData = [...this.exportacoes];
    
    if (filters) {
      if (filters.export_status) {
        filteredData = filteredData.filter(exp => exp.export_status === filters.export_status);
      }
      if (filters.compliance_status) {
        filteredData = filteredData.filter(exp => exp.compliance_status === filters.compliance_status);
      }
      if (filters.destination_country) {
        filteredData = filteredData.filter(exp => 
          exp.destination_country.toLowerCase().includes(filters.destination_country!.toLowerCase())
        );
      }
      if (filters.product_name) {
        filteredData = filteredData.filter(exp => 
          exp.product_name.toLowerCase().includes(filters.product_name!.toLowerCase())
        );
      }
      if (filters.importer_name) {
        filteredData = filteredData.filter(exp => 
          exp.importer_name.toLowerCase().includes(filters.importer_name!.toLowerCase())
        );
      }
    }
    
    return of(filteredData).pipe(delay(800));
  }

  getExportacaoById(id: string): Observable<Exportacao | null> {
    const exportacao = this.exportacoes.find(exp => exp.export_id === id);
    return of(exportacao || null).pipe(delay(500));
  }

  createExportacao(exportacao: Partial<Exportacao>): Observable<Exportacao> {
    const newExportacao: Exportacao = {
      export_id: `exp_${Date.now()}`,
      export_number: `EXP-2026-${String(this.exportacoes.length + 1).padStart(4, '0')}`,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'current_user',
      created_by_name: 'Usuário Atual',
      updated_by: 'current_user',
      updated_by_name: 'Usuário Atual',
      ai_generated: false,
      ai_confidence_score: 0,
      ai_risk_score: 0,
      ai_auto_fill_enabled: true,
      ai_document_generation: true,
      ai_compliance_check: true,
      export_license_required: false,
      mapa_approval: false,
      completion_percentage: 25,
      ...exportacao
    } as Exportacao;
    
    this.exportacoes.push(newExportacao);
    return of(newExportacao).pipe(delay(1000));
  }

  updateExportacao(id: string, exportacao: Partial<Exportacao>): Observable<Exportacao> {
    const index = this.exportacoes.findIndex(exp => exp.export_id === id);
    if (index === -1) {
      return throwError(() => new Error('Exportação não encontrada'));
    }
    
    this.exportacoes[index] = {
      ...this.exportacoes[index],
      ...exportacao,
      updated_at: new Date(),
      updated_by: 'current_user',
      updated_by_name: 'Usuário Atual'
    };
    
    return of(this.exportacoes[index]).pipe(delay(1000));
  }

  deleteExportacao(id: string): Observable<boolean> {
    const index = this.exportacoes.findIndex(exp => exp.export_id === id);
    if (index === -1) {
      return of(false);
    }
    
    this.exportacoes.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  // ================================
  // MÉTODOS DE DASHBOARD E DETALHES
  // ================================

  getDashboardData(): Observable<ExportacaoDashboard> {
    return of(this.dashboardData).pipe(delay(800));
  }

  getExportacaoDetails(exportId: string): Observable<any> {
    console.log('Obtendo detalhes da exportação:', exportId);
    return this.getExportacaoById(exportId);
  }

  // ================================
  // MÉTODOS DE INTELIGÊNCIA ARTIFICIAL E AUTOMAÇÃO
  // ================================

  createExportacaoByNLP(text: string): Observable<Exportacao> {
    console.log('Processando comando:', text);
    
    const aiGeneratedExportacao: Partial<Exportacao> = {
      export_status: 'Draft',
      ai_generated: true,
      ai_confidence_score: 85.0,
      ai_risk_score: 25.0,
      product_name: 'Produto identificado por IA',
      quantity: 1000,
      unit: 'MT',
      destination_country: 'País identificado por IA',
      ai_suggestions: [
        {
          field: 'product_verification',
          suggestion: 'Verificar dados do produto extraídos do texto',
          confidence: 0.85,
          reason: 'Texto pode conter informações incompletas'
        }
      ]
    };
    
    return this.createExportacao(aiGeneratedExportacao);
  }

  processOCRDocument(file: File): Observable<Exportacao> {
    console.log('Processando OCR do arquivo:', file.name);
    
    const ocrGeneratedExportacao: Partial<Exportacao> = {
      export_status: 'Draft',
      ai_generated: true,
      ai_confidence_score: 92.0,
      ai_risk_score: 18.0,
      invoice_number: 'INV-OCR-001',
      product_name: 'Produto extraído via OCR',
      quantity: 2500,
      unit: 'MT',
      total_value: 1250000,
      currency: 'USD',
      ai_suggestions: [
        {
          field: 'ocr_verification',
          suggestion: 'Verificar dados extraídos do documento',
          confidence: 0.92,
          reason: 'OCR pode ter erros de leitura'
        }
      ]
    };
    
    return this.createExportacao(ocrGeneratedExportacao).pipe(delay(2000));
  }

  generateExportWithAI(basicData: any): Observable<Exportacao> {
    console.log('Gerando exportação com IA:', basicData);
    const aiGeneratedExport: Partial<Exportacao> = {
      ...basicData,
      ai_generated: true,
      ai_confidence_score: 88.5,
      ai_risk_score: 12.3,
      export_status: 'Draft',
      completion_percentage: 45
    };
    return this.createExportacao(aiGeneratedExport);
  }

  getMasterData(): Observable<any> {
    console.log('Carregando dados mestres');
    const masterData = {
      countries: ['Brasil', 'Estados Unidos', 'Alemanha', 'China', 'Japão'],
      currencies: ['USD', 'EUR', 'BRL', 'CNY', 'JPY'],
      incoterms: ['FOB', 'CIF', 'CFR', 'EXW', 'DDP'],
      paymentTerms: ['30 days', '60 days', '90 days', 'At sight'],
      packagingTypes: ['Bulk', 'Bag', 'Container', 'Pallet'],
      transportModes: ['Marítimo', 'Aéreo', 'Terrestre'],
      ports: ['Santos', 'Paranaguá', 'Rio Grande', 'Vitória']
    };
    return of(masterData).pipe(delay(500));
  }

  getAISuggestions(formData: any): Observable<any[]> {
    console.log('Obtendo sugestões da IA para:', formData);
    const suggestions = [
      { field: 'product_name', suggestion: 'Soja em Grão Premium', confidence: 0.95 },
      { field: 'unit_price', suggestion: 450.00, confidence: 0.87 },
      { field: 'incoterm', suggestion: 'FOB', confidence: 0.92 }
    ];
    return of(suggestions).pipe(delay(1000));
  }

  getAIResponse(query: string): Observable<{message: string, suggestions?: AISuggestion[]}> {
    console.log('Obtendo resposta da IA para:', query);
    
    const mockResponse = {
      message: 'Com base na sua consulta, identifiquei que você pode otimizar os custos escolhendo o porto de Paranaguá em vez de Santos, resultando em economia de aproximadamente 8%. Posso ajudar a reconfigurar a rota automaticamente.',
      suggestions: [
        {
          field: 'port_origin',
          suggestion: 'Alterar porto de origem para Paranaguá',
          confidence: 0.87,
          reason: 'Menor custo portuário e melhor disponibilidade'
        }
      ]
    };
    
    return of(mockResponse).pipe(delay(1500));
  }

  runAIAnalysis(exportId: string): Observable<any> {
    console.log('Executando análise IA para:', exportId);
    
    const mockAnalysis = {
      risk_score: Math.floor(Math.random() * 100),
      compliance_score: Math.floor(Math.random() * 100),
      optimization_suggestions: [
        'Considerar troca de porto para reduzir custos',
        'Agrupar embarques para otimizar container'
      ],
      predicted_delays: Math.floor(Math.random() * 5),
      cost_analysis: {
        current_cost: 25000,
        optimized_cost: 22500,
        savings: 2500
      }
    };
    
    return of(mockAnalysis).pipe(delay(2000));
  }

  processAIQuery(query: string, contextExportId?: string): Observable<AIAssistantMessage[]> {
    console.log('Processando consulta IA:', query, 'Contexto:', contextExportId);
    
    const mockResponse: AIAssistantMessage[] = [
      {
        id: 'msg_user',
        type: 'user',
        message: query,
        timestamp: new Date()
      },
      {
        id: 'msg_ai',
        type: 'assistant',
        message: 'Baseado na análise da exportação, identifiquei que faltam os seguintes documentos: certificado de origem e packing list. Recomendo gerar estes documentos automaticamente.',
        timestamp: new Date(),
        suggestions: [
          {
            field: 'certificate_origin',
            suggestion: 'Gerar certificado de origem automaticamente',
            confidence: 0.95,
            reason: 'Dados completos disponíveis'
          }
        ]
      }
    ];
    
    return of(mockResponse).pipe(delay(1200));
  }

  // ================================
  // MÉTODOS DE VALIDAÇÃO E COMPLIANCE
  // ================================

  validateExportacao(exportId: string): Observable<{valid: boolean, errors: string[]}> {
    console.log('Validando exportação:', exportId);
    
    const mockValidation = {
      valid: Math.random() > 0.3,
      errors: Math.random() > 0.5 ? [] : [
        'NCM code não encontrado',
        'Valor unitário inconsistente'
      ]
    };
    
    return of(mockValidation).pipe(delay(1000));
  }

  validateCompliance(exportId: string): Observable<{valid: boolean, errors: string[], warnings: string[]}> {
    console.log('Validando compliance para exportação:', exportId);
    
    const mockCompliance = {
      valid: Math.random() > 0.2,
      errors: Math.random() > 0.7 ? [] : [
        'Certificado fitossanitário expirado',
        'Valor FOB inconsistente'
      ],
      warnings: Math.random() > 0.5 ? [] : [
        'Porto de destino com restrições temporárias',
        'Moeda de pagamento volátil'
      ]
    };
    
    return of(mockCompliance).pipe(delay(1000));
  }

  // ================================
  // MÉTODOS DE DOCUMENTOS
  // ================================

  generateDocuments(exportId: string): Observable<boolean> {
    console.log('Gerando documentos para exportação:', exportId);
    return of(true).pipe(delay(1500));
  }

  regenerateDocument(exportId: string, documentId: string): Observable<ExportacaoDocumento> {
    console.log('Regenerando documento:', documentId, 'para exportação:', exportId);
    
    const mockDocument: ExportacaoDocumento = {
      document_id: documentId,
      document_type: 'Invoice',
      document_number: `DOC-${Date.now()}`,
      document_name: `Document-${documentId}`,
      file_url: '/documents/regenerated-document.pdf',
      generated_at: new Date(),
      status: 'Generated',
      ai_generated: true
    };
    
    return of(mockDocument).pipe(delay(1500));
  }

  // ================================
  // MÉTODOS DE INTEGRAÇÃO SISCOMEX
  // ================================

  sendToSiscomex(exportId: string): Observable<SiscomexIntegration> {
    console.log('Enviando para Siscomex:', exportId);
    
    const mockResponse: SiscomexIntegration = {
      due_number: `DUE26${String(Date.now()).slice(-6)}`,
      status: Math.random() > 0.2 ? 'approved' : 'processing',
      sent_date: new Date(),
      response_date: new Date(),
      response_message: 'DU-E processada com sucesso',
      validation_errors: []
    };
    
    return of(mockResponse).pipe(delay(2000));
  }

  checkSiscomexStatus(dueNumber: string): Observable<SiscomexIntegration> {
    console.log('Verificando status no Siscomex:', dueNumber);
    
    const mockStatus: SiscomexIntegration = {
      due_number: dueNumber,
      status: 'approved',
      sent_date: new Date(Date.now() - 86400000), // 1 dia atrás
      response_date: new Date(),
      response_message: 'DU-E aprovada automaticamente'
    };
    
    return of(mockStatus).pipe(delay(1000));
  }

  // ================================
  // MÉTODOS UTILITÁRIOS
  // ================================

  getCountries(): Observable<string[]> {
    const countries = [
      'United States', 'Germany', 'China', 'Netherlands', 'Japan',
      'France', 'United Kingdom', 'Italy', 'Spain', 'Belgium',
      'Canada', 'Argentina', 'Chile', 'Mexico', 'India'
    ];
    return of(countries);
  }

  getProducts(): Observable<{id: string, name: string, ncm: string}[]> {
    const products = [
      { id: 'prod_001', name: 'Soja em Grão', ncm: '12019000' },
      { id: 'prod_002', name: 'Minério de Ferro', ncm: '26011100' },
      { id: 'prod_003', name: 'Café Verde em Grão', ncm: '09011100' },
      { id: 'prod_004', name: 'Açúcar Cristal', ncm: '17019900' },
      { id: 'prod_005', name: 'Milho em Grão', ncm: '10059000' },
      { id: 'prod_006', name: 'Carne Bovina Congelada', ncm: '02023000' },
      { id: 'prod_007', name: 'Suco de Laranja', ncm: '20091100' }
    ];
    return of(products);
  }

  getPorts(): Observable<{origin: string[], destination: string[]}> {
    const ports = {
      origin: [
        'Santos, SP', 'Paranaguá, PR', 'Rio Grande, RS', 
        'Vitória, ES', 'Itaguaí, RJ', 'São Francisco do Sul, SC'
      ],
      destination: [
        'New Orleans, USA', 'Hamburg, Germany', 'Shanghai, China',
        'Rotterdam, Netherlands', 'Tokyo, Japan', 'Antwerp, Belgium'
      ]
    };
    return of(ports);
  }
}