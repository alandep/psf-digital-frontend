import { Observable } from 'rxjs';
import {
  ContratoCambio,
  QuotationData,
  SimulationRequest,
  SimulationResult,
  BankComparison,
  FinancialTimelineEvent,
  CambioAIInsights,
  CambioMetrics,
  FinancialKPIs,
  CambioFilters,
  ContractStatus
} from '../../../types/cambio';

// Gateway interface for the financeiro/cambio module. Method names and return
// types mirror CambioContratsMockService EXACTLY (Observable vs sync) so the
// cambio screen + detail dialog can swap the concrete service without any
// other change.
export interface ICambioService {
  getContracts(filters?: CambioFilters): Observable<ContratoCambio[]>;
  getContractById(id: string): Observable<ContratoCambio | null>;
  createContract(data: Partial<ContratoCambio>): Observable<ContratoCambio>;

  getQuotations(): Observable<QuotationData[]>;
  simulate(request: SimulationRequest): Observable<SimulationResult>;
  compareBanks(currency: string, value: number): Observable<BankComparison[]>;
  getTimeline(contractId: string): Observable<FinancialTimelineEvent[]>;
  getAIInsights(contractId: string): Observable<CambioAIInsights>;
  getMetrics(): Observable<CambioMetrics>;
  getFinancialKPIs(): Observable<FinancialKPIs>;

  // Static dropdown catalog: SYNC in the mock (returns arrays).
  getBanks(): string[];
  getCurrencies(): string[];
  getStatuses(): ContractStatus[];
}
