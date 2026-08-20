export type ScreeningType = 'KYC' | 'AML' | 'SANCTIONS' | 'PEP';
export type ScreeningStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED' | 'EXPIRED';
export type MatchStatus = 'CLEAR' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH';

export interface Screening {
  id: string;
  entityName: string;
  entityType: 'INDIVIDUAL' | 'COMPANY';
  country: string;
  taxId: string;
  screeningType: ScreeningType;
  status: ScreeningStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  matchStatus: MatchStatus | null;
  matchedWatchlists: string[];
  confidenceScore: number;
  assignedAnalyst: string;
  resolution: 'APPROVE' | 'REJECT' | 'ESCALATE' | null;
  justification: string;
  createdAt: Date;
  completedAt: Date | null;
  slaDeadline: Date;
}

export interface DueDiligenceMetrics {
  totalScreenings: number;
  pending: number;
  flagged: number;
  completed: number;
  expired: number;
  avgResolutionTime: number;
}

export interface DueDiligenceFilters {
  searchText: string;
  screeningType: ScreeningType | '';
  status: ScreeningStatus | '';
  riskLevel: string;
}
