export type InstrumentType = 'LC' | 'COBRANCA_DOCUMENTARIA' | 'GARANTIA_BANCARIA' | 'SBLC' | 'AVAL';
export type InstrumentStatus = 'ATIVA' | 'PENDENTE' | 'VENCIDA' | 'CANCELADA' | 'EM_NEGOCIACAO' | 'UTILIZADA';

export interface TradeFinanceInstrument {
  id: string;
  instrumentNumber: string;
  type: InstrumentType;
  status: InstrumentStatus;
  bank: string;
  beneficiary: string;
  applicant: string;
  value: number;
  currency: string;
  issueDate: Date;
  expiryDate: Date;
  linkedContract: string;
  description: string;
  advisingBank: string;
  confirmingBank: string;
  partialShipment: boolean;
  transhipment: boolean;
  incoterm: string;
  portOfLoading: string;
  portOfDischarge: string;
  lastAmendmentDate: Date | null;
  amendments: number;
  documentsRequired: string[];
  timelineEvents: TradeFinanceTimelineEvent[];
}

export interface TradeFinanceTimelineEvent {
  id: string;
  date: Date;
  event: string;
  user: string;
  details: string;
}

export interface TradeFinanceKPIs {
  lcsAtivas: number;
  valorTotalLCs: number;
  cobrancasPendentes: number;
  instrumentosVencendo: number;
}

export interface TradeFinanceFilters {
  searchText: string;
  type: InstrumentType | '';
  status: InstrumentStatus | '';
  bank: string;
  currency: string;
}
