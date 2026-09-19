import { InjectionToken, Provider } from '@angular/core';
import { IAuthFlowService } from './auth-flow.interface';
import { AuthFlowMockAdapter } from './auth-flow-mock.service';
import { AuthFlowHttpService } from './auth-flow-http.service';
import { environment } from '../../../environments/environment';

export const AUTH_FLOW_SERVICE = new InjectionToken<IAuthFlowService>('AuthFlowService');

// Default (realApis.auth === false) keeps the fully-mocked flow. Flip the flag
// to route the identity flow to the backend BFF.
export const authFlowServiceProvider: Provider = {
  provide: AUTH_FLOW_SERVICE,
  useClass: environment.realApis?.auth ? AuthFlowHttpService : AuthFlowMockAdapter
};
