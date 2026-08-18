import { InjectionToken, Provider } from '@angular/core';
import { IExportacaoService } from './exportacao-service.interface';
import { ExportacaoMockServiceAdapter } from './exportacao-mock.service';
import { ExportacaoRealService } from './exportacao-real.service';
import { environment } from '../../../environments/environment';

export const EXPORTACAO_SERVICE = new InjectionToken<IExportacaoService>('ExportacaoService');

export const exportacaoServiceProvider: Provider = {
  provide: EXPORTACAO_SERVICE,
  useClass: environment.useMockServices ? ExportacaoMockServiceAdapter : ExportacaoRealService
};
