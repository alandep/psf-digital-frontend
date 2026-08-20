export type CustomerSegment = 'AGRO' | 'INDUSTRIAL' | 'TRADING' | 'RETAIL' | 'SERVICES';
export type OpportunityStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

export interface Customer {
  id: string;
  companyName: string;
  tradeName: string;
  taxId: string;
  country: string;
  address: string;
  segment: CustomerSegment;
  primaryContact: string;
  totalRevenue: number;
  activeContracts: number;
  riskScore: number;
  lastInteractionDate: Date;
  createdAt: Date;
}

export interface Contact {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Opportunity {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  estimatedValue: number;
  probability: number;
  stage: OpportunityStage;
  expectedCloseDate: Date;
  assignedUser: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmMetrics {
  totalCustomers: number;
  totalRevenue: number;
  activeContracts: number;
  avgRiskScore: number;
  opportunitiesOpen: number;
  pipelineValue: number;
}
