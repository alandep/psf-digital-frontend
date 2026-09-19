import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ISubscriptionService } from './subscription-service.interface';
import { SaasBillingMockService } from '../../../services/saasBillingMockService';
import {
  Subscription,
  UsageMetric,
  Invoice,
  SaasPlan,
  AddonPack,
  DataExportJob,
  PlanCode
} from '../../../types/saas-billing';

// Mock adapter: delegates every method to SaasBillingMockService so behavior
// is identical to the pre-gateway state.
@Injectable({
  providedIn: 'root'
})
export class SubscriptionMockAdapter implements ISubscriptionService {
  private readonly mock = inject(SaasBillingMockService);

  getCurrentSubscription(): Observable<Subscription> {
    return this.mock.getCurrentSubscription();
  }

  getUsage(): Observable<UsageMetric[]> {
    return this.mock.getUsage();
  }

  getInvoices(): Observable<Invoice[]> {
    return this.mock.getInvoices();
  }

  getPlans(): SaasPlan[] {
    return this.mock.getPlans();
  }

  getAddons(): AddonPack[] {
    return this.mock.getAddons();
  }

  changePlan(code: PlanCode): Observable<Subscription> {
    return this.mock.changePlan(code);
  }

  purchaseAddon(code: AddonPack['code']): Observable<AddonPack> {
    return this.mock.purchaseAddon(code);
  }

  cancelSubscription(reason: string): Observable<Subscription> {
    return this.mock.cancelSubscription(reason);
  }

  reactivate(): Observable<Subscription> {
    return this.mock.reactivate();
  }

  requestDataExport(): Observable<DataExportJob> {
    return this.mock.requestDataExport();
  }

  getDataExportJob(id: string): Observable<DataExportJob> {
    return this.mock.getDataExportJob(id);
  }
}
