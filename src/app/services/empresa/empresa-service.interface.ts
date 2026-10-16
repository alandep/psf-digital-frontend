import { Observable } from 'rxjs';
import { Empresa, EmpresaMetrics } from '../../../types/admin-empresas';

/** CRUD + metrics for the admin "Gestão de Empresas" screen. */
export interface IEmpresaService {
  getEmpresas(): Observable<Empresa[]>;
  getMetrics(): Observable<EmpresaMetrics>;
  addEmpresa(empresa: Empresa): Observable<Empresa>;
  updateEmpresa(empresa: Empresa): Observable<Empresa>;
}