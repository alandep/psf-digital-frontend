export interface ExportReport {
  id: string;
  exportNumber: string;
  client: string;
  country: string;
  product: string;
  ncm: string;
  volume: number;
  unit: string;
  totalValue: number;
  currency: string;
  incoterm: string;
  port: string;
  shipDate: Date;
  status: string;
  margin: number;
  dueNumber: string;
}

export interface ReportMetrics {
  totalExports: number;
  totalValue: number;
  avgMargin: number;
  topCountry: string;
  topProduct: string;
  totalVolume: number;
  exportsThisMonth: number;
  growthPercent: number;
}

export interface CountryBreakdown {
  country: string;
  value: number;
  volume: number;
  count: number;
  percentage: number;
}

export interface ProductBreakdown {
  product: string;
  value: number;
  volume: number;
  count: number;
  percentage: number;
}
