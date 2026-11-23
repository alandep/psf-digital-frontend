// Tipos da API de billing (Asaas). Fonte: docs/billing-asaas-contract.md §4.
// Reutilizáveis pelos serviços públicos (pré-login) e logados (/bff/assinatura).

export type BillingPlanCode = 'START' | 'BUSINESS' | 'PRO' | 'ENTERPRISE';
export type BillingIntervalCode = 'MONTHLY' | 'ANNUAL';
export type PaymentMethodCode = 'CREDIT_CARD' | 'PIX' | 'BOLETO';
export type DemoOrigin = 'SITE' | 'PRECOS_ENTERPRISE' | 'TRIAL_BANNER' | 'CHECKOUT';

/** Limites do plano. `null` = ilimitado. */
export interface ApiPlanLimits {
  aiCredits: number | null;
  ocrPages: number | null;
  storageGb: number | null;
  users: number | null;
}

/** GET /bff/public/signup/planos (e /bff/assinatura/planos). */
export interface ApiPlan {
  code: BillingPlanCode;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  highlighted: boolean;
  limits: ApiPlanLimits;
  modules: string[];
}

/** GET /bff/public/signup/pacotes (e /bff/assinatura/pacotes). */
export interface ApiAddon {
  code: string;
  name: string;
  description: string;
  amount: number;
  aiCredits: number;
  ocrPages: number;
  highlighted: boolean;
}

/** GET /bff/public/signup/cupom/{code}. */
export interface CouponValidation {
  valid: boolean;
  code: string;
  price: number | null;
  cycles: number | null;
  message: string | null;
}

export interface DemoRequestBody {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cnpj?: string;
  mensagem?: string;
  origem: DemoOrigin;
}

/** Dados do cartão no formato do gateway (ver `toGatewayCard`). */
export interface GatewayCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

/** Titular do cartão / pagador. */
export interface PaymentHolder {
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  cep: string;
  numero: string;
  complemento?: string;
}

/** Objeto `pagamento` do contrato (checkout, /ativar, /forma-pagamento). */
export interface PagamentoPayload {
  metodo: PaymentMethodCode;
  cartao?: GatewayCard;
  titular?: PaymentHolder;
}

export interface CheckoutEmpresa {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  telefone: string;
  email: string;
  site: string;
  segmento: string;
}

export interface CheckoutAdmin {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
}

export interface CheckoutPlano {
  planCode: Exclude<BillingPlanCode, 'ENTERPRISE'>;
  interval: BillingIntervalCode;
  coupon: string | null;
}

export interface CheckoutAceites {
  termos: boolean;
  privacidade: boolean;
  cobranca: boolean;
  termsVersion: string;
  privacyVersion: string;
}

/** POST /bff/public/signup/checkout. */
export interface CheckoutRequest {
  empresa: CheckoutEmpresa;
  admin: CheckoutAdmin;
  plano: CheckoutPlano;
  pagamento: PagamentoPayload;
  aceites: CheckoutAceites;
}

export interface CheckoutResponse {
  organizationId: string;
  planCode: BillingPlanCode;
  interval: BillingIntervalCode;
  amount: number;
  trialEnd: string | null;
  nextDueDate: string | null;
  paymentMethod: PaymentMethodCode;
  cardBrand: string | null;
  cardLast4: string | null;
}

// ---------------------------------------------------------------------------
// Área logada: /bff/assinatura (contrato §4.2). Datas em ISO-8601 (string).
// ---------------------------------------------------------------------------

export type ApiSubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCELED'
  | 'TERMINATED';

export type ApiInvoiceStatus = 'OPEN' | 'PAID' | 'OVERDUE' | 'REFUNDED' | 'CANCELED' | 'FAILED';
export type UsageFeature = 'AI' | 'OCR' | 'STORAGE';

export interface SubscriptionCoupon {
  code: string;
  price: number;
  cyclesRemaining: number;
}

/** GET /bff/assinatura (e respostas de ativar/plano/forma-pagamento/cancelar/reativar). */
export interface SubscriptionView {
  id: string;
  planCode: BillingPlanCode;
  planName: string;
  billingInterval: BillingIntervalCode;
  amount: number;
  status: ApiSubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  nextDueDate: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  paymentMethod: PaymentMethodCode | null;
  paymentBrand: string | null;
  paymentLast4: string | null;
  gatewayLinked: boolean;
  coupon: SubscriptionCoupon | null;
  licenseMode: string;
}

/** Medidor de uso. `included` null = ilimitado. */
export interface UsageMeter {
  feature: UsageFeature;
  label: string;
  used: number;
  included: number | null;
  fromPlan: number | null;
  fromPacks: number | null;
  unit: string;
  percent: number;
}

/** GET /bff/assinatura/uso. */
export interface UsageResponse {
  periodStart: string | null;
  periodEnd: string | null;
  meters: UsageMeter[];
}

/** GET /bff/assinatura/uso/extrato. */
export interface UsageEntry {
  occurredAt: string;
  operation: string;
  operationLabel: string;
  userName: string | null;
  amount: number;
  unit: string;
}

/** GET /bff/assinatura/faturas. */
export interface InvoiceApi {
  id: string;
  number: string | null;
  kind: 'SUBSCRIPTION' | 'ADDON';
  description: string | null;
  period: string | null;
  planName: string | null;
  amount: number;
  status: ApiInvoiceStatus;
  issuedAt: string | null;
  dueDate: string | null;
  paidAt: string | null;
  billingType: PaymentMethodCode | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
}

/** GET /bff/assinatura/faturas/{id}/pix e `pix` de POST /pacotes. */
export interface PixView {
  encodedImage: string;
  payload: string;
  expirationDate: string | null;
}

/** POST /bff/assinatura/pacotes. */
export interface PackPurchaseResponse {
  purchaseId: string;
  status: string;
  invoiceId: string | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
  pix: PixView | null;
}

/** POST /bff/assinatura/pacotes (corpo). */
export interface PackPurchaseRequest {
  addonCode: string;
  metodo: PaymentMethodCode;
  usarCartaoSalvo: boolean;
  cartao?: GatewayCard;
  titular?: PaymentHolder;
}

/** POST /bff/assinatura/ativar. */
export interface ActivateRequest {
  planCode: Exclude<BillingPlanCode, 'ENTERPRISE'>;
  interval: BillingIntervalCode;
  coupon?: string | null;
  pagamento: PagamentoPayload;
}

/** POST /bff/assinatura/plano. */
export interface ChangePlanRequest {
  planCode: Exclude<BillingPlanCode, 'ENTERPRISE'>;
  interval: BillingIntervalCode;
}

/** POST /bff/assinatura/cancelar. */
export interface CancelRequest {
  reason: string;
  comment?: string;
}

/** Resultado do download de dados (GET /bff/admin/exportar-dados). */
export interface DownloadedFile {
  blob: Blob;
  filename: string;
}
