import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { MarketQuote, MarketQuoteService } from './market-quote.service';

interface RateResult {
  currency: string;
  rate: number | null;
  quote: MarketQuote | null;
}

/**
 * Keeps a form "exchange rate" control prefilled with the REAL market rate for
 * the selected currency, instead of a hardcoded default.
 *
 * - On open: fills the control unless the user already edited it.
 * - On each currency change: refreshes it (the old rate belongs to another
 *   currency, so it would be wrong to keep it).
 * - If no real quote is available the control is cleared, so a required
 *   validator forces the user to type the rate: no rate is ever assumed.
 * - The user can always overwrite the value (negotiated/contract rates).
 *
 * @param onInfo receives a short pt-BR message about the source (for a hint)
 */
export function bindLiveRate(
  market: MarketQuoteService,
  rateControl: AbstractControl,
  currency$: Observable<string | null | undefined>,
  destroyRef: DestroyRef,
  onInfo?: (message: string) => void
): void {
  let first = true;
  currency$
    .pipe(
      map((c) => (c ?? '').trim().toUpperCase()),
      distinctUntilChanged(),
      switchMap((currency): Observable<RateResult> => {
        if (!currency || currency === 'BRL') {
          return of({ currency, rate: 1, quote: null });
        }
        return market.getQuote(currency).pipe(
          map((quote) => ({ currency, rate: quote.rate, quote })),
          catchError(() => of({ currency, rate: null, quote: null }))
        );
      }),
      takeUntilDestroyed(destroyRef)
    )
    .subscribe(({ currency, rate, quote }) => {
      // On open, never overwrite what the user already typed.
      if (!first || !rateControl.dirty) {
        rateControl.setValue(rate);
      }
      first = false;
      if (!onInfo) {
        return;
      }
      if (quote) {
        const hora = quote.quotedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        onInfo(
          'Cotação ' + currency + '/BRL: ' + quote.rate.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) +
          ' (' + quote.sourceLabel + ', ' + hora + ')' + (quote.stale ? ' - desatualizada' : '')
        );
      } else if (rate === null) {
        onInfo('Cotação indisponível no momento: informe a taxa manualmente.');
      } else {
        onInfo('');
      }
    });
}