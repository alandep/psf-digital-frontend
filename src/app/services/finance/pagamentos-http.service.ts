import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { IPagamentosService } from './pagamentos-service.interface';
import { MarketQuoteService } from '../market/market-quote.service';
import { PagamentoView, PagamentoRequest, blankToNull } from './pagamento-view';
import { parseApiDate, toApiDate } from './finance-utils';
import { environment } from '../../../environments/environment';
import {
  Pagamento,
  PaymentTimelineEvent,
  PaymentMetrics,
  CashFlowProjection,
  CashFlowMonth,
  PaymentFilters,
  PaymentCategory,
  PaymentStatus
} from '../../../types/pagamentos';

const FALLBACK_CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'ARS', 'CAD', 'AUD', 'CHF'];
const STATUSES: PaymentStatus[] = ['PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO'];
const DAY_MS = 24 * 60 * 60 * 1000;

interface RatedRows {
  rows: Pagamento[];
  rates: Record<string, number | null>;
}

/**
 * Gateway HTTP de Pagamentos (tipo=PAGAMENTO em /bff/financeiro/pagamentos).
 * Métricas e fluxo de caixa são derivados da lista real; totais em BRL usam a
 * cotação real do MarketQuoteService (moedas sem cotação ficam fora e são
 * sinalizadas).
 */
@Injectable({
  providedIn: 'root'
})
export class PagamentosHttpService implements IPagamentosService {
  private readonly http = inject(HttpClient);
  private readonly market = inject(MarketQuoteService);
  private readonly api = `${environment.bffBaseUrl}/bff/financeiro/pagamentos`;
  private readonly moedasApi = `${environment.bffBaseUrl}/bff/mercado/moedas`;

  private currencies: string[] = [...FALLBACK_CURRENCIES];
  private readonly seenBeneficiaries = new Set<string>();

  // Backend (PENDENTE/PAGO/ATRASADO/CANCELADO) -> front PaymentStatus.
  private mapStatus(status?: string): PaymentStatus {
    switch ((status || '').toUpperCase()) {
      case 'PAGO': return 'PAGO';
      case 'ATRASADO': return 'VENCIDO';
      case 'CANCELADO': return 'CANCELADO';
      default: return 'PENDENTE';
    }
  }

  private toApiStatus(status: PaymentStatus | ''): string | null {
    switch (status) {
      case 'VENCIDO': return 'ATRASADO';
      case 'PENDENTE':
      case 'PAGO':
      case 'CANCELADO':
        return status;
      default: return null;
    }
  }

  private toPagamento(v: PagamentoView): Pagamento {
    const now = new Date();
    const created = parseApiDate(v.createdAt) ?? now;
    const currency = v.currency ?? 'BRL';
    return {
      id: v.id,
      paymentNumber: v.referencia ?? '',
      company: '',
      beneficiary: v.contraparte ?? '',
      paymentType: currency === 'BRL' ? 'NACIONAL' : 'INTERNACIONAL',
      category: 'OUTROS' as PaymentCategory,
      bank: '',
      bankAccount: v.contaBancaria ?? '',
      currency,
      amount: v.amount ?? 0,
      issueDate: created,
      dueDate: parseApiDate(v.dueDate) ?? created,
      paymentDate: parseApiDate(v.paidAt),
      status: this.mapStatus(v.status),
      linkedExportNumber: '',
      linkedContractNumber: '',
      linkedInvoiceNumber: '',
      linkedDueNumber: '',
      costCenter: '',
      observations: v.observacoes ?? '',
      aiFinancialScore: 0,
      swift: null,
      iban: null,
      beneficiaryBank: null,
      beneficiaryCountry: null,
      createdAt: created,
      updatedAt: created,
      description: v.descricao ?? '',
      linkedExchangeContractId: v.contratoCambioId,
      linkedExportId: v.exportId
    };
  }

  private toRequest(e: Partial<Pagamento>): PagamentoRequest {
    return {
      tipo: 'PAGAMENTO',
      descricao: blankToNull(e.description),
      contraparte: blankToNull(e.beneficiary),
      referencia: blankToNull(e.paymentNumber),
      contaBancaria: blankToNull(e.bankAccount),
      contratoCambioId: blankToNull(e.linkedExchangeContractId),
      observacoes: blankToNull(e.observations),
      amount: Number(e.amount) || 0,
      currency: e.currency || 'BRL',
      dueDate: toApiDate(e.dueDate) ?? '',
      exportId: blankToNull(e.linkedExportId)
    };
  }

  private applyClientFilters(rows: Pagamento[], f?: PaymentFilters): Pagamento[] {
    if (!f) {
      return rows;
    }
    const text = (f.searchText || '').trim().toLowerCase();
    return rows.filter((p) => {
      if (text && !`${p.paymentNumber} ${p.beneficiary} ${p.description ?? ''} ${p.observations}`.toLowerCase().includes(text)) {
        return false;
      }
      if (f.paymentType && p.paymentType !== f.paymentType) {
        return false;
      }
      if (f.beneficiary && p.beneficiary !== f.beneficiary) {
        return false;
      }
      if (f.currency && p.currency !== f.currency) {
        return false;
      }
      if (f.dateStart && p.dueDate < f.dateStart) {
        return false;
      }
      if (f.dateEnd) {
        const end = new Date(f.dateEnd);
        end.setHours(23, 59, 59, 999);
        if (p.dueDate > end) {
          return false;
        }
      }
      return true;
    });
  }

  // --- CRUD ---
  getPayments(filters?: PaymentFilters): Observable<Pagamento[]> {
    let params = new HttpParams().set('tipo', 'PAGAMENTO');
    const status = filters ? this.toApiStatus(filters.status) : null;
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<PagamentoView[]>(this.api, { params }).pipe(
      map((rows) => (rows ?? []).map((r) => this.toPagamento(r))),
      tap((rows) => rows.forEach((r) => r.beneficiary && this.seenBeneficiaries.add(r.beneficiary))),
      map((rows) => this.applyClientFilters(rows, filters))
    );
  }

  getPaymentById(id: string): Observable<Pagamento | null> {
    return this.http
      .get<PagamentoView>(`${this.api}/${encodeURIComponent(id)}`)
      .pipe(map((v) => (v ? this.toPagamento(v) : null)));
  }

  createPayment(data: Partial<Pagamento>): Observable<Pagamento> {
    return this.http.post<PagamentoView>(this.api, this.toRequest(data)).pipe(map((v) => this.toPagamento(v)));
  }

  updatePayment(id: string, data: Partial<Pagamento>): Observable<Pagamento> {
    return this.http
      .put<PagamentoView>(`${this.api}/${encodeURIComponent(id)}`, this.toRequest(data))
      .pipe(map((v) => this.toPagamento(v)));
  }

  payPayment(id: string, paidAt?: Date): Observable<Pagamento> {
    const body = paidAt ? { paidAt: paidAt.toISOString() } : {};
    return this.http
      .post<PagamentoView>(`${this.api}/${encodeURIComponent(id)}/pagar`, body)
      .pipe(map((v) => this.toPagamento(v)));
  }

  cancelPayment(id: string): Observable<Pagamento> {
    return this.http
      .post<PagamentoView>(`${this.api}/${encodeURIComponent(id)}/cancelar`, {})
      .pipe(map((v) => this.toPagamento(v)));
  }

  // --- Derivados do próprio lançamento ---
  getTimeline(paymentId: string): Observable<PaymentTimelineEvent[]> {
    return this.getPaymentById(paymentId).pipe(
      map((p) => {
        if (!p) {
          return [];
        }
        const events: PaymentTimelineEvent[] = [
          {
            id: `${p.id}-created`,
            paymentId: p.id,
            event: 'Lançamento registrado',
            date: p.createdAt,
            user: '',
            details: p.description || p.beneficiary
          }
        ];
        if (p.status === 'PAGO') {
          events.push({
            id: `${p.id}-paid`,
            paymentId: p.id,
            event: 'Pagamento realizado',
            date: p.paymentDate ?? p.updatedAt,
            user: '',
            details: 'Marcado como pago'
          });
        } else if (p.status === 'CANCELADO') {
          events.push({
            id: `${p.id}-cancelled`,
            paymentId: p.id,
            event: 'Lançamento cancelado',
            date: p.updatedAt,
            user: '',
            details: 'Cancelado'
          });
        } else {
          events.push({
            id: `${p.id}-due`,
            paymentId: p.id,
            event: p.status === 'VENCIDO' ? 'Vencimento ultrapassado' : 'Vencimento previsto',
            date: p.dueDate,
            user: '',
            details: `Situação atual: ${p.status}`
          });
        }
        return events;
      })
    );
  }

  // Busca a lista real e as cotações (reais) das moedas envolvidas.
  private loadRated(): Observable<RatedRows> {
    return this.getPayments().pipe(
      switchMap((rows) => {
        const cur = Array.from(new Set(rows.map((r) => r.currency).filter((c) => !!c && c !== 'BRL')));
        if (cur.length === 0) {
          return of({ rows, rates: {} as Record<string, number | null> });
        }
        return forkJoin(
          cur.map((c) => this.market.getRate(c).pipe(map((r) => [c, r] as [string, number | null])))
        ).pipe(map((pairs) => ({ rows, rates: Object.fromEntries(pairs) as Record<string, number | null> })));
      })
    );
  }

  private toBrl(p: Pagamento, rates: Record<string, number | null>): number {
    if (p.currency === 'BRL') {
      return p.amount;
    }
    const r = rates[p.currency];
    return r ? p.amount * r : 0;
  }

  private missing(rows: Pagamento[], rates: Record<string, number | null>): string[] {
    const set = new Set<string>();
    rows.forEach((p) => {
      if (p.currency !== 'BRL' && !rates[p.currency]) {
        set.add(p.currency);
      }
    });
    return Array.from(set);
  }

  getMetrics(): Observable<PaymentMetrics> {
    return this.loadRated().pipe(
      map(({ rows, rates }) => {
        const sum = (list: Pagamento[]) => list.reduce((s, p) => s + this.toBrl(p, rates), 0);
        const pending = rows.filter((p) => p.status === 'PENDENTE');
        const paid = rows.filter((p) => p.status === 'PAGO');
        const overdue = rows.filter((p) => p.status === 'VENCIDO');
        return {
          totalPayments: rows.length,
          pendingCount: pending.length,
          paidCount: paid.length,
          overdueCount: overdue.length,
          totalPendingValue: sum(pending),
          totalPaidValue: sum(paid),
          totalOverdueValue: sum(overdue),
          avgFinancialScore: 0,
          unconvertedCurrencies: this.missing(rows, rates)
        };
      })
    );
  }

  getCashFlowProjection(): Observable<CashFlowProjection> {
    return this.loadRated().pipe(
      map(({ rows, rates }) => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const open = rows.filter((p) => p.status === 'PENDENTE' || p.status === 'VENCIDO');
        const sum = (list: Pagamento[]) => list.reduce((s, p) => s + this.toBrl(p, rates), 0);
        const within = (days: number) =>
          open.filter((p) => {
            const t = p.dueDate.getTime();
            return t >= todayStart && t <= todayStart + days * DAY_MS;
          });
        const paidThisMonth = rows.filter(
          (p) =>
            p.status === 'PAGO' &&
            p.paymentDate &&
            p.paymentDate.getMonth() === now.getMonth() &&
            p.paymentDate.getFullYear() === now.getFullYear()
        );

        const months = new Map<string, number>();
        open.forEach((p) => {
          const key = `${p.dueDate.getFullYear()}-${String(p.dueDate.getMonth() + 1).padStart(2, '0')}`;
          months.set(key, (months.get(key) ?? 0) + this.toBrl(p, rates));
        });
        const byMonth: CashFlowMonth[] = Array.from(months.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, total]) => {
            const [y, m] = month.split('-').map(Number);
            const label = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            return { month, label, total };
          });

        return {
          totalPayable: sum(open),
          paidThisMonth: sum(paidThisMonth),
          upcomingWeek: sum(within(7)),
          upcomingMonth: sum(within(30)),
          projectedBalance: 0,
          scenarioOptimistic: 0,
          scenarioProbable: 0,
          scenarioConservative: 0,
          byMonth,
          unconvertedCurrencies: this.missing(rows, rates)
        };
      })
    );
  }

  // --- Catálogos ---
  getBeneficiaries(): string[] {
    return Array.from(this.seenBeneficiaries).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  getCurrencies(): string[] {
    return [...this.currencies];
  }

  loadCurrencies(): Observable<string[]> {
    return this.http.get<string[]>(this.moedasApi).pipe(
      map((list) => (list ?? []).map((c) => c.toUpperCase())),
      tap((list) => {
        if (list.length > 0) {
          this.currencies = ['BRL', ...list.filter((c) => c !== 'BRL')];
        }
      }),
      map(() => this.getCurrencies()),
      catchError(() => of(this.getCurrencies()))
    );
  }

  getStatuses(): PaymentStatus[] {
    return [...STATUSES];
  }
}
