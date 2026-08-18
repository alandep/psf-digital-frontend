export type ContractStatus = 'ABERTO' | 'FECHADO' | 'LIQUIDADO' | 'VENCIDO' | 'CANCELADO' | 'RENEGOCIADO';
export type RiskLevel = 'BAIXO' | 'MÉDIO' | 'ALTO';
export type ScenarioType = 'OTIMISTA' | 'PROVÁVEL' | 'CONSERVADOR';

export interface ContratoCambio {
  id: string;
  contractNumber: string;
  bank: string;
  exporterName: string;
  currency: string;
  foreignValue: number;
  exchangeRate: number;
  brlValue: number;
  status: ContractStatus;
  closingDate: Date;
  liquidationDate: Date;
  linkedExportNumber: string;
  linkedInvoiceNumber: string;
  linkedDueNumber: string;
  aiFinancialScore: number;
  gainLoss: number;
  spread: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotationData {
  currency: string;
  currentRate: number;
  previousClose: number;
  dailyChange: number;
  weeklyChange: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  bestAvailable: number;
  lastUpdated: Date;
  source: string;
}

export interface SimulationRequest {
  currency: string;
  value: number;
  term: number;
  bank: string;
  expectedDate: Date;
}

export interface SimulationResult {
  netValue: number;
  iof: number;
  bankFees: number;
  spread: number;
  financialImpact: number;
  scenarios: ScenarioResult[];
}

export interface ScenarioResult {
  type: ScenarioType;
  rate: number;
  brlValue: number;
  probability: number;
}

export interface BankComparison {
  bank: string;
  rate: number;
  spread: number;
  fees: number;
  totalCost: number;
  netValue: number;
  recommendation: boolean;
}

export interface FinancialTimelineEvent {
  id: string;
  contractId: string;
  event: string;
  date: Date;
  user: string;
  details: string;
  value: number;
}

export interface CambioAIInsights {
  contractId: string;
  financialScore: number;
  riskLevel: RiskLevel;
  alerts: CambioAlert[];
  suggestions: CambioSuggestion[];
  bankComparisons: BankComparison[];
  executiveSummary: string;
}

export interface CambioAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  detectedAt: Date;
}

export interface CambioSuggestion {
  action: string;
  reason: string;
  factors: string[];
  confidence: number;
  financialImpact: string;
}

export interface CambioFilters {
  searchText: string;
  status: ContractStatus | '';
  bank: string;
  currency: string;
  dateStart: Date | null;
  dateEnd: Date | null;
  minValue: number | null;
}

export interface CambioMetrics {
  totalContracts: number;
  openContracts: number;
  liquidatedValue: number;
  pendingReceipts: number;
  totalGainLoss: number;
  avgSpread: number;
  avgLiquidationDays: number;
}

export interface FinancialKPIs {
  exportedValue: number;
  liquidatedValue: number;
  pendingReceipts: number;
  gainLoss: number;
  avgSpread: number;
  avgLiquidationDays: number;
}
