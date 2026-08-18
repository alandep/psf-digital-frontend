export type LicenseType = 'EXPORTAÇÃO' | 'REGISTRO_ESPECIAL' | 'SANITÁRIA' | 'FITOSSANITÁRIA' | 'AMBIENTAL' | 'PRODUTOS_CONTROLADOS' | 'OUTRAS';
export type LicenseStatus = 'VÁLIDA' | 'VENCIDA' | 'PENDENTE' | 'EM_RENOVAÇÃO' | 'SUSPENSA' | 'CANCELADA';
export type RiskLevel = 'MUITO_BAIXO' | 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO';
export type ValidationStatus = 'CONFORME' | 'NÃO_CONFORME' | 'PENDENTE' | 'EM_ANÁLISE';

export interface Licenca {
  id: string;
  licenseNumber: string;
  licenseType: LicenseType;
  company: string;
  productName: string;
  destinationCountry: string;
  regulatoryBody: string;
  issueDate: Date;
  expiryDate: Date;
  status: LicenseStatus;
  responsibleUser: string;
  observations: string;
  aiComplianceScore: number;
  riskLevel: RiskLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceValidation {
  id: string;
  licenseId: string;
  checkType: string;
  status: ValidationStatus;
  riskScore: number;
  validationDate: Date;
  validatedBy: string;
  observations: string;
}

export interface CountryRequirement {
  id: string;
  country: string;
  requirement: string;
  category: string;
  mandatory: boolean;
  regulatoryBody: string;
  details: string;
}

export interface RegulatoryRestriction {
  id: string;
  country: string;
  product: string;
  restrictionType: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  severity: RiskLevel;
}

export interface ActionPlan {
  id: string;
  licenseId: string;
  title: string;
  description: string;
  responsible: string;
  deadline: Date;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO';
  priority: 'BAIXA' | 'MÉDIA' | 'ALTA' | 'CRÍTICA';
  evidence: string[];
}

export interface LicenseTimelineEvent {
  id: string;
  licenseId: string;
  event: string;
  date: Date;
  user: string;
  details: string;
}

export interface LicenseAIInsights {
  licenseId: string;
  complianceScore: number;
  riskLevel: RiskLevel;
  alerts: LicenseAlert[];
  suggestions: LicenseSuggestion[];
  countryRequirements: CountryRequirement[];
  restrictions: RegulatoryRestriction[];
  executiveSummary: string;
}

export interface LicenseAlert {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  regulation: string;
  detectedAt: Date;
}

export interface LicenseSuggestion {
  action: string;
  reason: string;
  regulation: string;
  confidence: number;
  operationalImpact: string;
  deadline: string;
}

export interface LicenseFilters {
  searchText: string;
  licenseType: LicenseType | '';
  status: LicenseStatus | '';
  regulatoryBody: string;
  destinationCountry: string;
  riskLevel: RiskLevel | '';
  expiryStart: Date | null;
  expiryEnd: Date | null;
}

export interface LicenseMetrics {
  totalLicenses: number;
  activeCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  nonConformities: number;
  blockedExports: number;
  avgComplianceScore: number;
  avgRiskScore: number;
}
