import { InjectionToken, Provider } from '@angular/core';
import { IHedgeService } from './hedge-service.interface';
import { HedgeMockAdapter } from './hedge-mock.service';
import { HedgeHttpService } from './hedge-http.service';
import { environment } from '../../../environments/environment';

export const HEDGE_SERVICE = new InjectionToken<IHedgeService>('HedgeService');

// Default (realApis.finance === false) keeps the mock. Flip the flag to route
// hedge reads to the backend BFF (rich extras still fall back to mock).
export const hedgeServiceProvider: Provider = {
  provide: HEDGE_SERVICE,
  useClass: environment.realApis?.finance ? HedgeHttpService : HedgeMockAdapter
};
