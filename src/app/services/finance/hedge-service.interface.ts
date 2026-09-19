import { Observable } from 'rxjs';
import {
  HedgeContract,
  HedgeKPIs,
  ExposureSummary,
  HedgeFilters,
  HedgeType,
  HedgeStatus
} from '../../../types/hedge';

// Gateway interface for the financeiro/hedge module. Method names and return
// types mirror HedgeMockService EXACTLY (Observable vs sync) so the hedge screen
// can swap the concrete service without any other change.
export interface IHedgeService {
  getContracts(filters?: HedgeFilters): Observable<HedgeContract[]>;
  getKPIs(): Observable<HedgeKPIs>;
  getExposureSummary(): Observable<ExposureSummary>;

  // Static dropdown catalog: SYNC in the mock (returns arrays).
  getBanks(): string[];
  getTypes(): HedgeType[];
  getStatuses(): HedgeStatus[];
  getCurrencyPairs(): string[];
}
