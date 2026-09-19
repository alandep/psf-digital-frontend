// MOCK: In-app guided product tour state (§56). Data-driven; no backend.
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TourStep {
  sequence: number;
  title: string;
  content: string;
}

const TOUR_DONE_KEY = 'eip_tour_done';

@Injectable({ providedIn: 'root' })
export class ProductTourService {
  // Static step definitions (§56). Exposed as a readonly field, not a getter.
  readonly steps: TourStep[] = [
    { sequence: 1, title: 'Command Center', content: 'Sua central de comando com visão consolidada da operação.' },
    { sequence: 2, title: 'AI Hub', content: 'A inteligência artificial que apoia decisões e automações.' },
    { sequence: 3, title: 'Produtos e NCM', content: 'Cadastre produtos e classifique NCM com apoio da IA.' },
    { sequence: 4, title: 'Exportações', content: 'Crie e acompanhe suas operações de exportação ponta a ponta.' },
    { sequence: 5, title: 'Documentos', content: 'Gere e organize DUE, invoice, packing list e certificados.' },
    { sequence: 6, title: 'Logística', content: 'Controle embarques, portos, navios e containers.' },
    { sequence: 7, title: 'Financeiro', content: 'Acompanhe câmbio, pagamentos e trade finance.' },
    { sequence: 8, title: 'Compliance', content: 'Mantenha licenças, sanções e due diligence em dia.' },
  ];

  private activeSubject = new BehaviorSubject<boolean>(false);
  readonly active$ = this.activeSubject.asObservable();

  private currentSubject = new BehaviorSubject<number>(0);
  readonly current$ = this.currentSubject.asObservable();

  get total(): number {
    return this.steps.length;
  }

  get currentIndex(): number {
    return this.currentSubject.value;
  }

  getStep(i: number): TourStep {
    return this.steps[i];
  }

  start(): void {
    this.currentSubject.next(0);
    this.activeSubject.next(true);
  }

  next(): void {
    const i = this.currentSubject.value;
    if (i < this.steps.length - 1) {
      this.currentSubject.next(i + 1);
    } else {
      this.finish();
    }
  }

  prev(): void {
    const i = this.currentSubject.value;
    if (i > 0) {
      this.currentSubject.next(i - 1);
    }
  }

  skip(): void {
    this.finish();
  }

  finish(): void {
    this.activeSubject.next(false);
    try {
      localStorage.setItem(TOUR_DONE_KEY, 'true');
    } catch {
      // localStorage may be unavailable (SSR / privacy mode) - ignore.
    }
  }

  restart(): void {
    this.start();
  }
}
