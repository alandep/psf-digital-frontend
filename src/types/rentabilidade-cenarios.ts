export type CenarioTipo = 'OTIMISTA' | 'BASE' | 'CONSERVADOR' | 'ADVERSO';

export interface Cenario {
  id: string;
  name: string;
  tipo: CenarioTipo;
  description: string;
  product: string;
  country: string;
  volume: number;
  exchangeRate: number;
  freightCost: number;
  productPrice: number;
  margin: number;
  marginPercent: number;
  revenue: number;
  totalCost: number;
  riskLevel: string;
  createdAt: Date;
  createdBy: string;
}

export interface CenarioComparison {
  metric: string;
  otimista: number;
  base: number;
  conservador: number;
  adverso: number;
  unit: string;
}

export interface CenariosMetrics {
  totalCenarios: number;
  cenariosAtivos: number;
  melhorMargem: number;
  piorMargem: number;
  margemMedia: number;
  variacaoCambial: number;
}
