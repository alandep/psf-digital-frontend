import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiAddon,
  ApiPlan,
  BillingIntervalCode,
  BillingPlanCode,
  CheckoutRequest,
  CheckoutResponse,
  CouponValidation,
  DemoRequestBody
} from '../../../types/billing-api';

/**
 * Endpoints públicos (pré-login) de billing: /bff/public/signup/**.
 * Sem CSRF; o checkout abre a sessão HTTP (igual ao signup).
 */
@Injectable({ providedIn: 'root' })
export class PublicBillingService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffBaseUrl}/bff/public/signup`;

  getPlans(): Observable<ApiPlan[]> {
    return this.http.get<ApiPlan[]>(`${this.base}/planos`);
  }

  getAddons(): Observable<ApiAddon[]> {
    return this.http.get<ApiAddon[]>(`${this.base}/pacotes`);
  }

  validateCoupon(code: string, plan: BillingPlanCode, interval: BillingIntervalCode): Observable<CouponValidation> {
    const params = new HttpParams().set('plan', plan).set('interval', interval);
    return this.http.get<CouponValidation>(`${this.base}/cupom/${encodeURIComponent(code.trim())}`, { params });
  }

  requestDemo(body: DemoRequestBody): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/demo`, body);
  }

  checkout(body: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.base}/checkout`, body);
  }
}
