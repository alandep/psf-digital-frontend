import { Observable } from 'rxjs';
import { Produto, NovoProduto } from '../../../types/produto';

export interface IProdutoService {
  listar(): Observable<Produto[]>;
  criar(payload: NovoProduto): Observable<Produto>;
}
