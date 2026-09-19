import { InjectionToken, Provider } from '@angular/core';
import { IExportacaoService } from './exportacao-service.interface';
import { ExportacaoMockServiceAdapter } from './exportacao-mock.service';
import { ExportacaoRealService } from './exportacao-real.service';
import { environment } from '../../../environments/environment';

export const EXPORTACAO_SERVICE = new InjectionToken<IExportacaoService>('ExportacaoService');

// Default (realApis.export === false) keeps the mock. Flip the flag to route
// export CRUD to the backend BFF (unsupported methods still fall back to mock).
export const exportacaoServiceProvider: Provider = {
  provide: EXPORTACAO_SERVICE,
  useClass: environment.realApis?.export ? ExportacaoRealService : ExportacaoMockServiceAdapter
};
