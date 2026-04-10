export interface Embarque {
  shipment_id: string;
  shipment_number: string;
  contract_id: string;
  exporter_name: string;
  importer_name: string;
  commodity: string;
  quantity: number;
  unit: 'MT' | 'KG' | 'TON';
  vessel_name?: string;
  container_count?: number;
  booking_number?: string;
  port_origin: string;
  port_destination: string;
  departure_date?: Date;
  arrival_date?: Date;
  shipment_status: 'Planned' | 'Booked' | 'In Transit' | 'Delivered' | 'Delayed';
  delay_risk_score?: number;
  tracking_status: 'On Time' | 'Delayed' | 'Risk';
  last_update: Date;
  incoterm?: 'FOB' | 'CIF' | 'CFR';

  // Transporte
  transport_mode?: 'Marítimo' | 'Rodoviário' | 'Ferroviário';
  vessel_imo?: string;
  shipping_company?: string;
  bill_of_lading?: string;
  freight_type?: 'FCL' | 'LCL' | 'Bulk';

  // Containers
  containers?: Container[];

  // Portos & Rota
  transshipment_port?: string;
  route_description?: string;

  // Datas & Tracking
  etd?: Date;
  eta?: Date;
  ata?: Date;
  delay_days?: number;
  tracking_url?: string;

  // Documentação Aduaneira
  due_number?: string;
  ruc_number?: string;
  invoice_number?: string;
  packing_list_number?: string;
  certificate_phytosanitary?: string;
  mapa_clearance?: boolean;
  vigiagro_status?: 'Pending' | 'Approved' | 'Rejected';

  // IA & Automação
  ai_route_suggestion?: string;
  ai_port_suggestion?: string;
  ai_eta_prediction?: Date;
  ai_delay_risk_score?: number;
  ai_cost_optimization?: number;
  ai_best_shipping_company?: string;
  ai_alerts?: any[];
  ai_auto_tracking?: boolean;
  ai_success_probability?: string;
  ai_operational_risk?: string;
  ai_reliability_score?: string;
  ai_sustainability_index?: string;

  // Financeiro
  freight_cost?: number;
  insurance_cost?: number;
  port_charges?: number;
  total_logistic_cost?: number;
  payment_status?: string;
  payment_due_date?: Date;
  amount_paid?: number;
  initial_budget?: number;
  actual_cost?: number;
  budget_variation?: number;
  gross_revenue?: number;
  gross_margin?: number;
  net_profit?: number;

  // Siscomex e Integração Governamental
  siscomex_due_status?: string;
  siscomex_lpco_status?: string;
  customs_channel?: string;
  
  // Datas de Upload e Verificação de Documentos
  invoice_upload_date?: Date;
  invoice_last_check?: Date;
  packing_upload_date?: Date;
  packing_last_check?: Date;
  certificate_upload_date?: Date;
  certificate_last_check?: Date;

  // Auditoria
  created_at: Date;
  created_by: string;
  created_by_name?: string;
  creation_method?: string;
  updated_at: Date;
  updated_by: string;
  updated_by_name?: string;
  update_type?: string;
  
  // Compliance e GDPR
  gdpr_compliant?: boolean;
  audit_trail_complete?: boolean;
  data_retention_compliant?: boolean;
  data_retention_period?: string;
  scheduled_deletion_date?: Date;
}

export interface Container {
  container_number: string;
  container_type: '20GP' | '40HQ' | 'Bulk';
  seal_number?: string;
  tare_weight?: number;
  gross_weight?: number;
  net_weight?: number;
  stuffing_date?: Date;
}

export interface Rota {
  id: string;
  nome: string;
  porto_origem: string;
  porto_destino: string;
  tempo_estimado_dias: number;
  custo_estimado: number;
  risco_atraso: number;
}

export interface PortoInfo {
  codigo: string;
  nome: string;
  pais: string;
  congestionamento_atual: number;
  tempo_medio_operacao: number;
}

export interface EmbarqueFilters {
  shipment_status?: string;
  tracking_status?: string;
  exporter_name?: string;
  commodity?: string;
  port_origin?: string;
  port_destination?: string;
  date_range_start?: Date;
  date_range_end?: Date;
}