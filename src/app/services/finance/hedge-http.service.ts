import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IHedgeService } from './hedge-service.interface';
import { HedgeMockService } from '../../../services/hedgeMockService';
import { environment } from '../../../environments/environment';
import {
  HedgeContract,
  HedgeKPIs,
  ExposureSummary,
  HedgeFilters,
  HedgeType,
  HedgeStatus
} from '../../../types/hedge';

// --- Backend BFF DTOs (/bff/financeiro/hedge) ---
interface HedgeView {
  id: string;
  contractNumber?: string;
  bank?: string;
  type?: string;
  status: string;
  notionalValue?: number;
  currencyPair?: string;
  strikeRate?: number;
  maturityDate?: string;
  direction?: string;
}

// HTTP gateway for the financeiro/hedge module. Only used when
// environment.realApis.finance === true. The front mock is far richer than the
// backend, so KPIs, exposure summary and dropdown catalogs DELEGATE to the
// injected mock (marked PARTIAL).
@Injectable({
  providedIn: 'root'
})
export class HedgeHttpService implements IHedgeService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(HedgeMockService);
  private readonly api = `${environment.bffBaseUrl}/bff/financeiro/hedge`;

  private mapStatus(status?: string): HedgeStatus {
    const s = (status || '').toUpperCase();
    const known: HedgeStatus[] = ['ATIVO', 'LIQUIDADO', 'VENCIDO', 'CANCELADO', 'EM_NEGOCIACAO'];
    return (known as string[]).includes(s) ? (s as HedgeStatus) : 'ATIVO';
  }

  private mapType(type?: string): HedgeType {
    const t = (type || '').toUpperCase();
    const known: HedgeType[] = ['NDF', 'FORWARD', 'OPTION_CALL', 'OPTION_PUT', 'SWAP'];
    return (known as string[]).includes(t) ? (t as HedgeType) : 'NDF';
  }

  // Maps HedgeView -> front HedgeContract, filling fields the backend does not
  // provide with safe defaults so the UI always renders a valid row.
  private toContract(v: HedgeView): HedgeContract {
    const now = new Date();
    return {
      id: v.id,
      contractNumber: v.contractNumber ?? '',
      bank: v.bank ?? '',
      type: this.mapType(v.type),
      status: this.mapStatus(v.status),
      notionalValue: v.notionalValue ?? 0,
      currencyPair: v.currencyPair ?? 'USD/BRL',
      strikeRate: v.strikeRate ?? 0,
      spotRateAtClose: 0,
      maturityDate: v.maturityDate ? new Date(v.maturityDate) : now,
      tradeDate: now,
      settlementDate: now,
      markToMarket: 0,
      counterparty: '',
      linkedExposure: '',
      premium: 0,
      direction: (v.direction || '').toUpperCase() === 'BUY' ? 'BUY' : 'SELL',
      notes: ''
    };
  }

  // --- Backed by the backend BFF ---
  getContracts(filters?: HedgeFilters): Observable<HedgeContract[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http
      .get<HedgeView[]>(this.api, { params })
      .pipe(map((rows) => (rows ?? []).map((r) => this.toContract(r))));
  }

  // PARTIAL: aggregate hedge KPIs have no backend endpoint.
  getKPIs(): Observable<HedgeKPIs> {
    return this.mock.getKPIs();
  }

  // PARTIAL: exposure summary has no backend endpoint.
  getExposureSummary(): Observable<ExposureSummary> {
    return this.mock.getExposureSummary();
  }

  // PARTIAL: dropdown catalogs are static/mock-only.
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
