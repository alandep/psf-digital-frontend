import { InjectionToken, Provider } from '@angular/core';
import { IAiService } from './ai-service.interface';
import { AiMockAdapter } from './ai-mock.service';
import { AiHttpService } from './ai-http.service';
import { environment } from '../../../environments/environment';

export const AI_SERVICE = new InjectionToken<IAiService>('AiService');

// Default (realApis.ai === false) keeps the mock. Flip the flag to route the
// AI Hub to the real backend BFF (/bff/ai/analisar and /bff/ai/reconciliar).
export const aiServiceProvider: Provider = {
  provide: AI_SERVICE,
  useClass: environment.realApis?.ai ? AiHttpService : AiMockAdapter
};
