import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ILocalidadeService } from './localidade-service.interface';
import { Estado, Cidade } from '../../../types/localidade';

/** Offline mock: the 27 UFs plus a few capitals per state, for the demo profile. */
@Injectable({ providedIn: 'root' })
export class LocalidadeMockAdapter implements ILocalidadeService {
  private estados: Estado[] = [
    { uf: 'AC', ibgeCode: '12', name: 'Acre' }, { uf: 'AL', ibgeCode: '27', name: 'Alagoas' },
    { uf: 'AP', ibgeCode: '16', name: 'Amapá' }, { uf: 'AM', ibgeCode: '13', name: 'Amazonas' },
    { uf: 'BA', ibgeCode: '29', name: 'Bahia' }, { uf: 'CE', ibgeCode: '23', name: 'Ceará' },
    { uf: 'DF', ibgeCode: '53', name: 'Distrito Federal' }, { uf: 'ES', ibgeCode: '32', name: 'Espírito Santo' },
    { uf: 'GO', ibgeCode: '52', name: 'Goiás' }, { uf: 'MA', ibgeCode: '21', name: 'Maranhão' },
    { uf: 'MT', ibgeCode: '51', name: 'Mato Grosso' }, { uf: 'MS', ibgeCode: '50', name: 'Mato Grosso do Sul' },
    { uf: 'MG', ibgeCode: '31', name: 'Minas Gerais' }, { uf: 'PA', ibgeCode: '15', name: 'Pará' },
    { uf: 'PB', ibgeCode: '25', name: 'Paraíba' }, { uf: 'PR', ibgeCode: '41', name: 'Paraná' },
    { uf: 'PE', ibgeCode: '26', name: 'Pernambuco' }, { uf: 'PI', ibgeCode: '22', name: 'Piauí' },
    { uf: 'RJ', ibgeCode: '33', name: 'Rio de Janeiro' }, { uf: 'RN', ibgeCode: '24', name: 'Rio Grande do Norte' },
    { uf: 'RS', ibgeCode: '43', name: 'Rio Grande do Sul' }, { uf: 'RO', ibgeCode: '11', name: 'Rondônia' },
    { uf: 'RR', ibgeCode: '14', name: 'Roraima' }, { uf: 'SC', ibgeCode: '42', name: 'Santa Catarina' },
    { uf: 'SP', ibgeCode: '35', name: 'São Paulo' }, { uf: 'SE', ibgeCode: '28', name: 'Sergipe' },
    { uf: 'TO', ibgeCode: '17', name: 'Tocantins' }
  ];
  private capitais: Record<string, string[]> = {
    SP: ['São Paulo', 'Campinas', 'Santos'], RJ: ['Rio de Janeiro', 'Niterói'],
    MG: ['Belo Horizonte', 'Uberlândia'], PR: ['Curitiba', 'Londrina'], BA: ['Salvador'],
    DF: ['Brasília'], GO: ['Goiânia'], SC: ['Florianópolis', 'Chapecó'], RS: ['Porto Alegre']
  };

  listarEstados(): Observable<Estado[]> { return of([...this.estados]); }

  listarCidades(uf: string): Observable<Cidade[]> {
    const key = (uf ?? '').trim().toUpperCase();
    const names = this.capitais[key] ?? [];
    return of(names.map((n, i) => ({ ibgeCode: `${key}${i}`, uf: key, name: n })));
  }
}