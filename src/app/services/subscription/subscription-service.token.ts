import { InjectionToken, Provider } from '@angular/core';
import { ISubscriptionService } from './subscription-service.interface';
import { SubscriptionMockAdapter } from './subscription-mock.service';
import { SubscriptionHttpService } from './subscription-http.service';
import { environment } from '../../../environments/environment';

export const SUBSCRIPTION_SERVICE = new InjectionToken<ISubscriptionService>('SubscriptionService');

// realApis.subscription === true usa o BFF; false usa o adapter estático.
export const subscriptionServiceProvider: Provider = {
  provide: SUBSCRIPTION_SERVICE,
  useClass: environment.realApis?.subscription ? SubscriptionHttpService : SubscriptionMockAdapter
};
