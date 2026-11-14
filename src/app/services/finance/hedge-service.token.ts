import { InjectionToken, Provider } from '@angular/core';
import { IHedgeService } from './hedge-service.interface';
import { HedgeHttpService } from './hedge-http.service';

export const HEDGE_SERVICE = new InjectionToken<IHedgeService>('HedgeService');

// Hedge usa sempre o backend real (BFF); não há mais adaptador mock.
export const hedgeServiceProvider: Provider = {
  provide: HEDGE_SERVICE,
  useClass: HedgeHttpService
};
