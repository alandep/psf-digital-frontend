// Interfaces para o sistema de contratos de exportação
export interface Contract {
  contract_id?: string;
  contract_number: string;
  exporter_id?: string;
  exporter_name?: string;
  importer_name: string;
  importer_country?: string;
  country_destination: string;
  total_value: number;
  currency: 'USD' | 'EUR' | 'BRL' | 'CNY';
  status: 'Draft' | 'Active' | 'Closed' | 'Cancelled';
  incoterm: 'FOB' | 'CIF' | 'EXW' | 'DDP' | 'CFR' | 'CPT';
  port_origin?: string;
  port_destination?: string;
  contract_date?: Date | string;
  shipment_date?: Date | string;
  // Campos calculados
  calculated_costs?: ContractCosts;
  // Metadados
  created_at?: Date | string;
  updated_at?: Date | string;
  created_by?: string;
}

export interface ContractCosts {
  freight_cost?: number;
  insurance_cost?: number;
  handling_cost?: number;
  total_costs?: number;
  margin?: number;
  net_value?: number;
}

export interface Exporter {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  country: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface Port {
  code: string;
  name: string;
  country: string;
  type: 'sea' | 'air' | 'land';
}

export interface Country {
  code: string;
  name: string;
  region: string;
  currency: string;
}

export interface ContractFilters {
  status?: ('Draft' | 'Active' | 'Closed' | 'Cancelled')[];
  currency?: ('USD' | 'EUR' | 'BRL' | 'CNY')[];
  incoterm?: ('FOB' | 'CIF' | 'EXW' | 'DDP' | 'CFR' | 'CPT')[];
  countries?: string[];
  value_min?: number;
  value_max?: number;
  date_from?: Date | string;
  date_to?: Date | string;
  exporter_id?: string[];
}

export interface ContractFilterOptions {
  statuses: { value: string; label: string }[];
  currencies: string[];
  incoterms: { value: string; label: string }[];
  countries: Country[];
  exporters: Exporter[];
  ports: Port[];
}

// Labels para exibição
export const CONTRACT_STATUS_LABELS = {
  'Draft': 'Rascunho',
  'Active': 'Ativo',
  'Closed': 'Fechado',
  'Cancelled': 'Cancelado'
} as const;

export const INCOTERM_LABELS = {
  'FOB': 'FOB - Free on Board',
  'CIF': 'CIF - Cost, Insurance & Freight',
  'EXW': 'EXW - Ex Works',
  'DDP': 'DDP - Delivered Duty Paid',
  'CFR': 'CFR - Cost and Freight',
  'CPT': 'CPT - Carriage Paid To'
} as const;

export const CURRENCY_LABELS = {
  'USD': 'Dólar Americano (USD)',
  'EUR': 'Euro (EUR)',
  'BRL': 'Real Brasileiro (BRL)',
  'CNY': 'Yuan Chinês (CNY)'
} as const;

// Constantes para validação e cálculos
export const INCOTERM_COST_FACTORS = {
  'FOB': { freight: 0, insurance: 0, handling: 0.02 },
  'CIF': { freight: 0.05, insurance: 0.015, handling: 0.02 },
  'EXW': { freight: 0, insurance: 0, handling: 0.01 },
  'DDP': { freight: 0.08, insurance: 0.02, handling: 0.03 },
  'CFR': { freight: 0.05, insurance: 0, handling: 0.02 },
  'CPT': { freight: 0.06, insurance: 0, handling: 0.025 }
} as const;

export const MIN_CONTRACT_VALUE = 1000;
export const MAX_CONTRACT_VALUE = 10000000;

export const CURRENCY_LIST = ['USD', 'EUR', 'BRL', 'CNY'] as const;
export const INCOTERM_LIST = ['FOB', 'CIF', 'EXW', 'DDP', 'CFR', 'CPT'] as const;