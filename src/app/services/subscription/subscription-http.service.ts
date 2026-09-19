import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ISubscriptionService } from './subscription-service.interface';
import { SaasBillingMockService } from '../../../services/saasBillingMockService';
import { environment } from '../../../environments/environment';
import {
  Subscription,
  UsageMetric,
  Invoice,
  SaasPlan,
  AddonPack,
  DataExportJob,
  PlanCode,
  BillingInterval,
  SubscriptionStatus
} from '../../../types/saas-billing';

// --- Backend BFF DTOs (/bff/assinatura) ---
interface SubscriptionView {
  id: string;
  planCode: string;
  planName: string;
  billingInterval: string;
  amount: number;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd: string;
  paymentBrand?: string;
  paymentLast4?: string;
  licenseMode?: string;
}

interface UsageView {
  feature: string;
  label: string;
  used: number;
  included: number;
  unit: string;
  percent?: number;
}

interface InvoiceView {
  id: string;
  number?: string;
  period: string;
  planName: string;
  amount: number;
  status: string;
  issuedAt: string;
}

// HTTP gateway for the subscription module. Only used when
// environment.realApis.subscription === true; otherwise the mock adapter is
// provided. Methods with no backend endpoint delegate to the mock (marked
// PARTIAL) so screens keep working during incremental migration.
@Injectable({
  providedIn: 'root'
})
export class SubscriptionHttpService implements ISubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(SaasBillingMockService);
  private readonly api = `${environment.bffBaseUrl}/bff/assinatura`;

  // Maps a backend subscription status string to the front union, falling back
  // to ACTIVE for unknown values so the UI always renders a valid state.
  private mapStatus(status?: string): SubscriptionStatus {
    const s = (status || '').toUpperCase();
    const known: SubscriptionStatus[] = [
      'TRIALING', 'ACTIVE', 'PAST_DUE', 'GRACE_PERIOD',
      'SUSPENDED', 'CANCELED', 'TERMINATED'
    ];
    return (known as string[]).includes(s) ? (s as SubscriptionStatus) : 'ACTIVE';
  }

  private mapInterval(interval?: string): BillingInterval {
    return (interval || '').toUpperCase() === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
  }

  // Maps SubscriptionView -> front Subscription, filling fields the backend
  // does not provide with safe defaults.
  private toSubscription(v: SubscriptionView): Subscription {
    const end = v.currentPeriodEnd ? new Date(v.currentPeriodEnd) : new Date();
    const start = v.currentPeriodStart ? new Date(v.currentPeriodStart) : new Date();
    return {
      id: v.id,
      tenantId: '',
      planCode: (v.planCode as PlanCode) ?? 'BUSINESS',
      planName: v.planName ?? '',
      billingInterval: this.mapInterval(v.billingInterval),
      amount: v.amount ?? 0,
      status: this.mapStatus(v.status),
      currentPeriodStart: start,
      currentPeriodEnd: end,
      trialEnd: null,
      cancelAtPeriodEnd: false,
      paymentBrand: v.paymentBrand ?? '',
      paymentLast4: v.paymentLast4 ?? ''
    };
  }

  private toUsage(v: UsageView): UsageMetric {
    return {
      feature: v.feature,
      label: v.label,
      used: v.used,
      included: v.included,
      unit: v.unit
    };
  }

  private mapInvoiceStatus(status?: string): Invoice['status'] {
    const s = (status || '').toUpperCase();
    if (s === 'PAID') { return 'PAID'; }
    if (s === 'FAILED') { return 'FAILED'; }
    return 'OPEN';
  }

  private toInvoice(v: InvoiceView): Invoice {
    return {
      id: v.id,
      date: v.issuedAt ? new Date(v.issuedAt) : new Date(),
      amount: v.amount ?? 0,
      status: this.mapInvoiceStatus(v.status),
      planName: v.planName ?? '',
      period: v.period ?? ''
    };
  }

  // --- Backed by the backend BFF ---
  getCurrentSubscription(): Observable<Subscription> {
    return this.http
      .get<SubscriptionView>(this.api)
      .pipe(map((v) => this.toSubscription(v)));
  }

  getUsage(): Observable<UsageMetric[]> {
    return this.http
      .get<UsageView[]>(`${this.api}/uso`)
      .pipe(map((rows) => (rows ?? []).map((r) => this.toUsage(r))));
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http
      .get<InvoiceView[]>(`${this.api}/faturas`)
      .pipe(map((rows) => (rows ?? []).map((r) => this.toInvoice(r))));
  }

  changePlan(code: PlanCode): Observable<Subscription> {
    return this.http
      .post<SubscriptionView>(`${this.api}/plano`, { planCode: code })
      .pipe(map((v) => this.toSubscription(v)));
  }

  cancelSubscription(reason: string): Observable<Subscription> {
    return this.http
      .post<SubscriptionView>(`${this.api}/cancelar`, { reason })
      .pipe(map((v) => this.toSubscription(v)));
  }

  reactivate(): Observable<Subscription> {
    return this.http
      .post<SubscriptionView>(`${this.api}/reativar`, {})
      .pipe(map((v) => this.toSubscription(v)));
  }

  // PARTIAL: plan catalog served from mock (static); backend
  // GET /bff/assinatura/planos available for future async migration.
  getPlans(): SaasPlan[] {
    return this.mock.getPlans();
  }

  // PARTIAL: addon catalog is static; no backend endpoint.
  getAddons(): AddonPack[] {
    return this.mock.getAddons();
  }

  // PARTIAL: no backend endpoint for addon purchase.
  purchaseAddon(code: AddonPack['code']): Observable<AddonPack> {
    return this.mock.purchaseAddon(code);
  }

  // PARTIAL: no backend endpoint for data export request.
  requestDataExport(): Observable<DataExportJob> {
    return this.mock.requestDataExport();
  }

  // PARTIAL: no backend endpoint for data export job status.
  getDataExportJob(id: string): Observable<DataExportJob> {
    return this.mock.getDataExportJob(id);
  }
}
