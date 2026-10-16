import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AiAgent,
  AiOperationsMetrics,
  AiErrorEntry,
  AiOperationsFilters
} from '../../../types/ai-operations';
import { IAiOperationsService } from './ai-operations-service.token';

/**
 * Shape devolvido por GET /bff/ai/operations/metrics.
 * Espelha o record backend `CapabilityMetricView`.
 */
interface CapabilityMetricView {
  capability: string;
  label: string;
  requests: number;
  avgResponseTimeMs: number;
  cost: number;
  // Acurácia só existe para NCM_CLASSIFICATION/OCR_DOCUMENT; senão null.
  accuracy: number | null;
  status: AiAgent['status'];
  lastError: string | null;
  lastErrorAt: string | null;
}

/**
 * Shape devolvido por GET /bff/ai/operations/errors.
 * Espelha o record backend `AiErrorView`.
 */
interface AiErrorView {
  capability: string;
  at: string;
  category: string;
  detail: string | null;
}

/**
 * Gateway HTTP da observabilidade do AI Operations Center. Usado apenas quando
 * environment.realApis.ai === true; caso contrário o mock adapter é injetado.
 *
 * Consome os endpoints reais do BFF
 * (GET /bff/ai/operations/metrics e /errors) sob ${environment.bffBaseUrl}.
 * A sessão e o token CSRF são anexados pelos interceptors existentes. Não há
 * fallback para mock: erros reais do backend sobem para a tela.
 */
@Injectable({ providedIn: 'root' })
export class AiOperationsHttpService implements IAiOperationsService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/ai/operations`;

  /**
   * Busca as métricas por capacidade e as mapeia para `AiAgent`, aplicando os
   * filtros client-side (texto/status/módulo) para manter a superfície idêntica
   * à do mock.
   */
  getAgents(filters?: AiOperationsFilters): Observable<AiAgent[]> {
    return this.fetchMetrics().pipe(
      map((metrics) => metrics.map((m) => this.toAgent(m))),
      map((agents) => this.applyFilters(agents, filters))
    );
  }

  /**
   * Deriva as métricas agregadas a partir das capacidades retornadas pelo BFF.
   */
  getMetrics(): Observable<AiOperationsMetrics> {
    return this.fetchMetrics().pipe(
      map((metrics) => this.aggregate(metrics))
    );
  }

  /**
   * Busca os erros, filtra pela capacidade (= agentId) e mapeia para
   * `AiErrorEntry`.
   */
  getAgentErrors(agentId: string): Observable<AiErrorEntry[]> {
    return this.http
      .get<AiErrorView[]>(`${this.api}/errors`)
      .pipe(
        map((errors) =>
          errors
            .filter((e) => e.capability === agentId)
            .map((e) => this.toErrorEntry(e))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        )
      );
  }

  /**
   * O filtro de módulo é secundário na observabilidade real; os labels são
   * derivados dinamicamente de `getAgents`. Mantemos uma lista estática vazia
   * aqui para não acoplar o componente a uma chamada síncrona bloqueante.
   */
  getModules(): string[] {
    return [];
  }

  /** Capacidades com acurácia conhecida (não-null) abaixo de 85%. */
  getLowAccuracyAgents(): Observable<AiAgent[]> {
    return this.fetchMetrics().pipe(
      map((metrics) =>
        metrics
          .map((m) => this.toAgent(m))
          .filter((a) => a.accuracy != null && a.accuracy < 85)
      )
    );
  }

  private fetchMetrics(): Observable<CapabilityMetricView[]> {
    return this.http.get<CapabilityMetricView[]>(`${this.api}/metrics`);
  }

  private toAgent(m: CapabilityMetricView): AiAgent {
    return {
      id: m.capability,
      name: m.label,
      module: m.label,
      requests24h: m.requests,
      avgResponseTime: m.avgResponseTimeMs,
      // Backend expõe acurácia já em percentual (ou null). Preserva null para
      // a UI renderizar "n/a".
      accuracy: m.accuracy ?? null,
      cost: m.cost,
      status: m.status,
      lastError: m.lastError ?? null,
      lastErrorAt: m.lastErrorAt ? new Date(m.lastErrorAt) : null
    };
  }

  private toErrorEntry(e: AiErrorView): AiErrorEntry {
    return {
      id: `${e.capability}-${e.at}`,
      agentId: e.capability,
      timestamp: new Date(e.at),
      type: e.category,
      message: e.detail ?? e.category,
      module: e.capability
    };
  }

  private applyFilters(
    agents: AiAgent[],
    filters?: AiOperationsFilters
  ): AiAgent[] {
    if (!filters) {
      return agents;
    }
    let filtered = agents;
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.module.toLowerCase().includes(search)
      );
    }
    if (filters.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }
    if (filters.module) {
      filtered = filtered.filter((a) => a.module === filters.module);
    }
    return filtered;
  }

  private aggregate(metrics: CapabilityMetricView[]): AiOperationsMetrics {
    const totalAgents = metrics.length;
    const totalRequests24h = metrics.reduce((sum, m) => sum + m.requests, 0);
    const avgResponseTime = totalAgents
      ? Math.round(
          metrics.reduce((sum, m) => sum + m.avgResponseTimeMs, 0) / totalAgents
        )
      : 0;
    const accuracies = metrics
      .map((m) => m.accuracy)
      .filter((a): a is number => a != null);
    const accuracyRate = accuracies.length
      ? Math.round(
          (accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length) * 10
        ) / 10
      : 0;
    const estimatedCost =
      Math.round(metrics.reduce((sum, m) => sum + m.cost, 0) * 100) / 100;
    const activeAgents = metrics.filter((m) => m.status === 'ACTIVE').length;

    return {
      totalRequests24h,
      avgResponseTime,
      accuracyRate,
      estimatedCost,
      activeAgents,
      totalAgents
    };
  }
}
