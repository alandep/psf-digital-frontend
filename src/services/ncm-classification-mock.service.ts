import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { 
  NCMClassification,
  NCMAIAnalysis,
  NCMValidation,
  NCMClassificationFilters,
  NCMClassificationStats,
  NCMClassificationHistory,
  AIClassificationRequest,
  AIClassificationResponse,
  NCMSuggestion,
  CommodityType,
  ComplianceStatus,
  ClassificationSource,
  ClassificationStatus
} from '../types/ncm-classification';

@Injectable({
  providedIn: 'root'
})
export class NCMClassificationMockService {
  
  private classifications: NCMClassification[] = [
    {
      // SOJA EM GRÃO
      classification_id: 'ncm_001',
      product_id: 'prod_001',
      product_name: 'Soja em Grão Premium',
      product_code: 'SOJA_PREM_001',
      product_description: 'Soja em grão premium para exportação, livre de transgênicos',
      scientific_name: 'Glycine max',
      commodity_type: 'GRAO',
      origin_country: 'Brasil',
      
      ncm_code: '1201.90.00',
      ncm_description: 'Soja, mesmo triturada, exceto para semeadura',
      hs_code: '1201',
      hs_description: 'Soja, mesmo triturada',
      ncm_chapter: '12',
      ncm_heading: '1201',
      ncm_subheading: '120190',
      ncm_item: '12019000',
      ncm_full_code: '1201900000',
      common_ncm_examples: 'Soja em grão, farelo de soja',
      
      export_tax: 0.0,
      export_license_required: false,
      export_license_type: 'NONE',
      lpco_required: false,
      lpco_type: undefined,
      requires_inspection: true,
      inspection_agency: 'MAPA',
      export_restriction: false,
      restriction_description: undefined,
      
      ai_suggested_ncm: '1201.90.00',
      ai_alternative_ncm_codes: ['1201.10.00', '2304.00.00'],
      ai_confidence_score: 98.5,
      ai_classification_reason: 'Classificação baseada em descrição "soja em grão" e características do produto',
      ai_data_sources: ['Receita Federal', 'Siscomex', 'MAPA', 'Base IA Interna'],
      ai_last_analysis_date: new Date('2024-02-20T10:30:00'),
      ai_auto_classification_enabled: true,
      ai_requires_human_review: false,
      ai_classification_status: 'APPROVED',
      
      compliance_status: 'VALID',
      classification_source: 'IA',
      last_validated_at: new Date('2024-02-20T14:15:00'),
      status: 'ACTIVE',
      
      version: 3,
      created_by: 'user_001',
      created_at: new Date('2024-02-15T09:00:00'),
      updated_by: 'user_001',
      updated_at: new Date('2024-02-20T10:30:00'),
      approved_by: 'supervisor_001',
      approved_at: new Date('2024-02-20T11:00:00'),
      approval_status: 'APPROVED'
    },
    {
      // MILHO EM GRÃO
      classification_id: 'ncm_002',
      product_id: 'prod_002',
      product_name: 'Milho Amarelo #2',
      product_code: 'MILHO_AM_002',
      product_description: 'Milho amarelo grão tipo 2 para exportação',
      scientific_name: 'Zea mays',
      commodity_type: 'GRAO',
      origin_country: 'Brasil',
      
      ncm_code: '1005.90.11',
      ncm_description: 'Milho em grão, exceto milho doce',
      hs_code: '1005',
      hs_description: 'Milho',
      ncm_chapter: '10',
      ncm_heading: '1005',
      ncm_subheading: '100590',
      ncm_item: '10059011',
      ncm_full_code: '1005901100',
      common_ncm_examples: 'Milho em grão, milho para ração',
      
      export_tax: 0.0,
      export_license_required: false,
      export_license_type: 'NONE',
      lpco_required: true,
      lpco_type: 'MAPA',
      requires_inspection: true,
      inspection_agency: 'MAPA',
      export_restriction: false,
      restriction_description: undefined,
      
      ai_suggested_ncm: '1005.90.11',
      ai_alternative_ncm_codes: ['1005.90.19', '1005.10.00'],
      ai_confidence_score: 95.2,
      ai_classification_reason: 'Milho amarelo grão tipo 2 corresponde ao NCM específico',
      ai_data_sources: ['Receita Federal', 'MAPA', 'Base Commodities'],
      ai_last_analysis_date: new Date('2024-02-19T15:45:00'),
      ai_auto_classification_enabled: true,
      ai_requires_human_review: false,
      ai_classification_status: 'APPROVED',
      
      compliance_status: 'VALID',
      classification_source: 'IA',
      last_validated_at: new Date('2024-02-19T16:00:00'),
      status: 'ACTIVE',
      
      version: 2,
      created_by: 'user_002',
      created_at: new Date('2024-02-18T14:30:00'),
      updated_by: 'user_002',
      updated_at: new Date('2024-02-19T15:45:00'),
      approved_by: 'supervisor_001',
      approved_at: new Date('2024-02-19T16:30:00'),
      approval_status: 'APPROVED'
    },
    {
      // AÇÚCAR VHP
      classification_id: 'ncm_003',
      product_id: 'prod_003',
      product_name: 'Açúcar Cristal VHP',
      product_code: 'ACUCAR_VHP_001',
      product_description: 'Açúcar cristal VHP (Very High Polarization) para exportação',
      scientific_name: 'Saccharum officinarum',
      commodity_type: 'PROCESSADO',
      origin_country: 'Brasil',
      
      ncm_code: '1701.14.00',
      ncm_description: 'Açúcar de cana, cristal',
      hs_code: '1701',
      hs_description: 'Açúcar de cana',
      ncm_chapter: '17',
      ncm_heading: '1701',
      ncm_subheading: '170114',
      ncm_item: '17011400',
      ncm_full_code: '1701140000',
      common_ncm_examples: 'Açúcar cristal, açúcar VHP, açúcar branco',
      
      export_tax: 0.0,
      export_license_required: false,
      export_license_type: 'NONE',
      lpco_required: false,
      lpco_type: undefined,
      requires_inspection: true,
      inspection_agency: 'SGS',
      export_restriction: false,
      restriction_description: undefined,
      
      ai_suggested_ncm: '1701.14.00',
      ai_alternative_ncm_codes: ['1701.13.00', '1701.99.00'],
      ai_confidence_score: 92.8,
      ai_classification_reason: 'Açúcar cristal VHP classificado corretamente no subitem específico',
      ai_data_sources: ['Receita Federal', 'INMETRO', 'UNICA'],
      ai_last_analysis_date: new Date('2024-02-21T08:20:00'),
      ai_auto_classification_enabled: true,
      ai_requires_human_review: true,
      ai_classification_status: 'REVIEW_REQUIRED',
      
      compliance_status: 'WARNING',
      classification_source: 'IA',
      last_validated_at: new Date('2024-02-21T09:00:00'),
      status: 'REVIEW',
      
      version: 1,
      created_by: 'user_003',
      created_at: new Date('2024-02-21T08:00:00'),
      updated_by: undefined,
      updated_at: undefined,
      approved_by: undefined,
      approved_at: undefined,
      approval_status: 'PENDING'
    },
    {
      // CAFÉ ARÁBICA
      classification_id: 'ncm_004',
      product_id: 'prod_004',
      product_name: 'Café Arábica Santos',
      product_code: 'CAFE_ARAB_001',
      product_description: 'Café arábica em grão cru, tipo Santos, para exportação',
      scientific_name: 'Coffea arabica',
      commodity_type: 'GRAO',
      origin_country: 'Brasil',
      
      ncm_code: '0901.11.10',
      ncm_description: 'Café não torrado, não descafeinado',
      hs_code: '0901',
      hs_description: 'Café, mesmo torrado ou descafeinado',
      ncm_chapter: '09',
      ncm_heading: '0901',
      ncm_subheading: '090111',
      ncm_item: '09011110',
      ncm_full_code: '0901111000',
      common_ncm_examples: 'Café em grão cru, café verde, café arábica',
      
      export_tax: 0.0,
      export_license_required: false,
      export_license_type: 'NONE',
      lpco_required: false,
      lpco_type: undefined,
      requires_inspection: true,
      inspection_agency: 'MAPA',
      export_restriction: false,
      restriction_description: undefined,
      
      ai_suggested_ncm: '0901.11.10',
      ai_alternative_ncm_codes: ['0901.11.90', '0901.12.00'],
      ai_confidence_score: 96.7,
      ai_classification_reason: 'Café arábica em grão cru claramente identificado',
      ai_data_sources: ['Receita Federal', 'MAPA', 'CECAFE', 'Base Café'],
      ai_last_analysis_date: new Date('2024-02-22T11:15:00'),
      ai_auto_classification_enabled: true,
      ai_requires_human_review: false,
      ai_classification_status: 'APPROVED',
      
      compliance_status: 'VALID',
      classification_source: 'MANUAL',
      last_validated_at: new Date('2024-02-22T12:00:00'),
      status: 'ACTIVE',
      
      version: 4,
      created_by: 'user_004',
      created_at: new Date('2024-02-10T16:20:00'),
      updated_by: 'user_004',
      updated_at: new Date('2024-02-22T11:15:00'),
      approved_by: 'supervisor_002',
      approved_at: new Date('2024-02-22T13:30:00'),
      approval_status: 'APPROVED'
    },
    {
      // ALGODÃO EM PLUMA - Com problemas para teste
      classification_id: 'ncm_005',
      product_id: 'prod_005',
      product_name: 'Algodão em Pluma',
      product_code: 'ALGODAO_PLU_001',
      product_description: 'Algodão em pluma não cardado nem penteado',
      scientific_name: 'Gossypium hirsutum',
      commodity_type: 'FIBRA',
      origin_country: 'Brasil',
      
      ncm_code: '5201.00.90', // NCM problemático para teste
      ncm_description: 'Algodão não cardado nem penteado',
      hs_code: '5201',
      hs_description: 'Algodão, não cardado nem penteado',
      ncm_chapter: '52',
      ncm_heading: '5201',
      ncm_subheading: '520100',
      ncm_item: '52010090',
      ncm_full_code: '5201009000',
      common_ncm_examples: 'Algodão em pluma, fibra de algodão',
      
      export_tax: 0.0,
      export_license_required: true,
      export_license_type: 'MAPA',
      lpco_required: true,
      lpco_type: 'MAPA',
      requires_inspection: true,
      inspection_agency: 'MAPA',
      export_restriction: true,
      restriction_description: 'Controle especial de qualidade e origem',
      
      ai_suggested_ncm: '5201.00.20', // IA sugere NCM diferente
      ai_alternative_ncm_codes: ['5201.00.20', '5201.00.10'],
      ai_confidence_score: 75.3, // Confiança baixa
      ai_classification_reason: 'Discrepância detectada entre classificação manual e sugestão IA',
      ai_data_sources: ['Receita Federal', 'ABRAPA', 'Base Têxtil'],
      ai_last_analysis_date: new Date('2024-02-23T09:45:00'),
      ai_auto_classification_enabled: true,
      ai_requires_human_review: true,
      ai_classification_status: 'REVIEW_REQUIRED',
      
      compliance_status: 'INVALID', // Status inválido para teste
      classification_source: 'MANUAL',
      last_validated_at: new Date('2024-02-23T10:00:00'),
      status: 'REVIEW',
      
      version: 1,
      created_by: 'user_005',
      created_at: new Date('2024-02-23T09:00:00'),
      updated_by: undefined,
      updated_at: undefined,
      approved_by: undefined,
      approved_at: undefined,
      approval_status: 'PENDING'
    }
  ];

  // ========== MÉTODOS PÚBLICOS ==========

  public getClassifications(filters?: NCMClassificationFilters): Observable<NCMClassification[]> {
    console.log('📋 Buscando classificações NCM:', filters);
    
    let results = [...this.classifications];

    if (filters) {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        results = results.filter(c => 
          c.product_name.toLowerCase().includes(searchTerm) ||
          c.product_code.toLowerCase().includes(searchTerm) ||
          c.ncm_code.includes(searchTerm) ||
          c.ncm_description.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.commodity_types?.length) {
        results = results.filter(c => filters.commodity_types!.includes(c.commodity_type));
      }

      if (filters.compliance_status?.length) {
        results = results.filter(c => filters.compliance_status!.includes(c.compliance_status));
      }

      if (filters.classification_source?.length) {
        results = results.filter(c => filters.classification_source!.includes(c.classification_source));
      }

      if (filters.status?.length) {
        results = results.filter(c => filters.status!.includes(c.status));
      }

      if (filters.ai_confidence_min !== undefined) {
        results = results.filter(c => c.ai_confidence_score >= filters.ai_confidence_min!);
      }

      if (filters.ai_confidence_max !== undefined) {
        results = results.filter(c => c.ai_confidence_score <= filters.ai_confidence_max!);
      }

      if (filters.requires_license !== undefined) {
        results = results.filter(c => c.export_license_required === filters.requires_license);
      }

      if (filters.has_restrictions !== undefined) {
        results = results.filter(c => c.export_restriction === filters.has_restrictions);
      }
    }

    return of(results).pipe(delay(800));
  }

  public getClassificationById(classificationId: string): Observable<NCMClassification> {
    console.log('📋 Buscando classificação NCM por ID:', classificationId);
    
    const classification = this.classifications.find(c => c.classification_id === classificationId);
    
    if (classification) {
      return of(classification).pipe(delay(500));
    } else {
      return throwError(() => new Error(`Classificação ${classificationId} não encontrada`));
    }
  }

  public createClassification(classification: Omit<NCMClassification, 'classification_id' | 'created_at' | 'updated_at' | 'version'>): Observable<NCMClassification> {
    console.log('➕ Criando nova classificação NCM:', classification);
    
    const newClassification: NCMClassification = {
      ...classification,
      classification_id: this.generateClassificationId(),
      created_at: new Date(),
      updated_at: new Date(),
      version: 1
    };
    
    this.classifications.unshift(newClassification);
    console.log('✅ Classificação NCM criada:', newClassification);
    
    return of(newClassification).pipe(delay(1000));
  }

  public updateClassification(classificationId: string, updates: Partial<NCMClassification>): Observable<NCMClassification> {
    console.log('📝 Atualizando classificação NCM:', classificationId, updates);
    
    const index = this.classifications.findIndex(c => c.classification_id === classificationId);
    
    if (index === -1) {
      return throwError(() => new Error(`Classificação ${classificationId} não encontrada`));
    }
    
    const currentClassification = this.classifications[index];
    const updatedClassification: NCMClassification = {
      ...currentClassification,
      ...updates,
      updated_at: new Date(),
      version: currentClassification.version + 1
    };
    
    this.classifications[index] = updatedClassification;
    console.log('✅ Classificação NCM atualizada:', updatedClassification);
    
    return of(updatedClassification).pipe(delay(800));
  }

  public deleteClassification(classificationId: string): Observable<void> {
    console.log('🗑️ Excluindo classificação NCM:', classificationId);
    
    const index = this.classifications.findIndex(c => c.classification_id === classificationId);
    
    if (index === -1) {
      return throwError(() => new Error(`Classificação ${classificationId} não encontrada`));
    }
    
    this.classifications.splice(index, 1);
    console.log('✅ Classificação NCM excluída');
    
    return of(void 0).pipe(delay(600));
  }

  // ========== MÉTODOS DE IA ==========

  public classifyWithAI(request: AIClassificationRequest): Observable<AIClassificationResponse> {
    console.log('🤖 Classificando com IA:', request);
    
    // Simular análise de IA baseada na descrição
    const response = this.simulateAIClassification(request);
    
    return of(response).pipe(delay(2000)); // Simular tempo de processamento
  }

  public validateNCMWithReceita(ncmCode: string): Observable<NCMValidation> {
    console.log('🏛️ Validando NCM com Receita Federal:', ncmCode);
    
    const validation = this.simulateReceitaValidation(ncmCode);
    
    return of(validation).pipe(delay(1500));
  }

  public getStatistics(): Observable<NCMClassificationStats> {
    console.log('📊 Calculando estatísticas NCM');
    
    const stats: NCMClassificationStats = {
      total_classifications: this.classifications.length,
      active_classifications: this.classifications.filter(c => c.status === 'ACTIVE').length,
      pending_review: this.classifications.filter(c => c.status === 'REVIEW').length,
      ai_generated: this.classifications.filter(c => c.classification_source === 'IA').length,
      manual_classifications: this.classifications.filter(c => c.classification_source === 'MANUAL').length,
      compliance_valid: this.classifications.filter(c => c.compliance_status === 'VALID').length,
      compliance_warnings: this.classifications.filter(c => c.compliance_status === 'WARNING').length,
      compliance_errors: this.classifications.filter(c => c.compliance_status === 'INVALID').length,
      avg_ai_confidence: this.classifications.reduce((sum, c) => sum + c.ai_confidence_score, 0) / this.classifications.length,
      with_license: this.classifications.filter(c => c.export_license_required).length,
      recent_validations: this.classifications.filter(c => 
        c.last_validated_at && 
        (new Date().getTime() - c.last_validated_at.getTime()) < 24 * 60 * 60 * 1000
      ).length
    };
    
    return of(stats).pipe(delay(500));
  }

  public getClassificationHistory(classificationId: string): Observable<NCMClassificationHistory[]> {
    console.log('📜 Buscando histórico da classificação:', classificationId);
    
    // Simular histórico
    const history: NCMClassificationHistory[] = [
      {
        history_id: 'hist_001',
        classification_id: classificationId,
        action: 'CREATED',
        old_values: null,
        new_values: { status: 'PENDING' },
        user_id: 'user_001',
        user_name: 'João Silva',
        timestamp: new Date('2024-02-20T09:00:00'),
        ip_address: '192.168.1.100'
      },
      {
        history_id: 'hist_002',
        classification_id: classificationId,
        action: 'AI_CLASSIFICATION',
        old_values: { ncm_code: null },
        new_values: { ncm_code: '1201.90.00', ai_confidence_score: 98.5 },
        user_id: 'system_ai',
        user_name: 'Sistema IA',
        timestamp: new Date('2024-02-20T09:15:00'),
        ip_address: 'system'
      },
      {
        history_id: 'hist_003',
        classification_id: classificationId,
        action: 'APPROVED',
        old_values: { status: 'PENDING' },
        new_values: { status: 'ACTIVE' },
        user_id: 'supervisor_001',
        user_name: 'Maria Santos',
        timestamp: new Date('2024-02-20T11:00:00'),
        ip_address: '192.168.1.101'
      }
    ];
    
    return of(history).pipe(delay(600));
  }

  // ========== MÉTODOS AUXILIARES ==========

  private generateClassificationId(): string {
    return 'ncm_' + Math.random().toString(36).substr(2, 9);
  }

  private simulateAIClassification(request: AIClassificationRequest): AIClassificationResponse {
    const description = request.product_description.toLowerCase();
    
    let primarySuggestion: NCMSuggestion;
    let alternatives: NCMSuggestion[] = [];
    let confidence: number;
    let reason: string;

    if (description.includes('soja')) {
      primarySuggestion = {
        ncm_code: '1201.90.00',
        ncm_description: 'Soja, mesmo triturada, exceto para semeadura',
        hs_code: '1201',
        confidence: 98.5,
        reason: 'Produto claramente identificado como soja em grão'
      };
      alternatives = [
        {
          ncm_code: '1201.10.00',
          ncm_description: 'Soja para semeadura',
          hs_code: '1201',
          confidence: 75.0,
          reason: 'Alternativa se for soja para plantio'
        },
        {
          ncm_code: '2304.00.00',
          ncm_description: 'Farelo de soja',
          hs_code: '2304',
          confidence: 65.0,
          reason: 'Se for farelo e não grão inteiro'
        }
      ];
      confidence = 98.5;
      reason = 'Descrição "soja em grão" corresponde exatamente ao NCM 1201.90.00';
    } else if (description.includes('milho')) {
      primarySuggestion = {
        ncm_code: '1005.90.11',
        ncm_description: 'Milho em grão',
        hs_code: '1005',
        confidence: 95.2,
        reason: 'Milho em grão para consumo'
      };
      alternatives = [
        {
          ncm_code: '1005.90.19',
          ncm_description: 'Outros tipos de milho',
          hs_code: '1005',
          confidence: 80.0,
          reason: 'Outros tipos de milho não especificados'
        }
      ];
      confidence = 95.2;
      reason = 'Milho em grão identificado corretamente';
    } else if (description.includes('café')) {
      primarySuggestion = {
        ncm_code: '0901.11.10',
        ncm_description: 'Café não torrado, não descafeinado',
        hs_code: '0901',
        confidence: 96.7,
        reason: 'Café em grão cru para exportação'
      };
      alternatives = [
        {
          ncm_code: '0901.12.00',
          ncm_description: 'Café descafeinado',
          hs_code: '0901',
          confidence: 70.0,
          reason: 'Se for café descafeinado'
        }
      ];
      confidence = 96.7;
      reason = 'Café identificado como grão cru não torrado';
    } else {
      // Sugestão genérica
      primarySuggestion = {
        ncm_code: '9999.99.99',
        ncm_description: 'Produto não identificado automaticamente',
        hs_code: '9999',
        confidence: 45.0,
        reason: 'Descrição não corresponde a produtos conhecidos'
      };
      confidence = 45.0;
      reason = 'Produto não identificado automaticamente. Requer classificação manual.';
    }

    return {
      primary_suggestion: primarySuggestion,
      alternative_suggestions: alternatives,
      confidence_score: confidence,
      classification_reason: reason,
      risk_assessment: {
        risk_level: confidence >= 90 ? 'LOW' : confidence >= 70 ? 'MEDIUM' : 'HIGH',
        risk_factors: confidence < 70 ? ['Baixa confiança na classificação', 'Pode necessitar revisão manual'] : [],
        recommendations: confidence < 90 ? ['Revisar classificação com especialista', 'Validar com Receita Federal'] : ['Classificação aprovada automaticamente']
      },
      data_sources: ['Base IA Interna', 'Receita Federal', 'Siscomex', 'Histórico de Classificações'],
      processing_time_ms: Math.floor(Math.random() * 2000) + 500
    };
  }

  private simulateReceitaValidation(ncmCode: string): NCMValidation {
    // Base de NCMs conhecidos
    const knownNCMs: { [key: string]: NCMValidation } = {
      '1201.90.00': {
        ncm_code: '1201.90.00',
        is_valid: true,
        official_description: 'Soja, mesmo triturada, exceto para semeadura',
        export_tax: 0.0,
        requires_license: false,
        last_updated: new Date('2024-02-01T00:00:00'),
        source: 'RECEITA_FEDERAL'
      },
      '1005.90.11': {
        ncm_code: '1005.90.11',
        is_valid: true,
        official_description: 'Milho em grão, exceto milho doce',
        export_tax: 0.0,
        requires_license: false,
        last_updated: new Date('2024-02-01T00:00:00'),
        source: 'RECEITA_FEDERAL'
      },
      '0901.11.10': {
        ncm_code: '0901.11.10',
        is_valid: true,
        official_description: 'Café não torrado, não descafeinado',
        export_tax: 0.0,
        requires_license: false,
        last_updated: new Date('2024-02-01T00:00:00'),
        source: 'RECEITA_FEDERAL'
      }
    };

    return knownNCMs[ncmCode] || {
      ncm_code: ncmCode,
      is_valid: false,
      official_description: 'NCM não encontrado na base da Receita Federal',
      export_tax: 0.0,
      requires_license: false,
      last_updated: new Date(),
      source: 'RECEITA_FEDERAL'
    };
  }
}