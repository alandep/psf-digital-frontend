import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IPagamentosService } from './pagamentos-service.interface';
import { PagamentosMockService } from '../../../services/pagamentosMockService';
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

// Mock adapter: delegates every method to PagamentosMockService so behavior is
// identical to the pre-gateway state.
@Injectable({
  providedIn: 'root'
})
export class PagamentosMockAdapter implements IPagamentosService {
  private readonly mock = inject(PagamentosMockService);

  getPayments(filters?: PaymentFilters): Observable<Pagamento[]> {
    return this.mock.getPayments(filters);
  }

  getPaymentById(id: string): Observable<Pagamento | null> {
    return this.mock.getPaymentById(id);
  }

  createPayment(data: Partial<Pagamento>): Observable<Pagamento> {
    return this.mock.createPayment(data);
  }

  getReconciliations(paymentId: string): Observable<PaymentReconciliation[]> {
    return this.mock.getReconciliations(paymentId);
  }

  getNotifications(paymentId: string): Observable<PaymentNotification[]> {
    return this.mock.getNotifications(paymentId);
  }

  getTimeline(paymentId: string): Observable<PaymentTimelineEvent[]> {
    return this.mock.getTimeline(paymentId);
  }

  getAIInsights(paymentId: string): Observable<PaymentAIInsights> {
    return this.mock.getAIInsights(paymentId);
  }

  getMetrics(): Observable<PaymentMetrics> {
    return this.mock.getMetrics();
  }

  getCashFlowProjection(): Observable<CashFlowProjection> {
    return this.mock.getCashFlowProjection();
  }

  reconcilePayment(paymentId: string): Observable<PaymentReconciliation> {
    return this.mock.reconcilePayment(paymentId);
  }

  approvePayment(paymentId: string): Observable<Pagamento> {
    return this.mock.approvePayment(paymentId);
  }

  getBeneficiaries(): string[] {
    return this.mock.getBeneficiaries();
  }

  getCategories(): PaymentCategory[] {
    return this.mock.getCategories();
  }

  getBanks(): string[] {
    return this.mock.getBanks();
  }

  getCurrencies(): string[] {
    return this.mock.getCurrencies();
  }

  getStatuses(): PaymentStatus[] {
    return this.mock.getStatuses();
  }
}
