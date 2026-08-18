export type InvoiceStatus = 'RASCUNHO' | 'GERADA' | 'EDITADA' | 'VALIDADA' | 'APROVADA' | 'ENVIADA' | 'UTILIZADA' | 'ARQUIVADA';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  exporterName: string;
  exporterCnpj: string;
  buyerName: string;
  buyerAddress: string;
  buyerCountry: string;
  portOrigin: string;
  portDestination: string;
  incoterm: string;
  paymentMethod: string;
  saleCondition: string;
  currency: string;
  exchangeRate: number | null;
  issueDate: Date;
  subtotal: number;
  freight: number;
  insurance: number;
  discount: number;
  otherExpenses: number;
  totalValue: number;
  totalWeight: number;
  totalQuantity: number;
  linkedContractNumber: string;
  linkedExportId: string;
  linkedDueNumber: string;
  linkedPackingList: string;
  completionPercentage: number;
  aiDocScore: number;
  rejectionProbability: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

export interface InvoiceProduct {
  id: string;
  invoiceId: string;
  productName: string;
  commercialDescription: string;
  technicalDescription: string;
  ncm: string;
  quantity: number;
  unit: string;
  netWeight: number;
  grossWeight: number;
  unitPrice: number;
  totalValue: number;
  countryOrigin: string;
  linkedLot: string;
}

export interface InvoiceRelatedDoc {
  id: string;
  invoiceId: string;
  documentType: string;
  documentNumber: string;
  status: 'valid' | 'pending' | 'missing';
}

export interface InvoiceValidation {
  id: string;
  invoiceId: string;
  checkName: string;
  status: 'pass' | 'fail' | 'warning';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  suggestion: string;
}

export interface InvoiceTimelineEvent {
  id: string;
  invoiceId: string;
  event: string;
  date: Date;
  user: string;
  details: string;
}

export interface InvoiceAIInsights {
  invoiceId: string;
  docScore: number;
  rejectionProbability: number;
  alerts: InvoiceAlert[];
  suggestions: InvoiceSuggestion[];
  executiveSummary: string;
}

export interface InvoiceAlert {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}

export interface InvoiceSuggestion {
  field: string;
  suggestion: string;
  reason: string;
  source: string;
  confidence: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface InvoiceFilters {
  searchText: string;
  status: InvoiceStatus | '';
  buyerName: string;
  buyerCountry: string;
  currency: string;
  portOrigin: string;
  dateStart: Date | null;
  dateEnd: Date | null;
}

export interface InvoiceMetrics {
  totalInvoices: number;
  draftCount: number;
  approvedCount: number;
  sentCount: number;
  totalValueUSD: number;
  avgDocScore: number;
}
