import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IPaisService } from './pais-service.interface';
import { Pais } from '../../../types/pais';

/**
 * Adapter demo-safe de países de referência. Mantém uma lista em memória
 * semeada com países comuns e simula latência de rede. Ativo quando a auth
 * real está desligada; nenhuma chamada ao backend é feita.
 */
@Injectable({ providedIn: 'root' })
export class PaisMockAdapter implements IPaisService {
  private readonly items: Pais[] = [
    { alpha2: 'BR', alpha3: 'BRA', namePt: 'Brasil', nameEn: 'Brazil' },
    { alpha2: 'US', alpha3: 'USA', namePt: 'Estados Unidos', nameEn: 'United States' },
    { alpha2: 'CN', alpha3: 'CHN', namePt: 'China', nameEn: 'China' },
    { alpha2: 'DE', alpha3: 'DEU', namePt: 'Alemanha', nameEn: 'Germany' },
    { alpha2: 'JP', alpha3: 'JPN', namePt: 'Japão', nameEn: 'Japan' },
    { alpha2: 'AR', alpha3: 'ARG', namePt: 'Argentina', nameEn: 'Argentina' },
    { alpha2: 'NL', alpha3: 'NLD', namePt: 'Países Baixos', nameEn: 'Netherlands' },
    { alpha2: 'GB', alpha3: 'GBR', namePt: 'Reino Unido', nameEn: 'United Kingdom' },
    { alpha2: 'FR', alpha3: 'FRA', namePt: 'França', nameEn: 'France' },
    { alpha2: 'IT', alpha3: 'ITA', namePt: 'Itália', nameEn: 'Italy' },
    { alpha2: 'ES', alpha3: 'ESP', namePt: 'Espanha', nameEn: 'Spain' },
    { alpha2: 'CA', alpha3: 'CAN', namePt: 'Canadá', nameEn: 'Canada' },
    { alpha2: 'MX', alpha3: 'MEX', namePt: 'México', nameEn: 'Mexico' },
    { alpha2: 'CL', alpha3: 'CHL', namePt: 'Chile', nameEn: 'Chile' },
    { alpha2: 'PT', alpha3: 'PRT', namePt: 'Portugal', nameEn: 'Portugal' }
  ];

  listar(): Observable<Pais[]> {
    return of([...this.items]).pipe(delay(150));
  }
}
