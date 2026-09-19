import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IHedgeService } from './hedge-service.interface';
import { HedgeMockService } from '../../../services/hedgeMockService';
import {
  HedgeContract,
  HedgeKPIs,
  ExposureSummary,
  HedgeFilters,
  HedgeType,
  HedgeStatus
} from '../../../types/hedge';

// Mock adapter: delegates every method to HedgeMockService so behavior is
// identical to the pre-gateway state.
@Injectable({
  providedIn: 'root'
})
export class HedgeMockAdapter implements IHedgeService {
  private readonly mock = inject(HedgeMockService);

  getContracts(filters?: HedgeFilters): Observable<HedgeContract[]> {
    return this.mock.getContracts(filters);
  }

  getKPIs(): Observable<HedgeKPIs> {
    return this.mock.getKPIs();
  }

  getExposureSummary(): Observable<ExposureSummary> {
    return this.mock.getExposureSummary();
  }

  getBanks(): string[] {
    return this.mock.getBanks();
  }

  getTypes(): HedgeType[] {
    return this.mock.getTypes();
  }

  getStatuses(): HedgeStatus[] {
    return this.mock.getStatuses();
  }

  getCurrencyPairs(): string[] {
    return this.mock.getCurrencyPairs();
  }
}
