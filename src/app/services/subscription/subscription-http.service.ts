import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ISubscriptionService } from './subscription-service.interface';
import { environment } from '../../../environments/environment';
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

const EXPORT_FALLBACK_NAME = 'eip-exportacao.zip';

/** Extrai o nome do arquivo do header Content-Disposition (filename*= ou filename=). */
export function filenameFromDisposition(header: string | null, fallback: string): string {
  if (!header) {
    return fallback;
  }
  const star = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ''));
    } catch {
      /* usa o próximo formato */
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : fallback;
}

/** Implementação real (BFF). Usada quando environment.realApis.subscription === true. */
@Injectable({ providedIn: 'root' })
export class SubscriptionHttpService implements ISubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/assinatura`;

  current(): Observable<SubscriptionView> {
    return this.http.get<SubscriptionView>(this.api);
  }

  plans(): Observable<ApiPlan[]> {
    return this.http.get<ApiPlan[]>(`${this.api}/planos`);
  }

  addons(): Observable<ApiAddon[]> {
    return this.http.get<ApiAddon[]>(`${this.api}/pacotes`);
  }

  usage(): Observable<UsageResponse> {
    return this.http.get<UsageResponse>(`${this.api}/uso`);
  }

  statement(feature: Extract<UsageFeature, 'AI' | 'OCR'>, limit = 200): Observable<UsageEntry[]> {
    const params = new HttpParams().set('feature', feature).set('limit', String(limit));
    return this.http.get<UsageEntry[]>(`${this.api}/uso/extrato`, { params });
  }

  invoices(): Observable<InvoiceApi[]> {
    return this.http.get<InvoiceApi[]>(`${this.api}/faturas`);
  }

  invoicePdf(id: string): Observable<Blob> {
    return this.http.get(`${this.api}/faturas/${encodeURIComponent(id)}/pdf`, { responseType: 'blob' });
  }

  invoicePix(id: string): Observable<PixView> {
    return this.http.get<PixView>(`${this.api}/faturas/${encodeURIComponent(id)}/pix`);
  }

  activate(body: ActivateRequest): Observable<SubscriptionView> {
    return this.http.post<SubscriptionView>(`${this.api}/ativar`, body);
  }

  changePlan(body: ChangePlanRequest): Observable<SubscriptionView> {
    return this.http.post<SubscriptionView>(`${this.api}/plano`, body);
  }

  changePaymentMethod(body: PagamentoPayload): Observable<SubscriptionView> {
    return this.http.post<SubscriptionView>(`${this.api}/forma-pagamento`, body);
  }

  cancel(body: CancelRequest): Observable<SubscriptionView> {
    return this.http.post<SubscriptionView>(`${this.api}/cancelar`, body);
  }

  reactivate(): Observable<SubscriptionView> {
    return this.http.post<SubscriptionView>(`${this.api}/reativar`, {});
  }

  purchasePack(body: PackPurchaseRequest): Observable<PackPurchaseResponse> {
    return this.http.post<PackPurchaseResponse>(`${this.api}/pacotes`, body);
  }

  dataExport(): Observable<DownloadedFile> {
    return this.http
      .get(`${environment.bffBaseUrl}/bff/admin/exportar-dados`, { observe: 'response', responseType: 'blob' })
      .pipe(
        map((res: HttpResponse<Blob>) => ({
          blob: res.body ?? new Blob(),
          filename: filenameFromDisposition(res.headers.get('Content-Disposition'), EXPORT_FALLBACK_NAME)
        }))
      );
  }
}
