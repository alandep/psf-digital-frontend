export type RegulationType = 'LAW' | 'DECREE' | 'RESOLUTION' | 'ORDINANCE' | 'NORMATIVE_INSTRUCTION' | 'TECHNICAL_STANDARD' | 'TRADE_AGREEMENT' | 'INTERNAL_POLICY' | 'CLIENT_REQUIREMENT' | 'OTHER';
export type RegulationStatus = 'DRAFT' | 'UNDER_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED' | 'REPLACED' | 'ARCHIVED';
export type RegulationCategory = 'ADUANEIRA' | 'FISCAL' | 'SANITÁRIA' | 'FITOSSANITÁRIA' | 'AMBIENTAL' | 'CAMBIAL' | 'SEGURANÇA_ALIMENTAR' | 'QUALIDADE' | 'ESG' | 'CERTIFICAÇÕES' | 'ROTULAGEM' | 'EMBALAGEM';
export type Criticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Regulamentacao {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  description: string;
  category: RegulationCategory;
  regulationType: RegulationType;
  status: RegulationStatus;
  criticality: Criticality;
  country: string;
  regulatoryBody: string;
  publicationDate: Date;
  effectiveStartDate: Date;
  effectiveEndDate: Date | null;
  officialNumber: string;
  officialUrl: string;
  officialSource: string;
  owner: string;
  version: string;
  affectedProducts: number;
  affectedOperations: number;
  riskScore: number;
  aiAnalyzed: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

export interface RegulationRequirement {
  id: string;
  regulationId: string;
  title: string;
  requirementType: string;
  mandatory: boolean;
  blocking: boolean;
  responsibleRole: string;
  riskScore: number;
  status: 'ACTIVE' | 'PENDING' | 'REVOKED';
}

export interface CountryProductMatrix {
  id: string;
  product: string;
  country: string;
  allowed: 'SIM' | 'CONDICIONAL' | 'NÃO';
  certificates: number;
  licenses: number;
  riskLevel: Criticality;
  complianceStatus: 'CONFORME' | 'PENDENTE' | 'NÃO_CONFORME';
}

export interface ImpactAnalysis {
  regulationId: string;
  affectedProducts: number;
  affectedNCMs: number;
  affectedContracts: number;
  affectedExports: number;
  affectedShipments: number;
  documentsToReview: number;
  responsibleUsers: number;
  estimatedCost: number;
  adaptationDeadline: number; // days
}

export interface NonConformity {
  id: string;
  regulationId: string;
  title: string;
  description: string;
  severity: Criticality;
  riskScore: number;
  status: 'ABERTA' | 'EM_TRATAMENTO' | 'RESOLVIDA' | 'CANCELADA';
  responsible: string;
  dueDate: Date;
  detectedAt: Date;
  blocking: boolean;
}

export interface RegulationTimelineEvent {
  id: string;
  regulationId: string;
  event: string;
  date: Date;
  user: string;
  details: string;
}

export interface RegulationAIInsights {
  regulationId: string;
  riskScore: number;
  criticality: Criticality;
  summary: string;
  keyChanges: string[];
  affectedAreas: string[];
  recommendations: RegulationRecommendation[];
  alerts: RegulationAlert[];
  impactAnalysis: ImpactAnalysis;
  executiveSummary: string;
}

export interface RegulationAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  regulation: string;
  detectedAt: Date;
}

export interface RegulationRecommendation {
  action: string;
  reason: string;
  regulation: string;
  confidence: number;
  deadline: string;
  impact: string;
}

export interface RegulamentacaoFilters {
  searchText: string;
  category: RegulationCategory | '';
  regulationType: RegulationType | '';
  status: RegulationStatus | '';
  criticality: Criticality | '';
  country: string;
  regulatoryBody: string;
  dateStart: Date | null;
  dateEnd: Date | null;
}

export interface RegulamentacaoMetrics {
  totalRegulations: number;
  activeCount: number;
  recentChanges: number;
  affectedOperations: number;
  nonConformities: number;
  criticalRisks: number;
  countriesMonitored: number;
  productsWithPendencies: number;
}
