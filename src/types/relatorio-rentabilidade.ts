export interface RentabilidadeReport {
  id: string;
  operation: string;
  client: string;
  product: string;
  country: string;
  volume: number;
  revenue: number;
  totalCost: number;
  grossMargin: number;
  marginPercent: number;
  logisticsCost: number;
  financialCost: number;
  period: string;
  incoterm: string;
}

export interface RentabilidadeMetrics {
  totalRevenue: number;
  totalCost: number;
  avgMargin: number;
  bestProduct: string;
  bestClient: string;
  worstMarginOp: string;
  operationsAboveTarget: number;
  operationsBelowTarget: number;
}

export interface MarginByProduct {
  product: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
  volume: number;
}

export interface MarginByClient {
  client: string;
  revenue: number;
  margin: number;
  marginPercent: number;
  operations: number;
}
