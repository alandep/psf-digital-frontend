import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICrmService } from './crm-service.interface';
import { CrmMockService } from '../../../services/crmMockService';
import {
  Customer,
  Contact,
  Opportunity,
  CrmMetrics,
  CustomerSegment,
  OpportunityStage,
  CrmDashboard
} from '../../../types/crm';

// Mock adapter: delegates every existing method to CrmMockService so behavior
// is identical to the pre-gateway state. CrmMockService has no dashboard
// endpoint, so getDashboard() aggregates the pipeline in-memory from the
// opportunities list.
@Injectable({
  providedIn: 'root'
})
export class CrmMockAdapter implements ICrmService {
  private readonly mock = inject(CrmMockService);

  getCustomers(): Observable<Customer[]> {
    return this.mock.getCustomers();
  }

  getContacts(): Observable<Contact[]> {
    return this.mock.getContacts();
  }

  getOpportunities(): Observable<Opportunity[]> {
    return this.mock.getOpportunities();
  }

  getMetrics(): Observable<CrmMetrics> {
    return this.mock.getMetrics();
  }

  createCustomer(data: Partial<Customer>): Observable<Customer> {
    return this.mock.createCustomer(data);
  }

  createOpportunity(data: Partial<Opportunity>): Observable<Opportunity> {
    return this.mock.createOpportunity(data);
  }

  getSegments(): CustomerSegment[] {
    return this.mock.getSegments();
  }

  getCountries(): string[] {
    return this.mock.getCountries();
  }

  getStages(): OpportunityStage[] {
    return this.mock.getStages();
  }

  // CrmMockService has no dashboard method, so aggregate the pipeline from the
  // in-memory opportunities (grouping by stage) to match the backend
  // GET /bff/crm/oportunidades/dashboard response shape.
  getDashboard(): Observable<CrmDashboard> {
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
