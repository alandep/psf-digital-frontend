import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AiAgent, AiOperationsMetrics, AiErrorEntry, AiOperationsFilters } from '../types/ai-operations';

@Injectable({ providedIn: 'root' })
export class AiOperationsMockService {

  private mockAgents: AiAgent[] = [
    {
      id: 'AGENT-001', name: 'Export Agent', module: 'Exportações',
      requests24h: 1247, avgResponseTime: 320, accuracy: 94.2, cost: 12.50,
      status: 'ACTIVE', lastError: null, lastErrorAt: null
    },
    {
      id: 'AGENT-002', name: 'Compliance Agent', module: 'Compliance',
      requests24h: 856, avgResponseTime: 450, accuracy: 91.8, cost: 8.90,
      status: 'ACTIVE', lastError: null, lastErrorAt: null
    },
    {
      id: 'AGENT-003', name: 'Logistics Agent', module: 'Logística',
      requests24h: 2103, avgResponseTime: 280, accuracy: 96.1, cost: 18.30,
      status: 'ACTIVE', lastError: null, lastErrorAt: null
    },
    {
      id: 'AGENT-004', name: 'Finance Agent', module: 'Financeiro',
      requests24h: 634, avgResponseTime: 520, accuracy: 89.3, cost: 6.20,
      status: 'ACTIVE', lastError: 'Timeout ao consultar taxa de câmbio', lastErrorAt: new Date('2024-11-04T14:30:00')
    },
    {
      id: 'AGENT-005', name: 'Document Agent', module: 'Documentos',
      requests24h: 1589, avgResponseTime: 680, accuracy: 82.7, cost: 15.80,
      status: 'DEGRADED', lastError: 'Modelo de extração retornou confiança < 60%', lastErrorAt: new Date('2024-11-04T16:45:00')
    },
    {
      id: 'AGENT-006', name: 'OCR Agent', module: 'Documentos',
      requests24h: 3420, avgResponseTime: 1200, accuracy: 78.4, cost: 28.50,
      status: 'DEGRADED', lastError: 'Falha na extração de texto em documento digitalizado', lastErrorAt: new Date('2024-11-04T17:20:00')
    },
    {
      id: 'AGENT-007', name: 'Classification Agent', module: 'Produtos',
      requests24h: 945, avgResponseTime: 150, accuracy: 97.3, cost: 4.80,
      status: 'ACTIVE', lastError: null, lastErrorAt: null
    },
    {
      id: 'AGENT-008', name: 'Analytics Agent', module: 'Relatórios',
      requests24h: 412, avgResponseTime: 2800, accuracy: 88.9, cost: 22.40,
      status: 'ACTIVE', lastError: 'Query timeout em dataset grande', lastErrorAt: new Date('2024-11-03T09:15:00')
    },
    {
      id: 'AGENT-009', name: 'Forecast Agent', module: 'Rentabilidade',
      requests24h: 287, avgResponseTime: 3500, accuracy: 83.6, cost: 35.20,
      status: 'MAINTENANCE', lastError: 'Modelo em retreinamento', lastErrorAt: new Date('2024-11-04T08:00:00')
    },
    {
      id: 'AGENT-010', name: 'Chat Agent', module: 'Assistente IA',
      requests24h: 5678, avgResponseTime: 890, accuracy: 91.2, cost: 45.60,
      status: 'ACTIVE', lastError: null, lastErrorAt: null
    }
  ];

  private mockErrors: AiErrorEntry[] = [
    { id: 'ERR-001', agentId: 'AGENT-005', timestamp: new Date('2024-11-04T16:45:00'), type: 'LOW_CONFIDENCE', message: 'Modelo de extração retornou confiança < 60% para invoice #INV-2024-1234', module: 'Documentos' },
    { id: 'ERR-002', agentId: 'AGENT-006', timestamp: new Date('2024-11-04T17:20:00'), type: 'EXTRACTION_FAILURE', message: 'Falha na extração de texto em documento digitalizado - resolução muito baixa', module: 'Documentos' },
    { id: 'ERR-003', agentId: 'AGENT-006', timestamp: new Date('2024-11-04T15:10:00'), type: 'TIMEOUT', message: 'Timeout ao processar documento de 50 páginas', module: 'Documentos' },
    { id: 'ERR-004', agentId: 'AGENT-004', timestamp: new Date('2024-11-04T14:30:00'), type: 'API_ERROR', message: 'Timeout ao consultar taxa de câmbio - API Banco Central indisponível', module: 'Financeiro' },
    { id: 'ERR-005', agentId: 'AGENT-008', timestamp: new Date('2024-11-03T09:15:00'), type: 'QUERY_TIMEOUT', message: 'Query timeout em dataset grande (>1M registros)', module: 'Relatórios' },
    { id: 'ERR-006', agentId: 'AGENT-009', timestamp: new Date('2024-11-04T08:00:00'), type: 'MODEL_RETRAIN', message: 'Modelo em retreinamento - previsões temporariamente indisponíveis', module: 'Rentabilidade' },
    { id: 'ERR-007', agentId: 'AGENT-005', timestamp: new Date('2024-11-04T12:30:00'), type: 'VALIDATION_ERROR', message: 'Campos obrigatórios não extraídos do certificado fitossanitário', module: 'Documentos' },
    { id: 'ERR-008', agentId: 'AGENT-006', timestamp: new Date('2024-11-04T11:45:00'), type: 'FORMAT_ERROR', message: 'Formato de documento não suportado: .tiff multi-page', module: 'Documentos' },
    { id: 'ERR-009', agentId: 'AGENT-005', timestamp: new Date('2024-11-04T10:20:00'), type: 'LOW_CONFIDENCE', message: 'Confiança de 45% na classificação do documento - requer revisão manual', module: 'Documentos' },
    { id: 'ERR-010', agentId: 'AGENT-006', timestamp: new Date('2024-11-04T09:00:00'), type: 'MEMORY_ERROR', message: 'Out of memory ao processar lote de 200 documentos', module: 'Documentos' },
    { id: 'ERR-011', agentId: 'AGENT-004', timestamp: new Date('2024-11-03T16:20:00'), type: 'RATE_LIMIT', message: 'Rate limit excedido na API de câmbio', module: 'Financeiro' },
    { id: 'ERR-012', agentId: 'AGENT-008', timestamp: new Date('2024-11-02T14:10:00'), type: 'DATA_ERROR', message: 'Dados inconsistentes detectados no relatório de exportações', module: 'Relatórios' },
    { id: 'ERR-013', agentId: 'AGENT-009', timestamp: new Date('2024-11-02T11:30:00'), type: 'PREDICTION_ERROR', message: 'Erro de previsão >15% no cenário de rentabilidade', module: 'Rentabilidade' },
    { id: 'ERR-014', agentId: 'AGENT-005', timestamp: new Date('2024-11-03T08:45:00'), type: 'PARSING_ERROR', message: 'Falha ao parsear XML do DU-E', module: 'Documentos' },
    { id: 'ERR-015', agentId: 'AGENT-006', timestamp: new Date('2024-11-03T07:30:00'), type: 'EXTRACTION_FAILURE', message: 'Texto ilegível em área de assinatura do certificado', module: 'Documentos' },
    { id: 'ERR-016', agentId: 'AGENT-010', timestamp: new Date('2024-11-04T13:00:00'), type: 'CONTEXT_OVERFLOW', message: 'Contexto excedeu limite de tokens - resposta truncada', module: 'Assistente IA' },
    { id: 'ERR-017', agentId: 'AGENT-010', timestamp: new Date('2024-11-03T15:40:00'), type: 'HALLUCINATION', message: 'Resposta detectada como potencial alucinação - confidence check falhou', module: 'Assistente IA' },
    { id: 'ERR-018', agentId: 'AGENT-001', timestamp: new Date('2024-11-03T10:20:00'), type: 'VALIDATION_ERROR', message: 'NCM inválido sugerido para classificação de produto', module: 'Exportações' },
    { id: 'ERR-019', agentId: 'AGENT-002', timestamp: new Date('2024-11-02T16:50:00'), type: 'API_ERROR', message: 'API Siscomex retornou erro 503 - indisponível', module: 'Compliance' },
    { id: 'ERR-020', agentId: 'AGENT-003', timestamp: new Date('2024-11-02T12:15:00'), type: 'TRACKING_ERROR', message: 'Falha ao obter tracking do container MSKU1234567', module: 'Logística' },
    { id: 'ERR-021', agentId: 'AGENT-006', timestamp: new Date('2024-11-02T08:30:00'), type: 'LANGUAGE_ERROR', message: 'Idioma do documento não suportado: Árabe', module: 'Documentos' },
    { id: 'ERR-022', agentId: 'AGENT-005', timestamp: new Date('2024-11-01T17:00:00'), type: 'LOW_CONFIDENCE', message: 'Extração de dados com confiança 52% no BL', module: 'Documentos' },
    { id: 'ERR-023', agentId: 'AGENT-009', timestamp: new Date('2024-11-01T14:20:00'), type: 'DATA_DRIFT', message: 'Data drift detectado - modelo pode estar desatualizado', module: 'Rentabilidade' },
    { id: 'ERR-024', agentId: 'AGENT-004', timestamp: new Date('2024-11-01T11:00:00'), type: 'CALCULATION_ERROR', message: 'Divergência >2% no cálculo de hedge cambial', module: 'Financeiro' },
    { id: 'ERR-025', agentId: 'AGENT-008', timestamp: new Date('2024-11-01T09:30:00'), type: 'AGGREGATION_ERROR', message: 'Falha na agregação de dados mensais - dados faltantes em outubro', module: 'Relatórios' },
    { id: 'ERR-026', agentId: 'AGENT-003', timestamp: new Date('2024-11-01T07:45:00'), type: 'ROUTE_ERROR', message: 'Rota marítima sugerida passa por zona de conflito', module: 'Logística' },
    { id: 'ERR-027', agentId: 'AGENT-001', timestamp: new Date('2024-10-31T16:30:00'), type: 'DUPLICATE_DETECTION', message: 'Possível duplicata detectada na exportação EXP-2024-456', module: 'Exportações' },
    { id: 'ERR-028', agentId: 'AGENT-007', timestamp: new Date('2024-10-31T14:15:00'), type: 'CLASSIFICATION_ERROR', message: 'Classificação NCM ambígua para produto misto', module: 'Produtos' },
    { id: 'ERR-029', agentId: 'AGENT-010', timestamp: new Date('2024-10-31T11:00:00'), type: 'SAFETY_FILTER', message: 'Resposta bloqueada pelo filtro de segurança - consulta sobre dados sensíveis', module: 'Assistente IA' },
    { id: 'ERR-030', agentId: 'AGENT-002', timestamp: new Date('2024-10-31T09:30:00'), type: 'RULE_CONFLICT', message: 'Conflito entre regras de compliance para exportação para Irã', module: 'Compliance' },
    { id: 'ERR-031', agentId: 'AGENT-006', timestamp: new Date('2024-10-30T15:20:00'), type: 'BATCH_ERROR', message: 'Lote de OCR falhou - 15 de 50 documentos com erro', module: 'Documentos' }
  ];

  getAgents(filters?: AiOperationsFilters): Observable<AiAgent[]> {
    let filtered = [...this.mockAgents];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        filtered = filtered.filter(a =>
          a.name.toLowerCase().includes(search) ||
          a.module.toLowerCase().includes(search)
        );
      }
      if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status);
      }
      if (filters.module) {
        filtered = filtered.filter(a => a.module === filters.module);
      }
    }

    return of(filtered).pipe(delay(300));
  }

  getMetrics(): Observable<AiOperationsMetrics> {
    const metrics: AiOperationsMetrics = {
      totalRequests24h: this.mockAgents.reduce((sum, a) => sum + a.requests24h, 0),
      avgResponseTime: Math.round(this.mockAgents.reduce((sum, a) => sum + a.avgResponseTime, 0) / this.mockAgents.length),
      accuracyRate: Math.round(this.mockAgents.reduce((sum, a) => sum + a.accuracy, 0) / this.mockAgents.length * 10) / 10,
      estimatedCost: Math.round(this.mockAgents.reduce((sum, a) => sum + a.cost, 0) * 100) / 100,
      activeAgents: this.mockAgents.filter(a => a.status === 'ACTIVE').length,
      totalAgents: this.mockAgents.length
    };
    return of(metrics).pipe(delay(200));
  }

  getErrors(agentId?: string): Observable<AiErrorEntry[]> {
    let filtered = [...this.mockErrors];
    if (agentId) {
      filtered = filtered.filter(e => e.agentId === agentId);
    }
    return of(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())).pipe(delay(200));
  }

  getAgentErrors(agentId: string): Observable<AiErrorEntry[]> {
    const filtered = this.mockErrors.filter(e => e.agentId === agentId);
    return of(filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())).pipe(delay(200));
  }

  getModules(): string[] {
    return [...new Set(this.mockAgents.map(a => a.module))];
  }

  getLowAccuracyAgents(): Observable<AiAgent[]> {
    const filtered = this.mockAgents.filter(a => a.accuracy < 85);
    return of(filtered).pipe(delay(200));
  }
}
