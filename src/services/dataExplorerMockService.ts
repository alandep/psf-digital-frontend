import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  DatasetType, QueryConfig, QueryResult, SavedQuery,
  DatasetInfo, ExplorerMetrics, MetricType
} from '../types/data-explorer';

@Injectable({ providedIn: 'root' })
export class DataExplorerMockService {

  private savedQueries: SavedQuery[] = this.generateSavedQueries();

  getDatasets(): DatasetInfo[] {
    return [
      {
        type: 'EXPORTACOES', name: 'Exportações', description: 'Dados de exportações realizadas',
        dimensions: ['País Destino', 'Produto', 'Porto', 'Mês', 'Status'],
        metrics: ['Valor FOB', 'Peso (ton)', 'Quantidade', 'Número de Operações'],
        filterFields: ['País', 'Produto', 'Status', 'Ano'],
        totalRecords: 2847
      },
      {
        type: 'CONTRATOS', name: 'Contratos', description: 'Contratos comerciais ativos e históricos',
        dimensions: ['Cliente', 'Tipo', 'Status', 'Moeda', 'Mês'],
        metrics: ['Valor Total', 'Quantidade', 'Margem Média', 'Prazo Médio (dias)'],
        filterFields: ['Cliente', 'Status', 'Moeda', 'Ano'],
        totalRecords: 1256
      },
      {
        type: 'FINANCEIRO', name: 'Financeiro', description: 'Transações e movimentações financeiras',
        dimensions: ['Tipo Operação', 'Banco', 'Moeda', 'Mês', 'Categoria'],
        metrics: ['Valor', 'Taxa Média', 'Volume', 'Spread'],
        filterFields: ['Banco', 'Moeda', 'Tipo', 'Período'],
        totalRecords: 5621
      },
      {
        type: 'LOGISTICA', name: 'Logística', description: 'Embarques, containers e transportes',
        dimensions: ['Porto Origem', 'Porto Destino', 'Armador', 'Mês', 'Modal'],
        metrics: ['Containers', 'Peso Total', 'Frete Médio', 'Transit Time (dias)'],
        filterFields: ['Armador', 'Porto', 'Status', 'Mês'],
        totalRecords: 3892
      },
      {
        type: 'COMPLIANCE', name: 'Compliance', description: 'Licenças, regulamentações e documentos',
        dimensions: ['Tipo Documento', 'Órgão', 'Status', 'Mês', 'Risco'],
        metrics: ['Documentos', 'Pendências', 'Taxa Aprovação', 'Tempo Médio (dias)'],
        filterFields: ['Órgão', 'Status', 'Tipo', 'Risco'],
        totalRecords: 1453
      },
    ];
  }

  executeQuery(config: QueryConfig): Observable<QueryResult[]> {
    const results = this.generateQueryResults(config);
    return of(results).pipe(delay(600));
  }

  getSavedQueries(): Observable<SavedQuery[]> {
    return of([...this.savedQueries]).pipe(delay(300));
  }

  getMetrics(): Observable<ExplorerMetrics> {
    const metrics: ExplorerMetrics = {
      totalConsultas: 156,
      datasetsDisponiveis: 5,
      consultasSalvas: this.savedQueries.length,
      ultimaConsulta: new Date(),
    };
    return of(metrics).pipe(delay(200));
  }

  saveQuery(name: string, config: QueryConfig): Observable<SavedQuery> {
    const newQuery: SavedQuery = {
      id: `query-${Date.now()}`,
      name,
      description: `Consulta: ${config.dataset} agrupado por ${config.groupBy}`,
      icon: 'query_stats',
      config,
      createdAt: new Date(),
      createdBy: 'admin@empresa.com',
    };
    this.savedQueries.unshift(newQuery);
    return of(newQuery).pipe(delay(400));
  }

  private generateQueryResults(config: QueryConfig): QueryResult[] {
    const labelsMap: Record<DatasetType, Record<string, string[]>> = {
      'EXPORTACOES': {
        'País Destino': ['China', 'EUA', 'Alemanha', 'Japão', 'Arábia Saudita', 'Holanda', 'Itália'],
        'Produto': ['Soja', 'Milho', 'Café', 'Açúcar', 'Carne Bovina', 'Algodão', 'Celulose'],
        'Porto': ['Santos', 'Paranaguá', 'Rio Grande', 'Vitória', 'Itajaí'],
        'Mês': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        'Status': ['Concluída', 'Em Andamento', 'Pendente', 'Cancelada'],
      },
      'CONTRATOS': {
        'Cliente': ['Global Grain', 'China Foods', 'European Comm.', 'Tokyo Trading', 'Arabia Foods'],
        'Tipo': ['FOB', 'CIF', 'CFR', 'EXW'],
        'Status': ['Ativo', 'Vencido', 'Pendente', 'Encerrado'],
        'Moeda': ['USD', 'EUR', 'BRL', 'JPY'],
        'Mês': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      },
      'FINANCEIRO': {
        'Tipo Operação': ['Câmbio', 'Adiantamento', 'Cobrança', 'Hedge', 'Transferência'],
        'Banco': ['Itaú', 'Bradesco', 'Santander', 'BB', 'Citibank'],
        'Moeda': ['USD', 'EUR', 'GBP', 'JPY'],
        'Mês': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        'Categoria': ['Receita', 'Despesa', 'Investimento'],
      },
      'LOGISTICA': {
        'Porto Origem': ['Santos', 'Paranaguá', 'Rio Grande', 'Vitória', 'Itajaí'],
        'Porto Destino': ['Shanghai', 'Houston', 'Hamburg', 'Tokyo', 'Rotterdam'],
        'Armador': ['MSC', 'Maersk', 'CMA CGM', 'Hapag-Lloyd', 'ONE'],
        'Mês': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        'Modal': ['Marítimo', 'Aéreo', 'Rodoviário'],
      },
      'COMPLIANCE': {
        'Tipo Documento': ['Licença Import.', 'Certificado Origem', 'Fitossanitário', 'LPCO'],
        'Órgão': ['MAPA', 'ANVISA', 'IBAMA', 'INMETRO', 'Receita Federal'],
        'Status': ['Aprovado', 'Pendente', 'Vencido', 'Em Análise'],
        'Mês': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        'Risco': ['Baixo', 'Médio', 'Alto', 'Crítico'],
      },
    };

    const labels = labelsMap[config.dataset]?.[config.groupBy] || ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E'];

    const results: QueryResult[] = labels.map(label => {
      const value = Math.round(Math.random() * 10000 + 500);
      return { label, value };
    });

    const total = results.reduce((sum, r) => sum + r.value, 0);
    results.forEach(r => r.percentage = Math.round((r.value / total) * 100));

    return results.sort((a, b) => b.value - a.value);
  }

  private generateSavedQueries(): SavedQuery[] {
    return [
      {
        id: 'query-001', name: 'Top Destinos por Valor FOB', description: 'Exportações agrupadas por país de destino',
        icon: 'public', config: { dataset: 'EXPORTACOES', groupBy: 'País Destino', metric: 'SUM', metricField: 'Valor FOB', filterField: '', filterValue: '' },
        createdAt: new Date(2025, 4, 15), createdBy: 'admin@empresa.com'
      },
      {
        id: 'query-002', name: 'Embarques por Armador', description: 'Logística agrupada por armador',
        icon: 'directions_boat', config: { dataset: 'LOGISTICA', groupBy: 'Armador', metric: 'COUNT', metricField: 'Containers', filterField: '', filterValue: '' },
        createdAt: new Date(2025, 4, 20), createdBy: 'admin@empresa.com'
      },
      {
        id: 'query-003', name: 'Receitas por Moeda', description: 'Financeiro agrupado por moeda',
        icon: 'currency_exchange', config: { dataset: 'FINANCEIRO', groupBy: 'Moeda', metric: 'SUM', metricField: 'Valor', filterField: '', filterValue: '' },
        createdAt: new Date(2025, 5, 1), createdBy: 'admin@empresa.com'
      },
    ];
  }
}
