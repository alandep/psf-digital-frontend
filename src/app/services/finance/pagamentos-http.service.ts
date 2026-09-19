import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IPagamentosService } from './pagamentos-service.interface';
import { PagamentosMockService } from '../../../services/pagamentosMockService';
import { environment } from '../../../environments/environment';
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
  PaymentStatus,
  PaymentType
} from '../../../types/pagamentos';

// --- Backend BFF DTOs (/bff/financeiro/pagamentos) ---
interface PagamentoView {
  id: string;
  reference?: string;
  beneficiary?: string;
  amount: number;
  currency?: string;
  status: string;
  dueDate?: string;
  tipo?: string;
  descricao?: string;
}

interface CriarPagamentoRequest {
  beneficiary: string;
  amount: number;
  currency?: string;
  dueDate?: string;
  tipo?: string;
  descricao?: string;
}

// HTTP gateway for the financeiro/pagamentos module. Only used when
// environment.realApis.finance === true. The front mock is far richer than the
// backend, so the rich extras (reconciliations, notifications, timeline, AI
// insights, metrics, cash flow) and all sync dropdown catalogs DELEGATE to the
// injected mock (marked PARTIAL).
@Injectable({
  providedIn: 'root'
})
export class PagamentosHttpService implements IPagamentosService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(PagamentosMockService);
  private readonly api = `${environment.bffBaseUrl}/bff/financeiro/pagamentos`;

  // Maps backend status (PENDENTE/PAGO/ATRASADO/CANCELADO) to the front
  // PaymentStatus union, falling back to 'PENDENTE' for unknown values.
  private mapStatus(status?: string): PaymentStatus {
    switch ((status || '').toUpperCase()) {
      case 'PAGO': return 'PAGO';
      case 'ATRASADO': return 'VENCIDO';
      case 'VENCIDO': return 'VENCIDO';
      case 'CANCELADO': return 'CANCELADO';
      case 'APROVADO': return 'APROVADO';
      case 'CONCILIADO': return 'CONCILIADO';
      case 'PENDENTE': return 'PENDENTE';
      default: return 'PENDENTE';
    }
  }

  private mapType(tipo?: string): PaymentType {
    return (tipo || '').toUpperCase() === 'INTERNACIONAL' ? 'INTERNACIONAL' : 'NACIONAL';
  }

  // Maps PagamentoView -> front Pagamento, filling rich fields the backend does
  // not provide with safe defaults so the UI always renders a valid row.
  private toPagamento(v: PagamentoView): Pagamento {
    const now = new Date();
    return {
      id: v.id,
      paymentNumber: v.reference ?? '',
      company: 'PSF Exportadora Ltda',
      beneficiary: v.beneficiary ?? '',
      paymentType: this.mapType(v.tipo),
      category: 'OUTROS' as PaymentCategory,
      bank: '',
      bankAccount: '',
      currency: v.currency ?? 'BRL',
      amount: v.amount ?? 0,
      issueDate: now,
      dueDate: v.dueDate ? new Date(v.dueDate) : now,
      paymentDate: null,
      status: this.mapStatus(v.status),
      linkedExportNumber: '',
      linkedContractNumber: '',
      linkedInvoiceNumber: '',
      linkedDueNumber: '',
      costCenter: '',
      observations: v.descricao ?? '',
      aiFinancialScore: 0,
      swift: null,
      iban: null,
      beneficiaryBank: null,
      beneficiaryCountry: null,
      createdAt: now,
      updatedAt: now
    };
  }

  private toCreateRequest(e: Partial<Pagamento>): CriarPagamentoRequest {
    return {
      beneficiary: e.beneficiary ?? '',
      amount: e.amount ?? 0,
      currency: e.currency,
      dueDate: e.dueDate ? new Date(e.dueDate).toISOString() : undefined,
      tipo: e.paymentType,
      descricao: e.observations
    };
  }

  // --- Backed by the backend BFF ---
  getPayments(filters?: PaymentFilters): Observable<Pagamento[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http
      .get<PagamentoView[]>(this.api, { params })
      .pipe(map((rows) => (rows ?? []).map((r) => this.toPagamento(r))));
  }

  getPaymentById(id: string): Observable<Pagamento | null> {
    return this.http
      .get<PagamentoView>(`${this.api}/${id}`)
      .pipe(map((v) => (v ? this.toPagamento(v) : null)));
  }

  createPayment(data: Partial<Pagamento>): Observable<Pagamento> {
    return this.http
      .post<PagamentoView>(this.api, this.toCreateRequest(data))
      .pipe(map((v) => this.toPagamento(v)));
  }

  // PARTIAL: reconciliation detail has no backend read endpoint.
  getReconciliations(paymentId: string): Observable<PaymentReconciliation[]> {
    return this.mock.getReconciliations(paymentId);
  }

  // PARTIAL: notifications have no backend endpoint.
  getNotifications(paymentId: string): Observable<PaymentNotification[]> {
    return this.mock.getNotifications(paymentId);
  }

  // PARTIAL: financial timeline has no backend endpoint.
  getTimeline(paymentId: string): Observable<PaymentTimelineEvent[]> {
    return this.mock.getTimeline(paymentId);
  }

  // PARTIAL: AI insights have no backend endpoint.
  getAIInsights(paymentId: string): Observable<PaymentAIInsights> {
    return this.mock.getAIInsights(paymentId);
  }

  // PARTIAL: the backend exposes GET /resumo with a different shape; the rich
  // PaymentMetrics is mock-only for now.
  getMetrics(): Observable<PaymentMetrics> {
    return this.mock.getMetrics();
  }

  // PARTIAL: cash flow projection has no backend endpoint.
  getCashFlowProjection(): Observable<CashFlowProjection> {
    return this.mock.getCashFlowProjection();
  }

  // PARTIAL: manual reconciliation has no backend endpoint.
  reconcilePayment(paymentId: string): Observable<PaymentReconciliation> {
    return this.mock.reconcilePayment(paymentId);
  }

  // PARTIAL: approval maps to the /pagar transition on the backend; delegated
  // to the mock until the transition contract is wired.
  approvePayment(paymentId: string): Observable<Pagamento> {
    return this.mock.approvePayment(paymentId);
  }

  // PARTIAL: dropdown catalogs are static/mock-only (no backend endpoint).
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
