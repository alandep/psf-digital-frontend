import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IAdminUsuarioService } from './admin-usuario-service.interface';
import { AdminUsuarioHttpService } from './admin-usuario-http.service';
import { AdminUsuarioMockAdapter } from './admin-usuario-mock.service';

export const ADMIN_USUARIO_SERVICE = new InjectionToken<IAdminUsuarioService>('AdminUsuarioService');

// User management is tenant-scoped. Uses the real BFF when real auth is active
// (session available); otherwise the in-memory mock for demo.
export const adminUsuarioServiceProvider: Provider = {
  provide: ADMIN_USUARIO_SERVICE,
  useClass: environment.realApis?.auth ? AdminUsuarioHttpService : AdminUsuarioMockAdapter
};