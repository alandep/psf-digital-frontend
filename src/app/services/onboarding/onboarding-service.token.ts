import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IOnboardingService } from './onboarding-service.interface';
import { OnboardingHttpService } from './onboarding-http.service';
import { OnboardingMockAdapter } from './onboarding-mock.service';

export const ONBOARDING_SERVICE = new InjectionToken<IOnboardingService>('OnboardingService');

// Trial/onboarding state is tenant-scoped. Uses the real BFF when real auth is
// active (session available); otherwise the in-memory mock for demo.
export const onboardingServiceProvider: Provider = {
  provide: ONBOARDING_SERVICE,
  useClass: environment.realApis?.auth ? OnboardingHttpService : OnboardingMockAdapter
};