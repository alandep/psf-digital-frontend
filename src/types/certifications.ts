// ===============================
// 🏆 TIPOS PARA CERTIFICAÇÕES DE PRODUTOS EIP
// Sistema inteligente de compliance internacional
// ===============================

// === ENUMS ===
export type CertificationType = 
  | 'SANITARIO' 
  | 'FITOSSANITARIO' 
  | 'ORIGEM' 
  | 'QUALIDADE' 
  | 'HALAL' 
  | 'KOSHER' 
  | 'ORGANICO' 
  | 'NON_GMO' 
  | 'BRC' 
  | 'SIF' 
  | 'HACCP';

export type CertificationCategory = 
  | 'SANITARIO' 
  | 'ORIGEM' 
  | 'LOGISTICO' 
  | 'COMERCIAL';

export type CertificationStatus = 
  | 'VALID' 
  | 'EXPIRED' 
  | 'PENDING' 
  | 'INVALID' 
  | 'EXPIRING_SOON';

export type ComplianceStatus = 
  | 'OK' 
  | 'WARNING' 
  | 'ERROR' 
  | 'PENDING_VALIDATION';

export type RestrictionType = 
  | 'PROHIBITION' 
  | 'QUOTA' 
  | 'TARIFF' 
  | 'SEASONAL' 
  | 'PHYTOSANITARY' 
  | 'LABELING' 
  | 'DOCUMENTATION';

export type AIConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// === INTERFACES PRINCIPAIS ===

export interface CertificationData {
  // Identificação
  certification_id: string;
  product_id: string;
  product_name: string;
  certification_type: CertificationType;
  certification_category: CertificationCategory;
  description?: string;

  // Dados do Certificado
  certification_number: string;
  issuing_authority: string;
  issuing_country: string;
  issue_date: Date;
  expiry_date?: Date;
  certificate_file_url?: string;
  digital_signature: boolean;

  // Status e Compliance
  certification_status: CertificationStatus;
  compliance_status: ComplianceStatus;
  
  // Integração com Exportação
  linked_export_id?: string;
  export_id?: string;
  shipment_id?: string;
  due_number?: string;
  auto_attach_to_export: boolean;

  // IA e Automação
  ai_generated: boolean;
  ai_confidence_score: number;
  ai_document_extracted: boolean;
  ai_missing_fields?: string[];
  ai_compliance_check: boolean;
  ai_suggested_certifications?: AISuggestion[];
  ai_risk_score: number;
  ai_alerts?: AIAlert[];
  ai_risk_level?: AIRiskLevel;

  // Auditoria
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  last_validated_at?: Date;
}

export interface CountryCompliance {
  id: string;
  certification_id: string;
  destination_country: string;
  country_code: string;
  mandatory: boolean;
  regulatory_requirement?: string;
  issuing_agency_required?: string;
  compliance_status: ComplianceStatus;
  restriction_type?: RestrictionType;
  restriction_description?: string;
  effective_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AIAlert {
  id: string;
  certification_id: string;
  alert_type: 'EXPIRY_WARNING' | 'MISSING_DOCUMENT' | 'COMPLIANCE_ISSUE' | 'REGULATORY_CHANGE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  suggested_action?: string;
  created_at: Date;
  resolved: boolean;
  resolved_at?: Date;
}

export interface AISuggestion {
  id: string;
  certification_type: CertificationType;
  reason: string;
  confidence_score: number;
  required_for_countries: string[];
  issuing_authorities: string[];
  estimated_processing_time_days: number;
  cost_estimate?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DocumentOCR {
  id: string;
  certification_id: string;
  file_url: string;
  extracted_data: {
    certification_number?: string;
    issuing_authority?: string;
    issue_date?: string;
    expiry_date?: string;
    product_name?: string;
    destination_country?: string;
  };
  confidence_score: number;
  processing_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  extraction_errors?: string[];
  created_at: Date;
}

export interface CertificationTemplate {
  id: string;
  certification_type: CertificationType;
  country_code: string;
  template_name: string;
  required_fields: string[];
  optional_fields: string[];
  validation_rules: ValidationRule[];
  typical_processing_time_days: number;
  cost_range_usd?: {
    min: number;
    max: number;
  };
  issuing_authorities: string[];
  renewal_notification_days: number[];
}

export interface ValidationRule {
  field_name: string;
  rule_type: 'REQUIRED' | 'FORMAT' | 'DATE_RANGE' | 'NUMERIC_RANGE' | 'REGEX';
  rule_value?: any;
  error_message: string;
}

export interface CertificationMetrics {
  total_certifications: number;
  valid_certifications: number;
  expired_certifications: number;
  expiring_soon_certifications: number;
  pending_certifications: number;
  invalid_certifications: number;
  compliance_rate: number;
  ai_accuracy_rate: number;
  ai_predictions_count: number;
  compliance_ok_count: number;
  countries_covered_count: number;
  compliance_score: number;
  average_processing_time_days: number;
  cost_savings_usd: number;
  error_reduction_percentage: number;
}

export interface CertificationFilters {
  product_id?: string;
  certification_type?: CertificationType;
  certification_category?: CertificationCategory;
  certification_status?: CertificationStatus;
  compliance_status?: ComplianceStatus;
  destination_country?: string;
  issuing_authority?: string;
  date_range?: {
    start: Date;
    end: Date;
  };
  expiry_date_range?: {
    start: Date;
    end: Date;
  };
  ai_risk_level?: AIRiskLevel;
  search_text?: string;
}

export interface ComplianceCheck {
  product_id: string;
  destination_country: string;
  required_certifications: RequiredCertification[];
  existing_certifications: CertificationData[];
  missing_certifications: RequiredCertification[];
  compliance_status: ComplianceStatus;
  risk_assessment: RiskAssessment;
  recommendations: ComplianceRecommendation[];
}

export interface RequiredCertification {
  certification_type: CertificationType;
  mandatory: boolean;
  issuing_authority: string;
  typical_validity_days: number;
  processing_time_days: number;
  estimated_cost_usd?: number;
  regulatory_reference: string;
}

export interface RiskAssessment {
  overall_risk: AIRiskLevel;
  risk_factors: RiskFactor[];
  mitigation_strategies: string[];
  estimated_delay_days?: number;
  financial_impact_usd?: number;
}

export interface RiskFactor {
  factor: string;
  impact: AIRiskLevel;
  description: string;
  likelihood_percentage: number;
}

export interface ComplianceRecommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  description: string;
  estimated_time_to_complete_days: number;
  cost_estimate_usd?: number;
  deadline?: Date;
}

// === INTERFACES DE FORMULÁRIO ===
export interface CertificationFormData {
  // ABA 1 - Identificação
  identification: {
    certification_id?: string;
    product_id: string;
    product_name: string;
    certification_type: CertificationType;
    certification_category: CertificationCategory;
    description?: string;
  };

  // ABA 2 - Dados do Certificado
  certificate_data: {
    certification_number: string;
    issuing_authority: string;
    issuing_country: string;
    issue_date: Date;
    expiry_date?: Date;
    certificate_file_url?: string;
    digital_signature: boolean;
  };

  // ABA 3 - Compliance por País
  country_compliance: CountryCompliance[];

  // ABA 4 - Integração com Exportação
  export_integration: {
    export_id?: string;
    shipment_id?: string;
    due_number?: string;
    auto_attach_to_export: boolean;
  };

  // ABA 5 - IA & Automação
  ai_automation: {
    ai_generated: boolean;
    ai_confidence_score?: number;
    ai_document_extracted: boolean;
    ai_missing_fields?: string[];
    ai_compliance_check: boolean;
    ai_suggested_certifications?: AISuggestion[];
    ai_risk_score?: number;
    ai_alerts?: AIAlert[];
  };
}

export interface CertificationSearchResult {
  certifications: CertificationData[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  filters_applied: CertificationFilters;
  metrics: CertificationMetrics;
}