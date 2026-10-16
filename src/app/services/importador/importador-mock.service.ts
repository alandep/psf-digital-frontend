import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IImportadorService } from './importador-service.interface';
import { Importador, NovoImportador } from '../../../types/importador';

/**
 * Adapter demo-safe do cadastro de importadores. Mantém uma lista em memória
 * semeada com importadores realistas e simula latência de rede. Ativo quando
 * `realApis.export === false`; nenhuma chamada ao backend é feita.
 */
@Injectable({ providedIn: 'root' })
export class ImportadorMockAdapter implements IImportadorService {
  private readonly items: Importador[] = [
    {
      id: 'imp-0001',
      name: 'Global Grain Corp',
      country: 'United States',
      document: 'US-12-3456789',
      address: '450 Harbor Ave, New Orleans, LA 70130',
      contact: 'procurement@globalgrain.com'
    },
    {
      id: 'imp-0002',
      name: 'Shanghai Agri Imports Ltd',
      country: 'China',
      document: 'CN-91310000-7788',
      address: '88 Pudong Avenue, Shanghai 200120',
      contact: 'imports@shanghaiagri.cn'
    },
    {
      id: 'imp-0003',
      name: 'Rotterdam Commodities BV',
      country: 'Netherlands',
      document: 'NL-8529-6611-B01',
      address: 'Wilhelminakade 909, 3072 AP Rotterdam',
      contact: 'trade@rotterdamcommodities.nl'
    },
    {
      id: 'imp-0004',
      name: 'Al Rayan Trading LLC',
      country: 'United Arab Emirates',
      document: 'AE-DXB-554120',
      address: 'Jebel Ali Free Zone, Dubai',
      contact: 'contact@alrayantrading.ae'
    }
  ];

  listar(): Observable<Importador[]> {
    return of([...this.items]).pipe(delay(300));
  }

  criar(payload: NovoImportador): Observable<Importador> {
    const created: Importador = { id: 'imp-' + Date.now(), ...payload };
    this.items.push(created);
    return of(created).pipe(delay(300));
  }
}
