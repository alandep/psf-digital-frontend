import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** A currency-vs-BRL commercial quote served by the BFF (real market data). */
export interface MarketQuote {
  currency: string;
  pair: string;
  /** Value to use/display (the bid). */
  rate: number;
  ask: number | null;
  high: number | null;
  low: number | null;
  /** Day variation in percent. */
  pctChange: number | null;
  /** Previous close (bid minus the day's absolute variation). */
  previousClose: number | null;
  trend: 'up' | 'down' | 'stable';
  source: string;
  sourceLabel: string;
  quotedAt: Date;
  /** True when the upstream failed and the last good value is served. */
  stale: boolean;
}

interface MarketQuoteDto {
  currency: string;
  pair: string;
  rate: number;
  ask: number | null;
  high: number | null;
  low: number | null;
  pctChange: number | null;
  previousClose: number | null;
  trend: 'up' | 'down' | 'stable';
  source: string;
  sourceLabel: string;
  quotedAt: string;
  stale: boolean;
}

/**
 * Single entry point for FX quotes against BRL (GET /bff/mercado/...). Every
 * screen that needs a currency rate (exchange screen, simulators, new
 * contracts, receivables, copilot) must go through this service instead of
 * hardcoding a rate. The backend caches upstream calls, so it is cheap to call.
 */
@Injectable({ providedIn: 'root' })
export class MarketQuoteService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.bffBaseUrl + '/bff/mercado';

  /** One currency quote (errors propagate: the caller decides how to degrade). */
  getQuote(currency: string): Observable<MarketQuote> {
    return this.http
      .get<MarketQuoteDto>(this.api + '/cotacao/' + encodeURIComponent(currency))
      .pipe(map((d) => this.toQuote(d)));
  }

  /** Several quotes at once, in request order; unavailable ones are omitted. */
  getQuotes(currencies: string[]): Observable<MarketQuote[]> {
    const params = new HttpParams().set('moedas', currencies.join(','));
    return this.http
      .get<MarketQuoteDto[]>(this.api + '/cotacoes', { params })
      .pipe(map((list) => (list ?? []).map((d) => this.toQuote(d))));
  }

  /**
   * Convenience for forms and calculators: the current rate to convert 1 unit
   * of {@code currency} into BRL, or null when no real quote is available (the
   * caller must then ask the user to type the rate - never assume one).
   * BRL is always 1.
   */
  getRate(currency: string): Observable<number | null> {
    const code = (currency || '').trim().toUpperCase();
    if (!code || code === 'BRL') {
      return of(1);
    }
    return this.getQuote(code).pipe(
      map((q) => q.rate),
      catchError(() => of(null))
    );
  }

  private toQuote(d: MarketQuoteDto): MarketQuote {
    return {
      currency: d.currency,
      pair: d.pair,
      rate: d.rate,
      ask: d.ask,
      high: d.high,
      low: d.low,
      pctChange: d.pctChange,
      previousClose: d.previousClose,
      trend: d.trend ?? 'stable',
      source: d.source,
      sourceLabel: d.sourceLabel,
      quotedAt: d.quotedAt ? new Date(d.quotedAt) : new Date(),
      stale: d.stale
    };
  }
}