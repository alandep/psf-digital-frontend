import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICertificacaoService } from './certificacao-service.interface';
import { environment } from '../../../environments/environment';
import { CertificacaoApi, SalvarCertificacao } from '../../../types/certificacao-api';
import { AI_SERVICE } from '../ai/ai-service.token';
import { IAiService } from '../ai/ai-service.interface';
import { AiAnalyzeRequest } from '../../../types/ai-hub';

// HTTP gateway para o módulo de Certificações (compliance). Usado quando
// environment.realApis.compliance === true (ou, na ausência da flag, quando
// realApis.export === true); caso contrário o CertificacaoMockAdapter é provido.
// Este adapter fala com o BFF REAL:
//   GET    /bff/compliance/certificacoes[?status=]
//   POST   /bff/compliance/certificacoes
//   PUT    /bff/compliance/certificacoes/{id}
//   DELETE /bff/compliance/certificacoes/{id}
// O cookie de sessão e o header X-XSRF-TOKEN são anexados automaticamente pelos
// credentialsInterceptor/csrfInterceptor, sem necessidade de fiação extra. Não
// há fallback para o mock: erros reais do backend são propagados para a tela.
// A verificação de compliance/risco usa a IA REAL (Vertex/GCP) via AI_SERVICE
// com a task 'RISK_ANALYSIS', retornando o texto do agente.
@Injectable({ providedIn: 'root' })
export class CertificacaoHttpService implements ICertificacaoService {
  private readonly http = inject(HttpClient);
  private readonly ai = inject<IAiService>(AI_SERVICE);
  private readonly api = `${environment.bffBaseUrl}/bff/compliance/certificacoes`;

  listar(status?: string): Observable<CertificacaoApi[]> {
    if (status) {
      const params = new HttpParams().set('status', status);
      return this.http.get<CertificacaoApi[]>(this.api, { params });
    }
    return this.http.get<CertificacaoApi[]>(this.api);
  }

  criar(payload: SalvarCertificacao): Observable<CertificacaoApi> {
    return this.http.post<CertificacaoApi>(this.api, payload);
  }

  atualizar(id: string, payload: SalvarCertificacao): Observable<CertificacaoApi> {
    return this.http.put<CertificacaoApi>(`${this.api}/${id}`, payload);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  verificarCompliance(input: string): Observable<string> {
    const req: AiAnalyzeRequest = { task: 'RISK_ANALYSIS', input };
    return this.ai.analisar(req).pipe(map(r => r.output));
  }
}
