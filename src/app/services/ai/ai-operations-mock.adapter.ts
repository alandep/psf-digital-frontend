import { Injectable } from '@angular/core';
import { AiOperationsMockService } from '../../../services/aiOperationsMockService';
import { IAiOperationsService } from './ai-operations-service.token';

/**
 * Adapter demo-safe para a observabilidade do AI Operations Center.
 *
 * Reusa integralmente a implementação determinística existente em
 * {@link AiOperationsMockService} e apenas a expõe sob o contrato
 * {@link IAiOperationsService}, permitindo que o token DI alterne entre mock e
 * HTTP sem tocar no componente. O serviço mock original é preservado.
 */
@Injectable({ providedIn: 'root' })
export class AiOperationsMockAdapter
  extends AiOperationsMockService
  implements IAiOperationsService {}
