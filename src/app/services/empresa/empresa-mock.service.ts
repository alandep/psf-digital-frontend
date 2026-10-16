import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IEmpresaService } from './empresa-service.interface';
import { EmpresasMockService } from '../../../services/empresasMockService';
import { Empresa, EmpresaMetrics } from '../../../types/admin-empresas';

/** Adapter exposing the legacy in-memory EmpresasMockService via IEmpresaService. */
@Injectable({ providedIn: 'root' })
export class EmpresaMockAdapter implements IEmpresaService {
  private readonly mock = inject(EmpresasMockService);
  getEmpresas(): Observable<Empresa[]> { return this.mock.getEmpresas(); }
  getMetrics(): Observable<EmpresaMetrics> { return this.mock.getMetrics(); }
  addEmpresa(e: Empresa): Observable<Empresa> { return this.mock.addEmpresa(e); }
  updateEmpresa(e: Empresa): Observable<Empresa> { return this.mock.updateEmpresa(e); }
}