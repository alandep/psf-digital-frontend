export interface Exportacao {
  export_id: string;
  export_number: string;
  contract_id: string;
  contract_number?: string;
  exporter_id: string;
  exporter_name: string;
  importer_name: string;
  importer_country: string;
  destination_country: string;
  
  // Produto & Quantidade
  product_id: string;
  product_name: string;
  ncm_code: string;
  quantity: number;
  unit: 'MT' | 'KG' | 'TON';
  packaging_type: 'Bulk' | 'Bag' | 'Container';
  
  // Comercial
  incoterm: 'FOB' | 'CIF' | 'CFR' | 'EXW' | 'DDP' | 'DDU';
  currency: 'USD' | 'EUR' | 'BRL' | 'CNY';
  unit_price: number;
  total_value: number;
  payment_method: 'T/T' | 'L/C' | 'D/P' | 'D/A' | 'O/A';
  payment_terms: string;
  
  // Logística
  shipment_id?: string;
  shipment_number?: string;
  port_origin: string;
  port_destination: string;
  transport_mode: 'Marítimo' | 'Aéreo' | 'Terrestre' | 'Multimodal';
  etd?: Date;
  eta?: Date;
  
  // Documentação
  due_number?: string;
  invoice_number?: string;
  packing_list?: string;
  certificate_origin?: string;
  phytosanitary_certificate?: string;
  
  // Status e Workflow
  export_status: 'Draft' | 'Processing' | 'Approved' | 'Shipped' | 'Completed' | 'Blocked' | 'Cancelled';
  export_date?: Date;
  export_type?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  
  // Informações estendidas do importador
  importer_document?: string;
  importer_address?: string;
  importer_contact?: string;
  
  // Portos com nomes alternativos
  destination_port?: string;
  origin_port?: string;
  
  // Informações financeiras adicionais
  exchange_rate?: number;
  estimated_value?: number;
  
  // Dados do transportador
  carrier_name?: string;
  
  // Arrays de itens e documentos
  items?: ExportacaoItem[];
  documents?: ExportacaoDocumento[];
  
  // Compliance
  compliance_status: 'OK' | 'Warning' | 'Error' | 'Pending';
  export_license_required: boolean;
  mapa_approval: boolean;
  vigiagro_status: 'Pending' | 'Approved' | 'Rejected' | 'Not Required';
  
  // IA & Automação
  ai_generated: boolean;
  ai_confidence_score: number;
  ai_risk_score: number;
  ai_missing_fields?: string[];
  ai_suggestions?: AISuggestion[];
  ai_auto_fill_enabled: boolean;
  ai_document_generation: boolean;
  ai_compliance_check: boolean;
  
  // Siscomex Integration
  siscomex_status?: 'Not Sent' | 'Sent' | 'Processing' | 'Approved' | 'Rejected';
  siscomex_sent_date?: Date;
  siscomex_response?: string;
  
  // Auditoria
  created_at: Date;
  created_by: string;
  created_by_name?: string;
  updated_at: Date;
  updated_by: string;
  updated_by_name?: string;
  
  // Campos calculados
  is_urgent?: boolean;
  days_until_etd?: number;
  completion_percentage?: number;
}

export interface AISuggestion {
  field: string;
  suggestion: string;
  confidence: number;
  reason: string;
}

export interface ExportacaoFilterOptions {
  export_status?: string;
  compliance_status?: string;
  destination_country?: string;
  product_name?: string;
  importer_name?: string;
  date_range_start?: Date;
  date_range_end?: Date;
  ai_risk_score_min?: number;
  ai_risk_score_max?: number;
  siscomex_status?: string;
}

export interface ExportacaoDashboard {
  totalExportacoes: number;
  totalValue: number;
  exportacoesPendentes: number;
  exportacoesAprovadas: number;
  exportacoesEmAndamento: number;
  exportacoesCompletas: number;
  exportacoesBloqueadas: number;
  aiAutomationRate: number;
  complianceScore: number;
  averageProcessingTime: number;
  topDestinationCountries: CountryStats[];
  topProducts: ProductStats[];
  riskAlerts: RiskAlert[];
  siscomexIntegrationHealth: number;
}

export interface CountryStats {
  country: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface ProductStats {
  product: string;
  count: number;
  totalQuantity: number;
  totalValue: number;
  percentage: number;
}

export interface RiskAlert {
  id: string;
  export_id: string;
  export_number: string;
  type: 'compliance' | 'logistics' | 'documentation' | 'financial' | 'deadline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
  created_at: Date;
  resolved: boolean;
}

export interface AIAssistantMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  suggestions?: AISuggestion[];
  actions?: AIAction[];
}

export interface AIAction {
  id: string;
  label: string;
  action: string;
  params?: any;
}

export interface SiscomexIntegration {
  due_number?: string;
  status: 'pending' | 'sent' | 'processing' | 'approved' | 'rejected' | 'error';
  sent_date?: Date;
  response_date?: Date;
  response_message?: string;
  validation_errors?: string[];
}

export interface DocumentGeneration {
  invoice: boolean;
  packing_list: boolean;
  due: boolean;
  certificate_origin: boolean;
  phytosanitary: boolean;
  auto_generate: boolean;
}

// Enums para facilitar o uso
export const ExportStatus = {
  DRAFT: 'Draft',
  PROCESSING: 'Processing', 
  APPROVED: 'Approved',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
  CANCELLED: 'Cancelled'
} as const;

export const ComplianceStatus = {
  OK: 'OK',
  WARNING: 'Warning', 
  ERROR: 'Error',
  PENDING: 'Pending'
} as const;

export const VigiAgroStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected', 
  NOT_REQUIRED: 'Not Required'
} as const;

export const TransportMode = {
  MARITIMO: 'Marítimo',
  AEREO: 'Aéreo',
  TERRESTRE: 'Terrestre',
  MULTIMODAL: 'Multimodal'
} as const;

export const PaymentMethod = {
  TT: 'T/T',
  LC: 'L/C', 
  DP: 'D/P',
  DA: 'D/A',
  OA: 'O/A'
} as const;

// Interfaces adicionais
export interface ExportacaoDocumento {
  document_id: string;
  document_type: 'Invoice' | 'Packing List' | 'DU-E' | 'Certificate' | 'Bill of Lading' | 'Other';
  document_number?: string;
  document_name?: string;
  file_url?: string;
  generated_at: Date;
  status: 'Generated' | 'Pending' | 'Approved' | 'Rejected';
  ai_generated?: boolean;
  file_size?: number;
  file_format?: string;
}

export interface ExportacaoItem {
  item_id: string;
  product_id: string;
  product_name: string;
  product_description?: string;
  ncm_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_value: number;
  packaging_info?: string;
  weight?: number;
  volume?: number;
  country_of_origin?: string;
}