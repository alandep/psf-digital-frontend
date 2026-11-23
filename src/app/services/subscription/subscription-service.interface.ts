import { Observable } from 'rxjs';
import {
  ActivateRequest,
  ApiAddon,
  ApiPlan,
  CancelRequest,
  ChangePlanRequest,
  DownloadedFile,
  InvoiceApi,
  PackPurchaseRequest,
  PackPurchaseResponse,
  PagamentoPayload,
  PixView,
  SubscriptionView,
  UsageEntry,
  UsageFeature,
  UsageResponse
} from '../../../types/billing-api';

/** Gateway da área logada de assinatura (contrato docs/billing-asaas-contract.md §4.2 e §4.3). */
export interface ISubscriptionService {
  current(): Observable<SubscriptionView>;
  plans(): Observable<ApiPlan[]>;
  addons(): Observable<ApiAddon[]>;
  usage(): Observable<UsageResponse>;
  statement(feature: Extract<UsageFeature, 'AI' | 'OCR'>, limit?: number): Observable<UsageEntry[]>;
  invoices(): Observable<InvoiceApi[]>;
  invoicePdf(id: string): Observable<Blob>;
  invoicePix(id: string): Observable<PixView>;

  activate(body: ActivateRequest): Observable<SubscriptionView>;
  changePlan(body: ChangePlanRequest): Observable<SubscriptionView>;
  changePaymentMethod(body: PagamentoPayload): Observable<SubscriptionView>;
  cancel(body: CancelRequest): Observable<SubscriptionView>;
  reactivate(): Observable<SubscriptionView>;
  purchasePack(body: PackPurchaseRequest): Observable<PackPurchaseResponse>;

  /** GET /bff/admin/exportar-dados (zip). */
  dataExport(): Observable<DownloadedFile>;
}
