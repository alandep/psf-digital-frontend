import { InjectionToken, Provider } from '@angular/core';
import { ISubscriptionService } from './subscription-service.interface';
import { SubscriptionMockAdapter } from './subscription-mock.service';
import { SubscriptionHttpService } from './subscription-http.service';
import { environment } from '../../../environments/environment';

export const SUBSCRIPTION_SERVICE = new InjectionToken<ISubscriptionService>('SubscriptionService');

// Default (realApis.subscription === false) keeps the mock. Flip the flag to
// route subscription reads/mutations to the backend BFF (unsupported methods
// still fall back to mock).
export const subscriptionServiceProvider: Provider = {
  provide: SUBSCRIPTION_SERVICE,
  useClass: environment.realApis?.subscription ? SubscriptionHttpService : SubscriptionMockAdapter
};
