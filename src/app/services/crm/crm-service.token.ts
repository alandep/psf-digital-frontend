import { InjectionToken, Provider } from '@angular/core';
import { ICrmService } from './crm-service.interface';
import { CrmMockAdapter } from './crm-mock.service';
import { CrmHttpService } from './crm-http.service';
import { environment } from '../../../environments/environment';

export const CRM_SERVICE = new InjectionToken<ICrmService>('CrmService');

// Default (realApis.crm === false) keeps the mock. Flip the flag to route
// CRM dashboard to the backend BFF (rich methods still fall back to mock).
export const crmServiceProvider: Provider = {
  provide: CRM_SERVICE,
  useClass: environment.realApis?.crm ? CrmHttpService : CrmMockAdapter
};
