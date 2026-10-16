import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ICertificacaoService } from './certificacao-service.interface';
import { CertificacaoApi, SalvarCertificacao } from '../../../types/certificacao-api';

/**
 * Adapter demo-safe do módulo de Certificações (compliance). Mantém uma lista em
 * memória semeada com certificados agrícolas realistas e simula latência de rede.
 * Ativo quando a flag realApis.compliance (e o fallback realApis.export) estão
 * desligados; nenhuma chamada ao backend ou à IA é feita.
 */
@Injectable({ providedIn: 'root' })
export class CertificacaoMockAdapter implements ICertificacaoService {
  private items: CertificacaoApi[] = [
    {
      id: 'cert-0001',
      name: 'Certificado Fitossanitário - Soja',
      tipo: 'Fitossanitário',
      orgaoEmissor: 'MAPA',
      numero: 'FITO-2024-000123',
      status: 'VALIDA',
      emitidaEm: '2024-01-15',
      validaAte: '2025-01-15',
      productId: 'prod-0001',
      productName: 'Soja em Grão',
      categoria: 'Grãos',
      descricao: 'Certificado fitossanitário para exportação de soja em grão.',
      paisEmissor: 'Brasil',
      paisDestino: 'China',
      assinaturaDigital: true,
      complianceStatus: 'APROVADO',
      exportId: 'exp-0001',
      dueNumber: '24BR0001234567',
      aiGenerated: false,
      aiConfidenceScore: null,
      aiRiskScore: 0.12,
      aiRiskLevel: 'LOW',
      createdBy: 'operador@demo.com'
    },
    {
      id: 'cert-0002',
      name: 'Certificado de Origem - Milho',
      tipo: 'Origem',
      orgaoEmissor: 'FIESP',
      numero: 'ORIG-2024-000456',
      status: 'VALIDA',
      emitidaEm: '2024-03-02',
      validaAte: '2025-03-02',
      productId: 'prod-0002',
      productName: 'Milho',
      categoria: 'Grãos',
      descricao: 'Certificado de origem para exportação de milho a granel.',
      paisEmissor: 'Brasil',
      paisDestino: 'Japão',
      assinaturaDigital: true,
      complianceStatus: 'APROVADO',
      exportId: 'exp-0002',
      dueNumber: '24BR0007654321',
      aiGenerated: false,
      aiConfidenceScore: null,
      aiRiskScore: 0.2,
      aiRiskLevel: 'LOW',
      createdBy: 'operador@demo.com'
    },
    {
      id: 'cert-0003',
      name: 'Certificado Orgânico - Café',
      tipo: 'Orgânico',
      orgaoEmissor: 'IBD',
      numero: 'ORG-2024-000789',
      status: 'PENDENTE',
      emitidaEm: '2024-05-20',
      validaAte: '2025-05-20',
      productId: 'prod-0004',
      productName: 'Café Arábica',
      categoria: 'Café',
      descricao: 'Certificado orgânico para exportação de café arábica.',
      paisEmissor: 'Brasil',
      paisDestino: 'Alemanha',
      assinaturaDigital: false,
      complianceStatus: 'EM_ANALISE',
      exportId: 'exp-0003',
      dueNumber: '24BR0009876543',
      aiGenerated: true,
      aiConfidenceScore: 0.88,
      aiRiskScore: 0.35,
      aiRiskLevel: 'MEDIUM',
      createdBy: 'operador@demo.com'
    }
  ];

  listar(status?: string): Observable<CertificacaoApi[]> {
    const list = status ? this.items.filter(c => c.status === status) : this.items;
    return of([...list]).pipe(delay(300));
  }

  criar(payload: SalvarCertificacao): Observable<CertificacaoApi> {
    const created: CertificacaoApi = {
      ...payload,
      id: 'cert-' + Date.now(),
      createdBy: 'operador@demo.com'
    };
    this.items.push(created);
    return of(created).pipe(delay(300));
  }

  atualizar(id: string, payload: SalvarCertificacao): Observable<CertificacaoApi> {
    const updated: CertificacaoApi = { ...payload, id };
    const idx = this.items.findIndex(c => c.id === id);
    if (idx >= 0) {
      updated.createdBy = this.items[idx].createdBy;
      this.items[idx] = updated;
    } else {
      this.items.push(updated);
    }
    return of(updated).pipe(delay(300));
  }

  excluir(id: string): Observable<void> {
    this.items = this.items.filter(c => c.id !== id);
    return of(void 0).pipe(delay(300));
  }

  verificarCompliance(_input: string): Observable<string> {
    return of('Análise de compliance simulada (mock).').pipe(delay(300));
  }
}
