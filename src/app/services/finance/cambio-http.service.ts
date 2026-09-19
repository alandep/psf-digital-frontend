import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICambioService } from './cambio-service.interface';
import { CambioContratsMockService } from '../../../services/cambioContratsMockService';
import { environment } from '../../../environments/environment';
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

// --- Backend BFF DTOs (/bff/financeiro/cambio) ---
interface CambioView {
  id: string;
  contractNumber?: string;
  bank?: string;
  currency?: string;
  foreignValue?: number;
  exchangeRate?: number;
  brlValue?: number;
  status: string;
  liquidationDate?: string;
}

interface CriarCambioRequest {
  contractNumber?: string;
  bank?: string;
  currency?: string;
  foreignValue?: number;
  exchangeRate?: number;
}

// HTTP gateway for the financeiro/cambio module. Only used when
// environment.realApis.finance === true. The front mock is far richer than the
// backend, so simulation, bank comparison, quotations, timeline, AI insights,
// metrics and KPIs DELEGATE to the injected mock (marked PARTIAL).
@Injectable({
  providedIn: 'root'
})
export class CambioHttpService implements ICambioService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(CambioContratsMockService);
  private readonly api = `${environment.bffBaseUrl}/bff/financeiro/cambio`;

  // Maps backend status to the front ContractStatus union, falling back to
  // 'ABERTO' for unknown values.
  private mapStatus(status?: string): ContractStatus {
    const s = (status || '').toUpperCase();
    const known: ContractStatus[] = ['ABERTO', 'FECHADO', 'LIQUIDADO', 'VENCIDO', 'CANCELADO', 'RENEGOCIADO'];
    return (known as string[]).includes(s) ? (s as ContractStatus) : 'ABERTO';
  }

  // Maps CambioView -> front ContratoCambio, filling fields the backend does not
  // provide with safe defaults so the UI always renders a valid row.
  private toContrato(v: CambioView): ContratoCambio {
    const now = new Date();
    const foreign = v.foreignValue ?? 0;
    const rate = v.exchangeRate ?? 0;
    return {
      id: v.id,
      contractNumber: v.contractNumber ?? '',
      bank: v.bank ?? '',
      exporterName: '',
      currency: v.currency ?? 'USD',
      foreignValue: foreign,
      exchangeRate: rate,
      brlValue: v.brlValue ?? foreign * rate,
      status: this.mapStatus(v.status),
      closingDate: now,
      liquidationDate: v.liquidationDate ? new Date(v.liquidationDate) : now,
      linkedExportNumber: '',
      linkedInvoiceNumber: '',
      linkedDueNumber: '',
      aiFinancialScore: 0,
      gainLoss: 0,
      spread: 0,
      createdAt: now,
      updatedAt: now
    };
  }

  private toCreateRequest(e: Partial<ContratoCambio>): CriarCambioRequest {
    return {
      contractNumber: e.contractNumber,
      bank: e.bank,
      currency: e.currency,
      foreignValue: e.foreignValue,
      exchangeRate: e.exchangeRate
    };
  }

  // --- Backed by the backend BFF ---
  getContracts(filters?: CambioFilters): Observable<ContratoCambio[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http
      .get<CambioView[]>(this.api, { params })
      .pipe(map((rows) => (rows ?? []).map((r) => this.toContrato(r))));
  }

  getContractById(id: string): Observable<ContratoCambio | null> {
    return this.http
      .get<CambioView>(`${this.api}/${id}`)
      .pipe(map((v) => (v ? this.toContrato(v) : null)));
  }

  createContract(data: Partial<ContratoCambio>): Observable<ContratoCambio> {
    return this.http
      .post<CambioView>(this.api, this.toCreateRequest(data))
      .pipe(map((v) => this.toContrato(v)));
  }

  // PARTIAL: FX quotations have no backend endpoint.
  getQuotations(): Observable<QuotationData[]> {
    return this.mock.getQuotations();
  }

  // PARTIAL: simulation engine is front-only.
  simulate(request: SimulationRequest): Observable<SimulationResult> {
    return this.mock.simulate(request);
  }

  // PARTIAL: bank comparison is front-only.
  compareBanks(currency: string, value: number): Observable<BankComparison[]> {
    return this.mock.compareBanks(currency, value);
  }

  // PARTIAL: financial timeline has no backend endpoint.
  getTimeline(contractId: string): Observable<FinancialTimelineEvent[]> {
    return this.mock.getTimeline(contractId);
  }

  // PARTIAL: AI insights have no backend endpoint.
  getAIInsights(contractId: string): Observable<CambioAIInsights> {
    return this.mock.getAIInsights(contractId);
  }

  // PARTIAL: aggregate metrics have no backend endpoint.
  getMetrics(): Observable<CambioMetrics> {
    return this.mock.getMetrics();
  }

  // PARTIAL: financial KPIs have no backend endpoint.
  getFinancialKPIs(): Observable<FinancialKPIs> {
    return this.mock.getFinancialKPIs();
  }

  // PARTIAL: dropdown catalogs are static/mock-only.
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
