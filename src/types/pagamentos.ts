export type PaymentStatus = 'PENDENTE' | 'APROVADO' | 'PAGO' | 'VENCIDO' | 'CANCELADO' | 'CONCILIADO';
export type PaymentCategory = 'FRETE' | 'ARMAZENAGEM' | 'DESPACHANTE' | 'SEGURO' | 'COMISSÃO' | 'TAXAS_PORTUÁRIAS' | 'TAXAS_BANCÁRIAS' | 'CERTIFICADOS' | 'TRANSPORTE' | 'TRIBUTOS' | 'FORNECEDORES' | 'OUTROS';
export type PaymentType = 'NACIONAL' | 'INTERNACIONAL';

export interface Pagamento {
  id: string;
  paymentNumber: string;
  company: string;
  beneficiary: string;
  paymentType: PaymentType;
  category: PaymentCategory;
  bank: string;
  bankAccount: string;
  currency: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  paymentDate: Date | null;
  status: PaymentStatus;
  linkedExportNumber: string;
  linkedContractNumber: string;
  linkedInvoiceNumber: string;
  linkedDueNumber: string;
  costCenter: string;
  observations: string;
  aiFinancialScore: number;
  // International fields
  swift: string | null;
  iban: string | null;
  beneficiaryBank: string | null;
  beneficiaryCountry: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentReconciliation {
  id: string;
  paymentId: string;
  expectedAmount: number;
  realizedAmount: number;
  difference: number;
  status: 'CONCILIADO' | 'DIVERGENTE' | 'PENDENTE';
  source: string;
  reconciliatedAt: Date | null;
}

export interface PaymentNotification {
  id: string;
  paymentId: string;
  type: string;
  message: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'PUSH' | 'CENTRAL';
  sentAt: Date;
  read: boolean;
}

export interface PaymentTimelineEvent {
  id: string;
  paymentId: string;
  event: string;
  date: Date;
  user: string;
  details: string;
}

export interface PaymentAIInsights {
  paymentId: string;
  financialScore: number;
  riskLevel: 'BAIXO' | 'MÉDIO' | 'ALTO';
  alerts: PaymentAlert[];
  suggestions: PaymentSuggestion[];
  cashFlowImpact: CashFlowProjection;
  executiveSummary: string;
}

export interface PaymentAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  detectedAt: Date;
}

export interface PaymentSuggestion {
  action: string;
  reason: string;
  criteria: string[];
  confidence: number;
  financialImpact: string;
}

export interface CashFlowProjection {
  totalPayable: number;
  paidThisMonth: number;
  upcomingWeek: number;
  upcomingMonth: number;
  projectedBalance: number;
  scenarioOptimistic: number;
  scenarioProbable: number;
  scenarioConservative: number;
}

export interface PaymentFilters {
  searchText: string;
  status: PaymentStatus | '';
  category: PaymentCategory | '';
  paymentType: PaymentType | '';
  beneficiary: string;
  currency: string;
  bank: string;
  dateStart: Date | null;
  dateEnd: Date | null;
}

export interface PaymentMetrics {
  totalPayments: number;
  pendingCount: number;
  paidCount: number;
  overdueCount: number;
  totalPendingValue: number;
  totalPaidValue: number;
  totalOverdueValue: number;
  avgFinancialScore: number;
}
