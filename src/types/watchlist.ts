// Types for the EIP Intelligence Watchlist (MOCK). Backend-agnostic shapes so
// the mock service can later be swapped for a real API without changing consumers.

export type WatchlistTargetType =
  | 'COUNTRY'
  | 'PRODUCT'
  | 'NCM'
  | 'PORT'
  | 'COMMODITY'
  | 'REGULATION'
  | 'ROUTE';

export interface WatchlistItem {
  id: string;
  type: WatchlistTargetType;
  label: string;
  active: boolean;
}

export interface WatchlistSuggestion {
  type: WatchlistTargetType;
  label: string;
}
