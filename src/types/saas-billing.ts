// Types for the EIP SaaS & Billing (commercialization) module.
// These shapes are backend-agnostic and designed to later swap the MOCK
// service for real API/Stripe calls WITHOUT changing consumers.

export type BillingInterval = 'MONTHLY' | 'ANNUAL';

export type PlanCode = 'START' | 'BUSINESS' | 'PRO' | 'ENTERPRISE';

export type SubscriptionStatus =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCELED'
  | 'TERMINATED';

export type LicenseAccessMode = 'FULL' | 'READ_ONLY' | 'BILLING_ONLY' | 'NONE';

export interface PlanFeature {
  code: string;
  label: string;
  startValue: string | boolean;
  businessValue: string | boolean;
  proValue: string | boolean;
}

export interface SaasPlan {
  code: PlanCode;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  highlighted: boolean;
  ctaLabel: string;
  bullets: string[];
}

export interface UsageMetric {
  feature: string;
  label: string;
  used: number;
  included: number;
  unit: string;
}

export interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'PAID' | 'OPEN' | 'FAILED';
  planName: string;
  period: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planCode: PlanCode;
  planName: string;
  billingInterval: BillingInterval;
  amount: number;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
  paymentBrand: string;
  paymentLast4: string;
}

export interface TenantCompany {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  email: string;
  phone: string;
  segment?: string;
}

export interface LegalDocument {
  type: 'TERMS' | 'PRIVACY' | 'DPA';
  version: string;
  effectiveAt: Date;
  title: string;
}

export interface TermsAcceptance {
  documentType: string;
  version: string;
  acceptedAt: Date;
  ip: string;
  userName: string;
}

export interface DataExportJob {
  id: string;
  status: 'REQUESTED' | 'PROCESSING' | 'READY' | 'EXPIRED';
  requestedAt: Date;
  requestedBy: string;
  expiresAt?: Date | null;
  downloadRef?: string | null;
}

export interface SaasMetrics {
  mrr: number;
  arr: number;
  arpa: number;
  activeCompanies: number;
  trials: number;
  pastDue: number;
  canceledThisMonth: number;
  churnRate: number;
  mrrByPlan: { plan: string; mrr: number }[];
}

export interface TenantSummary {
  id: string;
  company: string;
  cnpj: string;
  planName: string;
  status: SubscriptionStatus;
  mrr: number;
  nextBilling: Date;
  usersCount: number;
}

// Catálogo de planos (base comercial do EIP). Anual ≈ 2 meses grátis.
export const PLAN_CATALOG: SaasPlan[] = [
  {
    code: 'START',
    name: 'EIP Start',
    description: 'Para empresas iniciando ou com menor volume de exportações.',
    monthlyPrice: 1290,
    annualPrice: 12900,
    highlighted: false,
    ctaLabel: 'Começar agora',
    bullets: [
      'Usuários ilimitados',
      '1 CNPJ incluído',
      'Gestão de exportações',
      'Cadastro de produtos e NCM',
      'Documentos de exportação',
      'Franquia limitada de OCR/IA',
      'Dashboard e IA essencial',
    ],
  },
  {
    code: 'BUSINESS',
    name: 'EIP Business',
    description: 'Para o exportador recorrente que precisa de automação e IA avançada.',
    monthlyPrice: 2490,
    annualPrice: 24900,
    highlighted: true,
    ctaLabel: 'Começar agora',
    bullets: [
      'Usuários ilimitados',
      'Tudo do Start',
      'Automações e workflow',
      'Franquia generosa de IA/OCR',
      'Compliance e BI',
      'Integrações',
      'Maior capacidade operacional',
    ],
  },
];

PLAN_CATALOG.push(
  {
    code: 'PRO',
    name: 'EIP Pro',
    description: 'Para operações mais complexas que exigem API e compliance avançado.',
    monthlyPrice: 4490,
    annualPrice: 44900,
    highlighted: false,
    ctaLabel: 'Começar agora',
    bullets: [
      'Usuários ilimitados',
      'Tudo do Business',
      'Acesso à API',
      'Integrações avançadas (ERP)',
      'Compliance e auditoria avançados',
      'Maiores limites de IA/documentos',
      'Suporte prioritário',
    ],
  },
  {
    code: 'ENTERPRISE',
    name: 'EIP Enterprise',
    description: 'A partir de R$ 6.990/mês',
    monthlyPrice: 6990,
    annualPrice: 0,
    highlighted: false,
    ctaLabel: 'Falar com vendas',
    bullets: [
      'Usuários ilimitados',
      'Grandes exportadores e grupos econômicos',
      'CNPJs adicionais do mesmo grupo',
      'SLA e suporte dedicados',
      'Onboarding assistido',
      'Condições comerciais negociadas',
    ],
  }
);

// Matriz de comparação de recursos (Start / Business / Pro).
export const PLAN_FEATURES: PlanFeature[] = [
  { code: 'USERS', label: 'Usuários', startValue: 'Ilimitado', businessValue: 'Ilimitado', proValue: 'Ilimitado' },
  { code: 'CNPJ', label: 'CNPJ incluído', startValue: '1', businessValue: '1', proValue: '1' },
  { code: 'EXPORTS', label: 'Exportações', startValue: 'Limitada', businessValue: 'Ilimitado', proValue: 'Ilimitado' },
  { code: 'PRODUCTS', label: 'Produtos', startValue: 'Ilimitado', businessValue: 'Ilimitado', proValue: 'Ilimitado' },
  { code: 'DOCS', label: 'Documentos', startValue: true, businessValue: true, proValue: true },
  { code: 'AI_ASSIST', label: 'IA Assistente', startValue: true, businessValue: true, proValue: true },
  { code: 'OCR', label: 'OCR', startValue: 'Básico', businessValue: 'Avançado', proValue: 'Avançado' },
  { code: 'AI_TRANS', label: 'Tradução IA', startValue: 'Limitada', businessValue: true, proValue: true },
  { code: 'NCM', label: 'Sugestão NCM', startValue: 'Limitada', businessValue: true, proValue: true },
  { code: 'COMPLIANCE', label: 'Compliance', startValue: 'Básico', businessValue: true, proValue: 'Avançado' },
  { code: 'WORKFLOW', label: 'Workflow', startValue: false, businessValue: true, proValue: true },
  { code: 'BI', label: 'BI avançado', startValue: false, businessValue: true, proValue: true },
  { code: 'API', label: 'API', startValue: false, businessValue: false, proValue: true },
  { code: 'INTEGR', label: 'Integrações avançadas', startValue: false, businessValue: true, proValue: true },
  { code: 'AUDIT', label: 'Auditoria avançada', startValue: false, businessValue: false, proValue: true },
  { code: 'SUPPORT', label: 'Suporte prioritário', startValue: false, businessValue: false, proValue: true },
];

export interface AddonPack {
  code: 'AI_PACK' | 'AI_PACK_PLUS' | 'EXTRA_CNPJ';
  name: string;
  description: string;
  monthlyPrice: number;
  highlight?: boolean;
}

export interface FinancialHealth {
  mrr: number;
  arr: number;
  arpa: number;
  grossRevenue: number;
  paymentFees: number;
  taxes: number;
  aiOcrCloud: number;
  contributionMargin: number;
  fixedCosts: number;
  operatingContribution: number;
  customers: number;
  breakEvenCustomers: number;
}

export interface TenantUnitEconomics {
  tenantId: string;
  company: string;
  subscription: number;
  paymentCost: number;
  aiCost: number;
  ocrCost: number;
  storageCost: number;
  cloudCost: number;
  contribution: number;
  marginPercent: number;
  score: 'GREEN' | 'YELLOW' | 'RED';
}

// Add-ons/pacotes complementares (base comercial do EIP).
export const ADDON_CATALOG: AddonPack[] = [
  {
    code: 'EXTRA_CNPJ',
    name: 'CNPJ adicional',
    description: 'Adicione outro CNPJ do mesmo grupo, com usuários ilimitados.',
    monthlyPrice: 690,
  },
  {
    code: 'AI_PACK',
    name: 'EIP AI Pack',
    description: 'Franquia adicional de créditos de IA e OCR para o mês.',
    monthlyPrice: 390,
  },
  {
    code: 'AI_PACK_PLUS',
    name: 'EIP AI Pack Plus',
    description: 'Franquia estendida de IA e OCR para operações de alto volume.',
    monthlyPrice: 790,
    highlight: true,
  },
];

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  conversionFromPrev: number | null; // percent vs previous stage, null for first
}

export interface NorthStarMetric {
  label: string;
  value: number;
  description: string;
  trendPercent: number; // positive = up
}

export interface OnboardingStep {
  key: string;
  label: string;
  done: boolean;
}
export interface OnboardingProgress {
  percent: number;
  steps: OnboardingStep[];
  completed: boolean;
}
export interface TrialState {
  active: boolean;
  daysRemaining: number;
  planName: string;
}

export type ProductEventName =
  | 'SIGNUP_STARTED' | 'SIGNUP_COMPLETED' | 'PLAN_VIEWED'
  | 'CHECKOUT_STARTED' | 'CHECKOUT_COMPLETED' | 'ONBOARDING_STARTED'
  | 'PRODUCT_CREATED' | 'CUSTOMER_CREATED' | 'EXPORT_CREATED'
  | 'FIRST_EXPORT_CREATED' | 'DOCUMENT_GENERATED' | 'AI_USED';

export interface ProductEvent {
  id: string;
  tenantId: string;
  company: string;
  userId: string;
  event: ProductEventName;
  properties: string;      // short human-readable summary of the event payload
  occurredAt: Date;
}

export interface EventTypeCount {
  event: ProductEventName;
  label: string;           // pt-BR friendly label
  count: number;
}
