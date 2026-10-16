import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IProdutoService } from './produto-service.interface';
import { Produto, NovoProduto } from '../../../types/produto';

/**
 * Adapter demo-safe do catálogo de produtos. Mantém uma lista em memória
 * semeada com commodities agrícolas realistas e simula latência de rede. Ativo
 * quando `realApis.export === false`; nenhuma chamada ao backend é feita.
 */
@Injectable({ providedIn: 'root' })
export class ProdutoMockAdapter implements IProdutoService {
  private readonly items: Produto[] = [
    {
      id: 'prod-0001',
      name: 'Soja em Grão',
      ncm: '12019000',
      description: 'Soja em grão a granel',
      unit: 'MT',
      standardPrice: 425.5,
      currency: 'USD',
      originCountry: 'Brasil'
    },
    {
      id: 'prod-0002',
      name: 'Milho',
      ncm: '10059010',
      description: 'Milho em grão a granel',
      unit: 'MT',
      standardPrice: 215.0,
      currency: 'USD',
      originCountry: 'Brasil'
    },
    {
      id: 'prod-0003',
      name: 'Farelo de Soja',
      ncm: '23040010',
      description: 'Farelo de soja para ração animal',
      unit: 'MT',
      standardPrice: 390.75,
      currency: 'USD',
      originCountry: 'Brasil'
    },
    {
      id: 'prod-0004',
      name: 'Café Arábica',
      ncm: '09011110',
      description: 'Café arábica em grão não torrado',
      unit: 'SC',
      standardPrice: 185.9,
      currency: 'USD',
      originCountry: 'Brasil'
    },
    {
      id: 'prod-0005',
      name: 'Açúcar VHP',
      ncm: '17011400',
      description: 'Açúcar VHP bruto para exportação',
      unit: 'MT',
      standardPrice: 540.0,
      currency: 'USD',
      originCountry: 'Brasil'
    }
  ];

  listar(): Observable<Produto[]> {
    return of([...this.items]).pipe(delay(300));
  }

  criar(payload: NovoProduto): Observable<Produto> {
    const created: Produto = {
      id: 'prod-' + Date.now(),
      name: payload.name,
      ncm: payload.ncm ?? null,
      description: payload.description ?? null,
      unit: payload.unit ?? null,
      standardPrice: payload.standardPrice ?? null,
      currency: payload.currency ?? null,
      originCountry: payload.originCountry ?? null
    };
    this.items.push(created);
    return of(created).pipe(delay(300));
  }
}
