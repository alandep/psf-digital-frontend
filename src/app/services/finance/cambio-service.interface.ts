import { Observable } from 'rxjs';
import {
  ContratoCambio,
  QuotationData,
  SimulationRequest,
  SimulationResult,
  BankComparison,
  FinancialTimelineEvent,
  CambioAnalysis,
  CambioMetrics,
  FinancialKPIs,
  CambioFilters,
  ContractStatus
} from '../../../types/cambio';

// Gateway da tela financeiro/cambio. Implementação única: CambioHttpService
// (BFF /bff/financeiro/cambio + cotações reais de /bff/mercado).
export interface ICambioService {
  getContracts(filters?: CambioFilters): Observable<ContratoCambio[]>;
  getContractById(id: string): Observable<ContratoCambio | null>;
  createContract(data: Partial<ContratoCambio>): Observable<ContratoCambio>;
  liquidarContract(id: string): Observable<ContratoCambio>;
  cancelarContract(id: string): Observable<ContratoCambio>;

  getQuotations(): Observable<QuotationData[]>;
  simulate(request: SimulationRequest): Observable<SimulationResult>;
  compareBanks(currency: string, value: number): Observable<BankComparison[]>;
  getTimeline(contractId: string): Observable<FinancialTimelineEvent[]>;
  /** Fatos determinísticos calculados do contrato (não é IA). */
  getAnalysis(contractId: string): Observable<CambioAnalysis>;
  getMetrics(): Observable<CambioMetrics>;
  getFinancialKPIs(): Observable<FinancialKPIs>;

  // Catálogos síncronos (fallback estático + dados vistos na organização).
  getBanks(): string[];
  getCurrencies(): string[];
  /** Moedas suportadas pelo backend (GET /bff/mercado/moedas). */
  loadCurrencies(): Observable<string[]>;
  getStatuses(): ContractStatus[];
}
