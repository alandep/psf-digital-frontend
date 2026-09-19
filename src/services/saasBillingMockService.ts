// MOCK service for SaaS billing/commercialization. Replace method bodies with
// real API/Stripe calls later; the shapes stay the same.
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  SaasPlan,
  PlanFeature,
  Subscription,
  UsageMetric,
  Invoice,
  SaasMetrics,
  TenantSummary,
  LegalDocument,
  DataExportJob,
  TermsAcceptance,
  TenantCompany,
  PlanCode,
  BillingInterval,
  AddonPack,
  FinancialHealth,
  TenantUnitEconomics,
  FunnelStage,
  NorthStarMetric,
  OnboardingProgress,
  OnboardingStep,
  TrialState,
  ProductEvent,
  ProductEventName,
  EventTypeCount,
  PLAN_CATALOG,
  PLAN_FEATURES,
  ADDON_CATALOG,
} from '../types/saas-billing';

@Injectable({ providedIn: 'root' })
export class SaasBillingMockService {
  private wait = 400;

  private subscription: Subscription = {
    id: 'SUB-0001',
    tenantId: 'TEN-0001',
    planCode: 'BUSINESS',
    planName: 'EIP Business',
    billingInterval: 'MONTHLY',
    amount: 2490,
    status: 'ACTIVE',
    currentPeriodStart: new Date(new Date().setDate(new Date().getDate() - 2)),
    currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 28)),
    trialEnd: null,
    cancelAtPeriodEnd: false,
    paymentBrand: 'Mastercard',
    paymentLast4: '1234',
  };

  private exportJobs: DataExportJob[] = [];

  private ms<T>(payload: T): Observable<T> {
    return of(payload).pipe(delay(this.wait));
  }

  getPlans(): SaasPlan[] {
    return PLAN_CATALOG;
  }

  getPlanFeatures(): PlanFeature[] {
    return PLAN_FEATURES;
  }

  getAddons(): AddonPack[] {
    return ADDON_CATALOG;
  }

  purchaseAddon(code: AddonPack['code']): Observable<AddonPack> {
    const addon = ADDON_CATALOG.find((a) => a.code === code) ?? ADDON_CATALOG[0];
    return this.ms({ ...addon });
  }

  getFinancialHealth(): Observable<FinancialHealth> {
    return this.ms<FinancialHealth>({
      mrr: 265000,
      arr: 3180000,
      arpa: 2650,
      grossRevenue: 265000,
      paymentFees: 12468,
      taxes: 26500,
      aiOcrCloud: 34800,
      contributionMargin: 191232,
      fixedCosts: 70000,
      operatingContribution: 121232,
      customers: 100,
      breakEvenCustomers: 37,
    });
  }

  getTenantUnitEconomics(): Observable<TenantUnitEconomics[]> {
    const mk = (
      tenantId: string,
      company: string,
      subscription: number,
      paymentCost: number,
      aiCost: number,
      ocrCost: number,
      storageCost: number,
      cloudCost: number
    ): TenantUnitEconomics => {
      const contribution =
        subscription - (paymentCost + aiCost + ocrCost + storageCost + cloudCost);
      const marginPercent = Math.round((contribution / subscription) * 100);
      const score: TenantUnitEconomics['score'] =
        marginPercent > 70 ? 'GREEN' : marginPercent >= 60 ? 'YELLOW' : 'RED';
      return {
        tenantId,
        company,
        subscription,
        paymentCost,
        aiCost,
        ocrCost,
        storageCost,
        cloudCost,
        contribution,
        marginPercent,
        score,
      };
    };
    return this.ms<TenantUnitEconomics[]>([
      mk('TEN-0001', 'Agro Export Brasil Ltda', 2490, 117, 74, 18, 22, 91),
      mk('TEN-0002', 'Brazilian Commodities SA', 4490, 211, 180, 60, 55, 190),
      mk('TEN-0003', 'Sul Grãos Comex ME', 1290, 61, 48, 22, 18, 55),
      mk('TEN-0004', 'Madeireira Amazônia SA', 4490, 211, 640, 320, 210, 480),
      mk('TEN-0005', 'Pescados Litoral ME', 2490, 117, 360, 180, 90, 130),
      mk('TEN-0006', 'Têxtil Nordeste SA', 2490, 117, 96, 40, 30, 110),
    ]);
  }

  getFunnel(): Observable<FunnelStage[]> {
    const raw: { key: string; label: string; count: number }[] = [
      { key: 'visitors', label: 'Visitantes', count: 4200 },
      { key: 'leads', label: 'Leads', count: 980 },
      { key: 'demo', label: 'Demonstração', count: 420 },
      { key: 'trial', label: 'Trial', count: 210 },
      { key: 'checkout', label: 'Checkout', count: 130 },
      { key: 'paid', label: 'Pagantes', count: 100 },
      { key: 'activated', label: 'Ativados', count: 78 },
      { key: 'first_export', label: 'Primeira exportação', count: 61 },
      { key: 'active_30d', label: 'Ativos 30 dias', count: 54 },
    ];
    const stages: FunnelStage[] = raw.map((s, i) => ({
      key: s.key,
      label: s.label,
      count: s.count,
      conversionFromPrev:
        i === 0 ? null : Math.round((s.count / raw[i - 1].count) * 100),
    }));
    return this.ms<FunnelStage[]>(stages);
  }

  getNorthStar(): Observable<NorthStarMetric> {
    return this.ms<NorthStarMetric>({
      label: 'Empresas com exportações ativas no EIP',
      value: 54,
      description:
        'Empresas que executaram ao menos uma operação de exportação nos últimos 30 dias.',
      trendPercent: 8.4,
    });
  }

  getOnboardingProgress(): Observable<OnboardingProgress> {
    const steps: OnboardingStep[] = [
      { key: 'company', label: 'Dados da empresa', done: true },
      { key: 'product', label: 'Produto cadastrado', done: true },
      { key: 'customer', label: 'Cliente cadastrado', done: true },
      { key: 'users', label: 'Usuários convidados', done: true },
      { key: 'first_export', label: 'Primeira exportação', done: false },
    ];
    const doneCount = steps.filter((s) => s.done).length;
    const percent = Math.round((doneCount / steps.length) * 100);
    return this.ms<OnboardingProgress>({
      percent,
      steps,
      completed: percent === 100,
    });
  }

  getTrialState(): Observable<TrialState> {
    return this.ms<TrialState>({
      active: true,
      daysRemaining: 9,
      planName: 'EIP Business',
    });
  }

  getCurrentSubscription(): Observable<Subscription> {
    return this.ms({ ...this.subscription });
  }

  getUsage(): Observable<UsageMetric[]> {
    return this.ms<UsageMetric[]>([
      { feature: 'AI', label: 'Créditos de IA', used: 3920, included: 5000, unit: 'créditos' },
      { feature: 'OCR', label: 'Páginas OCR', used: 1180, included: 2000, unit: 'páginas' },
      { feature: 'STORAGE', label: 'Armazenamento', used: 21, included: 100, unit: 'GB' },
    ]);
  }

  getInvoices(): Observable<Invoice[]> {
    const base = new Date();
    const mk = (m: number, status: Invoice['status']): Invoice => {
      const d = new Date(base.getFullYear(), base.getMonth() - m, 5);
      return {
        id: `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`,
        date: d,
        amount: 2490,
        status,
        planName: 'EIP Business',
        period: `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
      };
    };
    return this.ms<Invoice[]>([
      mk(0, 'OPEN'),
      mk(1, 'PAID'),
      mk(2, 'PAID'),
      mk(3, 'PAID'),
      mk(4, 'PAID'),
      mk(5, 'PAID'),
    ]);
  }

  getSaasMetrics(): Observable<SaasMetrics> {
    return this.ms<SaasMetrics>({
      mrr: 265000,
      arr: 3180000,
      arpa: 2650,
      activeCompanies: 100,
      trials: 8,
      pastDue: 2,
      canceledThisMonth: 1,
      churnRate: 1.7,
      mrrByPlan: [
        { plan: 'Start', mrr: 38700 },
        { plan: 'Business', mrr: 174300 },
        { plan: 'Pro', mrr: 52000 },
      ],
    });
  }

  getTenants(): Observable<TenantSummary[]> {
    const nb = (d: number) => new Date(new Date().setDate(new Date().getDate() + d));
    return this.ms<TenantSummary[]>([
      { id: 'TEN-0001', company: 'Agro Export Brasil Ltda', cnpj: '12.345.678/0001-90', planName: 'EIP Business', status: 'ACTIVE', mrr: 2490, nextBilling: nb(28), usersCount: 24 },
      { id: 'TEN-0002', company: 'Brazilian Commodities SA', cnpj: '98.765.432/0001-10', planName: 'EIP Pro', status: 'ACTIVE', mrr: 4490, nextBilling: nb(12), usersCount: 41 },
      { id: 'TEN-0003', company: 'Sul Grãos Comex ME', cnpj: '11.222.333/0001-44', planName: 'EIP Start', status: 'ACTIVE', mrr: 1290, nextBilling: nb(3), usersCount: 6 },
      { id: 'TEN-0004', company: 'Café do Cerrado Export', cnpj: '22.333.444/0001-55', planName: 'EIP Business', status: 'TRIALING', mrr: 0, nextBilling: nb(9), usersCount: 3 },
      { id: 'TEN-0005', company: 'Frutas Vale Ltda', cnpj: '33.444.555/0001-66', planName: 'EIP Start', status: 'PAST_DUE', mrr: 1290, nextBilling: nb(-4), usersCount: 8 },
      { id: 'TEN-0006', company: 'Madeireira Amazônia SA', cnpj: '44.555.666/0001-77', planName: 'EIP Pro', status: 'ACTIVE', mrr: 4490, nextBilling: nb(20), usersCount: 33 },
      { id: 'TEN-0007', company: 'Pescados Litoral ME', cnpj: '55.666.777/0001-88', planName: 'EIP Business', status: 'GRACE_PERIOD', mrr: 2490, nextBilling: nb(-1), usersCount: 11 },
      { id: 'TEN-0008', company: 'Têxtil Nordeste SA', cnpj: '66.777.888/0001-99', planName: 'EIP Business', status: 'ACTIVE', mrr: 2490, nextBilling: nb(15), usersCount: 19 },
      { id: 'TEN-0009', company: 'Calçados Vale dos Sinos', cnpj: '77.888.999/0001-00', planName: 'EIP Start', status: 'SUSPENDED', mrr: 0, nextBilling: nb(-18), usersCount: 5 },
      { id: 'TEN-0010', company: 'Metais Minas Export', cnpj: '88.999.000/0001-11', planName: 'EIP Pro', status: 'ACTIVE', mrr: 4490, nextBilling: nb(24), usersCount: 52 },
      { id: 'TEN-0011', company: 'Aromas & Óleos Ltda', cnpj: '99.000.111/0001-22', planName: 'EIP Business', status: 'CANCELED', mrr: 0, nextBilling: nb(6), usersCount: 7 },
      { id: 'TEN-0012', company: 'Grupo Vinícola Serra', cnpj: '10.020.030/0001-33', planName: 'EIP Business', status: 'ACTIVE', mrr: 2490, nextBilling: nb(11), usersCount: 16 },
    ]);
  }

  getLegalDocuments(): LegalDocument[] {
    const eff = new Date('2025-01-01');
    return [
      { type: 'TERMS', version: '1.0', effectiveAt: eff, title: 'Termos de Uso e Licenciamento SaaS do EIP' },
      { type: 'PRIVACY', version: '1.0', effectiveAt: eff, title: 'Política de Privacidade e Proteção de Dados' },
      { type: 'DPA', version: '1.0', effectiveAt: eff, title: 'Anexo de Tratamento de Dados Pessoais (DPA)' },
    ];
  }

  changePlan(code: PlanCode): Observable<Subscription> {
    const plan = PLAN_CATALOG.find((p) => p.code === code);
    if (plan) {
      this.subscription = {
        ...this.subscription,
        planCode: plan.code,
        planName: plan.name,
        amount:
          this.subscription.billingInterval === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice,
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
      };
    }
    return this.ms({ ...this.subscription });
  }

  cancelSubscription(reason: string): Observable<Subscription> {
    this.subscription = {
      ...this.subscription,
      status: 'CANCELED',
      cancelAtPeriodEnd: true,
    };
    return this.ms({ ...this.subscription });
  }

  reactivate(): Observable<Subscription> {
    this.subscription = {
      ...this.subscription,
      status: 'ACTIVE',
      cancelAtPeriodEnd: false,
    };
    return this.ms({ ...this.subscription });
  }

  requestDataExport(): Observable<DataExportJob> {
    const job: DataExportJob = {
      id: `EXP-${Date.now()}`,
      status: 'REQUESTED',
      requestedAt: new Date(),
      requestedBy: 'Administrador',
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)),
      downloadRef: null,
    };
    this.exportJobs.push(job);
    return this.ms({ ...job });
  }

  getDataExportJob(id: string): Observable<DataExportJob> {
    const job = this.exportJobs.find((j) => j.id === id);
    if (job && job.status !== 'READY') {
      // Simula progresso do processamento ate ficar pronto para download.
      job.status = job.status === 'REQUESTED' ? 'PROCESSING' : 'READY';
      if (job.status === 'READY') {
        job.downloadRef = `EIP_EXPORT_${id}.zip`;
      }
    }
    const fallback: DataExportJob = job ?? {
      id,
      status: 'EXPIRED',
      requestedAt: new Date(),
      requestedBy: 'Administrador',
      expiresAt: null,
      downloadRef: null,
    };
    return this.ms({ ...fallback });
  }

  acceptTerms(a: TermsAcceptance): Observable<void> {
    // No mock apenas registramos em memória (nenhuma persistência real).
    return this.ms<void>(undefined as unknown as void);
  }

  createCheckout(
    company: TenantCompany,
    planCode: PlanCode,
    interval: BillingInterval
  ): Observable<{ subscription: Subscription; company: TenantCompany }> {
    const plan = PLAN_CATALOG.find((p) => p.code === planCode) ?? PLAN_CATALOG[1];
    const now = new Date();
    const trialEnd = new Date(new Date().setDate(now.getDate() + 14));
    const subscription: Subscription = {
      id: `SUB-${Date.now()}`,
      tenantId: company.id || `TEN-${Date.now()}`,
      planCode: plan.code,
      planName: plan.name,
      billingInterval: interval,
      amount: interval === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice,
      status: 'TRIALING',
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      trialEnd,
      cancelAtPeriodEnd: false,
      paymentBrand: 'Mastercard',
      paymentLast4: '4242',
    };
    return this.ms({ subscription, company });
  }

  getProductEvents(): Observable<ProductEvent[]> {
    const ago = (min: number) => new Date(Date.now() - min * 60000);
    const events: ProductEvent[] = [
      { id: 'EVT-0001', tenantId: 'TEN-0001', company: 'Agro Export Brasil Ltda', userId: 'ana@agroexport', event: 'AI_USED', properties: 'Assistente de IA • 320 tokens', occurredAt: ago(18) },
      { id: 'EVT-0002', tenantId: 'TEN-0002', company: 'Brazilian Commodities SA', userId: 'carlos@bcommodities', event: 'DOCUMENT_GENERATED', properties: 'Commercial Invoice gerada', occurredAt: ago(42) },
      { id: 'EVT-0003', tenantId: 'TEN-0003', company: 'Sul Grãos Comex ME', userId: 'joao@sulgraos', event: 'EXPORT_CREATED', properties: 'Exportação EXP-2045 criada', occurredAt: ago(65) },
      { id: 'EVT-0004', tenantId: 'TEN-0004', company: 'Café do Cerrado Export', userId: 'maria@cafecerrado', event: 'PLAN_VIEWED', properties: 'Plano Business visualizado', occurredAt: ago(90) },
      { id: 'EVT-0005', tenantId: 'TEN-0006', company: 'Madeireira Amazônia SA', userId: 'pedro@madamazonia', event: 'CHECKOUT_COMPLETED', properties: 'Assinatura Business ativada', occurredAt: ago(120) },
      { id: 'EVT-0006', tenantId: 'TEN-0001', company: 'Agro Export Brasil Ltda', userId: 'ana@agroexport', event: 'PRODUCT_CREATED', properties: 'Produto Soja em grãos • NCM 1201.90', occurredAt: ago(150) },
      { id: 'EVT-0007', tenantId: 'TEN-0008', company: 'Têxtil Nordeste SA', userId: 'lucia@textilnordeste', event: 'CUSTOMER_CREATED', properties: 'Cliente Global Fabrics Inc. criado', occurredAt: ago(175) },
      { id: 'EVT-0008', tenantId: 'TEN-0004', company: 'Café do Cerrado Export', userId: 'maria@cafecerrado', event: 'SIGNUP_STARTED', properties: 'Cadastro iniciado via landing page', occurredAt: ago(210) },
      { id: 'EVT-0009', tenantId: 'TEN-0004', company: 'Café do Cerrado Export', userId: 'maria@cafecerrado', event: 'SIGNUP_COMPLETED', properties: 'Cadastro concluído • e-mail confirmado', occurredAt: ago(205) },
      { id: 'EVT-0010', tenantId: 'TEN-0002', company: 'Brazilian Commodities SA', userId: 'carlos@bcommodities', event: 'AI_USED', properties: 'Tradução IA • 540 tokens', occurredAt: ago(240) },
      { id: 'EVT-0011', tenantId: 'TEN-0010', company: 'Metais Minas Export', userId: 'rafael@metaisminas', event: 'FIRST_EXPORT_CREATED', properties: 'Primeira exportação EXP-2050 criada', occurredAt: ago(300) },
      { id: 'EVT-0012', tenantId: 'TEN-0006', company: 'Madeireira Amazônia SA', userId: 'pedro@madamazonia', event: 'ONBOARDING_STARTED', properties: 'Onboarding iniciado • passo 1 de 5', occurredAt: ago(330) },
      { id: 'EVT-0013', tenantId: 'TEN-0003', company: 'Sul Grãos Comex ME', userId: 'joao@sulgraos', event: 'DOCUMENT_GENERATED', properties: 'Packing List gerada', occurredAt: ago(360) },
      { id: 'EVT-0014', tenantId: 'TEN-0001', company: 'Agro Export Brasil Ltda', userId: 'bruno@agroexport', event: 'CHECKOUT_STARTED', properties: 'Checkout Pro iniciado', occurredAt: ago(400) },
      { id: 'EVT-0015', tenantId: 'TEN-0012', company: 'Grupo Vinícola Serra', userId: 'sofia@vinicolaserra', event: 'PLAN_VIEWED', properties: 'Plano Pro visualizado', occurredAt: ago(455) },
      { id: 'EVT-0016', tenantId: 'TEN-0008', company: 'Têxtil Nordeste SA', userId: 'lucia@textilnordeste', event: 'EXPORT_CREATED', properties: 'Exportação EXP-2051 criada', occurredAt: ago(520) },
      { id: 'EVT-0017', tenantId: 'TEN-0010', company: 'Metais Minas Export', userId: 'rafael@metaisminas', event: 'AI_USED', properties: 'Sugestão de NCM • 210 tokens', occurredAt: ago(600) },
      { id: 'EVT-0018', tenantId: 'TEN-0002', company: 'Brazilian Commodities SA', userId: 'carlos@bcommodities', event: 'PRODUCT_CREATED', properties: 'Produto Café arábica • NCM 0901.21', occurredAt: ago(680) },
      { id: 'EVT-0019', tenantId: 'TEN-0006', company: 'Madeireira Amazônia SA', userId: 'pedro@madamazonia', event: 'CUSTOMER_CREATED', properties: 'Cliente Nordic Timber AB criado', occurredAt: ago(760) },
      { id: 'EVT-0020', tenantId: 'TEN-0012', company: 'Grupo Vinícola Serra', userId: 'sofia@vinicolaserra', event: 'DOCUMENT_GENERATED', properties: 'Certificado de Origem gerado', occurredAt: ago(880) },
      { id: 'EVT-0021', tenantId: 'TEN-0003', company: 'Sul Grãos Comex ME', userId: 'joao@sulgraos', event: 'SIGNUP_STARTED', properties: 'Cadastro iniciado via indicação', occurredAt: ago(1020) },
      { id: 'EVT-0022', tenantId: 'TEN-0001', company: 'Agro Export Brasil Ltda', userId: 'ana@agroexport', event: 'EXPORT_CREATED', properties: 'Exportação EXP-2052 criada', occurredAt: ago(1180) },
      { id: 'EVT-0023', tenantId: 'TEN-0010', company: 'Metais Minas Export', userId: 'rafael@metaisminas', event: 'CHECKOUT_COMPLETED', properties: 'Assinatura Pro ativada', occurredAt: ago(1320) },
      { id: 'EVT-0024', tenantId: 'TEN-0008', company: 'Têxtil Nordeste SA', userId: 'lucia@textilnordeste', event: 'AI_USED', properties: 'Assistente de IA • 415 tokens', occurredAt: ago(1500) },
      { id: 'EVT-0025', tenantId: 'TEN-0002', company: 'Brazilian Commodities SA', userId: 'carlos@bcommodities', event: 'ONBOARDING_STARTED', properties: 'Onboarding iniciado • passo 1 de 5', occurredAt: ago(1700) },
      { id: 'EVT-0026', tenantId: 'TEN-0012', company: 'Grupo Vinícola Serra', userId: 'sofia@vinicolaserra', event: 'PRODUCT_CREATED', properties: 'Produto Vinho tinto • NCM 2204.21', occurredAt: ago(1950) },
      { id: 'EVT-0027', tenantId: 'TEN-0006', company: 'Madeireira Amazônia SA', userId: 'pedro@madamazonia', event: 'FIRST_EXPORT_CREATED', properties: 'Primeira exportação EXP-2053 criada', occurredAt: ago(2200) },
      { id: 'EVT-0028', tenantId: 'TEN-0001', company: 'Agro Export Brasil Ltda', userId: 'bruno@agroexport', event: 'CHECKOUT_STARTED', properties: 'Checkout Business iniciado', occurredAt: ago(2500) },
      { id: 'EVT-0029', tenantId: 'TEN-0003', company: 'Sul Grãos Comex ME', userId: 'joao@sulgraos', event: 'DOCUMENT_GENERATED', properties: 'Commercial Invoice gerada', occurredAt: ago(2700) },
      { id: 'EVT-0030', tenantId: 'TEN-0010', company: 'Metais Minas Export', userId: 'rafael@metaisminas', event: 'CUSTOMER_CREATED', properties: 'Cliente Andes Metals SAC criado', occurredAt: ago(2850) },
    ];
    events.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
    return this.ms(events);
  }

  getEventTypeCounts(): Observable<EventTypeCount[]> {
    const labels: Record<ProductEventName, string> = {
      SIGNUP_STARTED: 'Cadastro iniciado',
      SIGNUP_COMPLETED: 'Cadastro concluído',
      PLAN_VIEWED: 'Plano visualizado',
      CHECKOUT_STARTED: 'Checkout iniciado',
      CHECKOUT_COMPLETED: 'Checkout concluído',
      ONBOARDING_STARTED: 'Onboarding iniciado',
      PRODUCT_CREATED: 'Produto criado',
      CUSTOMER_CREATED: 'Cliente criado',
      EXPORT_CREATED: 'Exportação criada',
      FIRST_EXPORT_CREATED: 'Primeira exportação',
      DOCUMENT_GENERATED: 'Documento gerado',
      AI_USED: 'IA utilizada',
    };
    const counts: Record<ProductEventName, number> = {
      AI_USED: 1240,
      PLAN_VIEWED: 980,
      DOCUMENT_GENERATED: 860,
      PRODUCT_CREATED: 640,
      SIGNUP_STARTED: 520,
      CUSTOMER_CREATED: 470,
      EXPORT_CREATED: 410,
      SIGNUP_COMPLETED: 300,
      CHECKOUT_STARTED: 180,
      CHECKOUT_COMPLETED: 130,
      ONBOARDING_STARTED: 120,
      FIRST_EXPORT_CREATED: 78,
    };
    const rows = (Object.keys(counts) as ProductEventName[]).map((event) => ({
      event,
      label: labels[event],
      count: counts[event],
    }));
    rows.sort((a, b) => b.count - a.count);
    return this.ms(rows);
  }
}
