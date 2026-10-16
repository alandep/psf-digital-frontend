import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ILocalidadeService } from './localidade-service.interface';
import { LocalidadeHttpService } from './localidade-http.service';
import { LocalidadeMockAdapter } from './localidade-mock.service';

export const LOCALIDADE_SERVICE = new InjectionToken<ILocalidadeService>('LocalidadeService');

// Brazilian state/city reference data: use the real BFF when real auth is active
// (session available), otherwise the offline mock for the demo profile.
export const localidadeServiceProvider: Provider = {
  provide: LOCALIDADE_SERVICE,
  useClass: environment.realApis?.auth ? LocalidadeHttpService : LocalidadeMockAdapter
};