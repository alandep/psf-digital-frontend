export type DatasetType = 'EXPORTACOES' | 'CONTRATOS' | 'FINANCEIRO' | 'LOGISTICA' | 'COMPLIANCE';
export type ViewMode = 'TABLE' | 'BAR_CHART' | 'KPI_CARDS';
export type MetricType = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';

export interface QueryConfig {
  dataset: DatasetType;
  groupBy: string;
  metric: MetricType;
  metricField: string;
  filterField: string;
  filterValue: string;
}

export interface QueryResult {
  label: string;
  value: number;
  percentage?: number;
}

export interface SavedQuery {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: QueryConfig;
  createdAt: Date;
  createdBy: string;
}

export interface DatasetInfo {
  type: DatasetType;
  name: string;
  description: string;
  dimensions: string[];
  metrics: string[];
  filterFields: string[];
  totalRecords: number;
}

export interface ExplorerMetrics {
  totalConsultas: number;
  datasetsDisponiveis: number;
  consultasSalvas: number;
  ultimaConsulta: Date;
}
