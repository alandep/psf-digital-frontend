// === STATUS TYPES ===
export type DueStatus = 'RASCUNHO' | 'VALIDAÇÃO' | 'PRONTO_ENVIO' | 'ENVIADO' | 'RECEBIDO' | 'EM_ANÁLISE' | 'LIBERADO' | 'AVERBADO' | 'CONCLUÍDO' | 'REJEITADO';

export type ValidationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// === MAIN DU-E INTERFACE ===
export interface DUE {
  id: string;
  dueNumber: string;
  status: DueStatus;
  exporterName: string;
  exporterCnpj: string;
  importerName: string;
  destinationCountry: string;
  productName: string;
  ncm: string;
  quantity: number;
  unit: string;
  totalValue: number;
  currency: string;
  incoterm: string;
  portOrigin: string;
  portDestination: string;
  transportMode: string;
  contractNumber: string;
  invoiceNumber: string;
  completionPercentage: number;
  aiComplianceScore: number;
  rejectionProbability: number;
  createdAt: Date;
  updatedAt: Date;
  lastSiscomexSync: Date | null;
  createdBy: string;
}

export interface DueProduct {
  id: string;
  dueId: string;
  productName: string;
  ncm: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  linkedLots: string[];
  netWeight: number;
  grossWeight: number;
}

export interface DueAttribute {
  id: string;
  dueId: string;
  ncm: string;
  attributeName: string;
  attributeValue: string;
  required: boolean;
  aiSuggested: boolean;
  aiConfidence: number;
  source: string;
}

export interface DueDocument {
  id: string;
  dueId: string;
  documentType: string;
  documentNumber: string;
  status: 'valid' | 'expired' | 'pending' | 'missing';
  issueDate: Date;
  linkedAt: Date;
}

export interface DueValidation {
  id: string;
  dueId: string;
  checkName: string;
  status: 'pass' | 'fail' | 'warning';
  severity: ValidationSeverity;
  message: string;
  suggestion: string;
}

export interface DueTimelineEvent {
  id: string;
  dueId: string;
  status: DueStatus;
  date: Date;
  user: string;
  integration: string;
  observations: string;
}

export interface DueAIInsights {
  dueId: string;
  complianceScore: number;
  rejectionProbability: number;
  bottlenecks: string[];
  suggestions: AIRecommendation[];
  executiveSummary: string;
}

export interface AIRecommendation {
  field: string;
  suggestion: string;
  reason: string;
  source: string;
  confidence: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DueAuditEntry {
  id: string;
  dueId: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
  ip: string;
}

export interface DueFilters {
  searchText: string;
  status: DueStatus | '';
  exporterName: string;
  destinationCountry: string;
  productName: string;
  portOrigin: string;
  dateStart: Date | null;
  dateEnd: Date | null;
}

export interface DueMetrics {
  totalDues: number;
  draftCount: number;
  sentCount: number;
  approvedCount: number;
  rejectedCount: number;
  avgComplianceScore: number;
}
