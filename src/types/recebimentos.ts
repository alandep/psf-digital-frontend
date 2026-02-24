export interface Recebimento {
  id?: string;
  amount: number;
  currency: string;
  payment_date: Date | string;
  contract: string;
  // Campos adicionais para controle cambial
  exchange_rate?: number;
  original_amount?: number;
  original_currency?: string;
  bank_account?: string;
  bank_code?: string;
  bank_name?: string;
  transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method: 'wire_transfer' | 'letter_of_credit' | 'collection' | 'advance_payment';
  // Metadados
  created_at?: Date | string;
  updated_at?: Date | string;
  created_by?: string;
}

export interface ContractBasic {
  id: string;
  number: string;
  client_name: string;
  total_amount: number;
  currency: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface BankAccount {
  id: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_type: 'checking' | 'savings';
  currency: string;
  active: boolean;
}

export interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  date: Date | string;
  source: string;
}

export interface RecebimentoFilters {
  status?: string[];
  currency?: string[];
  payment_method?: string[];
  contract?: string[];
  date_from?: Date | string;
  date_to?: Date | string;
  amount_min?: number;
  amount_max?: number;
  bank_account?: string[];
}

export interface FiltroOptions {
  currencies: string[];
  paymentMethods: { value: string; label: string }[];
  statuses: { value: string; label: string }[];
  contracts: ContractBasic[];
  bankAccounts: BankAccount[];
}

export const CURRENCY_LIST = [
  'USD', 'EUR', 'BRL', 'GBP', 'JPY', 'CAD', 'CHF', 'AUD', 'CNY', 'ARS'
];

export const PAYMENT_METHOD_LABELS = {
  wire_transfer: 'Transferência Bancária',
  letter_of_credit: 'Carta de Crédito',
  collection: 'Cobrança',
  advance_payment: 'Pagamento Antecipado'
};

export const STATUS_LABELS = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};