// MOCK service for the EIP Intelligence Watchlist + Alerts. In-memory and
// mutable so add/remove/toggle persist within a session. Replace method bodies
// with real API calls later; the shapes stay the same. Dependency-free.
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  WatchlistItem,
  WatchlistSuggestion,
  WatchlistTargetType,
} from '../types/watchlist';
import { IntelligenceAlert } from '../types/intelligence-alert';

// pt-BR labels for the watchlist target types.
export const TARGET_TYPE_LABELS: Record<WatchlistTargetType, string> = {
  COUNTRY: 'País',
  PRODUCT: 'Produto',
  NCM: 'NCM',
  PORT: 'Porto',
  COMMODITY: 'Commodity',
  REGULATION: 'Tema regulatório',
  ROUTE: 'Rota',
};

@Injectable({ providedIn: 'root' })
export class WatchlistMockService {
  private wait = 400;
  private seq = 100;

  // Mutable in-memory watchlist (persists in-session).
  private items: WatchlistItem[] = [
    { id: 'WL-001', type: 'COMMODITY', label: 'Carne bovina', active: true },
    { id: 'WL-002', type: 'COUNTRY', label: 'China', active: true },
    { id: 'WL-003', type: 'PORT', label: 'Porto de Santos', active: true },
    { id: 'WL-004', type: 'REGULATION', label: 'Habilitações MAPA', active: false },
  ];

  private ms<T>(payload: T): Observable<T> {
    return of(payload).pipe(delay(this.wait));
  }

  private nextId(prefix: string): string {
    this.seq += 1;
    return `${prefix}-${this.seq}`;
  }

  private snapshot(): WatchlistItem[] {
    // Return a copy so consumers cannot mutate the source list directly.
    return this.items.map((i) => ({ ...i }));
  }

  getWatchlist(): Observable<WatchlistItem[]> {
    return this.ms(this.snapshot());
  }

  addItem(type: WatchlistTargetType, label: string): Observable<WatchlistItem[]> {
    this.items = [
      ...this.items,
      { id: this.nextId('WL'), type, label: label.trim(), active: true },
    ];
    return this.ms(this.snapshot());
  }

  removeItem(id: string): Observable<WatchlistItem[]> {
    this.items = this.items.filter((i) => i.id !== id);
    return this.ms(this.snapshot());
  }

  toggleItem(id: string): Observable<WatchlistItem[]> {
    this.items = this.items.map((i) =>
      i.id === id ? { ...i, active: !i.active } : i
    );
    return this.ms(this.snapshot());
  }

  getSuggestions(): WatchlistSuggestion[] {
    return [
      { type: 'COUNTRY', label: 'Estados Unidos' },
      { type: 'COMMODITY', label: 'Soja' },
      { type: 'COMMODITY', label: 'Café' },
      { type: 'PORT', label: 'Porto de Paranaguá' },
      { type: 'NCM', label: '0201 — Carnes bovinas' },
      { type: 'ROUTE', label: 'Brasil → Ásia' },
    ];
  }

  // --- Alerts (MOCK) ---
  private daysAgo(d: number): Date {
    return new Date(Date.now() - d * 24 * 60 * 60_000);
  }

  private alerts: IntelligenceAlert[] = [
    {
      id: 'ALR-001',
      title: 'China / Carne bovina',
      impactLevel: 'HIGH',
      relatedTo: 'China · Carne bovina',
      affectedOperations: 3,
      summary:
        'Possível revisão de habilitações pode exigir atenção em embarques em trânsito.',
      createdAt: this.daysAgo(0),
      read: false,
    },
    {
      id: 'ALR-002',
      title: 'Congestionamento no Porto de Santos',
      impactLevel: 'MEDIUM',
      relatedTo: 'Porto de Santos',
      affectedOperations: 2,
      summary: 'Atrasos previstos podem impactar janelas de embarque.',
      createdAt: this.daysAgo(1),
      read: false,
    },
    {
      id: 'ALR-003',
      title: 'Nova regra MAPA',
      impactLevel: 'MEDIUM',
      relatedTo: 'Habilitações MAPA',
      affectedOperations: 1,
      summary: 'Atualização de requisitos documentais.',
      createdAt: this.daysAgo(3),
      read: true,
    },
    {
      id: 'ALR-004',
      title: 'Oportunidade: EUA',
      impactLevel: 'LOW',
      relatedTo: 'Estados Unidos · Soja',
      affectedOperations: 0,
      summary: 'Demanda crescente identificada.',
      createdAt: this.daysAgo(5),
      read: true,
    },
  ];

  private alertsSnapshot(): IntelligenceAlert[] {
    return this.alerts
      .map((a) => ({ ...a }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getAlerts(): Observable<IntelligenceAlert[]> {
    return this.ms(this.alertsSnapshot());
  }

  markAlertRead(id: string): Observable<IntelligenceAlert[]> {
    this.alerts = this.alerts.map((a) =>
      a.id === id ? { ...a, read: true } : a
    );
    return this.ms(this.alertsSnapshot());
  }
}
