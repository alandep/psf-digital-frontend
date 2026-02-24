export interface DashboardData {
  total_exportacoes: number;
  total_embarcado: number;  
  total_pendente: number;
  lucro_estimado: number;
  margem_media: number;
  contratos_ativos: number;
  alertas_compliance: number;
}

export interface ExportacoesPorMes {
  mes: string;
  valor: number;
}

export interface ExportacoesPorPais {
  pais: string;
  valor: number;
  percentual: number;
}

export interface ExportacoesPorProduto {
  produto: string;
  valor: number;
}

export interface FiltrosDashboard {
  periodo: {
    dataInicio: Date | null;
    dataFim: Date | null;
  };
  paises: string[];
  produtos: string[];
  clientes: string[];
}

export interface DashboardCompleto {
  kpis: DashboardData;
  exportacoesPorMes: ExportacoesPorMes[];
  exportacoesPorPais: ExportacoesPorPais[];
  exportacoesPorProduto: ExportacoesPorProduto[];
}

export interface OptionsFilters {
  paises: string[];
  produtos: string[];
  clientes: string[];
}