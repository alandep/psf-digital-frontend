import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeModule,
  KnowledgeDifficulty,
  KnowledgeCenterMetrics,
  KnowledgeCenterFilters
} from '../types/knowledge-center';

@Injectable({ providedIn: 'root' })
export class KnowledgeCenterMockService {

  private articles: KnowledgeArticle[] = this.generateArticles();

  getArticles(filters?: KnowledgeCenterFilters): Observable<KnowledgeArticle[]> {
    let result = [...this.articles].filter(a => a.isPublished);
    if (filters) {
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        result = result.filter(a =>
          a.title.toLowerCase().includes(s) ||
          a.summary.toLowerCase().includes(s) ||
          a.tags.some(t => t.toLowerCase().includes(s))
        );
      }
      if (filters.category) result = result.filter(a => a.category === filters.category);
      if (filters.modules && filters.modules.length > 0) result = result.filter(a => filters.modules.includes(a.module));
      if (filters.difficulty) result = result.filter(a => a.difficulty === filters.difficulty);
    }
    return of(result).pipe(delay(300));
  }

  getArticleById(id: string): Observable<KnowledgeArticle | null> {
    const article = this.articles.find(a => a.id === id);
    if (article) article.viewCount++;
    return of(article || null).pipe(delay(200));
  }

  getMetrics(): Observable<KnowledgeCenterMetrics> {
    const published = this.articles.filter(a => a.isPublished);
    const metrics: KnowledgeCenterMetrics = {
      totalArtigos: published.length,
      faqs: published.filter(a => a.category === 'FAQ').length,
      tutoriaisVideo: published.filter(a => a.category === 'VIDEO_TUTORIAL').length,
      ratingMedio: Math.round((published.reduce((sum, a) => sum + a.rating, 0) / published.length) * 10) / 10,
    };
    return of(metrics).pipe(delay(200));
  }

  getMostViewed(limit: number = 10): Observable<KnowledgeArticle[]> {
    const result = [...this.articles]
      .filter(a => a.isPublished)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
    return of(result).pipe(delay(200));
  }

  getRecentlyUpdated(days: number = 30): Observable<KnowledgeArticle[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = [...this.articles]
      .filter(a => a.isPublished && a.updatedAt >= cutoff)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return of(result).pipe(delay(200));
  }

  rateArticle(id: string, positive: boolean): Observable<{ success: boolean }> {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      article.ratingCount++;
      if (positive) {
        article.rating = Math.min(5, article.rating + 0.1);
      } else {
        article.rating = Math.max(1, article.rating - 0.1);
      }
      article.rating = Math.round(article.rating * 10) / 10;
    }
    return of({ success: true }).pipe(delay(200));
  }

  getCategories(): { value: KnowledgeCategory; label: string; icon: string }[] {
    return [
      { value: 'DOCUMENTATION', label: 'Documentação', icon: 'description' },
      { value: 'FAQ', label: 'FAQ', icon: 'help' },
      { value: 'VIDEO_TUTORIAL', label: 'Vídeo Tutorial', icon: 'play_circle' },
      { value: 'BEST_PRACTICES', label: 'Boas Práticas', icon: 'star' },
    ];
  }

  getModules(): { value: KnowledgeModule; label: string }[] {
    return [
      { value: 'EXPORTACOES', label: 'Exportações' },
      { value: 'FINANCEIRO', label: 'Financeiro' },
      { value: 'LOGISTICA', label: 'Logística' },
      { value: 'COMPLIANCE', label: 'Compliance' },
      { value: 'PRODUTOS', label: 'Produtos' },
      { value: 'INTEGRAÇÕES', label: 'Integrações' },
    ];
  }

  private generateArticles(): KnowledgeArticle[] {
    const templates: Omit<KnowledgeArticle, 'id' | 'viewCount' | 'ratingCount' | 'createdAt' | 'updatedAt' | 'isPublished'>[] = [
      { title: 'Como criar uma nova exportação', summary: 'Guia passo a passo para registrar uma nova operação de exportação na plataforma.', content: 'Conteúdo completo sobre criação de exportações...', category: 'DOCUMENTATION', module: 'EXPORTACOES', difficulty: 'BASICO', tags: ['exportação', 'novo pedido', 'início'], author: 'Equipe EIP', rating: 4.8, videoUrl: '', videoDuration: '' },
      { title: 'Perguntas frequentes sobre DU-E', summary: 'Respostas para as dúvidas mais comuns sobre Declaração Única de Exportação.', content: 'FAQ completo sobre DU-E...', category: 'FAQ', module: 'COMPLIANCE', difficulty: 'INTERMEDIARIO', tags: ['DU-E', 'documentos', 'siscomex'], author: 'Compliance Team', rating: 4.5, videoUrl: '', videoDuration: '' },
      { title: 'Tutorial: Configurando integrações Siscomex', summary: 'Vídeo tutorial mostrando como configurar a integração com o Siscomex.', content: 'Assistir ao vídeo para configuração completa.', category: 'VIDEO_TUTORIAL', module: 'INTEGRAÇÕES', difficulty: 'AVANCADO', tags: ['siscomex', 'integração', 'configuração'], author: 'Tech Team', rating: 4.7, videoUrl: 'https://example.com/video1', videoDuration: '12:34' },
      { title: 'Boas práticas para gestão de contratos', summary: 'Recomendações para gerenciar contratos de exportação de forma eficiente.', content: 'Boas práticas detalhadas...', category: 'BEST_PRACTICES', module: 'EXPORTACOES', difficulty: 'INTERMEDIARIO', tags: ['contratos', 'gestão', 'boas práticas'], author: 'Equipe EIP', rating: 4.6, videoUrl: '', videoDuration: '' },
      { title: 'Entendendo câmbio e hedge', summary: 'Guia completo sobre operações de câmbio e estratégias de hedge para exportadores.', content: 'Conteúdo sobre câmbio e hedge...', category: 'DOCUMENTATION', module: 'FINANCEIRO', difficulty: 'AVANCADO', tags: ['câmbio', 'hedge', 'financeiro', 'risco'], author: 'Equipe Financeira', rating: 4.9, videoUrl: '', videoDuration: '' },
      { title: 'FAQ: Classificação NCM', summary: 'Perguntas frequentes sobre classificação fiscal de mercadorias NCM.', content: 'FAQ NCM completo...', category: 'FAQ', module: 'PRODUTOS', difficulty: 'INTERMEDIARIO', tags: ['NCM', 'classificação', 'fiscal'], author: 'Compliance Team', rating: 4.3, videoUrl: '', videoDuration: '' },
      { title: 'Tutorial: Rastreamento de embarques', summary: 'Vídeo mostrando como acompanhar seus embarques em tempo real.', content: 'Assista ao tutorial de rastreamento.', category: 'VIDEO_TUTORIAL', module: 'LOGISTICA', difficulty: 'BASICO', tags: ['embarque', 'rastreamento', 'logística'], author: 'Tech Team', rating: 4.8, videoUrl: 'https://example.com/video2', videoDuration: '08:45' },
      { title: 'Melhores práticas de compliance', summary: 'Como manter sua empresa em conformidade com regulamentações de exportação.', content: 'Práticas de compliance...', category: 'BEST_PRACTICES', module: 'COMPLIANCE', difficulty: 'AVANCADO', tags: ['compliance', 'regulamentação', 'conformidade'], author: 'Compliance Team', rating: 4.4, videoUrl: '', videoDuration: '' },
      { title: 'Guia de Packing List', summary: 'Documentação completa sobre como preencher corretamente um Packing List.', content: 'Guia detalhado de Packing List...', category: 'DOCUMENTATION', module: 'EXPORTACOES', difficulty: 'BASICO', tags: ['packing list', 'documentos', 'embarque'], author: 'Equipe EIP', rating: 4.7, videoUrl: '', videoDuration: '' },
      { title: 'FAQ: Pagamentos internacionais', summary: 'Dúvidas comuns sobre modalidades de pagamento em exportações.', content: 'FAQ pagamentos...', category: 'FAQ', module: 'FINANCEIRO', difficulty: 'INTERMEDIARIO', tags: ['pagamentos', 'letter of credit', 'financeiro'], author: 'Equipe Financeira', rating: 4.5, videoUrl: '', videoDuration: '' },
      { title: 'Tutorial: Dashboard personalizado', summary: 'Aprenda a criar dashboards personalizados para sua operação.', content: 'Tutorial de criação de dashboards.', category: 'VIDEO_TUTORIAL', module: 'EXPORTACOES', difficulty: 'INTERMEDIARIO', tags: ['dashboard', 'personalização', 'relatórios'], author: 'Tech Team', rating: 4.6, videoUrl: 'https://example.com/video3', videoDuration: '15:20' },
      { title: 'Otimizando custos logísticos', summary: 'Estratégias para reduzir custos de frete e logística nas exportações.', content: 'Estratégias de otimização logística...', category: 'BEST_PRACTICES', module: 'LOGISTICA', difficulty: 'AVANCADO', tags: ['logística', 'custos', 'otimização', 'frete'], author: 'Equipe Logística', rating: 4.8, videoUrl: '', videoDuration: '' },
      { title: 'Certificações de produto para exportação', summary: 'Tudo sobre certificações necessárias para exportar diferentes produtos.', content: 'Guia de certificações...', category: 'DOCUMENTATION', module: 'PRODUTOS', difficulty: 'INTERMEDIARIO', tags: ['certificações', 'produtos', 'qualidade'], author: 'Quality Team', rating: 4.4, videoUrl: '', videoDuration: '' },
      { title: 'FAQ: Containers e tipos', summary: 'Perguntas frequentes sobre tipos de containers e quando usar cada um.', content: 'FAQ containers...', category: 'FAQ', module: 'LOGISTICA', difficulty: 'BASICO', tags: ['containers', 'tipos', 'logística'], author: 'Equipe Logística', rating: 4.2, videoUrl: '', videoDuration: '' },
      { title: 'Tutorial: Módulo financeiro', summary: 'Vídeo tutorial sobre todas as funcionalidades do módulo financeiro.', content: 'Tutorial do módulo financeiro.', category: 'VIDEO_TUTORIAL', module: 'FINANCEIRO', difficulty: 'BASICO', tags: ['financeiro', 'tutorial', 'módulo'], author: 'Tech Team', rating: 4.5, videoUrl: 'https://example.com/video4', videoDuration: '20:15' },
      { title: 'Segurança em operações de exportação', summary: 'Boas práticas de segurança para proteger suas operações comerciais.', content: 'Práticas de segurança...', category: 'BEST_PRACTICES', module: 'COMPLIANCE', difficulty: 'AVANCADO', tags: ['segurança', 'proteção', 'dados'], author: 'Security Team', rating: 4.6, videoUrl: '', videoDuration: '' },
      { title: 'Gestão de portos e terminais', summary: 'Guia sobre gerenciamento de operações portuárias na plataforma.', content: 'Documentação de portos e terminais...', category: 'DOCUMENTATION', module: 'LOGISTICA', difficulty: 'INTERMEDIARIO', tags: ['portos', 'terminais', 'operação portuária'], author: 'Equipe Logística', rating: 4.3, videoUrl: '', videoDuration: '' },
      { title: 'FAQ: Automação de processos', summary: 'Perguntas sobre as regras de automação disponíveis na plataforma.', content: 'FAQ automação...', category: 'FAQ', module: 'INTEGRAÇÕES', difficulty: 'INTERMEDIARIO', tags: ['automação', 'regras', 'processos'], author: 'Tech Team', rating: 4.1, videoUrl: '', videoDuration: '' },
      { title: 'Tutorial: Relatórios avançados', summary: 'Como gerar relatórios avançados com filtros e exportação de dados.', content: 'Tutorial relatórios avançados.', category: 'VIDEO_TUTORIAL', module: 'EXPORTACOES', difficulty: 'AVANCADO', tags: ['relatórios', 'análise', 'exportação dados'], author: 'Tech Team', rating: 4.7, videoUrl: 'https://example.com/video5', videoDuration: '18:30' },
      { title: 'Planejamento tributário para exportações', summary: 'Orientações sobre planejamento tributário e benefícios fiscais.', content: 'Planejamento tributário...', category: 'BEST_PRACTICES', module: 'FINANCEIRO', difficulty: 'AVANCADO', tags: ['tributário', 'fiscal', 'benefícios', 'impostos'], author: 'Equipe Financeira', rating: 4.9, videoUrl: '', videoDuration: '' },
      { title: 'Configuração inicial da plataforma', summary: 'Guia de configuração inicial para novos usuários da plataforma EIP.', content: 'Configuração inicial detalhada...', category: 'DOCUMENTATION', module: 'INTEGRAÇÕES', difficulty: 'BASICO', tags: ['configuração', 'início', 'primeiro acesso'], author: 'Tech Team', rating: 4.6, videoUrl: '', videoDuration: '' },
      { title: 'FAQ: ESG e sustentabilidade', summary: 'Dúvidas sobre indicadores ESG e relatórios de sustentabilidade.', content: 'FAQ ESG...', category: 'FAQ', module: 'COMPLIANCE', difficulty: 'INTERMEDIARIO', tags: ['ESG', 'sustentabilidade', 'indicadores'], author: 'ESG Team', rating: 4.0, videoUrl: '', videoDuration: '' },
    ];

    const now = new Date();
    return templates.map((t, i) => ({
      ...t,
      id: `art-${String(i + 1).padStart(3, '0')}`,
      viewCount: Math.floor(Math.random() * 500) + 50,
      ratingCount: Math.floor(Math.random() * 80) + 10,
      createdAt: new Date(now.getTime() - (i * 5 + Math.random() * 30) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - (i * 2 + Math.random() * 15) * 24 * 60 * 60 * 1000),
      isPublished: true,
    }));
  }
}
