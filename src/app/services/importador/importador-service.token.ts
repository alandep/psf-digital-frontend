import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IImportadorService } from './importador-service.interface';
import { ImportadorHttpService } from './importador-http.service';
import { ImportadorMockAdapter } from './importador-mock.service';

export const IMPORTADOR_SERVICE = new InjectionToken<IImportadorService>('ImportadorService');

// Reusa a flag realApis.export: quando a tela de exportação usa o backend real,
// o cadastro de importadores também usa (GET/POST /bff/importadores). Sem flag
// própria para manter o acoplamento com o módulo de exportação.
export const importadorServiceProvider: Provider = {
  provide: IMPORTADOR_SERVICE,
  useClass: environment.realApis?.export ? ImportadorHttpService : ImportadorMockAdapter
};
