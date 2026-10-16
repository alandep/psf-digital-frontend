import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { INcmClassificacaoService } from './ncm-classificacao-service.interface';
import { NcmClassificacaoHttpService } from './ncm-classificacao-http.service';
import { NcmClassificacaoMockAdapter } from './ncm-classificacao-mock.service';

export const NCM_CLASSIFICACAO_SERVICE = new InjectionToken<INcmClassificacaoService>('NcmClassificacaoService');

export const ncmClassificacaoServiceProvider: Provider = {
  provide: NCM_CLASSIFICACAO_SERVICE,
  useClass: environment.realApis?.export ? NcmClassificacaoHttpService : NcmClassificacaoMockAdapter
};
