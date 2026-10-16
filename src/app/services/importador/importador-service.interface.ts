import { Observable } from 'rxjs';
import { Importador, NovoImportador } from '../../../types/importador';

export interface IImportadorService {
  listar(): Observable<Importador[]>;
  criar(payload: NovoImportador): Observable<Importador>;
}
