import { Observable } from 'rxjs';
import { Pais } from '../../../types/pais';

export interface IPaisService {
  listar(): Observable<Pais[]>;
}
