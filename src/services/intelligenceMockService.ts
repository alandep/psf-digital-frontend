// MOCK service for EIP Intelligence. Replace method bodies with real API
// calls later; the shapes stay the same. All data here is illustrative.
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  IntelligenceItem,
  FxQuote,
  HomePublicData,
} from '../types/intelligence';

@Injectable({ providedIn: 'root' })
export class IntelligenceMockService {
  private wait = 400;

  private ms<T>(payload: T): Observable<T> {
    return of(payload).pipe(delay(this.wait));
  }

  private minutesAgo(m: number): Date {
    return new Date(Date.now() - m * 60_000);
  }

  private buildFx(): FxQuote[] {
    const now = new Date();
    return [
      {
        pair: 'USD/BRL',
        value: 5.42,
        changePercent: 0.38,
        reference: 'PTAX',
        source: 'Banco Central do Brasil',
        updatedAt: now,
      },
      {
        pair: 'EUR/BRL',
        value: 5.91,
        changePercent: -0.21,
        reference: 'PTAX',
        source: 'Banco Central do Brasil',
        updatedAt: now,
      },
    ];
  }

  // Full feed (~10 items) used by both the feed screen and item lookup.
  private buildFeed(): IntelligenceItem[] {
    const items: IntelligenceItem[] = [
      {
        id: 'INT-001',
        slug: 'congestionamento-porto-santos',
        type: 'ALERT',
        title: 'Congestionamento no Porto de Santos afeta janelas de embarque',
        summary:
          'Aumento na fila de navios eleva o tempo médio de atracação e pode impactar prazos de exportação nas próximas semanas.',
        sourceName: 'Autoridade Portuária de Santos',
        country: 'Brasil',
        sector: 'Logística',
        impactLevel: 'HIGH',
        aiGenerated: true,
        publishedAt: this.minutesAgo(35),
        aiAnalysis:
          'Exportadores com embarques programados para os próximos 15 dias devem revisar janelas e considerar rotas alternativas para reduzir risco de demurrage.',
      },
      {
        id: 'INT-002',
        slug: 'china-carne-bovina',
        type: 'NEWS',
        title: 'China revê protocolos de importação de carne bovina',
        summary:
          'Ajustes nos requisitos sanitários podem alterar o fluxo de habilitação de frigoríficos brasileiros.',
        sourceName: 'Ministério da Agricultura e Pecuária',
        country: 'China',
        sector: 'Agro',
        impactLevel: 'MEDIUM',
        aiGenerated: true,
        publishedAt: this.minutesAgo(90),
        aiAnalysis:
          'A mudança tende a favorecer plantas já habilitadas. Recomenda-se acompanhar a lista oficial de estabelecimentos e antecipar documentação sanitária.',
      },
      {
        id: 'INT-003',
        slug: 'novo-mercado-oriente-medio',
        type: 'OPPORTUNITY',
        title: 'Abertura de novo mercado no Oriente Médio para grãos',
        summary:
          'Acordo comercial amplia cotas de importação e cria oportunidade para exportadores de soja e milho.',
        sourceName: 'ApexBrasil',
        country: 'Emirados Árabes',
        sector: 'Agro',
        impactLevel: 'LOW',
        aiGenerated: false,
        publishedAt: this.minutesAgo(150),
      },
      {
        id: 'INT-004',
        slug: 'nova-regra-siscomex-due',
        type: 'REGULATION',
        title: 'Atualização de regras da DU-E no Siscomex',
        summary:
          'Novo leiaute de preenchimento entra em vigor e exige revisão dos processos de despacho aduaneiro.',
        sourceName: 'Receita Federal do Brasil',
        country: 'Brasil',
        sector: 'Compliance',
        impactLevel: 'MEDIUM',
        aiGenerated: false,
        publishedAt: this.minutesAgo(220),
      },
      {
        id: 'INT-005',
        slug: 'usd-brl-ptax',
        type: 'FX',
        title: 'Dólar PTAX recua com fluxo de exportação',
        summary:
          'A taxa de referência PTAX apresentou leve queda no fechamento, influenciada pela entrada de recursos do agronegócio.',
        sourceName: 'Banco Central do Brasil',
        country: 'Brasil',
        sector: 'Financeiro',
        impactLevel: 'INFORMATIONAL',
        aiGenerated: false,
        publishedAt: this.minutesAgo(45),
      },
      {
        id: 'INT-006',
        slug: 'greve-transporte-rodoviario',
        type: 'ALERT',
        title: 'Paralisação parcial no transporte rodoviário de cargas',
        summary:
          'Mobilização em corredores logísticos do Sudeste pode atrasar a chegada de contêineres aos terminais.',
        sourceName: 'Confederação Nacional do Transporte',
        country: 'Brasil',
        sector: 'Logística',
        impactLevel: 'CRITICAL',
        aiGenerated: true,
        publishedAt: this.minutesAgo(20),
        aiAnalysis:
          'Impacto potencialmente alto em janelas de embarque marítimo. Sugere-se comunicação proativa com clientes sobre possíveis atrasos.',
      },
      {
        id: 'INT-007',
        slug: 'ue-cbam-relatorio',
        type: 'REGULATION',
        title: 'União Europeia detalha próxima fase do CBAM',
        summary:
          'Novas orientações de relato de emissões afetam exportadores de setores intensivos em carbono.',
        sourceName: 'Comissão Europeia',
        country: 'União Europeia',
        sector: 'Compliance',
        impactLevel: 'HIGH',
        aiGenerated: true,
        publishedAt: this.minutesAgo(300),
        aiAnalysis:
          'Empresas de aço, alumínio e fertilizantes devem estruturar coleta de dados de emissões desde já para evitar custos adicionais.',
      },
      {
        id: 'INT-008',
        slug: 'eur-brl-ptax',
        type: 'FX',
        title: 'Euro estável frente ao real no fechamento PTAX',
        summary:
          'A cotação de referência do euro manteve-se estável, refletindo baixa volatilidade nos mercados europeus.',
        sourceName: 'Banco Central do Brasil',
        country: 'Brasil',
        sector: 'Financeiro',
        impactLevel: 'INFORMATIONAL',
        aiGenerated: false,
        publishedAt: this.minutesAgo(48),
      },
      {
        id: 'INT-009',
        slug: 'india-demanda-acucar',
        type: 'OPPORTUNITY',
        title: 'Índia amplia demanda por açúcar importado',
        summary:
          'Queda na produção interna abre espaço para fornecedores brasileiros no segundo semestre.',
        sourceName: 'ApexBrasil',
        country: 'Índia',
        sector: 'Agro',
        impactLevel: 'MEDIUM',
        aiGenerated: true,
        publishedAt: this.minutesAgo(360),
        aiAnalysis:
          'Janela favorável para negociação de contratos de médio prazo. Recomenda-se avaliar hedge cambial dado o horizonte de embarque.',
      },
      {
        id: 'INT-010',
        slug: 'mercosul-acordo-tarifario',
        type: 'NEWS',
        title: 'Mercosul avança em revisão de tarifa externa comum',
        summary:
          'Discussões sobre alíquotas podem reduzir custos de insumos importados para a indústria exportadora.',
        sourceName: 'Ministério do Desenvolvimento, Indústria e Comércio',
        country: 'Brasil',
        sector: 'Indústria',
        impactLevel: 'LOW',
        aiGenerated: false,
        publishedAt: this.minutesAgo(420),
      },
    ];
    // Newest first.
    return items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  getHomeData(): Observable<HomePublicData> {
    const feed = this.buildFeed();
    const teaser = feed
      .filter((i) => i.type === 'ALERT' || i.type === 'NEWS' || i.type === 'OPPORTUNITY' || i.type === 'REGULATION')
      .slice(0, 6);
    const data: HomePublicData = {
      fx: this.buildFx(),
      items: teaser,
      sponsored: {
        advertiser: 'MSC',
        headline: 'Soluções marítimas para sua exportação',
        description: 'Cobertura global e confiabilidade para seus embarques.',
        ctaLabel: 'Conhecer',
      },
      systemStatus: { ok: true, label: 'Todos os sistemas operacionais' },
    };
    return this.ms(data);
  }

  getIntelligenceFeed(): Observable<IntelligenceItem[]> {
    return this.ms(this.buildFeed());
  }

  getIntelligenceItem(slug: string): Observable<IntelligenceItem | null> {
    const found = this.buildFeed().find((i) => i.slug === slug) ?? null;
    return this.ms(found);
  }
}
