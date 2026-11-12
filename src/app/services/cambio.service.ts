import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, exhaustMap, filter, map, scan, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ExchangeRate {
  currency: string;
  rate: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  /** Day variation in percent, when the source provides it. */
  pctChange?: number | null;
  ask?: number | null;
  high?: number | null;
  low?: number | null;
  /** Source code (AWESOMEAPI | BCB_PTAX) and its display name. */
  source?: string;
  sourceLabel?: string;
  /** True when the upstream failed and the last good value is being shown. */
  stale?: boolean;
}

/** Backend payload of GET /bff/mercado/cotacao/usd. */
interface CotacaoDto {
  currency: string;
  rate: number;
  ask: number | null;
  high: number | null;
  low: number | null;
  pctChange: number | null;
  trend: 'up' | 'down' | 'stable';
  source: string;
  sourceLabel: string;
  quotedAt: string;
  stale: boolean;
}

/**
 * Real-time USD/BRL commercial dollar for the toolbar. Polls the BFF
 * (GET /bff/mercado/cotacao/usd), which caches the upstream quote (AwesomeAPI,
 * falling back to the Banco Central PTAX) for ~30s, so the number of open
 * browsers does not multiply upstream calls. Nothing is simulated: if no real
 * quote has ever been received the stream emits null and the toolbar hides the
 * pill instead of showing a made-up value.
 */
@Injectable({ providedIn: 'root' })
export class CambioService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.bffBaseUrl + '/bff/mercado/cotacao/usd';
  private static readonly POLL_MS = 30000;

  /**
   * Shared stream (one HTTP poller regardless of subscribers). Starts when the
   * first subscriber arrives and stops when the last one leaves. Polling is
   * skipped while the tab is hidden.
   */
  readonly exchangeRate$: Observable<ExchangeRate | null> = timer(0, CambioService.POLL_MS).pipe(
    filter(() => typeof document === 'undefined' || !document.hidden),
    exhaustMap(() => this.fetch()),
    // Keep the last good value (flagged stale) if a later poll fails.
    scan<ExchangeRate | null, ExchangeRate | null>(
      (previous, next) => next ?? (previous ? { ...previous, stale: true } : null),
      null
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private fetch(): Observable<ExchangeRate | null> {
    return this.http.get<CotacaoDto>(this.api).pipe(
      map((d) => this.toExchangeRate(d)),
      catchError(() => of(null))
    );
  }

  private toExchangeRate(d: CotacaoDto): ExchangeRate {
    return {
      currency: d.currency || 'USD',
      rate: d.rate,
      trend: d.trend ?? 'stable',
      lastUpdated: d.quotedAt ? new Date(d.quotedAt) : new Date(),
      pctChange: d.pctChange,
      ask: d.ask,
      high: d.high,
      low: d.low,
      source: d.source,
      sourceLabel: d.sourceLabel,
      stale: d.stale
    };
  }
}