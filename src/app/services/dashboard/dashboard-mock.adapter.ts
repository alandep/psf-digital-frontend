import { Injectable } from '@angular/core';
import { DashboardMockService } from '../../../services/dashboardMockService';
import { IDashboardService } from './dashboard-service.interface';

/**
 * Adapter demo-safe do Dashboard Principal. Reusa integralmente a implementação
 * determinística de {@link DashboardMockService}, expondo-a sob o contrato
 * {@link IDashboardService}. Ativo apenas quando `realApis.dashboard === false`.
 */
@Injectable({ providedIn: 'root' })
export class DashboardMockAdapter extends DashboardMockService implements IDashboardService {}
