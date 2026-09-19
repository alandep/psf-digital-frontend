import { InjectionToken, Provider } from '@angular/core';
import { IPagamentosService } from './pagamentos-service.interface';
import { PagamentosMockAdapter } from './pagamentos-mock.service';
import { PagamentosHttpService } from './pagamentos-http.service';
import { environment } from '../../../environments/environment';

export const PAGAMENTOS_SERVICE = new InjectionToken<IPagamentosService>('PagamentosService');

// Default (realApis.finance === false) keeps the mock. Flip the flag to route
// pagamentos reads/creates to the backend BFF (rich extras still fall back to
// mock).
export const pagamentosServiceProvider: Provider = {
  provide: PAGAMENTOS_SERVICE,
  useClass: environment.realApis?.finance ? PagamentosHttpService : PagamentosMockAdapter
};
