import { InjectionToken, Provider } from '@angular/core';
import { ILogisticsService } from './logistics-service.interface';
import { LogisticsMockAdapter } from './logistics-mock.service';
import { LogisticsHttpService } from './logistics-http.service';
import { environment } from '../../../environments/environment';

export const LOGISTICS_SERVICE = new InjectionToken<ILogisticsService>('LogisticsService');

// Default (realApis.logistics === false) keeps the mock. Flip the flag to route
// embarque reads/creates to the backend BFF (unsupported methods still fall
// back to mock).
export const logisticsServiceProvider: Provider = {
  provide: LOGISTICS_SERVICE,
  useClass: environment.realApis?.logistics ? LogisticsHttpService : LogisticsMockAdapter
};
