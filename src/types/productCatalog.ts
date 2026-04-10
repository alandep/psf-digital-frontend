// ===============================
// 🌾 TIPOS PARA CATÁLOGO DE PRODUTOS EIP
// Exportação de grãos e produtos agropecuários
// ===============================

// === ENUMS ===
export type CommodityType = 'GRAO' | 'FARELO' | 'OLEO' | 'FIBRA' | 'ANIMAL' | 'PROCESSADO';
export type Unit = 'MT' | 'KG' | 'TON' | 'BUSHEL' | 'SACAS' | 'LB';
export type Currency = 'USD' | 'BRL' | 'EUR' | 'CNY' | 'ARS';
export type PackageType = 'BULK' | 'BAG' | 'CONTAINER' | 'GRANEL' | 'EMBALAGEM';
export type StorageType = 'DRY' | 'REFRIGERATED' | 'AMBIENT' | 'CONTROLLED';
export type PriceUnit = 'USD_MT' | 'USD_BUSHEL' | 'BRL_MT' | 'USD_TON' | 'EUR_MT';
export type FuturesExchange = 'CBOT' | 'CME' | 'ICE' | 'EUREX' | 'BM&F';
export type InspectionStandard = 'SGS' | 'INTERTEK' | 'COTECNA' | 'BUREAU_VERITAS' | 'TUV';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BLOCKED';

// === IA E AUTOMAÇÃO ===
export type AIEnrichmentStatus = 'PENDING' | 'COMPLETED' | 'PROCESSING' | 'FAILED';
export type AIConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

// === INTERFACE PRINCIPAL DO PRODUTO ===
export interface Product {
  // Identificação
  product_id: string;
  product_code: string;
  name: string;
  short_name?: string;
  scientific_name?: string;
  description?: string;
  
  // Classificação
  commodity_type: CommodityType;
  origin_country: string;
  
  // Fiscal e Compliance
  ncm_code: string;
  ncm_description?: string;
  hs_code: string;
  export_tax?: number;
  cfop?: string;
  cest?: string;
  requires_export_license: boolean;
  export_license_type?: string;
  
  // Logística
  unit: Unit;
  net_weight: number;
  gross_weight?: number;
  volume_m3?: number;
  package_type: PackageType;
  storage_type: StorageType;
  shelf_life_days?: number;
  
  // Comercial
  standard_price?: number;
  currency: Currency;
  price_unit: PriceUnit;
  minimum_quantity?: number;
  maximum_quantity?: number;
  futures_exchange?: FuturesExchange;
  futures_symbol?: string;
  
  // Qualidade
  quality_specs?: ProductQualitySpecs;
  
  // IA e Automação
  ai_config: ProductAIConfig;
  
  // Sistema
  status: ProductStatus;
  active: boolean;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by?: string;
  deleted_at?: Date;
  
  // Versionamento
  version: number;
  version_notes?: string;
}

// === ESPECIFICAÇÕES DE QUALIDADE ===
export interface ProductQualitySpecs {
  moisture_max?: number;
  foreign_material_max?: number;
  broken_kernels_max?: number;
  protein_min?: number;
  oil_content_min?: number;
  inspection_standard?: InspectionStandard;
  defects_max?: number;
  test_weight_min?: number;
  ash_content_max?: number;
  fiber_content?: number;
  certification_organic?: boolean;
  certification_gmo_free?: boolean;
  additional_specs?: Record<string, any>;
}

// === CONFIGURAÇÃO DE IA ===
export interface ProductAIConfig {
  ai_generated: boolean;
  ai_confidence_score: number;
  ai_last_update?: Date;
  ai_auto_update_enabled: boolean;
  ai_enrichment_status: AIEnrichmentStatus;
  ai_confidence_level: AIConfidenceLevel;
  ai_suggestions?: AISuggestions;
  ai_validation_errors?: string[];
  ai_auto_classify: boolean;
  ai_price_prediction: boolean;
}

// === SUGESTÕES DE IA ===
export interface AISuggestions {
  suggested_ncm?: string;
  suggested_hs_code?: string;
  suggested_classification?: CommodityType;
  suggested_price?: number;
  suggested_unit?: Unit;
  suggested_description?: string;
  suggested_specs?: Partial<ProductQualitySpecs>;
  price_prediction?: PricePrediction;
  market_analysis?: MarketAnalysis;
}

// === PREVISÃO DE PREÇOS ===
export interface PricePrediction {
  predicted_price: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  factors: string[];
  updated_at: Date;
  source: 'CBOT' | 'INTERNAL' | 'MARKET_API';
}

// === ANÁLISE DE MERCADO ===
export interface MarketAnalysis {
  demand_level: 'HIGH' | 'MEDIUM' | 'LOW';
  supply_level: 'HIGH' | 'MEDIUM' | 'LOW';
  seasonality_factor: number;
  competition_level: 'HIGH' | 'MEDIUM' | 'LOW';
  export_opportunities: string[];
  risk_factors: string[];
}

// === VERSIONAMENTO DE PRODUTO ===
export interface ProductVersion {
  version_id: string;
  product_id: string;
  version: number;
  changes_summary: string;
  changed_fields: string[];
  modified_by: string;
  modified_at: Date;
  product_snapshot: Partial<Product>;
}

// === FILTROS DE BUSCA ===
export interface ProductFilters {
  search?: string;
  commodity_types?: CommodityType[];
  currencies?: Currency[];
  status?: ProductStatus[];
  origin_countries?: string[];
  active?: boolean;
  ai_generated?: boolean;
  requires_license?: boolean;
  futures_available?: boolean;
  price_min?: number;
  price_max?: number;
  created_after?: Date;
  created_before?: Date;
}

// === OPÇÕES DE FILTROS ===
export interface ProductFilterOptions {
  commodity_types: CommodityType[];
  currencies: Currency[];
  status_options: ProductStatus[];
  origin_countries: string[];
  futures_exchanges: FuturesExchange[];
  inspection_standards: InspectionStandard[];
  package_types: PackageType[];
  storage_types: StorageType[];
  units: Unit[];
  price_units: PriceUnit[];
}

// === VALIDAÇÃO DE PRODUTO ===
export interface ProductValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  ncm_validation?: NCMValidationResult;
  ai_validation?: AIValidationResult;
}

// === ERROS DE VALIDAÇÃO ===
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

// === AVISOS DE VALIDAÇÃO ===
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
  ai_generated: boolean;
}

// === VALIDAÇÃO NCM ===
export interface NCMValidationResult {
  ncm_valid: boolean;
  ncm_description: string;
  export_tax_rate: number;
  requires_license: boolean;
  last_validated: Date;
  source: 'RECEITA_FEDERAL' | 'CACHE' | 'MANUAL';
}

// === VALIDAÇÃO DE IA ===
export interface AIValidationResult {
  ai_confidence: number;
  classification_correct: boolean;
  suggested_improvements: string[];
  data_quality_score: number;
  enrichment_suggestions: string[];
}

// === REQUEST DE CRIAÇÃO COM IA ===
export interface AIProductCreationRequest {
  user_description: string;
  commodity_hint?: CommodityType;
  origin_country?: string;
  auto_enrich?: boolean;
  use_price_prediction?: boolean;
  validation_level?: 'BASIC' | 'FULL';
}

// === RESPOSTA DE CRIAÇÃO COM IA ===
export interface AIProductCreationResponse {
  product: Partial<Product>;
  confidence_score: number;
  suggestions: AISuggestions;
  validation_result: ProductValidationResult;
  auto_filled_fields: string[];
  requires_user_confirmation: string[];
}

// === BUSCA INTELIGENTE ===
export interface ProductSmartSearchResult {
  products: Product[];
  ai_suggestions: string[];
  similar_terms: string[];
  auto_corrections: Record<string, string>;
  search_analytics: SearchAnalytics;
}

// === ANALYTICS DE BUSCA ===
export interface SearchAnalytics {
  query: string;
  results_count: number;
  search_time_ms: number;
  ai_enhanced: boolean;
  language_detected?: string;
  intent_classification?: 'PRODUCT_NAME' | 'NCM' | 'HS_CODE' | 'SCIENTIFIC_NAME';
}

// === DETECÇÃO DE DUPLICATAS ===
export interface DuplicateDetectionResult {
  has_duplicates: boolean;
  potential_duplicates: DuplicateProduct[];
  similarity_threshold: number;
  ai_analysis: string;
}

// === PRODUTO DUPLICADO ===
export interface DuplicateProduct {
  product: Product;
  similarity_score: number;
  matching_fields: string[];
  differences: string[];
  merge_suggestion?: string;
}

// === ESTATÍSTICAS DO CATÁLOGO ===
export interface CatalogStatistics {
  total_products: number;
  active_products: number;
  ai_generated_products: number;
  products_by_commodity: Record<CommodityType, number>;
  products_by_country: Record<string, number>;
  average_confidence_score: number;
  pending_validations: number;
  recent_additions: number;
  price_coverage: number;
}

// === LABELS PARA UI ===
export const COMMODITY_TYPE_LABELS: Record<CommodityType, string> = {
  GRAO: '🌾 Grãos',
  FARELO: '🥣 Farelo',
  OLEO: '🫒 Óleo',
  FIBRA: '🧵 Fibra',
  ANIMAL: '🐄 Animal',
  PROCESSADO: '🏭 Processado'
};

export const UNIT_LABELS: Record<Unit, string> = {
  MT: 'MT - Tonelada Métrica',
  KG: 'KG - Quilograma',
  TON: 'TON - Tonelada',
  BUSHEL: 'BU - Bushel',
  SACAS: 'SC - Sacas',
  LB: 'LB - Libras'
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: '🇺🇸 USD - Dólar Americano',
  BRL: '🇧🇷 BRL - Real Brasileiro',
  EUR: '🇪🇺 EUR - Euro',
  CNY: '🇨🇳 CNY - Yuan Chinês',
  ARS: '🇦🇷 ARS - Peso Argentino'
};

export const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  BULK: '📦 Granel',
  BAG: '🎒 Sacas',
  CONTAINER: '📦 Container',
  GRANEL: '🚛 Granel',
  EMBALAGEM: '📦 Embalagem'
};

export const STORAGE_TYPE_LABELS: Record<StorageType, string> = {
  DRY: '🌵 Seco',
  REFRIGERATED: '❄️ Refrigerado', 
  AMBIENT: '🌡️ Ambiente',
  CONTROLLED: '🎛️ Controlado'
};

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  USD_MT: 'USD/MT',
  USD_BUSHEL: 'USD/Bushel',
  BRL_MT: 'BRL/MT',
  USD_TON: 'USD/Tonelada',
  EUR_MT: 'EUR/MT'
};

export const FUTURES_EXCHANGE_LABELS: Record<FuturesExchange, string> = {
  CBOT: 'CBOT - Chicago Board of Trade',
  CME: 'CME - Chicago Mercantile Exchange',
  ICE: 'ICE - Intercontinental Exchange',
  EUREX: 'EUREX - European Exchange',
  'BM&F': 'B3 - Brasil Bolsa Balcão'
};

export const INSPECTION_STANDARD_LABELS: Record<InspectionStandard, string> = {
  SGS: 'SGS - Société Générale de Surveillance',
  INTERTEK: 'Intertek',
  COTECNA: 'Cotecna',
  BUREAU_VERITAS: 'Bureau Veritas',
  TUV: 'TÜV'
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: '✅ Ativo',
  INACTIVE: '❌ Inativo',
  PENDING: '⏳ Pendente',
  BLOCKED: '🚫 Bloqueado'
};

export const AI_ENRICHMENT_STATUS_LABELS: Record<AIEnrichmentStatus, string> = {
  PENDING: '⏳ Pendente',
  COMPLETED: '✅ Completo',
  PROCESSING: '🔄 Processando',
  FAILED: '❌ Falhou'
};

// === DADOS MOCK PARA DESENVOLVIMENTO ===
export const MOCK_COUNTRIES = [
  'Brasil', 'Argentina', 'Estados Unidos', 'China', 'Paraguai', 
  'Uruguai', 'Canadá', 'França', 'Austrália', 'Ucrânia'
];

export const MOCK_NCM_CODES = [
  '1201.90.00', '1005.90.11', '1001.99.00', '0901.11.00', 
  '1701.14.00', '5201.00.00', '1006.30.00', '2304.00.00'
];

export const MOCK_HS_CODES = [
  '1201', '1005', '1001', '0901', '1701', '5201', '1006', '2304'
];