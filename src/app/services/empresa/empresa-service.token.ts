import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IEmpresaService } from './empresa-service.interface';
import { EmpresaHttpService } from './empresa-http.service';
import { EmpresaMockAdapter } from './empresa-mock.service';

export const EMPRESA_SERVICE = new InjectionToken<IEmpresaService>('EmpresaService');

// Empresa administration is a platform-admin surface. Uses the real BFF when
// real auth is active (session available); otherwise the in-memory mock.
export const empresaServiceProvider: Provider = {
  provide: EMPRESA_SERVICE,
  useClass: environment.realApis?.auth ? EmpresaHttpService : EmpresaMockAdapter
};