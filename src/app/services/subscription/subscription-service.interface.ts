import { Observable } from 'rxjs';
import {
  Subscription,
  UsageMetric,
  Invoice,
  SaasPlan,
  AddonPack,
  DataExportJob,
  PlanCode
} from '../../../types/saas-billing';

// Gateway interface for the subscription/assinatura module. Method names and
// return types mirror SaasBillingMockService EXACTLY (Observable vs sync) so
// the in-app consumers (assinatura, exportar-dados) can swap the concrete
// service without any other change.
export interface ISubscriptionService {
  getCurrentSubscription(): Observable<Subscription>;
  getUsage(): Observable<UsageMetric[]>;
  getInvoices(): Observable<Invoice[]>;

  // Static plan/addon catalog: SYNC in the mock (returns arrays).
  getPlans(): SaasPlan[];
  getAddons(): AddonPack[];

  changePlan(code: PlanCode): Observable<Subscription>;
  purchaseAddon(code: AddonPack['code']): Observable<AddonPack>;
  cancelSubscription(reason: string): Observable<Subscription>;
  reactivate(): Observable<Subscription>;

  requestDataExport(): Observable<DataExportJob>;
  getDataExportJob(id: string): Observable<DataExportJob>;
}
