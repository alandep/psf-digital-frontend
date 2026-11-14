export type HedgeType = 'NDF' | 'FORWARD' | 'OPTION_CALL' | 'OPTION_PUT' | 'SWAP' | 'OPCAO';

/** Instrumentos aceitos pelo backend. */
export type HedgeInstrumento = 'NDF' | 'SWAP' | 'OPCAO';

export interface CriarHedgeInput {
  instrumento: HedgeInstrumento;
  moeda: string;
  notional: number;
  strike: number | null;
  vencimento: Date | null;
}
export type HedgeStatus = 'ATIVO' | 'EXERCIDO' | 'EXPIRADO' | 'LIQUIDADO' | 'VENCIDO' | 'CANCELADO' | 'EM_NEGOCIACAO';

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
  /** Total de contratos de hedge cadastrados (qualquer status). */
  totalContratos?: number;
}

export interface ExposureSummary {
  totalExposed: number;
  totalHedged: number;
  hedgeRatio: number;
  netOpenPosition: number;
  /** Nocional ativo com vencimento nos próximos 30 dias. */
  maturingIn30Days?: number;
}

export interface HedgeFilters {
  searchText: string;
  type: HedgeType | '';
  status: HedgeStatus | '';
  bank: string;
  currencyPair: string;
}
