import { Observable } from 'rxjs';
import { CertificacaoApi, SalvarCertificacao } from '../../../types/certificacao-api';

export interface ICertificacaoService {
  listar(status?: string): Observable<CertificacaoApi[]>;
  criar(payload: SalvarCertificacao): Observable<CertificacaoApi>;
  atualizar(id: string, payload: SalvarCertificacao): Observable<CertificacaoApi>;
  excluir(id: string): Observable<void>;
  // IA real (Vertex/GCP): verifica compliance / analisa risco a partir de um texto-resumo.
  verificarCompliance(input: string): Observable<string>;
}
