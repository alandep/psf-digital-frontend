import { MarketQuote } from '../market/market-quote.service';
import { QuotationData } from '../../../types/cambio';

/** Maps a real market quote to the exchange-screen QuotationData shape. */
export function toQuotationData(q: MarketQuote): QuotationData {
  return {
    currency: q.currency,
    currentRate: q.rate,
    previousClose: q.previousClose ?? q.rate,
    dailyChange: q.pctChange ?? 0,
    trend: q.trend === 'up' ? 'UP' : q.trend === 'down' ? 'DOWN' : 'STABLE',
    lastUpdated: q.quotedAt,
    source: q.sourceLabel
  };
}

/** Currencies shown on the exchange screen quotation panel. */
export const COTACOES_MOEDAS = ['USD', 'EUR', 'GBP'];