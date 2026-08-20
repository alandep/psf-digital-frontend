export type HedgeType = 'NDF' | 'FORWARD' | 'OPTION_CALL' | 'OPTION_PUT' | 'SWAP';
export type HedgeStatus = 'ATIVO' | 'LIQUIDADO' | 'VENCIDO' | 'CANCELADO' | 'EM_NEGOCIACAO';

export interface HedgeContract {
  id: string;
  contractNumber: string;
  bank: string;
  type: HedgeType;
  status: HedgeStatus;
  notionalValue: number;
  currencyPair: string;
  strikeRate: number;
  spotRateAtClose: number;
  maturityDate: Date;
  tradeDate: Date;
  settlementDate: Date;
  markToMarket: number;
  counterparty: string;
  linkedExposure: string;
  premium: number;
  direction: 'BUY' | 'SELL';
  notes: string;
}

export interface HedgeKPIs {
  contratosAtivos: number;
  valorNocionalTotal: number;
  hedgeRatioMedio: number;
  pnlNaoRealizado: number;
}

export interface ExposureSummary {
  totalExposed: number;
  totalHedged: number;
  hedgeRatio: number;
  netOpenPosition: number;
}

export interface HedgeFilters {
  searchText: string;
  type: HedgeType | '';
  status: HedgeStatus | '';
  bank: string;
  currencyPair: string;
}
