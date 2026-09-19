// MOCK service for CMS Intelligence. In-memory mutable state.
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  CmsIntelligenceItem,
  CmsIntelligenceStats,
  CmsReviewStatus,
  CmsPublicationStatus,
} from '../types/cms-intelligence';

@Injectable({ providedIn: 'root' })
export class CmsIntelligenceMockService {
  private wait = 400;

  private items: CmsIntelligenceItem[] = [
    {
      id: 'CMS-001',
      title: 'Câmbio USD/BRL sobe 1,2% após decisão do Copom',
      type: 'Câmbio',
      source: 'Banco Central do Brasil',
      summary: 'O dólar fechou em alta frente ao real após a reunião do Copom.',
      impactLevel: 'MEDIUM',
      sectors: 'Agronegócio, Indústria',
      countries: 'Brasil',
      aiAnalysis: 'Exportadores tendem a se beneficiar no curto prazo; monitorar volatilidade.',
      aiGenerated: true,
      reviewStatus: 'REVIEW_REQUIRED',
      publicationStatus: 'NONE',
      updatedAt: new Date(new Date().setHours(new Date().getHours() - 2)),
    },
    {
      id: 'CMS-002',
      title: 'Nova regulação de exportação de proteína animal (MAPA)',
      type: 'Regulação',
      source: 'MAPA',
      summary: 'MAPA publica requisitos sanitários atualizados para exportação.',
      impactLevel: 'HIGH',
      sectors: 'Agronegócio',
      countries: 'Brasil, União Europeia',
      aiAnalysis: 'Exigências adicionais de certificação podem impactar prazos de embarque.',
      aiGenerated: true,
      reviewStatus: 'REVIEW_REQUIRED',
      publicationStatus: 'NONE',
      updatedAt: new Date(new Date().setHours(new Date().getHours() - 5)),
    },
  ];

  private moreItems: CmsIntelligenceItem[] = [
    {
      id: 'CMS-003',
      title: 'Oportunidade: demanda por soja cresce na Ásia',
      type: 'Oportunidade',
      source: 'EIP Intelligence',
      summary: 'Importadores asiáticos ampliam pedidos de soja brasileira.',
      impactLevel: 'LOW',
      sectors: 'Agronegócio',
      countries: 'China, Brasil',
      aiAnalysis: 'Janela favorável para novos contratos de exportação no Q3.',
      aiGenerated: true,
      reviewStatus: 'APPROVED',
      publicationStatus: 'PUBLISHED',
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
    {
      id: 'CMS-004',
      title: 'Alerta: congestionamento no Porto de Santos',
      type: 'Alerta',
      source: 'ANTAQ',
      summary: 'Operações portuárias registram atrasos por alta demanda.',
      impactLevel: 'CRITICAL',
      sectors: 'Logística',
      countries: 'Brasil',
      aiAnalysis: 'Recomenda-se antecipar janelas de embarque e revisar prazos logísticos.',
      aiGenerated: false,
      reviewStatus: 'APPROVED',
      publicationStatus: 'PUBLISHED',
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
    {
      id: 'CMS-005',
      title: 'Notícia: acordo comercial Mercosul avança',
      type: 'Notícia',
      source: 'WTO',
      summary: 'Negociações do acordo comercial registram progresso.',
      impactLevel: 'INFORMATIONAL',
      sectors: 'Comércio Exterior',
      countries: 'Brasil, União Europeia',
      aiAnalysis: 'Potencial redução tarifária de médio prazo para exportadores.',
      aiGenerated: true,
      reviewStatus: 'DRAFT',
      publicationStatus: 'NONE',
      updatedAt: new Date(new Date().setHours(new Date().getHours() - 8)),
    },
    {
      id: 'CMS-006',
      title: 'Câmbio EUR/BRL estável na semana',
      type: 'Câmbio',
      source: 'Banco Central do Brasil',
      summary: 'Euro mantém estabilidade frente ao real.',
      impactLevel: 'LOW',
      sectors: 'Indústria',
      countries: 'Brasil, União Europeia',
      aiAnalysis: 'Baixa volatilidade favorece planejamento de contratos em euro.',
      aiGenerated: true,
      reviewStatus: 'APPROVED',
      publicationStatus: 'SCHEDULED',
      updatedAt: new Date(new Date().setHours(new Date().getHours() - 12)),
    },
    {
      id: 'CMS-007',
      title: 'Regulação: novas regras de rotulagem IMO',
      type: 'Regulação',
      source: 'IMO',
      summary: 'Organização Marítima Internacional atualiza normas de rotulagem.',
      impactLevel: 'MEDIUM',
      sectors: 'Logística, Química',
      countries: 'Internacional',
      aiAnalysis: 'Ajustes de conformidade necessários para cargas perigosas.',
      aiGenerated: false,
      reviewStatus: 'REJECTED',
      publicationStatus: 'NONE',
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
    {
      id: 'CMS-008',
      title: 'Oportunidade: incentivo à exportação de café especial',
      type: 'Oportunidade',
      source: 'EIP Intelligence',
      summary: 'Novos programas de incentivo para café especial brasileiro.',
      impactLevel: 'MEDIUM',
      sectors: 'Agronegócio',
      countries: 'Brasil, Estados Unidos',
      aiAnalysis: 'Margem potencial elevada para exportadores de nicho premium.',
      aiGenerated: true,
      reviewStatus: 'APPROVED',
      publicationStatus: 'ARCHIVED',
      updatedAt: new Date(new Date().setDate(new Date().getDate() - 6)),
    },
  ];

  constructor() {
    this.items = [...this.items, ...this.moreItems];
  }

  private ms<T>(payload: T): Observable<T> {
    return of(payload).pipe(delay(this.wait));
  }

  getStats(): Observable<CmsIntelligenceStats> {
    return this.ms({ collected: 12, grouped: 8, analyzed: 5, published: 3, pendingReview: 2 });
  }

  getItems(): Observable<CmsIntelligenceItem[]> {
    return this.ms([...this.items]);
  }

  private setReview(id: string, reviewStatus: CmsReviewStatus): Observable<CmsIntelligenceItem[]> {
    this.items = this.items.map((i) =>
      i.id === id ? { ...i, reviewStatus, updatedAt: new Date() } : i
    );
    return this.ms([...this.items]);
  }

  private setPublication(id: string, publicationStatus: CmsPublicationStatus): Observable<CmsIntelligenceItem[]> {
    this.items = this.items.map((i) =>
      i.id === id ? { ...i, publicationStatus, updatedAt: new Date() } : i
    );
    return this.ms([...this.items]);
  }

  approve(id: string): Observable<CmsIntelligenceItem[]> {
    return this.setReview(id, 'APPROVED');
  }

  reject(id: string): Observable<CmsIntelligenceItem[]> {
    return this.setReview(id, 'REJECTED');
  }

  publish(id: string): Observable<CmsIntelligenceItem[]> {
    return this.setPublication(id, 'PUBLISHED');
  }

  schedule(id: string): Observable<CmsIntelligenceItem[]> {
    return this.setPublication(id, 'SCHEDULED');
  }

  archive(id: string): Observable<CmsIntelligenceItem[]> {
    return this.setPublication(id, 'ARCHIVED');
  }
}
