import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IPaisService } from './pais-service.interface';
import { PaisHttpService } from './pais-http.service';
import { PaisMockAdapter } from './pais-mock.service';

export const PAIS_SERVICE = new InjectionToken<IPaisService>('PaisService');

// Países são dados de referência globais. Usa o backend real quando a auth real
// está ativa (sessão disponível); caso contrário cai no mock para a demo.
export const paisServiceProvider: Provider = {
  provide: PAIS_SERVICE,
  useClass: environment.realApis?.auth ? PaisHttpService : PaisMockAdapter
};
