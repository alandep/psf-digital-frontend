// ===============================
// 🏷️ TIPOS PARA CLASSIFICAÇÃO NCM EIP
// Classificação automática com IA e Receita Federal
// ===============================

// === ENUMS ===
export type CommodityType = 'GRAO' | 'FARELO' | 'OLEO' | 'FIBRA' | 'ANIMAL' | 'PROCESSADO';
export type ComplianceStatus = 'VALID' | 'WARNING' | 'INVALID';
export type ClassificationSource = 'MANUAL' | 'RECEITA' | 'IA' | 'IMPORTACAO';
export type ClassificationStatus = 'ACTIVE' | 'PENDING' | 'REVIEW' | 'APPROVED' | 'REJECTED';
export type ExportLicenseType = 'MAPA' | 'ANVISA' | 'IBAMA' | 'INMETRO' | 'ANEEL' | 'NONE';
export type InspectionAgency = 'MAPA' | 'SGS' | 'INTERTEK' | 'COTECNA' | 'BUREAU_VERITAS';
export type AIClassificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// === INTERFACE PRINCIPAL ===
export interface NCMClassification {
  classification_id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  product_description: string;
  scientific_name?: string;
  commodity_type: CommodityType;
  origin_country: string;

  // Classificação Fiscal
  ncm_code: string;
  ncm_description: string;
  hs_code: string;
  hs_description?: string;
  ncm_chapter?: string;
  ncm_heading?: string;
  ncm_subheading?: string;
  ncm_item?: string;
  ncm_full_code: string;
  common_ncm_examples?: string;

  // Compliance Exportação
  export_tax: number;
  export_license_required: boolean;
  export_license_type?: ExportLicenseType;
  lpco_required: boolean;
  lpco_type?: string;
  requires_inspection: boolean;
  inspection_agency?: InspectionAgency;
  export_restriction: boolean;
  restriction_description?: string;

  // IA e Automação
  ai_suggested_ncm?: string;
  ai_alternative_ncm_codes?: string[];
  ai_confidence_score: number;
  ai_classification_reason?: string;
  ai_data_sources?: string[];
  ai_last_analysis_date?: Date;
  ai_auto_classification_enabled: boolean;
  ai_requires_human_review: boolean;
  ai_classification_status: AIClassificationStatus;

  // Controle e Status
  compliance_status: ComplianceStatus;
  classification_source: ClassificationSource;
  last_validated_at?: Date;
  status: ClassificationStatus;

  // Auditoria
  version: number;
  created_by: string;
  created_at: Date;
  updated_by?: string;
  updated_at?: Date;
  approved_by?: string;
  approved_at?: Date;
  approval_status: ApprovalStatus;
}

// === INTERFACE PARA ANÁLISE IA ===
export interface NCMAIAnalysis {
  analysis_id: string;
  classification_id: string;
  ai_suggested_ncm: string;
  confidence_score: number;
  analysis_date: Date;
  alternative_suggestions: NCMSuggestion[];
  risk_factors: string[];
  validation_sources: string[];
}

export interface NCMSuggestion {
  ncm_code: string;
  ncm_description: string;
  hs_code: string;
  confidence: number;
  reason: string;
}

// === INTERFACE PARA VALIDAÇÃO RECEITA FEDERAL ===
export interface NCMValidation {
  ncm_code: string;
  is_valid: boolean;
  official_description: string;
  export_tax: number;
  requires_license: boolean;
  last_updated: Date;
  source: 'RECEITA_FEDERAL' | 'SISCOMEX';
}

// === FILTROS ===
export interface NCMClassificationFilters {
  search?: string;
  commodity_types?: CommodityType[];
  compliance_status?: ComplianceStatus[];
  classification_source?: ClassificationSource[];
  status?: ClassificationStatus[];
  ai_confidence_min?: number;
  ai_confidence_max?: number;
  requires_license?: boolean;
  has_restrictions?: boolean;
  origin_countries?: string[];
  created_date_from?: Date;
  created_date_to?: Date;
}

// === ESTATÍSTICAS ===
export interface NCMClassificationStats {
  total_classifications: number;
  active_classifications: number;
  pending_review: number;
  ai_generated: number;
  manual_classifications: number;
  compliance_valid: number;
  compliance_warnings: number;
  compliance_errors: number;
  avg_ai_confidence: number;
  with_license: number;
  recent_validations: number;
}

// === HISTÓRICO ===
export interface NCMClassificationHistory {
  history_id: string;
  classification_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  user_id: string;
  user_name: string;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}

// === REQUEST/RESPONSE IA ===
export interface AIClassificationRequest {
  product_description: string;
  product_name?: string;
  scientific_name?: string;
  commodity_type?: CommodityType;
  origin_country?: string;
  additional_info?: string;
}

export interface AIClassificationResponse {
  primary_suggestion: NCMSuggestion;
  alternative_suggestions: NCMSuggestion[];
  confidence_score: number;
  classification_reason: string;
  risk_assessment: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    risk_factors: string[];
    recommendations: string[];
  };
  data_sources: string[];
  processing_time_ms: number;
}

// === LABELS PARA UI ===
export const COMMODITY_TYPE_LABELS_NCM = {
  'GRAO': '🌾 Grão',
  'FARELO': '🥜 Farelo',
  'OLEO': '🛢️ Óleo',
  'FIBRA': '🧵 Fibra',
  'ANIMAL': '🐄 Animal',
  'PROCESSADO': '⚙️ Processado'
} as const;

export const COMPLIANCE_STATUS_LABELS = {
  'VALID': '✅ Válido',
  'WARNING': '⚠️ Atenção',
  'INVALID': '❌ Inválido'
} as const;

export const CLASSIFICATION_SOURCE_LABELS = {
  'MANUAL': '👤 Manual',
  'RECEITA': '🏛️ Receita Federal',
  'IA': '🤖 Inteligência Artificial',
  'IMPORTACAO': '📥 Importação'
} as const;

export const STATUS_LABELS = {
  'ACTIVE': '✅ Ativo',
  'PENDING': '⏳ Pendente',
  'REVIEW': '👁️ Em Revisão',
  'APPROVED': '✅ Aprovado',
  'REJECTED': '❌ Rejeitado'
} as const;

export const EXPORT_LICENSE_LABELS = {
  'MAPA': '🌾 MAPA',
  'ANVISA': '💊 ANVISA',
  'IBAMA': '🌿 IBAMA',
  'INMETRO': '⚖️ INMETRO',
  'ANEEL': '⚡ ANEEL',
  'NONE': '🚫 Não requer'
} as const;

export const INSPECTION_AGENCY_LABELS = {
  'MAPA': '🌾 MAPA',
  'SGS': '🔍 SGS',
  'INTERTEK': '🔬 INTERTEK',
  'COTECNA': '⚖️ COTECNA',
  'BUREAU_VERITAS': '📋 Bureau Veritas'
} as const;