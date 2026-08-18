export type CertificadoStatus = 'VÁLIDO' | 'VENCIDO' | 'PENDENTE' | 'SOLICITADO' | 'EMITIDO' | 'VINCULADO' | 'ARQUIVADO';

export type CertificadoTipo = 'FITOSSANITÁRIO' | 'ORIGEM' | 'QUALIDADE' | 'ANÁLISE_LABORATORIAL' | 'HALAL' | 'KOSHER' | 'ORGÂNICO' | 'SANITÁRIO' | 'FUMIGAÇÃO';

export type RequirementLevel = 'OBRIGATÓRIO' | 'RECOMENDADO' | 'OPCIONAL' | 'NÃO_APLICÁVEL';

export interface CertificadoExportacao {
  id: string;
  certificateNumber: string;
  tipo: CertificadoTipo;
  status: CertificadoStatus;
  productName: string;
  ncm: string;
  destinationCountry: string;
  exporterName: string;
  importerName: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  linkedExportId: string;
  linkedLoteNumber: string;
  linkedDueNumber: string;
  aiComplianceScore: number;
  rejectionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  updatedAt: Date;
}

export interface CountryRequirement {
  id: string;
  country: string;
  productName: string;
  ncm: string;
  certificateType: CertificadoTipo;
  level: RequirementLevel;
  issuingAuthority: string;
  estimatedProcessingDays: number;
  validityMonths: number;
  notes: string;
}

export interface CertificadoValidation {
  id: string;
  certificateId: string;
  checkName: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CertificadoTimelineEvent {
  id: string;
  certificateId: string;
  event: string;
  date: Date;
  user: string;
  origin: string;
  observations: string;
}

export interface CertificadoRelatedDoc {
  id: string;
  certificateId: string;
  documentType: string;
  documentNumber: string;
  entity: string;
}

export interface CertificadoAIInsights {
  certificateId: string;
  complianceScore: number;
  rejectionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  alerts: CertificadoAlert[];
  suggestions: CertificadoSuggestion[];
  countryRequirements: CountryRequirement[];
  executiveSummary: string;
}

export interface CertificadoAlert {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  detectedAt: Date;
}

export interface CertificadoSuggestion {
  action: string;
  reason: string;
  norm: string;
  confidence: number;
  impact: string;
}

export interface CertificadoFilters {
  searchText: string;
  tipo: CertificadoTipo | '';
  status: CertificadoStatus | '';
  destinationCountry: string;
  productName: string;
  issuingAuthority: string;
  expiryStart: Date | null;
  expiryEnd: Date | null;
}

export interface CertificadoMetrics {
  totalCertificates: number;
  validCount: number;
  expiredCount: number;
  pendingCount: number;
  expiringSoonCount: number;
  avgComplianceScore: number;
}
