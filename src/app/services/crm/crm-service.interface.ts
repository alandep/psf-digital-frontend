import { Observable } from 'rxjs';
import {
  Customer,
  Contact,
  Opportunity,
  CrmMetrics,
  CustomerSegment,
  OpportunityStage,
  CrmDashboard
} from '../../../types/crm';

// Gateway interface for the CRM module. Method names and return types mirror
// CrmMockService EXACTLY (Observable vs sync) so CRM screens can swap the
// concrete service for the InjectionToken without any other change. The
// getDashboard() method is backed by GET /bff/crm/oportunidades/dashboard in
// the HTTP adapter (with mock fallback) and by aggregation in the mock adapter.
export interface ICrmService {
  getCustomers(): Observable<Customer[]>;
  getContacts(): Observable<Contact[]>;
  getOpportunities(): Observable<Opportunity[]>;
  getMetrics(): Observable<CrmMetrics>;
  createCustomer(data: Partial<Customer>): Observable<Customer>;
  createOpportunity(data: Partial<Opportunity>): Observable<Opportunity>;
  getSegments(): CustomerSegment[];
  getCountries(): string[];
  getStages(): OpportunityStage[];
  getDashboard(): Observable<CrmDashboard>;
}
