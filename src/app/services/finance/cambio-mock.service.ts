import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICambioService } from './cambio-service.interface';
import { CambioContratsMockService } from '../../../services/cambioContratsMockService';
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

// Mock adapter: delegates every method to CambioContratsMockService so behavior
// is identical to the pre-gateway state.
@Injectable({
  providedIn: 'root'
})
export class CambioMockAdapter implements ICambioService {
  private readonly mock = inject(CambioContratsMockService);

  getContracts(filters?: CambioFilters): Observable<ContratoCambio[]> {
    return this.mock.getContracts(filters);
  }

  getContractById(id: string): Observable<ContratoCambio | null> {
    return this.mock.getContractById(id);
  }

  createContract(data: Partial<ContratoCambio>): Observable<ContratoCambio> {
    return this.mock.createContract(data);
  }

  getQuotations(): Observable<QuotationData[]> {
    return this.mock.getQuotations();
  }

  simulate(request: SimulationRequest): Observable<SimulationResult> {
    return this.mock.simulate(request);
  }

  compareBanks(currency: string, value: number): Observable<BankComparison[]> {
    return this.mock.compareBanks(currency, value);
  }

  getTimeline(contractId: string): Observable<FinancialTimelineEvent[]> {
    return this.mock.getTimeline(contractId);
  }

  getAIInsights(contractId: string): Observable<CambioAIInsights> {
    return this.mock.getAIInsights(contractId);
  }

  getMetrics(): Observable<CambioMetrics> {
    return this.mock.getMetrics();
  }

  getFinancialKPIs(): Observable<FinancialKPIs> {
    return this.mock.getFinancialKPIs();
  }

  getBanks(): string[] {
    return this.mock.getBanks();
  }

  getCurrencies(): string[] {
    return this.mock.getCurrencies();
  }

  getStatuses(): ContractStatus[] {
    return this.mock.getStatuses();
  }
}
