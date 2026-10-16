import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IDashboardService } from './dashboard-service.interface';
import { DashboardHttpService } from './dashboard-http.service';
import { DashboardMockAdapter } from './dashboard-mock.adapter';

export const DASHBOARD_SERVICE = new InjectionToken<IDashboardService>('DashboardService');

// Default (realApis.dashboard === false) mantém o mock para a demo. Com a flag
// true, a tela consome o backend real (GET /bff/dashboards/principal e /filtros),
// sem fallback para mock.
export const dashboardServiceProvider: Provider = {
  provide: DASHBOARD_SERVICE,
  useClass: environment.realApis?.dashboard ? DashboardHttpService : DashboardMockAdapter
};
