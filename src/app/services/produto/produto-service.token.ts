import { InjectionToken, Provider } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IProdutoService } from './produto-service.interface';
import { ProdutoHttpService } from './produto-http.service';
import { ProdutoMockAdapter } from './produto-mock.service';

export const PRODUTO_SERVICE = new InjectionToken<IProdutoService>('ProdutoService');

// Reusa a flag realApis.export: quando a tela de exportação usa o backend real,
// o catálogo de produtos também usa (GET/POST /bff/produtos).
export const produtoServiceProvider: Provider = {
  provide: PRODUTO_SERVICE,
  useClass: environment.realApis?.export ? ProdutoHttpService : ProdutoMockAdapter
};
