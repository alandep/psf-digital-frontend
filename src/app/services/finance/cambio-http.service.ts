import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ICambioService } from './cambio-service.interface';
import { MarketQuoteService, MarketQuote } from '../market/market-quote.service';
import { toQuotationData, COTACOES_MOEDAS } from './quotation.mapper';
import { parseApiDate, toApiDate } from './finance-utils';
import { environment } from '../../../environments/environment';
import {
  ContratoCambio,
  QuotationData,
  SimulationRequest,
  SimulationResult,
  BankComparison,
  FinancialTimelineEvent,
  CambioAnalysis,
  CambioAnalysisFact,
  CambioMetrics,
  FinancialKPIs,
  CambioFilters,
  ContractStatus
} from '../../../types/cambio';

// --- DTOs do BFF (/bff/financeiro/cambio) ---
interface CambioView {
  id: string;
  banco: string | null;
  moeda: string;
  valor: number;
  taxa: number;
  tipo: 'COMPRA' | 'VENDA';
  status: 'ATIVO' | 'LIQUIDADO' | 'CANCELADO';
  dataContratacao: string | null;
  dataLiquidacao: string | null;
  createdAt: string | null;
}

interface CriarCambioRequest {
  banco: string | null;
  moeda: string;
  valor: number;
  taxa: number;
  tipo: 'COMPRA' | 'VENDA';
  dataContratacao: string;
  dataLiquidacao: string | null;
}

interface CambioMetricasDto {
  totalContratos: number;
  abertos: number;
  liquidados: number;
  cancelados: number;
  vencidos: number;
  volumeBrlTotal: number;
  volumeBrlAberto: number;
  taxaMediaPonderadaUsd: number | null;
  vencendo30Dias: number;
}

interface BancoResumoDto {
  bank: string;
  contratos: number;
  volumeBrl: number;
  taxaMediaPonderada: number;
  ultimaTaxa: number;
  ultimaOperacao: string | null;
}

/** Moedas aceitas pelo backend (espelha /bff/mercado/moedas); usada até a resposta chegar. */
const FALLBACK_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'ARS', 'CAD', 'AUD', 'CHF'];

/** Bancos brasileiros autorizados a operar câmbio (dado de referência, não é dataset de negócio). */
const REFERENCE_BANKS = [
  'Banco do Brasil',
  'Bradesco',
  'Itaú Unibanco',
  'Santander Brasil',
  'Caixa Econômica Federal',
  'BTG Pactual',
  'Banco Safra',
  'Citibank',
  'Banco BV',
  'Banco ABC Brasil',
  'Banco Daycoval',
  'Sicredi',
  'Sicoob'
];

const STATUSES: ContractStatus[] = ['ABERTO', 'FECHADO', 'LIQUIDADO', 'VENCIDO', 'CANCELADO', 'RENEGOCIADO'];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Gateway HTTP do módulo financeiro/cambio. Tudo vem do BFF real; cálculos
 * derivados (simulação, comparação, análise) usam apenas matemática
 * transparente sobre dados reais e a cotação de mercado.
 */
@Injectable({
  providedIn: 'root'
})
export class CambioHttpService implements ICambioService {
  private readonly http = inject(HttpClient);
  private readonly market = inject(MarketQuoteService);
  private readonly api = `${environment.bffBaseUrl}/bff/financeiro/cambio`;
  private readonly moedasApi = `${environment.bffBaseUrl}/bff/mercado/moedas`;

  private currencies: string[] = [...FALLBACK_CURRENCIES];
  private readonly seenBanks = new Set<string>();

  private mapStatus(v: CambioView): ContractStatus {
    switch (v.status) {
      case 'LIQUIDADO':
        return 'LIQUIDADO';
      case 'CANCELADO':
        return 'CANCELADO';
      default: {
        const due = parseApiDate(v.dataLiquidacao);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due && due.getTime() < today.getTime() ? 'VENCIDO' : 'ABERTO';
      }
    }
  }

  private toApiStatus(status?: ContractStatus | ''): string | null {
    switch (status) {
      case 'ABERTO':
      case 'VENCIDO':
        return 'ATIVO';
      case 'LIQUIDADO':
      case 'CANCELADO':
        return status;
      default:
        return null;
    }
  }

  private toContrato(v: CambioView): ContratoCambio {
    const now = new Date();
    const created = parseApiDate(v.createdAt) ?? now;
    const closing = parseApiDate(v.dataContratacao) ?? parseApiDate(v.createdAt) ?? now;
    const foreign = v.valor ?? 0;
    const rate = v.taxa ?? 0;
    return {
      id: v.id,
      contractNumber: 'CC-' + (v.id ?? '').substring(0, 8).toUpperCase(),
      bank: v.banco ?? '',
      exporterName: '',
      currency: v.moeda ?? 'USD',
      foreignValue: foreign,
      exchangeRate: rate,
      brlValue: foreign * rate,
      status: this.mapStatus(v),
      side: v.tipo,
      closingDate: closing,
      liquidationDate: parseApiDate(v.dataLiquidacao) ?? closing,
      linkedExportNumber: '',
      linkedInvoiceNumber: '',
      linkedDueNumber: '',
      aiFinancialScore: 0,
      gainLoss: 0,
      spread: 0,
      createdAt: created,
      updatedAt: created
    };
  }

  private toCreateRequest(e: Partial<ContratoCambio>): CriarCambioRequest {
    return {
      banco: e.bank || null,
      moeda: e.currency ?? '',
      valor: e.foreignValue ?? 0,
      taxa: e.exchangeRate ?? 0,
      tipo: e.side ?? 'VENDA',
      dataContratacao: toApiDate(e.closingDate) ?? (toApiDate(new Date()) as string),
      dataLiquidacao: toApiDate(e.liquidationDate) ?? null
    };
  }

  private remember(contracts: ContratoCambio[]): void {
    contracts.forEach((c) => {
      if (c.bank) {
        this.seenBanks.add(c.bank);
      }
    });
  }

  private applyClientFilters(rows: ContratoCambio[], f?: CambioFilters): ContratoCambio[] {
    if (!f) {
      return rows;
    }
    const text = (f.searchText || '').trim().toLowerCase();
    return rows.filter((c) => {
      if (text && !`${c.contractNumber} ${c.bank} ${c.currency}`.toLowerCase().includes(text)) {
        return false;
      }
      if (f.bank && c.bank !== f.bank) {
        return false;
      }
      if (f.currency && c.currency !== f.currency) {
        return false;
      }
      if (f.minValue != null && c.brlValue < f.minValue) {
        return false;
      }
      if (f.dateStart && c.liquidationDate < f.dateStart) {
        return false;
      }
      if (f.dateEnd) {
        const end = new Date(f.dateEnd);
        end.setHours(23, 59, 59, 999);
        if (c.liquidationDate > end) {
          return false;
        }
      }
      return true;
    });
  }

  // --- Contratos ---
  getContracts(filters?: CambioFilters): Observable<ContratoCambio[]> {
    let params = new HttpParams();
    const apiStatus = this.toApiStatus(filters?.status);
    if (apiStatus) {
      params = params.set('status', apiStatus);
    }
    return this.http.get<CambioView[]>(this.api, { params }).pipe(
      map((rows) => (rows ?? []).map((r) => this.toContrato(r))),
      tap((rows) => this.remember(rows)),
      map((rows) => (filters?.status ? rows.filter((c) => c.status === filters.status) : rows)),
      map((rows) => this.applyClientFilters(rows, filters))
    );
  }

  getContractById(id: string): Observable<ContratoCambio | null> {
    return this.http
      .get<CambioView>(`${this.api}/${encodeURIComponent(id)}`)
      .pipe(map((v) => (v ? this.toContrato(v) : null)));
  }

  createContract(data: Partial<ContratoCambio>): Observable<ContratoCambio> {
    return this.http
      .post<CambioView>(this.api, this.toCreateRequest(data))
      .pipe(map((v) => this.toContrato(v)));
  }

  liquidarContract(id: string): Observable<ContratoCambio> {
    return this.http
      .post<CambioView>(`${this.api}/${encodeURIComponent(id)}/liquidar`, {})
      .pipe(map((v) => this.toContrato(v)));
  }

  cancelarContract(id: string): Observable<ContratoCambio> {
    return this.http
      .post<CambioView>(`${this.api}/${encodeURIComponent(id)}/cancelar`, {})
      .pipe(map((v) => this.toContrato(v)));
  }

  // --- Cotações reais ---
  getQuotations(): Observable<QuotationData[]> {
    return this.market.getQuotes(COTACOES_MOEDAS).pipe(map((qs) => qs.map(toQuotationData)));
  }

  private describeQuote(q: MarketQuote): string {
    const hora = q.quotedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Cotação comercial de agora: R$ ${this.fmtRate(q.rate)} (fonte ${q.sourceLabel}, ${hora})`;
  }

  private fmtRate(rate: number): string {
    return rate.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }

  // --- Simulação: BRL = valor × taxa, sem spreads/tarifas inventados ---
  simulate(request: SimulationRequest): Observable<SimulationResult> {
    return this.market.getQuote(request.currency).pipe(
      map((q) => {
        const provided = request.rate != null && request.rate > 0;
        const rate = provided ? (request.rate as number) : q.rate;
        const note = provided
          ? `Taxa informada: R$ ${this.fmtRate(rate)}. ${this.describeQuote(q)}`
          : this.describeQuote(q);
        return {
          netValue: request.value * rate,
          iof: 0,
          bankFees: 0,
          spread: 0,
          financialImpact: provided ? request.value * (rate - q.rate) : 0,
          scenarios: [],
          rate,
          marketRate: q.rate,
          note
        };
      })
    );
  }

  // --- Comparação por banco: histórico real da própria organização ---
  compareBanks(currency: string, value: number): Observable<BankComparison[]> {
    const params = new HttpParams().set('moeda', currency);
    return this.http.get<BancoResumoDto[]>(`${this.api}/bancos`, { params }).pipe(
      map((rows) => {
        const list = (rows ?? []).map((b) => ({
          bank: b.bank,
          rate: b.taxaMediaPonderada,
          spread: 0,
          fees: 0,
          totalCost: 0,
          netValue: value * b.taxaMediaPonderada,
          recommendation: false,
          contracts: b.contratos,
          lastRate: b.ultimaTaxa,
          lastOperation: parseApiDate(b.ultimaOperacao)
        }));
        list.sort((a, b) => b.netValue - a.netValue);
        if (list.length > 0) {
          list[0].recommendation = true;
        }
        return list;
      })
    );
  }

  // --- Linha do tempo montada a partir do próprio contrato ---
  getTimeline(contractId: string): Observable<FinancialTimelineEvent[]> {
    return this.getContractById(contractId).pipe(
      map((c) => {
        if (!c) {
          return [];
        }
        const events: FinancialTimelineEvent[] = [
          {
            id: `${c.id}-created`,
            contractId: c.id,
            event: 'Contrato registrado',
            date: c.createdAt,
            user: '',
            details: `Taxa ${this.fmtRate(c.exchangeRate)} · ${c.currency} ${c.foreignValue.toLocaleString('pt-BR')}`,
            value: c.brlValue
          }
        ];
        if (c.status === 'LIQUIDADO') {
          events.push({
            id: `${c.id}-liquidated`,
            contractId: c.id,
            event: 'Contrato liquidado',
            date: c.liquidationDate,
            user: '',
            details: 'Liquidação concluída',
            value: c.brlValue
          });
        } else if (c.status === 'CANCELADO') {
          events.push({
            id: `${c.id}-cancelled`,
            contractId: c.id,
            event: 'Contrato cancelado',
            date: c.updatedAt,
            user: '',
            details: 'Contrato cancelado',
            value: 0
          });
        } else {
          events.push({
            id: `${c.id}-liquidation-due`,
            contractId: c.id,
            event: c.status === 'VENCIDO' ? 'Liquidação vencida' : 'Liquidação prevista',
            date: c.liquidationDate,
            user: '',
            details: `Situação atual: ${c.status}`,
            value: 0
          });
        }
        return events;
      })
    );
  }

  // --- Análise determinística (fatos calculados, sem IA) ---
  getAnalysis(contractId: string): Observable<CambioAnalysis> {
    return this.getContractById(contractId).pipe(
      switchMap((contract) =>
        contract
          ? this.market.getQuote(contract.currency).pipe(
              catchError(() => of(null)),
              map((quote) => ({ contract, quote }))
            )
          : of({ contract: null as ContratoCambio | null, quote: null as MarketQuote | null })
      ),
      map(({ contract, quote }) => {
        const facts: CambioAnalysisFact[] = [];
        if (contract) {
          if (quote && quote.rate > 0 && contract.exchangeRate > 0) {
            const delta = (contract.exchangeRate / quote.rate - 1) * 100;
            const dir = delta >= 0 ? 'acima' : 'abaixo';
            facts.push({
              tone: 'info',
              message:
                `Taxa do contrato ${Math.abs(delta).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% ${dir} da cotação atual. ` +
                this.describeQuote(quote)
            });
          } else {
            facts.push({ tone: 'info', message: 'Cotação atual indisponível para comparar com a taxa do contrato.' });
          }
          if (contract.status === 'ABERTO' || contract.status === 'VENCIDO') {
            const days = Math.ceil((contract.liquidationDate.getTime() - Date.now()) / DAY_MS);
            if (days < 0) {
              facts.push({ tone: 'warning', message: `Liquidação em atraso há ${-days} dia(s).` });
            } else {
              facts.push({ tone: days <= 7 ? 'warning' : 'info', message: `Liquidação prevista em ${days} dia(s).` });
            }
          }
        }
        return { contractId, facts, generatedAt: new Date() };
      })
    );
  }

  // --- Métricas reais (/metricas) ---
  private loadSummary(): Observable<{ m: CambioMetricasDto; contracts: ContratoCambio[] }> {
    return forkJoin({
      m: this.http.get<CambioMetricasDto>(`${this.api}/metricas`),
      contracts: this.getContracts()
    });
  }

  private liquidatedBrl(contracts: ContratoCambio[]): number {
    return contracts.filter((c) => c.status === 'LIQUIDADO').reduce((s, c) => s + (c.brlValue || 0), 0);
  }

  getMetrics(): Observable<CambioMetrics> {
    return this.loadSummary().pipe(
      map(({ m, contracts }) => ({
        totalContracts: m.totalContratos,
        openContracts: m.abertos,
        liquidatedValue: this.liquidatedBrl(contracts),
        pendingReceipts: m.volumeBrlAberto,
        totalGainLoss: 0,
        avgSpread: 0,
        avgLiquidationDays: 0
      }))
    );
  }

  getFinancialKPIs(): Observable<FinancialKPIs> {
    return this.loadSummary().pipe(
      map(({ m, contracts }) => ({
        exportedValue: 0,
        liquidatedValue: this.liquidatedBrl(contracts),
        pendingReceipts: m.volumeBrlAberto,
        gainLoss: 0,
        avgSpread: 0,
        avgLiquidationDays: 0,
        weightedAvgUsdRate: m.taxaMediaPonderadaUsd,
        expiringIn30Days: m.vencendo30Dias,
        overdueContracts: m.vencidos
      }))
    );
  }

  // --- Catálogos ---
  getBanks(): string[] {
    const all = new Set<string>([...REFERENCE_BANKS, ...this.seenBanks]);
    return Array.from(all).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  getCurrencies(): string[] {
    return [...this.currencies];
  }

  loadCurrencies(): Observable<string[]> {
    return this.http.get<string[]>(this.moedasApi).pipe(
      map((list) => (list ?? []).map((c) => c.toUpperCase())),
      tap((list) => {
        if (list.length > 0) {
          this.currencies = list;
        }
      }),
      map(() => this.getCurrencies()),
      catchError(() => of(this.getCurrencies()))
    );
  }

  getStatuses(): ContractStatus[] {
    return [...STATUSES];
  }
}
