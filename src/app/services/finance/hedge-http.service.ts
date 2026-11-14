import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IHedgeService } from './hedge-service.interface';
import { parseApiDate, toApiDate } from './finance-utils';
import { environment } from '../../../environments/environment';
import {
  HedgeContract,
  HedgeKPIs,
  ExposureSummary,
  HedgeFilters,
  CriarHedgeInput,
  HedgeType,
  HedgeStatus
} from '../../../types/hedge';

// --- DTOs do BFF (/bff/financeiro/hedge) ---
interface HedgeView {
  id: string;
  instrumento: 'NDF' | 'SWAP' | 'OPCAO';
  moeda: string;
  notional: number;
  strike: number | null;
  vencimento: string | null;
  status: 'ATIVO' | 'EXERCIDO' | 'EXPIRADO' | 'CANCELADO';
}

interface CriarHedgeRequest {
  instrumento: 'NDF' | 'SWAP' | 'OPCAO';
  moeda: string;
  notional: number;
  strike: number | null;
  vencimento: string | null;
}

interface HedgeMetricasDto {
  total: number;
  ativos: number;
  exercidos: number;
  expirados: number;
  cancelados: number;
  notionalTotal: number;
  notionalAtivo: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const REFERENCE_BANKS = [
  'Banco do Brasil',
  'Bradesco',
  'Itaú Unibanco',
  'Santander Brasil',
  'BTG Pactual',
  'Banco Safra',
  'Citibank',
  'J.P. Morgan',
  'Goldman Sachs'
];

const HEDGE_TYPES: HedgeType[] = ['NDF', 'SWAP', 'OPCAO'];
const HEDGE_STATUSES: HedgeStatus[] = ['ATIVO', 'EXERCIDO', 'EXPIRADO', 'CANCELADO'];
const REFERENCE_PAIRS = ['USD/BRL', 'EUR/BRL', 'GBP/BRL'];

/** Gateway HTTP do módulo financeiro/hedge, 100% sobre o BFF real. */
@Injectable({
  providedIn: 'root'
})
export class HedgeHttpService implements IHedgeService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/financeiro/hedge`;

  private readonly seenBanks = new Set<string>();
  private readonly seenPairs = new Set<string>();

  private mapStatus(status?: string): HedgeStatus {
    return (status || 'ATIVO').toUpperCase() as HedgeStatus;
  }

  private mapType(type?: string): HedgeType {
    const t = (type || '').toUpperCase();
    return (HEDGE_TYPES as string[]).includes(t) ? (t as HedgeType) : 'NDF';
  }

  // HedgeView -> HedgeContract. Campos sem fonte no backend ficam zerados/vazios
  // e são ocultados nos templates.
  private toContract(v: HedgeView): HedgeContract {
    const now = new Date();
    const maturity = parseApiDate(v.vencimento) ?? now;
    return {
      id: v.id,
      contractNumber: 'HG-' + (v.id ?? '').substring(0, 8).toUpperCase(),
      bank: '',
      type: this.mapType(v.instrumento),
      status: this.mapStatus(v.status),
      notionalValue: v.notional ?? 0,
      currencyPair: `${v.moeda ?? 'USD'}/BRL`,
      strikeRate: v.strike ?? 0,
      spotRateAtClose: 0,
      maturityDate: maturity,
      tradeDate: now,
      settlementDate: maturity,
      markToMarket: 0,
      counterparty: '',
      linkedExposure: '',
      premium: 0,
      direction: 'SELL',
      notes: ''
    };
  }

  private remember(rows: HedgeContract[]): void {
    rows.forEach((r) => {
      if (r.bank) {
        this.seenBanks.add(r.bank);
      }
      if (r.currencyPair) {
        this.seenPairs.add(r.currencyPair);
      }
    });
  }

  private applyClientFilters(rows: HedgeContract[], f?: HedgeFilters): HedgeContract[] {
    if (!f) {
      return rows;
    }
    const text = (f.searchText || '').trim().toLowerCase();
    return rows.filter((c) => {
      if (text && !`${c.contractNumber} ${c.bank} ${c.counterparty}`.toLowerCase().includes(text)) {
        return false;
      }
      if (f.type && c.type !== f.type) {
        return false;
      }
      if (f.bank && c.bank !== f.bank) {
        return false;
      }
      if (f.currencyPair && c.currencyPair !== f.currencyPair) {
        return false;
      }
      return true;
    });
  }

  getContracts(filters?: HedgeFilters): Observable<HedgeContract[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http.get<HedgeView[]>(this.api, { params }).pipe(
      map((rows) => (rows ?? []).map((r) => this.toContract(r))),
      tap((rows) => this.remember(rows)),
      map((rows) => this.applyClientFilters(rows, filters))
    );
  }

  createContract(input: CriarHedgeInput): Observable<HedgeContract> {
    const body: CriarHedgeRequest = {
      instrumento: input.instrumento,
      moeda: input.moeda,
      notional: input.notional,
      strike: input.strike,
      vencimento: toApiDate(input.vencimento) ?? null
    };
    return this.http.post<HedgeView>(this.api, body).pipe(map((v) => this.toContract(v)));
  }

  exercer(id: string): Observable<HedgeContract> {
    return this.http
      .post<HedgeView>(`${this.api}/${encodeURIComponent(id)}/exercer`, {})
      .pipe(map((v) => this.toContract(v)));
  }

  expirar(id: string): Observable<HedgeContract> {
    return this.http
      .post<HedgeView>(`${this.api}/${encodeURIComponent(id)}/expirar`, {})
      .pipe(map((v) => this.toContract(v)));
  }

  cancelar(id: string): Observable<HedgeContract> {
    return this.http
      .post<HedgeView>(`${this.api}/${encodeURIComponent(id)}/cancelar`, {})
      .pipe(map((v) => this.toContract(v)));
  }

  // KPIs reais a partir de /metricas. P&L e hedge ratio não têm fonte: 0 (ocultos na tela).
  getKPIs(): Observable<HedgeKPIs> {
    return this.http.get<HedgeMetricasDto>(`${this.api}/metricas`).pipe(
      map((m) => ({
        contratosAtivos: m.ativos,
        valorNocionalTotal: m.notionalAtivo,
        hedgeRatioMedio: 0,
        pnlNaoRealizado: 0,
        totalContratos: m.total
      }))
    );
  }

  // Posição protegida real (nocional ativo) + nocional vencendo em 30 dias, da lista.
  getExposureSummary(): Observable<ExposureSummary> {
    return forkJoin({
      m: this.http.get<HedgeMetricasDto>(`${this.api}/metricas`),
      ativos: this.getContracts({ searchText: '', type: '', status: 'ATIVO', bank: '', currencyPair: '' })
    }).pipe(
      map(({ m, ativos }) => {
        const limit = Date.now() + 30 * DAY_MS;
        const maturing = ativos
          .filter((c) => c.maturityDate.getTime() <= limit)
          .reduce((s, c) => s + (c.notionalValue || 0), 0);
        return {
          totalExposed: 0,
          totalHedged: m.notionalAtivo,
          hedgeRatio: 0,
          netOpenPosition: 0,
          maturingIn30Days: maturing
        };
      })
    );
  }

  // --- Catálogos ---
  getBanks(): string[] {
    return Array.from(new Set([...REFERENCE_BANKS, ...this.seenBanks])).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  getTypes(): HedgeType[] {
    return [...HEDGE_TYPES];
  }

  getStatuses(): HedgeStatus[] {
    return [...HEDGE_STATUSES];
  }

  getCurrencyPairs(): string[] {
    return Array.from(new Set([...REFERENCE_PAIRS, ...this.seenPairs]));
  }
}
