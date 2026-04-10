// Tipos principais para sistema de templates de contratos
export interface ContractTemplate {
  template_id?: string;
  template_name: string;
  template_code: string;
  description: string;
  contract_type: ContractType;
  commodity: Commodity;
  commodity_grade?: string;
  organization_standard?: OrganizationStandard;
  version: number;
  active: boolean;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
  
  // Dados do exportador (pré-configurado)
  exporter_id: string;
  exporter_name: string;
  exporter_country: string;
  exporter_tax_id: string;
  
  // Dados do importador (padrão)
  default_importer_name?: string;
  importer_country?: string;
  importer_region?: string;
  importer_type?: ImporterType;
  
  // Termos comerciais
  incoterm: Incoterm;
  incoterm_version: IncotermVersion;
  port_origin: string;
  port_destination: string;
  shipment_type: ShipmentType;
  
  // Dados financeiros
  currency: Currency;
  price_type: PriceType;
  default_price?: number;
  price_unit: PriceUnit;
  payment_terms: PaymentTerms;
  payment_method: PaymentMethod;
  payment_days?: number;
  
  // Quantidade e logística
  quantity_min: number;
  quantity_max: number;
  quantity_unit: QuantityUnit;
  tolerance_percent?: number;
  shipment_period_start?: number;
  shipment_period_end?: number;
  partial_shipment_allowed: boolean;
  transshipment_allowed: boolean;
  
  // Cláusulas contratuais
  contract_text_template: string;
  quality_specification?: string;
  inspection_standard?: InspectionStandard;
  arbitration_clause: ArbitrationClause;
  force_majeure_clause: string;
  
  // Variáveis do template
  variables: TemplateVariable[];
  
  // Configuração de IA
  ai_config: AIConfig;
}

export interface TemplateVariable {
  variable_name: string;
  variable_type: VariableType;
  description: string;
  default_value?: string;
  required: boolean;
}

export interface AIConfig {
  ai_enabled: boolean;
  ai_auto_fill: boolean;
  ai_risk_analysis: boolean;
  ai_suggest_incoterm: boolean;
  ai_generate_contract_text: boolean;
  ai_compliance_check: boolean;
}

export interface TemplateFilters {
  search?: string;
  contract_type?: ContractType[];
  commodity?: Commodity[];
  organization_standard?: OrganizationStandard[];
  currency?: Currency[];
  incoterm?: Incoterm[];
  active?: boolean | null;
  created_by?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface TemplateFilterOptions {
  commodities: { value: Commodity; label: string }[];
  countries: { code: string; name: string }[];
  ports: { code: string; name: string; country: string }[];
  exporters: { id: string; name: string }[];
  currencies: { code: Currency; symbol: string; name: string }[];
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ContractGenerationRequest {
  template_id: string;
  variables: Record<string, any>;
  generate_pdf: boolean;
  include_attachments: boolean;
}

export interface ContractGenerationResult {
  success: boolean;
  contract_id?: string;
  pdf_url?: string;
  docx_url?: string;
  errors?: string[];
}

// ============== ENUMS ==============

export type ContractType = 'Export' | 'Import' | 'Domestic';
export type Commodity = 
  | 'Soja' 
  | 'Milho' 
  | 'Farelo de Soja' 
  | 'Óleo de Soja'
  | 'Trigo' 
  | 'Algodão'
  | 'Açúcar'
  | 'Café'
  | 'Arroz'
  | 'Sorgo';

export type OrganizationStandard = 'GAFTA' | 'FOSFA' | 'ANEC' | 'ICC' | 'Custom';
export type ImporterType = 'Trader' | 'FeedMill' | 'Crusher' | 'Government' | 'Broker';
export type Incoterm = 'FOB' | 'CIF' | 'CFR' | 'DAP' | 'EXW' | 'DDP' | 'CPT';
export type IncotermVersion = 'Incoterms 2010' | 'Incoterms 2020';
export type ShipmentType = 'Bulk' | 'Container' | 'Mixed';
export type Currency = 'USD' | 'EUR' | 'BRL' | 'CNY' | 'GBP' | 'JPY';
export type PriceType = 'Fixed' | 'Futures Based' | 'Basis' | 'Market Price';
export type PriceUnit = 'USD/MT' | 'USD/Bushel' | 'EUR/MT' | 'BRL/SC';
export type PaymentTerms = 
  | 'Cash Against Documents'
  | 'Letter of Credit'
  | 'Advance Payment'
  | 'Open Account'
  | 'Collection';

export type PaymentMethod = 'Wire Transfer' | 'Letter of Credit' | 'Cash Against Documents' | 'Advance Payment';
export type QuantityUnit = 'MT' | 'Bushel' | 'Ton' | 'KG';
export type InspectionStandard = 'SGS' | 'Intertek' | 'Cotecna' | 'Bureau Veritas' | 'Internal';
export type ArbitrationClause = 'GAFTA' | 'FOSFA' | 'ICC' | 'LCIA' | 'Custom';
export type VariableType = 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'select';

// Label mappings
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  'Export': 'Exportação',
  'Import': 'Importação', 
  'Domestic': 'Doméstico'
};

export const COMMODITY_LABELS: Record<Commodity, string> = {
  'Soja': 'Soja',
  'Milho': 'Milho',
  'Farelo de Soja': 'Farelo de Soja',
  'Óleo de Soja': 'Óleo de Soja',
  'Trigo': 'Trigo',
  'Algodão': 'Algodão',
  'Açúcar': 'Açúcar',
  'Café': 'Café',
  'Arroz': 'Arroz',
  'Sorgo': 'Sorgo'
};

export const ORGANIZATION_STANDARD_LABELS: Record<OrganizationStandard, string> = {
  'GAFTA': 'GAFTA (Grain and Feed Trade Association)',
  'FOSFA': 'FOSFA (Federation of Oils, Seeds and Fats Associations)',
  'ANEC': 'ANEC (Associação Nacional dos Exportadores de Cereais)',
  'ICC': 'ICC (International Chamber of Commerce)',
  'Custom': 'Personalizado'
};

export const INCOTERM_LABELS: Record<Incoterm, string> = {
  'FOB': 'FOB - Free on Board',
  'CIF': 'CIF - Cost, Insurance and Freight',
  'CFR': 'CFR - Cost and Freight', 
  'DAP': 'DAP - Delivered at Place',
  'EXW': 'EXW - Ex Works',
  'DDP': 'DDP - Delivered Duty Paid',
  'CPT': 'CPT - Carriage Paid To'
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  'USD': 'US Dollar (USD)',
  'EUR': 'Euro (EUR)',
  'BRL': 'Real Brasileiro (BRL)',
  'CNY': 'Yuan Chinês (CNY)',
  'GBP': 'Libra Esterlina (GBP)',
  'JPY': 'Iene Japonês (JPY)'
};

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  'Cash Against Documents': 'Pagamento Contra Documentos',
  'Letter of Credit': 'Carta de Crédito',
  'Advance Payment': 'Pagamento Antecipado',
  'Open Account': 'Conta Aberta',
  'Collection': 'Cobrança Documentária'
};

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  'Fixed': 'Preço Fixo',
  'Futures Based': 'Baseado em Futuros',
  'Basis': 'Base',
  'Market Price': 'Preço de Mercado'
};

export const INSPECTION_STANDARD_LABELS: Record<InspectionStandard, string> = {
  'SGS': 'SGS - Société Générale de Surveillance',
  'Intertek': 'Intertek Group',
  'Cotecna': 'Cotecna Inspection',
  'Bureau Veritas': 'Bureau Veritas',
  'Internal': 'Inspeção Interna'
};

// Constantes de validação
export const VALIDATION_CONSTANTS = {
  TEMPLATE_NAME_MIN_LENGTH: 3,
  TEMPLATE_NAME_MAX_LENGTH: 150,
  TEMPLATE_CODE_MIN_LENGTH: 3,
  TEMPLATE_CODE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  CONTRACT_TEXT_MAX_LENGTH: 50000,
  QUANTITY_MIN: 0.001,
  QUANTITY_MAX: 999999999,
  TOLERANCE_MIN: 0,
  TOLERANCE_MAX: 100,
  PAYMENT_DAYS_MIN: 0,
  PAYMENT_DAYS_MAX: 365
};