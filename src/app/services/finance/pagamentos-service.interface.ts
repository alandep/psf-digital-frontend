import { Observable } from 'rxjs';
import {
  Pagamento,
  PaymentTimelineEvent,
  PaymentMetrics,
  CashFlowProjection,
  PaymentFilters,
  PaymentStatus
} from '../../../types/pagamentos';

// Gateway da tela financeiro/pagamentos. Implementação única:
// PagamentosHttpService (BFF /bff/financeiro/pagamentos?tipo=PAGAMENTO).
export interface IPagamentosService {
  getPayments(filters?: PaymentFilters): Observable<Pagamento[]>;
  getPaymentById(id: string): Observable<Pagamento | null>;
  createPayment(data: Partial<Pagamento>): Observable<Pagamento>;
  /** Só itens em aberto podem ser editados (regra do backend). */
  updatePayment(id: string, data: Partial<Pagamento>): Observable<Pagamento>;
  /** Marca como pago (POST /{id}/pagar). */
  payPayment(id: string, paidAt?: Date): Observable<Pagamento>;
  cancelPayment(id: string): Observable<Pagamento>;

  /** Linha do tempo montada a partir do próprio lançamento. */
  getTimeline(paymentId: string): Observable<PaymentTimelineEvent[]>;
  /** Métricas derivadas da lista real (totais em BRL pela cotação real). */
  getMetrics(): Observable<PaymentMetrics>;
  /** Projeção derivada da lista real agrupada por mês de vencimento. */
  getCashFlowProjection(): Observable<CashFlowProjection>;

  // Catálogos síncronos
  getBeneficiaries(): string[];
  getCurrencies(): string[];
  /** Moedas suportadas pelo backend (GET /bff/mercado/moedas) + BRL. */
  loadCurrencies(): Observable<string[]>;
  getStatuses(): PaymentStatus[];
}
