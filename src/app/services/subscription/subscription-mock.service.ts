import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ISubscriptionService } from './subscription-service.interface';
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
  UsageResponse
} from '../../../types/billing-api';

const SUBSCRIPTION: SubscriptionView = {
  id: 'sub-local',
  planCode: 'BUSINESS',
  planName: 'Business',
  billingInterval: 'MONTHLY',
  amount: 2490,
  status: 'ACTIVE',
  currentPeriodStart: null,
  currentPeriodEnd: null,
  trialEnd: null,
  nextDueDate: null,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  paymentMethod: null,
  paymentBrand: null,
  paymentLast4: null,
  gatewayLinked: false,
  coupon: null,
  licenseMode: 'FULL'
};

const PLANS: ApiPlan[] = [
  {
    code: 'START', name: 'Start', description: 'Para começar', monthlyPrice: 1290, annualPrice: 12900,
    highlighted: false, limits: { aiCredits: 500, ocrPages: 200, storageGb: 5, users: null }, modules: []
  },
  {
    code: 'BUSINESS', name: 'Business', description: 'Para equipes em crescimento', monthlyPrice: 2490,
    annualPrice: 24900, highlighted: true,
    limits: { aiCredits: 5000, ocrPages: 2000, storageGb: 100, users: null }, modules: []
  },
  {
    code: 'PRO', name: 'Pro', description: 'Para operações intensas', monthlyPrice: 4490, annualPrice: 44900,
    highlighted: false, limits: { aiCredits: 20000, ocrPages: 10000, storageGb: 500, users: null }, modules: []
  }
];

const ADDONS: ApiAddon[] = [
  { code: 'AI_PACK', name: 'EIP AI Pack', description: 'Créditos extras de IA e OCR', amount: 390, aiCredits: 10000, ocrPages: 2000, highlighted: false },
  { code: 'AI_PACK_PLUS', name: 'EIP AI Pack Plus', description: 'Mais créditos de IA e OCR', amount: 790, aiCredits: 30000, ocrPages: 6000, highlighted: true }
];

const USAGE: UsageResponse = {
  periodStart: null,
  periodEnd: null,
  meters: [
    { feature: 'AI', label: 'Créditos de IA', used: 0, included: 5000, fromPlan: 5000, fromPacks: 0, unit: 'créditos', percent: 0 },
    { feature: 'OCR', label: 'Páginas OCR', used: 0, included: 2000, fromPlan: 2000, fromPacks: 0, unit: 'páginas', percent: 0 },
    { feature: 'STORAGE', label: 'Armazenamento', used: 0, included: 100, fromPlan: 100, fromPacks: 0, unit: 'GB', percent: 0 }
  ]
};

/** Adapter estático (realApis.subscription = false). Não persiste nada. */
@Injectable({ providedIn: 'root' })
export class SubscriptionMockAdapter implements ISubscriptionService {
  current(): Observable<SubscriptionView> { return of(SUBSCRIPTION); }
  plans(): Observable<ApiPlan[]> { return of(PLANS); }
  addons(): Observable<ApiAddon[]> { return of(ADDONS); }
  usage(): Observable<UsageResponse> { return of(USAGE); }
  statement(): Observable<UsageEntry[]> { return of([]); }
  invoices(): Observable<InvoiceApi[]> { return of([]); }
  invoicePdf(): Observable<Blob> { return of(new Blob([], { type: 'application/pdf' })); }
  invoicePix(): Observable<PixView> { return of({ encodedImage: '', payload: '', expirationDate: null }); }
  activate(_body: ActivateRequest): Observable<SubscriptionView> { return of(SUBSCRIPTION); }
  changePlan(_body: ChangePlanRequest): Observable<SubscriptionView> { return of(SUBSCRIPTION); }
  changePaymentMethod(_body: PagamentoPayload): Observable<SubscriptionView> { return of(SUBSCRIPTION); }
  cancel(_body: CancelRequest): Observable<SubscriptionView> { return of(SUBSCRIPTION); }
  reactivate(): Observable<SubscriptionView> { return of(SUBSCRIPTION); }
  purchasePack(_body: PackPurchaseRequest): Observable<PackPurchaseResponse> {
    return of({ purchaseId: 'local', status: 'PAID', invoiceId: null, invoiceUrl: null, bankSlipUrl: null, pix: null });
  }
  dataExport(): Observable<DownloadedFile> {
    return of({ blob: new Blob([], { type: 'application/zip' }), filename: 'eip-exportacao.zip' });
  }
}
