export type REStatus = 'IMPORTADO' | 'VALIDADO' | 'CONVERTIDO' | 'PENDENTE' | 'DIVERGENTE' | 'ARQUIVADO';

export interface RegistroExportacao {
  id: string;
  reNumber: string;
  status: REStatus;
  exporterName: string;
  exporterCnpj: string;
  clientName: string;
  destinationCountry: string;
  productName: string;
  ncm: string;
  quantity: number;
  unit: string;
  totalValue: number;
  currency: string;
  incoterm: string;
  portOrigin: string;
  transportMode: string;
  operationNature: string;
  linkedExportId: string | null;
  linkedDueNumber: string | null;
  migrationScore: number;
  consistencyScore: number;
  createdAt: Date;
  importedAt: Date;
  originalSource: string;
}

export interface REProduct {
  id: string;
  reId: string;
  productName: string;
  ncm: string;
  quantity: number;
  unit: string;
  value: number;
  netWeight: number;
  grossWeight: number;
  linkedLot: string;
}

export interface REDocument {
  id: string;
  reId: string;
  documentType: string;
  documentNumber: string;
  status: 'valid' | 'expired' | 'pending' | 'converted';
  issueDate: Date;
}

export interface REDivergence {
  id: string;
  reId: string;
  field: string;
  reValue: string;
  currentValue: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestion: string;
  aiConfidence: number;
}

export interface RETimelineEvent {
  id: string;
  reId: string;
  event: string;
  date: Date;
  user: string;
  details: string;
}

export interface REAIInsights {
  reId: string;
  migrationScore: number;
  consistencyScore: number;
  divergences: REDivergence[];
  conversionReadiness: 'READY' | 'NEEDS_REVIEW' | 'NOT_READY';
  suggestions: AISuggestion[];
  executiveSummary: string;
}

export interface AISuggestion {
  field: string;
  suggestion: string;
  reason: string;
  source: string;
  confidence: number;
}

export interface REFilters {
  searchText: string;
  status: REStatus | '';
  exporterName: string;
  destinationCountry: string;
  productName: string;
  dateStart: Date | null;
  dateEnd: Date | null;
  linkedDue: string;
}

export interface REMetrics {
  totalREs: number;
  importedCount: number;
  convertedCount: number;
  pendingCount: number;
  divergentCount: number;
  avgMigrationScore: number;
}
