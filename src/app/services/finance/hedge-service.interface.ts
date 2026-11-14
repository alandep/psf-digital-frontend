import { Observable } from 'rxjs';
import {
  HedgeContract,
  HedgeKPIs,
  ExposureSummary,
  HedgeFilters,
  CriarHedgeInput,
  HedgeType,
  HedgeStatus
} from '../../../types/hedge';

// Gateway da tela financeiro/hedge. Implementação única: HedgeHttpService
// (BFF /bff/financeiro/hedge).
export interface IHedgeService {
  getContracts(filters?: HedgeFilters): Observable<HedgeContract[]>;
  createContract(input: CriarHedgeInput): Observable<HedgeContract>;
  exercer(id: string): Observable<HedgeContract>;
  expirar(id: string): Observable<HedgeContract>;
  cancelar(id: string): Observable<HedgeContract>;
  getKPIs(): Observable<HedgeKPIs>;
  getExposureSummary(): Observable<ExposureSummary>;

  // Catálogos síncronos (referência + dados vistos na organização).
  getBanks(): string[];
  getTypes(): HedgeType[];
  getStatuses(): HedgeStatus[];
  getCurrencyPairs(): string[];
}
