import { InjectionToken, Provider } from '@angular/core';
import { IPagamentosService } from './pagamentos-service.interface';
import { PagamentosHttpService } from './pagamentos-http.service';

export const PAGAMENTOS_SERVICE = new InjectionToken<IPagamentosService>('PagamentosService');

// Pagamentos usa sempre o backend real (BFF); não há mais adaptador mock.
export const pagamentosServiceProvider: Provider = {
  provide: PAGAMENTOS_SERVICE,
  useClass: PagamentosHttpService
};
