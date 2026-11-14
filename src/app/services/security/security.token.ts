import { InjectionToken, inject } from '@angular/core';
import { ISecurityService } from './security.interface';
import { SecurityHttpService } from './security-http.service';
import { SecurityMockService } from '../../../services/securityMockService';
import { environment } from '../../../environments/environment';

export const SECURITY_SERVICE = new InjectionToken<ISecurityService>('SecurityService', {
  providedIn: 'root',
  factory: () => (environment.realApis?.auth ? inject(SecurityHttpService) : inject(SecurityMockService))
});
