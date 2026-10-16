import { InjectionToken, Provider } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AiAgent,
  AiOperationsMetrics,
  AiErrorEntry,
  AiOperationsFilters
} from '../../../types/ai-operations';
import { environment } from '../../../environments/environment';
import { AiOperationsHttpService } from './ai-operations-http.service';
import { AiOperationsMockAdapter } from './ai-operations-mock.adapter';

/**
 * Contrato do serviço de observabilidade do AI Operations Center.
 *
 * A superfície espelha exatamente o que o `AiOperationsDashboardComponent` já
 * consome, de modo que a troca de implementação (mock ↔ HTTP) seja mínima e
 * sem alteração no componente além da injeção via token.
 */
export interface IAiOperationsService {
  getAgents(filters?: AiOperationsFilters): Observable<AiAgent[]>;
  getMetrics(): Observable<AiOperationsMetrics>;
  getAgentErrors(agentId: string): Observable<AiErrorEntry[]>;
  getModules(): string[];
  getLowAccuracyAgents(): Observable<AiAgent[]>;
}

export const AI_OPERATIONS_SERVICE = new InjectionToken<IAiOperationsService>(
  'AiOperationsService'
);

// Default (realApis.ai === false) mantém o mock para a demo. Com a flag ligada,
// a observabilidade passa a consumir o backend real
// (GET /bff/ai/operations/metrics e /errors), sem fallback para mock.
export const aiOperationsServiceProvider: Provider = {
  provide: AI_OPERATIONS_SERVICE,
  useClass: environment.realApis?.ai
    ? AiOperationsHttpService
    : AiOperationsMockAdapter
};
