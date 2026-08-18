export interface SimulacaoInput {
  product: string;
  volume: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  incoterm: string;
  originPort: string;
  destinationCountry: string;
  exchangeRate: number;
}

export interface SimulacaoResult {
  receita: number;
  custosProduto: number;
  custosLogisticos: number;
  custosPortuarios: number;
  seguro: number;
  impostos: number;
  custosFinanceiros: number;
  comissoes: number;
  custoTotal: number;
  margemBruta: number;
  margemPercentual: number;
  breakdownItems: CostBreakdownItem[];
}

export interface CostBreakdownItem {
  category: string;
  description: string;
  value: number;
  percentage: number;
}

export interface SimulacaoHistorico {
  id: string;
  date: Date;
  product: string;
  country: string;
  volume: number;
  receita: number;
  margem: number;
  margemPercent: number;
}
