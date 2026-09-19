import { InjectionToken, Provider } from '@angular/core';
import { ICambioService } from './cambio-service.interface';
import { CambioMockAdapter } from './cambio-mock.service';
import { CambioHttpService } from './cambio-http.service';
import { environment } from '../../../environments/environment';

export const CAMBIO_SERVICE = new InjectionToken<ICambioService>('CambioService');

// Default (realApis.finance === false) keeps the mock. Flip the flag to route
// cambio reads/creates to the backend BFF (rich extras still fall back to
// mock).
export const cambioServiceProvider: Provider = {
  provide: CAMBIO_SERVICE,
  useClass: environment.realApis?.finance ? CambioHttpService : CambioMockAdapter
};
