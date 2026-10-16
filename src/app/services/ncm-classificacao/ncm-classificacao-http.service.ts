import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INcmClassificacaoService } from './ncm-classificacao-service.interface';
import { environment } from '../../../environments/environment';
import { NcmClassificacaoApi, SalvarNcmClassificacao, NcmValidacaoResult } from '../../../types/ncm-classificacao-api';

// Gateway HTTP para classificações NCM. Ativo quando
// environment.realApis.export === true; caso contrário o
// NcmClassificacaoMockAdapter é fornecido. Atinge o BFF real
// (GET/POST /bff/ncm-classificacoes e POST /bff/ai/ncm/validar).
// Cookies de sessão e o header CSRF X-XSRF-TOKEN são anexados
// automaticamente pelos interceptors. Sem fallback para mock: erros
// reais do backend são repassados para a tela.
@Injectable({ providedIn: 'root' })
export class NcmClassificacaoHttpService implements INcmClassificacaoService {
  private readonly http = inject(HttpClient);
  private readonly apiCrud = `${environment.bffBaseUrl}/bff/ncm-classificacoes`;
  private readonly apiValidar = `${environment.bffBaseUrl}/bff/ai/ncm/validar`;

  listar(): Observable<NcmClassificacaoApi[]> {
    return this.http.get<NcmClassificacaoApi[]>(this.apiCrud);
  }

  salvar(payload: SalvarNcmClassificacao): Observable<NcmClassificacaoApi> {
    return this.http.post<NcmClassificacaoApi>(this.apiCrud, payload);
  }

  validarNcm(ncmCode: string, productDescription?: string): Observable<NcmValidacaoResult> {
    return this.http.post<NcmValidacaoResult>(this.apiValidar, { ncmCode, productDescription });
  }
}
