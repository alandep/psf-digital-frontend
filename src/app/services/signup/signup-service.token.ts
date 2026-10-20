import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ISignupService } from './signup-service.interface';
import { SignupHttpService } from './signup-http.service';
import { SignupMockAdapter } from './signup-mock.service';

export const SIGNUP_SERVICE = new InjectionToken<ISignupService>('SignupService');

// Public acquisition flow. Uses the real BFF when real auth is active;
// otherwise the in-memory mock for offline/demo.
export const signupServiceProvider: Provider = {
  provide: SIGNUP_SERVICE,
  useClass: environment.realApis?.auth ? SignupHttpService : SignupMockAdapter
};