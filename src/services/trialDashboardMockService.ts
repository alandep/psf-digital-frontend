// MOCK service for the Trial Command Center dashboard. In-memory state only.
// Replace method bodies with real API calls later; the shapes stay the same.
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  TrialDashboard,
  TrialSetupStep,
  DiscoveryShortcut,
} from '../types/trial-dashboard';

@Injectable({ providedIn: 'root' })
export class TrialDashboardMockService {
  private wait = 400;

  private steps: TrialSetupStep[] = [
    { key: 'company', label: 'Empresa', done: true },
    { key: 'product', label: 'Produto', done: true },
    { key: 'customer', label: 'Cliente', done: true },
    { key: 'first_export', label: 'Primeira exportação', done: false },
    { key: 'team', label: 'Convidar equipe', done: false },
  ];

  private planName = 'EIP Business';
  private daysRemaining = 11;
  private hasData = false;
  private sampleDataLoaded = false;

  private ms<T>(payload: T): Observable<T> {
    return of(payload).pipe(delay(this.wait));
  }

  private computeSetupPercent(): number {
    const total = this.steps.length;
    if (total === 0) return 0;
    const done = this.steps.filter((s) => s.done).length;
    return Math.round((done / total) * 100);
  }

  private snapshot(): TrialDashboard {
    return {
      planName: this.planName,
      daysRemaining: this.daysRemaining,
      setupPercent: this.computeSetupPercent(),
      steps: this.steps.map((s) => ({ ...s })),
      hasData: this.hasData,
      sampleDataLoaded: this.sampleDataLoaded,
    };
  }

  getDashboard(): Observable<TrialDashboard> {
    return this.ms(this.snapshot());
  }

  loadSampleData(): Observable<TrialDashboard> {
    this.sampleDataLoaded = true;
    this.hasData = true;
    return this.ms(this.snapshot());
  }

  removeSampleData(): Observable<TrialDashboard> {
    this.sampleDataLoaded = false;
    this.hasData = false;
    return this.ms(this.snapshot());
  }

  getDiscoveryShortcuts(): DiscoveryShortcut[] {
    return [
      { icon: 'auto_awesome', label: 'AI Hub', route: 'assistente-ia' },
      { icon: 'flight_takeoff', label: 'Exportações', route: 'exportacoes/gerenciar' },
      { icon: 'description', label: 'Documentos', route: 'documentos/gerenciar' },
      { icon: 'verified_user', label: 'Compliance', route: 'compliance/painel' },
      { icon: 'local_shipping', label: 'Logística', route: 'logistica/embarque' },
    ];
  }
}
