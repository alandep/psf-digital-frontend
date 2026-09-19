// Type for EIP Intelligence Alerts (MOCK). Shapes are backend-agnostic.

export interface IntelligenceAlert {
  id: string;
  title: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  relatedTo: string; // e.g. 'China / Carne bovina'
  affectedOperations: number;
  summary: string;
  createdAt: Date;
  read: boolean;
}
