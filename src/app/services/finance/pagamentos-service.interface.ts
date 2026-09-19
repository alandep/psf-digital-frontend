import { Observable } from 'rxjs';
import {
  Pagamento,
  PaymentReconciliation,
  PaymentNotification,
  PaymentTimelineEvent,
  PaymentAIInsights,
  PaymentMetrics,
  CashFlowProjection,
  PaymentFilters,
  PaymentCategory,
  PaymentStatus
} from '../../../types/pagamentos';

// Gateway interface for the financeiro/pagamentos module. Method names and
// return types mirror PagamentosMockService EXACTLY (Observable vs sync) so the
// pagamentos screen + detail dialog can swap the concrete service without any
// other change.
export interface IPagamentosService {
  getPayments(filters?: PaymentFilters): Observable<Pagamento[]>;
  getPaymentById(id: string): Observable<Pagamento | null>;
  createPayment(data: Partial<Pagamento>): Observable<Pagamento>;

  getReconciliations(paymentId: string): Observable<PaymentReconciliation[]>;
  getNotifications(paymentId: string): Observable<PaymentNotification[]>;
  getTimeline(paymentId: string): Observable<PaymentTimelineEvent[]>;
  getAIInsights(paymentId: string): Observable<PaymentAIInsights>;
  getMetrics(): Observable<PaymentMetrics>;
  getCashFlowProjection(): Observable<CashFlowProjection>;

  reconcilePayment(paymentId: string): Observable<PaymentReconciliation>;
  approvePayment(paymentId: string): Observable<Pagamento>;

  // Static dropdown catalog: SYNC in the mock (returns arrays).
  getBeneficiaries(): string[];
  getCategories(): PaymentCategory[];
  getBanks(): string[];
  getCurrencies(): string[];
  getStatuses(): PaymentStatus[];
}
