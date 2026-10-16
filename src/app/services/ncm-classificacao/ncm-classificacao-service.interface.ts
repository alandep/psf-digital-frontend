import { Observable } from 'rxjs';
import { NcmClassificacaoApi, SalvarNcmClassificacao, NcmValidacaoResult } from '../../../types/ncm-classificacao-api';

export interface INcmClassificacaoService {
  listar(): Observable<NcmClassificacaoApi[]>;
  salvar(payload: SalvarNcmClassificacao): Observable<NcmClassificacaoApi>;
  validarNcm(ncmCode: string, productDescription?: string): Observable<NcmValidacaoResult>;
}
