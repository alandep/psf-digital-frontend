import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ICrmService } from './crm-service.interface';
import { CrmMockService } from '../../../services/crmMockService';
import { environment } from '../../../environments/environment';
import {
  Customer,
  Contact,
  Opportunity,
  CrmMetrics,
  CustomerSegment,
  OpportunityStage,
  CrmDashboard
} from '../../../types/crm';

// HTTP gateway for the CRM module. Only used when environment.realApis.crm ===
// true; otherwise the mock adapter is provided. The front mock is far richer
// than the backend, so the rich methods currently DELEGATE to the injected
// mock (marked PARTIAL) because the backend returns different DTO shapes
// (clientes/leads/oportunidades views) that still need mapping. Only
// getDashboard() consumes the backend today, overlaying the real response on
// top of the mock aggregation so there is always a graceful fallback.
@Injectable({
  providedIn: 'root'
})
export class CrmHttpService implements ICrmService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(CrmMockService);
  private readonly api = `${environment.bffBaseUrl}/bff/crm`;

  // PARTIAL: backend exposes a different clientes view (CustomerView DTO) than
  // the rich front Customer; mapping is deferred, so delegate to the mock.
  getCustomers(): Observable<Customer[]> {
    return this.mock.getCustomers();
  }

  // PARTIAL: backend exposes a different leads/contatos view than the rich
  // front Contact; mapping is deferred, so delegate to the mock.
  getContacts(): Observable<Contact[]> {
    return this.mock.getContacts();
  }

  // PARTIAL: backend exposes a different oportunidades view than the rich
  // front Opportunity; mapping is deferred, so delegate to the mock.
  getOpportunities(): Observable<Opportunity[]> {
    return this.mock.getOpportunities();
  }

  // PARTIAL: backend has no aggregated metrics endpoint matching CrmMetrics;
  // mapping is deferred, so delegate to the mock.
  getMetrics(): Observable<CrmMetrics> {
    return this.mock.getMetrics();
  }

  // PARTIAL: backend create expects a different request DTO than the rich
  // front Customer; mapping is deferred, so delegate to the mock.
  createCustomer(data: Partial<Customer>): Observable<Customer> {
    return this.mock.createCustomer(data);
  }

  // PARTIAL: backend create expects a different request DTO than the rich
  // front Opportunity; mapping is deferred, so delegate to the mock.
  createOpportunity(data: Partial<Opportunity>): Observable<Opportunity> {
    return this.mock.createOpportunity(data);
  }

  // PARTIAL: static catalog, front-only concept; delegate to the mock.
  getSegments(): CustomerSegment[] {
    return this.mock.getSegments();
  }

  // PARTIAL: static catalog derived from mock data; delegate to the mock.
  getCountries(): string[] {
    return this.mock.getCountries();
  }

  // PARTIAL: static catalog, front-only concept; delegate to the mock.
  getStages(): OpportunityStage[] {
    return this.mock.getStages();
  }

  // Consumes GET /bff/crm/oportunidades/dashboard; falls back to the mock
  // aggregation when the backend is unavailable or returns nothing.
  getDashboard(): Observable<CrmDashboard> {
    const backend$ = this.http
      .get<CrmDashboard>(`${this.api}/oportunidades/dashboard`)
      .pipe(catchError(() => of<CrmDashboard | null>(null)));
    return forkJoin({ mockDash: this.mockDashboard(), backend: backend$ }).pipe(
      map(({ mockDash, backend }) => (backend && backend.total != null ? backend : mockDash))
    );
  }

  // Mirrors the mock adapter's aggregation: builds a CrmDashboard from the
  // in-memory opportunities (grouping by stage) so the dashboard still renders
  // when the backend cannot be reached.
  private mockDashboard(): Observable<CrmDashboard> {
    return this.mock.getOpportunities().pipe(
      map((opps) => {
        const counts = new Map<string, { quantidade: number; valorEstimado: number }>();
        let valorTotalEstimado = 0;
        for (const o of opps) {
          const estagio = o.stage;
          const bucket = counts.get(estagio) ?? { quantidade: 0, valorEstimado: 0 };
          bucket.quantidade += 1;
          bucket.valorEstimado += o.estimatedValue ?? 0;
          counts.set(estagio, bucket);
          valorTotalEstimado += o.estimatedValue ?? 0;
        }
        const porEstagio = Array.from(counts.entries()).map(([estagio, b]) => ({
          estagio,
          quantidade: b.quantidade,
          valorEstimado: b.valorEstimado
        }));
        return { total: opps.length, valorTotalEstimado, porEstagio } as CrmDashboard;
      })
    );
  }
}
