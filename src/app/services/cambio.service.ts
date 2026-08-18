import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ExchangeRate {
  currency: string;
  rate: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

@Injectable({ providedIn: 'root' })
export class CambioService implements OnDestroy {
  private readonly baseRate = 5.18;
  private readonly rateSubject = new BehaviorSubject<ExchangeRate>({
    currency: 'USD',
    rate: this.baseRate,
    trend: 'stable',
    lastUpdated: new Date()
  });
  private simulationSub?: Subscription;

  constructor() {
    this.startRateSimulation();
  }

  ngOnDestroy(): void {
    this.simulationSub?.unsubscribe();
  }

  get exchangeRate$(): Observable<ExchangeRate> {
    return this.rateSubject.asObservable();
  }

  get currentRate(): ExchangeRate {
    return this.rateSubject.value;
  }

  private startRateSimulation(): void {
    this.simulationSub = interval(30000).pipe(
      map(() => this.generateFluctuation())
    ).subscribe(rate => this.rateSubject.next(rate));
  }

  private generateFluctuation(): ExchangeRate {
    const previous = this.rateSubject.value.rate;
    const change = (Math.random() - 0.5) * 0.05; // ±2.5 centavos (~±0.5%)
    const newRate = Math.round((previous + change) * 100) / 100;
    const clampedRate = Math.max(4.50, Math.min(6.00, newRate)); // Keep within reasonable bounds
    const trend: 'up' | 'down' | 'stable' = clampedRate > previous ? 'up' : clampedRate < previous ? 'down' : 'stable';

    return {
      currency: 'USD',
      rate: clampedRate,
      trend,
      lastUpdated: new Date()
    };
  }
}
