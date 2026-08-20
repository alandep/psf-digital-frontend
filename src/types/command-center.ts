export type OperationStatus = 'ON_TIME' | 'AT_RISK' | 'DELAYED';
export type MilestoneType = 'CONTRACT_SIGNED' | 'PRODUCTION' | 'DOCUMENTATION' | 'SHIPMENT' | 'TRANSIT' | 'ARRIVAL' | 'FINANCIAL_SETTLEMENT';

export interface ActiveOperation {
  id: string;
  exportId: string;
  customer: string;
  product: string;
  origin: string;
  destination: string;
  currentStatus: OperationStatus;
  eta: Date;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  value: number;
  currency: string;
  milestones: OperationMilestone[];
  lat: number;
  lng: number;
}

export interface OperationMilestone {
  type: MilestoneType;
  label: string;
  date: Date | null;
  completed: boolean;
}

export interface CommandCenterMetrics {
  activeOperations: number;
  onTimeDeliveryRate: number;
  revenueInTransit: number;
  pendingDocuments: number;
  complianceAlerts: number;
  averageCycleTime: number;
}
