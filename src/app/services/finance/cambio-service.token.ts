import { InjectionToken, Provider } from '@angular/core';
import { ICambioService } from './cambio-service.interface';
import { CambioHttpService } from './cambio-http.service';

export const CAMBIO_SERVICE = new InjectionToken<ICambioService>('CambioService');

// Câmbio usa sempre o backend real (BFF); não há mais adaptador mock.
export const cambioServiceProvider: Provider = {
  provide: CAMBIO_SERVICE,
  useClass: CambioHttpService
};
