import { Observable } from 'rxjs';
import { Estado, Cidade } from '../../../types/localidade';

/** Reads Brazilian state/city reference data for the cascading combos. */
export interface ILocalidadeService {
  listarEstados(): Observable<Estado[]>;
  listarCidades(uf: string): Observable<Cidade[]>;
}