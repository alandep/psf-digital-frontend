export type ComplianceLevel = 'CONFORME' | 'PARCIAL' | 'NÃO_CONFORME' | 'NÃO_AVALIADO';

export interface ComplianceReport {
  id: string;
  area: string;
  requirement: string;
  regulation: string;
  status: ComplianceLevel;
  riskScore: number;
  responsible: string;
  dueDate: Date;
  lastAssessment: Date;
  evidence: string;
  actions: number;
  observations: string;
}

export interface ComplianceMetrics {
  totalRequirements: number;
  conformeCount: number;
  parcialCount: number;
  naoConformeCount: number;
  naoAvaliadoCount: number;
  overallScore: number;
  criticalRisks: number;
  pendingActions: number;
}

export interface ComplianceByArea {
  area: string;
  total: number;
  conforme: number;
  parcial: number;
  naoConforme: number;
  score: number;
}
