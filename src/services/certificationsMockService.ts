import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import {
  CertificationData,
  CertificationFilters,
  CertificationSearchResult,
  CertificationFormData,
  CountryCompliance,
  AIAlert,
  AISuggestion,
  DocumentOCR,
  CertificationTemplate,
  CertificationMetrics,
  ComplianceCheck,
  RequiredCertification,
  RiskAssessment,
  ComplianceRecommendation,
  CertificationType,
  CertificationCategory,
  CertificationStatus,
  ComplianceStatus,
  AIRiskLevel,
  RestrictionType
} from '../types/certifications';

@Injectable({
  providedIn: 'root'
})
export class CertificationsMockService {
  
  private certifications: CertificationData[] = [
    {
      certification_id: 'cert-001',
      product_id: 'prod-soja-001',
      product_name: 'Soja em Grão',
      certification_type: 'FITOSSANITARIO',
      certification_category: 'SANITARIO',
      description: 'Certificado Fitossanitário para exportação de soja',
      certification_number: 'FS-BR-2024-001234',
      issuing_authority: 'MAPA - Ministério da Agricultura',
      issuing_country: 'Brasil',
      issue_date: new Date('2024-01-15'),
      expiry_date: new Date('2024-07-15'),
      certificate_file_url: '/documents/fs-br-2024-001234.pdf',
      digital_signature: true,
      certification_status: 'VALID',
      compliance_status: 'OK',
      linked_export_id: 'exp-001',
      auto_attach_to_export: true,
      ai_generated: false,
      ai_confidence_score: 0.95,
      ai_document_extracted: true,
      ai_missing_fields: [],
      ai_compliance_check: true,
      ai_risk_score: 0.15,
      ai_risk_level: 'LOW',
      created_at: new Date('2024-01-10'),
      created_by: 'user-001',
      updated_at: new Date('2024-01-15'),
      updated_by: 'user-001',
      last_validated_at: new Date('2024-01-15')
    },
    {
      certification_id: 'cert-002',
      product_id: 'prod-milho-001',
      product_name: 'Milho em Grão',
      certification_type: 'ORIGEM',
      certification_category: 'COMERCIAL',
      description: 'Certificado de Origem para exportação de milho',
      certification_number: 'CO-BR-2024-005678',
      issuing_authority: 'FIESP - Federação das Indústrias',
      issuing_country: 'Brasil',
      issue_date: new Date('2024-02-01'),
      expiry_date: new Date('2024-08-01'),
      certificate_file_url: '/documents/co-br-2024-005678.pdf',
      digital_signature: true,
      certification_status: 'VALID',
      compliance_status: 'OK',
      auto_attach_to_export: true,
      ai_generated: true,
      ai_confidence_score: 0.88,
      ai_document_extracted: true,
      ai_missing_fields: [],
      ai_compliance_check: true,
      ai_risk_score: 0.25,
      ai_risk_level: 'LOW',
      created_at: new Date('2024-01-28'),
      created_by: 'ai-system',
      updated_at: new Date('2024-02-01'),
      updated_by: 'user-002',
      last_validated_at: new Date('2024-02-01')
    },
    {
      certification_id: 'cert-003',
      product_id: 'prod-cafe-001',
      product_name: 'Café Arabica',
      certification_type: 'ORGANICO',
      certification_category: 'COMERCIAL',
      description: 'Certificado Orgânico para café de exportação',
      certification_number: 'ORG-BR-2024-009876',
      issuing_authority: 'IBD Certificações',
      issuing_country: 'Brasil',
      issue_date: new Date('2024-01-20'),
      expiry_date: new Date('2025-01-20'),
      certificate_file_url: '/documents/org-br-2024-009876.pdf',
      digital_signature: true,
      certification_status: 'VALID',
      compliance_status: 'OK',
      auto_attach_to_export: false,
      ai_generated: false,
      ai_confidence_score: 0.92,
      ai_document_extracted: false,
      ai_missing_fields: [],
      ai_compliance_check: true,
      ai_risk_score: 0.10,
      ai_risk_level: 'LOW',
      created_at: new Date('2024-01-18'),
      created_by: 'user-003',
      updated_at: new Date('2024-01-20'),
      updated_by: 'user-003',
      last_validated_at: new Date('2024-01-20')
    },
    {
      certification_id: 'cert-004',
      product_id: 'prod-carne-001',
      product_name: 'Carne Bovina Congelada',
      certification_type: 'SIF',
      certification_category: 'SANITARIO',
      description: 'Certificado SIF para frigorífico',
      certification_number: 'SIF-BR-2024-004321',
      issuing_authority: 'MAPA - SIF',
      issuing_country: 'Brasil',
      issue_date: new Date('2024-03-01'),
      expiry_date: new Date('2024-09-01'),
      certificate_file_url: '/documents/sif-br-2024-004321.pdf',
      digital_signature: true,
      certification_status: 'EXPIRING_SOON',
      compliance_status: 'WARNING',
      auto_attach_to_export: true,
      ai_generated: false,
      ai_confidence_score: 0.85,
      ai_document_extracted: true,
      ai_missing_fields: ['destination_country'],
      ai_compliance_check: true,
      ai_risk_score: 0.45,
      ai_risk_level: 'MEDIUM',
      created_at: new Date('2024-02-25'),
      created_by: 'user-004',
      updated_at: new Date('2024-03-01'),
      updated_by: 'user-004',
      last_validated_at: new Date('2024-03-15')
    },
    {
      certification_id: 'cert-005',
      product_id: 'prod-soja-001',
      product_name: 'Soja em Grão',
      certification_type: 'NON_GMO',
      certification_category: 'COMERCIAL',
      description: 'Certificado Non-GMO para soja',
      certification_number: 'NGO-BR-2024-007777',
      issuing_authority: 'Pro Terra Foundation',
      issuing_country: 'Brasil',
      issue_date: new Date('2024-02-10'),
      expiry_date: new Date('2024-08-10'),
      certificate_file_url: '/documents/ngo-br-2024-007777.pdf',
      digital_signature: false,
      certification_status: 'PENDING',
      compliance_status: 'PENDING_VALIDATION',
      auto_attach_to_export: false,
      ai_generated: true,
      ai_confidence_score: 0.7,
      ai_document_extracted: false,
      ai_missing_fields: ['digital_signature', 'expiry_date'],
      ai_compliance_check: false,
      ai_risk_score: 0.65,
      ai_risk_level: 'MEDIUM',
      created_at: new Date('2024-02-08'),
      created_by: 'ai-system',
      updated_at: new Date('2024-02-10'),
      updated_by: 'ai-system',
      last_validated_at: undefined
    }
  ];

  private aiAlerts: AIAlert[] = [
    {
      id: 'alert-001',
      certification_id: 'cert-004',
      alert_type: 'EXPIRY_WARNING',
      severity: 'MEDIUM',
      title: 'Certificado expirando em breve',
      message: 'O certificado SIF-BR-2024-004321 expira em 30 dias. Renovação necessária.',
      suggested_action: 'Iniciar processo de renovação junto ao MAPA',
      created_at: new Date('2024-03-15'),
      resolved: false
    },
    {
      id: 'alert-002',
      certification_id: 'cert-005',
      alert_type: 'MISSING_DOCUMENT',
      severity: 'HIGH',
      title: 'Documentos faltantes',
      message: 'Certificado Non-GMO pendente de validação. Assinatura digital ausente.',
      suggested_action: 'Solicitar assinatura digital da Pro Terra Foundation',
      created_at: new Date('2024-02-12'),
      resolved: false
    }
  ];

  private suggestions: AISuggestion[] = [
    {
      id: 'sugg-001',
      certification_type: 'FITOSSANITARIO',
      reason: 'Obrigatório para exportação de grãos para China',
      confidence_score: 0.95,
      required_for_countries: ['China', 'Japão', 'Coreia do Sul'],
      issuing_authorities: ['MAPA', 'Vigiagro'],
      estimated_processing_time_days: 15,
      cost_estimate: 1500,
      priority: 'HIGH'
    },
    {
      id: 'sugg-002',
      certification_type: 'HALAL',
      reason: 'Recomendado para mercados muçulmanos',
      confidence_score: 0.85,
      required_for_countries: ['Arábia Saudita', 'Emirados Árabes Unidos', 'Malásia'],
      issuing_authorities: ['CDIAL Halal', 'Fambras Halal'],
      estimated_processing_time_days: 30,
      cost_estimate: 2500,
      priority: 'MEDIUM'
    }
  ];

  private countryCompliances: CountryCompliance[] = [
    {
      id: 'cc-001',
      certification_id: 'cert-001',
      destination_country: 'China',
      country_code: 'CN',
      mandatory: true,
      regulatory_requirement: 'Certificado Fitossanitário obrigatório para grãos',
      issuing_agency_required: 'MAPA',
      compliance_status: 'OK',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: 'cc-002',
      certification_id: 'cert-002',
      destination_country: 'Estados Unidos',
      country_code: 'US',
      mandatory: true,
      regulatory_requirement: 'Certificado de Origem para produtos agrícolas',
      issuing_agency_required: 'FIESP ou Câmara de Comércio',
      compliance_status: 'OK',
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-01')
    }
  ];

  // Métodos principais do serviço

  getCertifications(filters?: CertificationFilters): Observable<CertificationSearchResult> {
    let filteredCertifications = [...this.certifications];

    if (filters) {
      if (filters.product_id) {
        filteredCertifications = filteredCertifications.filter(c => 
          c.product_id === filters.product_id
        );
      }
      
      if (filters.certification_type) {
        filteredCertifications = filteredCertifications.filter(c => 
          c.certification_type === filters.certification_type
        );
      }
      
      if (filters.certification_status) {
        filteredCertifications = filteredCertifications.filter(c => 
          c.certification_status === filters.certification_status
        );
      }

      if (filters.compliance_status) {
        filteredCertifications = filteredCertifications.filter(c => 
          c.compliance_status === filters.compliance_status
        );
      }

      if (filters.destination_country) {
        // Busca nas country compliances
        const certIdsForCountry = this.countryCompliances
          .filter(cc => cc.destination_country === filters.destination_country)
          .map(cc => cc.certification_id);
        
        filteredCertifications = filteredCertifications.filter(c => 
          certIdsForCountry.includes(c.certification_id)
        );
      }

      if (filters.search_text) {
        const searchLower = filters.search_text.toLowerCase();
        filteredCertifications = filteredCertifications.filter(c => 
          c.product_name.toLowerCase().includes(searchLower) ||
          c.certification_number.toLowerCase().includes(searchLower) ||
          c.issuing_authority.toLowerCase().includes(searchLower)
        );
      }
    }

    const result: CertificationSearchResult = {
      certifications: filteredCertifications,
      total_count: filteredCertifications.length,
      page: 1,
      page_size: 50,
      total_pages: 1,
      filters_applied: filters || {},
      metrics: this.getMetrics()
    };

    return of(result).pipe(delay(500));
  }

  getCertificationById(id: string): Observable<CertificationData> {
    const certification = this.certifications.find(c => c.certification_id === id);
    
    if (certification) {
      return of(certification).pipe(delay(300));
    } else {
      return throwError(() => new Error('Certificação não encontrada'));
    }
  }

  createCertification(data: CertificationFormData): Observable<CertificationData> {
    const newCertification: CertificationData = {
      certification_id: `cert-${Date.now()}`,
      product_id: data.identification.product_id,
      product_name: data.identification.product_name,
      certification_type: data.identification.certification_type,
      certification_category: data.identification.certification_category,
      description: data.identification.description,
      certification_number: data.certificate_data.certification_number,
      issuing_authority: data.certificate_data.issuing_authority,
      issuing_country: data.certificate_data.issuing_country,
      issue_date: data.certificate_data.issue_date,
      expiry_date: data.certificate_data.expiry_date,
      certificate_file_url: data.certificate_data.certificate_file_url,
      digital_signature: data.certificate_data.digital_signature,
      certification_status: 'VALID',
      compliance_status: 'OK',
      export_id: data.export_integration.export_id,
      shipment_id: data.export_integration.shipment_id,
      due_number: data.export_integration.due_number,
      auto_attach_to_export: data.export_integration.auto_attach_to_export,
      ai_generated: data.ai_automation.ai_generated,
      ai_confidence_score: data.ai_automation.ai_confidence_score || 0,
      ai_document_extracted: data.ai_automation.ai_document_extracted,
      ai_missing_fields: data.ai_automation.ai_missing_fields,
      ai_compliance_check: data.ai_automation.ai_compliance_check,
      ai_suggested_certifications: data.ai_automation.ai_suggested_certifications,
      ai_risk_score: data.ai_automation.ai_risk_score || 0,
      ai_alerts: data.ai_automation.ai_alerts,
      created_at: new Date(),
      created_by: 'current-user',
      updated_at: new Date(),
      updated_by: 'current-user',
      last_validated_at: new Date()
    };

    this.certifications.push(newCertification);
    return of(newCertification).pipe(delay(800));
  }

  updateCertification(id: string, data: Partial<CertificationFormData>): Observable<CertificationData> {
    const index = this.certifications.findIndex(c => c.certification_id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Certificação não encontrada'));
    }

    const updated = {
      ...this.certifications[index],
      updated_at: new Date(),
      updated_by: 'current-user'
    };

    this.certifications[index] = updated;
    return of(updated).pipe(delay(600));
  }

  deleteCertification(id: string): Observable<boolean> {
    const index = this.certifications.findIndex(c => c.certification_id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Certificação não encontrada'));
    }

    this.certifications.splice(index, 1);
    return of(true).pipe(delay(400));
  }

  getAIAlerts(certificationId?: string): Observable<AIAlert[]> {
    let alerts = [...this.aiAlerts];
    
    if (certificationId) {
      alerts = alerts.filter(a => a.certification_id === certificationId);
    }
    
    return of(alerts).pipe(delay(200));
  }

  getAISuggestions(productId: string, destinationCountry?: string): Observable<AISuggestion[]> {
    // Simula sugestões baseadas no produto e país
    return of(this.suggestions).pipe(delay(300));
  }

  processDocumentOCR(file: File): Observable<DocumentOCR> {
    // Simula processamento OCR
    const mockOCR: DocumentOCR = {
      id: `ocr-${Date.now()}`,
      certification_id: '',
      file_url: URL.createObjectURL(file),
      extracted_data: {
        certification_number: 'FS-BR-2024-' + Math.floor(Math.random() * 10000),
        issuing_authority: 'MAPA - Ministério da Agricultura',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        product_name: 'Soja em Grão',
        destination_country: 'China'
      },
      confidence_score: 0.92,
      processing_status: 'COMPLETED',
      created_at: new Date()
    };

    return of(mockOCR).pipe(delay(2000));
  }

  validateCompliance(productId: string, destinationCountry: string): Observable<ComplianceCheck> {
    const mockCheck: ComplianceCheck = {
      product_id: productId,
      destination_country: destinationCountry,
      required_certifications: [
        {
          certification_type: 'FITOSSANITARIO',
          mandatory: true,
          issuing_authority: 'MAPA',
          typical_validity_days: 180,
          processing_time_days: 15,
          estimated_cost_usd: 1500,
          regulatory_reference: 'Instrução Normativa MAPA 01/2024'
        }
      ],
      existing_certifications: this.certifications.filter(c => c.product_id === productId),
      missing_certifications: [],
      compliance_status: 'OK',
      risk_assessment: {
        overall_risk: 'LOW',
        risk_factors: [],
        mitigation_strategies: ['Manter certificados atualizados', 'Monitorar datas de vencimento']
      },
      recommendations: [
        {
          priority: 'MEDIUM',
          action: 'Renovar certificado antes do vencimento',
          description: 'Configure alertas automáticos para renovação',
          estimated_time_to_complete_days: 15
        }
      ]
    };

    return of(mockCheck).pipe(delay(1000));
  }

  getCountryCompliances(certificationId: string): Observable<CountryCompliance[]> {
    const compliances = this.countryCompliances.filter(cc => 
      cc.certification_id === certificationId
    );
    
    return of(compliances).pipe(delay(300));
  }

  getMetrics(): CertificationMetrics {
    const total = this.certifications.length;
    const valid = this.certifications.filter(c => c.certification_status === 'VALID').length;
    const expired = this.certifications.filter(c => c.certification_status === 'EXPIRED').length;
    const expiringSoon = this.certifications.filter(c => c.certification_status === 'EXPIRING_SOON').length;
    const pending = this.certifications.filter(c => c.certification_status === 'PENDING').length;
    
    return {
      total_certifications: total,
      valid_certifications: valid,
      expired_certifications: expired,
      expiring_soon_certifications: expiringSoon,
      pending_certifications: pending,
      invalid_certifications: this.certifications.filter(c => c.certification_status === 'INVALID').length,
      compliance_rate: total > 0 ? (valid / total) * 100 : 0,
      ai_accuracy_rate: 92.5,
      ai_predictions_count: 24,
      compliance_ok_count: this.certifications.filter(c => c.compliance_status === 'OK').length,
      countries_covered_count: 15,
      compliance_score: 94.2,
      average_processing_time_days: 12,
      cost_savings_usd: 45000,
      error_reduction_percentage: 87.3
    };
  }

  // Métodos auxiliares para componentes
  getCertificationTypes(): CertificationType[] {
    return [
      'SANITARIO',
      'FITOSSANITARIO', 
      'ORIGEM',
      'QUALIDADE',
      'HALAL',
      'KOSHER',
      'ORGANICO',
      'NON_GMO',
      'BRC',
      'SIF',
      'HACCP'
    ];
  }

  getIssuingAuthorities(): string[] {
    return [
      'MAPA - Ministério da Agricultura',
      'FIESP - Federação das Indústrias',
      'IBD Certificações',
      'MAPA - SIF',
      'Pro Terra Foundation',
      'Vigiagro',
      'CDIAL Halal',
      'Fambras Halal',
      'Ecocert Brasil',
      'SGS do Brasil'
    ];
  }

  getDestinationCountries(): string[] {
    return [
      'China',
      'Estados Unidos',
      'Argentina',
      'Alemanha',
      'Holanda',
      'Japão',
      'Coreia do Sul',
      'Arábia Saudita',
      'Emirados Árabes Unidos',
      'Malásia',
      'Tailândia',
      'Vietnã',
      'Índia'
    ];
  }
}