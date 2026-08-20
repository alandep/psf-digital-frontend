export type SupplierCategory = 'RAW_MATERIAL' | 'PACKAGING' | 'LOGISTICS' | 'SERVICES' | 'EQUIPMENT';
export type QualificationStatus = 'QUALIFIED' | 'PENDING' | 'CONDITIONAL' | 'DISQUALIFIED';

export interface Supplier {
  id: string;
  companyName: string;
  taxId: string;
  country: string;
  category: SupplierCategory;
  contactName: string;
  email: string;
  phone: string;
  riskScore: number;
  qualificationStatus: QualificationStatus;
  lastAuditDate: Date;
  activeContracts: number;
  deliveryPerformance: number;
  qualityMetrics: number;
  financialStability: number;
  complianceHistory: number;
  geographicRisk: number;
  createdAt: Date;
}

export interface SupplierMetrics {
  totalSuppliers: number;
  qualified: number;
  pending: number;
  highRisk: number;
  avgRiskScore: number;
  avgDeliveryPerformance: number;
}
