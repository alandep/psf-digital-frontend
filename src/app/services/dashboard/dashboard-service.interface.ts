import { Observable } from 'rxjs';
import { DashboardCompleto, FiltrosDashboard, OptionsFilters } from '../../../types/dashboard';

// Contrato do serviço do Dashboard Principal. Mesma superfície que a tela já
// consome (getDashboardData/getOptionsFilters), para troca mínima entre o
// adapter HTTP real e o mock.
export interface IDashboardService {
  getDashboardData(filtros?: FiltrosDashboard): Observable<DashboardCompleto>;
  getOptionsFilters(): Observable<OptionsFilters>;
}
