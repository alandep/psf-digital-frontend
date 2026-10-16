import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ICertificacaoService } from './certificacao-service.interface';
import { CertificacaoHttpService } from './certificacao-http.service';
import { CertificacaoMockAdapter } from './certificacao-mock.service';

export const CERTIFICACAO_SERVICE = new InjectionToken<ICertificacaoService>('CertificacaoService');

// Usa a flag realApis.compliance quando existir; senão cai no realApis.export.
// A precedência é calculada em uma const dedicada para evitar ambiguidade de
// operadores dentro do literal do Provider.
const useReal =
  (environment.realApis as any)?.compliance === true || environment.realApis?.export === true;

export const certificacaoServiceProvider: Provider = {
  provide: CERTIFICACAO_SERVICE,
  useClass: useReal ? CertificacaoHttpService : CertificacaoMockAdapter
};
