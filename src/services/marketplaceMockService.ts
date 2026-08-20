import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  MarketplaceConnector,
  MarketplaceCategory,
  MarketplaceStatus,
  MarketplaceMetrics,
  MarketplaceFilters,
  MarketplaceReview
} from '../types/marketplace';

@Injectable({ providedIn: 'root' })
export class MarketplaceMockService {

  private connectors: MarketplaceConnector[] = this.generateConnectors();

  getConnectors(filters?: MarketplaceFilters): Observable<MarketplaceConnector[]> {
    let result = [...this.connectors];
    if (filters) {
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        result = result.filter(c =>
          c.name.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s) ||
          c.developer.toLowerCase().includes(s)
        );
      }
      if (filters.categories.length > 0) result = result.filter(c => filters.categories.includes(c.category));
      if (filters.status) result = result.filter(c => c.status === filters.status);
      switch (filters.sortBy) {
        case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'rating': result.sort((a, b) => b.rating - a.rating); break;
        case 'category': result.sort((a, b) => a.category.localeCompare(b.category)); break;
        case 'recent': result.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()); break;
      }
    }
    return of(result).pipe(delay(400));
  }

  getConnectorById(id: string): Observable<MarketplaceConnector | null> {
    return of(this.connectors.find(c => c.id === id) || null).pipe(delay(200));
  }

  getFeatured(): Observable<MarketplaceConnector[]> {
    return of(this.connectors.filter(c => c.isFeatured).slice(0, 3)).pipe(delay(200));
  }

  getMetrics(): Observable<MarketplaceMetrics> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const metrics: MarketplaceMetrics = {
      conectoresAtivos: this.connectors.filter(c => c.status === 'ACTIVE').length,
      disponiveis: this.connectors.filter(c => c.status === 'AVAILABLE').length,
      categorias: new Set(this.connectors.map(c => c.category)).size,
      adicionadosRecentemente: this.connectors.filter(c => c.addedAt >= thirtyDaysAgo).length,
    };
    return of(metrics).pipe(delay(200));
  }

  activateConnector(id: string): Observable<MarketplaceConnector> {
    const c = this.connectors.find(x => x.id === id);
    if (c) c.status = 'ACTIVE';
    return of(c!).pipe(delay(500));
  }

  deactivateConnector(id: string): Observable<MarketplaceConnector> {
    const c = this.connectors.find(x => x.id === id);
    if (c) c.status = 'AVAILABLE';
    return of(c!).pipe(delay(500));
  }

  getCategories(): { value: MarketplaceCategory; label: string }[] {
    return [
      { value: 'ERP', label: 'ERP' },
      { value: 'LOGISTICS', label: 'Logística' },
      { value: 'FINANCE', label: 'Financeiro' },
      { value: 'COMPLIANCE', label: 'Compliance' },
      { value: 'ANALYTICS', label: 'Analytics' },
      { value: 'COMMUNICATION', label: 'Comunicação' },
    ];
  }

  private generateConnectors(): MarketplaceConnector[] {
    const items: Omit<MarketplaceConnector, 'id' | 'reviews'>[] = [
      { name: 'SAP Business One', category: 'ERP', description: 'Integração completa com SAP B1 para gestão empresarial', longDescription: 'Conector enterprise para sincronização bidirecional com SAP Business One. Suporta pedidos, estoque, financeiro e documentos fiscais.', icon: 'business', status: 'ACTIVE', rating: 4.8, reviewCount: 124, features: ['Sincronização em tempo real', 'Mapeamento de campos customizável', 'Histórico de transações', 'Alertas de falha'], pricing: 'R$ 2.500/mês', requirements: ['SAP B1 versão 10+', 'API Key válida', 'Conexão VPN configurada'], version: '3.2.1', developer: 'SAP Partner Brasil', lastUpdated: new Date(2025, 0, 15), addedAt: new Date(2024, 6, 1), installCount: 89, isFeatured: true },
      { name: 'Siscomex Connect', category: 'COMPLIANCE', description: 'Integração direta com portal Siscomex para DU-E e RE', longDescription: 'Automatize registros de exportação e declarações únicas diretamente pelo sistema. Validação prévia e acompanhamento de status.', icon: 'verified_user', status: 'ACTIVE', rating: 4.6, reviewCount: 98, features: ['Registro automático DU-E', 'Consulta status RE', 'Validação prévia NCM', 'Certificados digitais'], pricing: 'R$ 1.800/mês', requirements: ['Certificado Digital e-CNPJ', 'Habilitação RADAR', 'Procuração eletrônica'], version: '2.8.0', developer: 'GovTech Solutions', lastUpdated: new Date(2025, 0, 20), addedAt: new Date(2024, 3, 15), installCount: 156, isFeatured: true },
      { name: 'Maersk Track & Trace', category: 'LOGISTICS', description: 'Rastreamento em tempo real de containers Maersk', longDescription: 'Acompanhe seus embarques com a maior empresa de logística marítima do mundo. Alertas automáticos de ETA e mudanças de rota.', icon: 'directions_boat', status: 'ACTIVE', rating: 4.5, reviewCount: 76, features: ['Tracking GPS em tempo real', 'Alertas ETA', 'Documentação digital', 'API webhooks'], pricing: 'R$ 900/mês', requirements: ['Conta Maersk ativa', 'Contratos de frete vigentes'], version: '4.1.0', developer: 'Maersk Digital', lastUpdated: new Date(2025, 1, 1), addedAt: new Date(2024, 8, 10), installCount: 67, isFeatured: true },
      { name: 'BACEN Exchange', category: 'FINANCE', description: 'Cotações e contratos de câmbio via Banco Central', longDescription: 'Acesse cotações oficiais do BACEN em tempo real e gerencie contratos de câmbio para operações de exportação.', icon: 'currency_exchange', status: 'ACTIVE', rating: 4.4, reviewCount: 55, features: ['Cotações PTAX diárias', 'Histórico de taxas', 'Cálculo automático', 'Alertas de variação'], pricing: 'R$ 600/mês', requirements: ['Cadastro no BACEN', 'Banco operador habilitado'], version: '2.3.0', developer: 'FinTech Brasil', lastUpdated: new Date(2025, 0, 28), addedAt: new Date(2024, 5, 20), installCount: 112, isFeatured: false },
      { name: 'Power BI Connector', category: 'ANALYTICS', description: 'Dashboards avançados com Microsoft Power BI', longDescription: 'Conecte seus dados de exportação ao Power BI para criar visualizações avançadas e relatórios executivos personalizados.', icon: 'bar_chart', status: 'AVAILABLE', rating: 4.3, reviewCount: 42, features: ['Datasets automatizados', 'Templates prontos', 'Refresh agendado', 'Row-level security'], pricing: 'R$ 1.200/mês', requirements: ['Licença Power BI Pro', 'Workspace dedicado'], version: '1.9.2', developer: 'Analytics Pro', lastUpdated: new Date(2025, 0, 10), addedAt: new Date(2024, 9, 5), installCount: 34, isFeatured: false },
      { name: 'WhatsApp Business API', category: 'COMMUNICATION', description: 'Notificações e comunicação via WhatsApp Business', longDescription: 'Envie alertas, confirmações e documentos para clientes e parceiros via WhatsApp Business com templates aprovados.', icon: 'chat', status: 'ACTIVE', rating: 4.7, reviewCount: 88, features: ['Templates de mensagem', 'Envio em massa', 'Confirmação de leitura', 'Chatbot integrado'], pricing: 'R$ 800/mês + R$ 0.05/msg', requirements: ['Conta WhatsApp Business verificada', 'Número dedicado'], version: '3.0.1', developer: 'Comm Solutions', lastUpdated: new Date(2025, 1, 5), addedAt: new Date(2024, 4, 12), installCount: 145, isFeatured: false },
      { name: 'TOTVS Protheus', category: 'ERP', description: 'Conector para TOTVS Protheus módulos fiscal e financeiro', longDescription: 'Integre operações de exportação com o ERP TOTVS Protheus. Sincronize notas fiscais, financeiro e estoque.', icon: 'storage', status: 'AVAILABLE', rating: 4.2, reviewCount: 38, features: ['NF-e integrada', 'Conciliação bancária', 'Estoque multifilial', 'Contabilidade'], pricing: 'R$ 2.000/mês', requirements: ['TOTVS Protheus 12.1.33+', 'Módulo SIGAEXP ativo'], version: '2.1.0', developer: 'TOTVS Partner', lastUpdated: new Date(2024, 11, 20), addedAt: new Date(2024, 7, 1), installCount: 28, isFeatured: false },
      { name: 'MSC Container Track', category: 'LOGISTICS', description: 'Rastreamento de containers MSC Mediterranean Shipping', longDescription: 'Monitore embarques MSC com atualizações em tempo real. Integração com schedule de navios e booking online.', icon: 'local_shipping', status: 'AVAILABLE', rating: 4.1, reviewCount: 31, features: ['Tracking containers', 'Schedule de navios', 'Booking online', 'Documentação BL'], pricing: 'R$ 750/mês', requirements: ['Conta MSC ativa', 'Contrato de frete vigente'], version: '1.8.0', developer: 'MSC Digital', lastUpdated: new Date(2024, 11, 15), addedAt: new Date(2024, 10, 1), installCount: 22, isFeatured: false },
      { name: 'Anvisa Connector', category: 'COMPLIANCE', description: 'Integração com portal ANVISA para produtos regulados', longDescription: 'Gerencie licenças e autorizações de exportação para produtos sujeitos à regulamentação da ANVISA.', icon: 'health_and_safety', status: 'AVAILABLE', rating: 4.0, reviewCount: 19, features: ['Consulta licenças', 'Monitoramento vencimentos', 'Alertas automáticos', 'Documentação digital'], pricing: 'R$ 1.500/mês', requirements: ['Certificado Digital', 'Cadastro ANVISA ativo'], version: '1.5.0', developer: 'HealthTech Brasil', lastUpdated: new Date(2024, 11, 1), addedAt: new Date(2024, 11, 1), installCount: 15, isFeatured: false },
      { name: 'Tableau Analytics', category: 'ANALYTICS', description: 'Visualizações avançadas com Tableau para export data', longDescription: 'Crie dashboards interativos e análises preditivas com seus dados de exportação no Tableau.', icon: 'insights', status: 'MAINTENANCE', rating: 4.4, reviewCount: 45, features: ['Datasource automático', 'Visualizações customizadas', 'Alertas inteligentes', 'Compartilhamento'], pricing: 'R$ 1.500/mês', requirements: ['Licença Tableau Creator', 'Tableau Server/Online'], version: '2.2.0', developer: 'Data Viz Co', lastUpdated: new Date(2024, 10, 20), addedAt: new Date(2024, 6, 15), installCount: 29, isFeatured: false },
      { name: 'Receita Federal API', category: 'COMPLIANCE', description: 'Consultas e validações junto à Receita Federal', longDescription: 'Automatize consultas de CNPJ, situação cadastral e certidões negativas diretamente na Receita Federal.', icon: 'account_balance', status: 'ACTIVE', rating: 4.3, reviewCount: 62, features: ['Consulta CNPJ', 'Certidão Negativa', 'Situação RADAR', 'Histórico fiscal'], pricing: 'R$ 500/mês', requirements: ['Certificado e-CNPJ A1', 'Procuração digital'], version: '2.0.1', developer: 'GovTech Solutions', lastUpdated: new Date(2025, 0, 25), addedAt: new Date(2024, 2, 1), installCount: 178, isFeatured: false },
      { name: 'Slack Notifications', category: 'COMMUNICATION', description: 'Alertas e notificações via canais Slack', longDescription: 'Receba alertas de operações críticas, aprovações e status de embarques diretamente nos canais Slack da equipe.', icon: 'tag', status: 'AVAILABLE', rating: 4.5, reviewCount: 52, features: ['Canais customizados', 'Menções automáticas', 'Botões de ação', 'Threads de discussão'], pricing: 'R$ 400/mês', requirements: ['Workspace Slack', 'Permissão de admin'], version: '2.4.0', developer: 'Comm Solutions', lastUpdated: new Date(2025, 0, 5), addedAt: new Date(2024, 5, 1), installCount: 56, isFeatured: false },
      { name: 'CMA CGM Tracking', category: 'LOGISTICS', description: 'Rastreamento de embarques CMA CGM em tempo real', longDescription: 'Acompanhe containers e navios da CMA CGM com atualizações em tempo real e previsão de chegada.', icon: 'sailing', status: 'COMING_SOON', rating: 0, reviewCount: 0, features: ['Tracking em tempo real', 'Alertas de atraso', 'Documentação digital', 'Booking integrado'], pricing: 'A definir', requirements: ['Conta CMA CGM', 'Contrato de serviço ativo'], version: '0.9.0', developer: 'CMA CGM Digital', lastUpdated: new Date(2025, 1, 1), addedAt: new Date(2025, 1, 1), installCount: 0, isFeatured: false },
      { name: 'Banco do Brasil Câmbio', category: 'FINANCE', description: 'Operações de câmbio e ACC/ACE via Banco do Brasil', longDescription: 'Gerencie operações de câmbio, ACC e ACE diretamente com o Banco do Brasil. Cotações preferenciais para exportadores.', icon: 'payments', status: 'ACTIVE', rating: 4.6, reviewCount: 71, features: ['ACC/ACE automático', 'Cotações preferenciais', 'Liquidação programada', 'Histórico operações'], pricing: 'R$ 700/mês', requirements: ['Conta PJ Banco do Brasil', 'Gerente de câmbio designado'], version: '3.1.0', developer: 'BB Tecnologia', lastUpdated: new Date(2025, 0, 18), addedAt: new Date(2024, 1, 1), installCount: 134, isFeatured: false },
      { name: 'Machine Learning Predictor', category: 'ANALYTICS', description: 'Predições de mercado e demanda com ML', longDescription: 'Modelos de machine learning para predição de demanda, preços de commodities e riscos de operação.', icon: 'psychology', status: 'AVAILABLE', rating: 4.1, reviewCount: 23, features: ['Predição de demanda', 'Análise de sentimento', 'Detecção de anomalias', 'Forecasting'], pricing: 'R$ 3.000/mês', requirements: ['Volume mínimo de dados: 12 meses', 'API de dados de mercado'], version: '1.2.0', developer: 'AI Labs Brasil', lastUpdated: new Date(2025, 0, 30), addedAt: new Date(2024, 11, 15), installCount: 12, isFeatured: false },
      { name: 'DocuSign Integration', category: 'COMMUNICATION', description: 'Assinatura digital de contratos e documentos', longDescription: 'Integre assinatura digital DocuSign para contratos internacionais, procurações e documentos de exportação.', icon: 'draw', status: 'ACTIVE', rating: 4.7, reviewCount: 93, features: ['Assinatura em lote', 'Templates de documento', 'Workflow de aprovação', 'Auditoria completa'], pricing: 'R$ 1.000/mês', requirements: ['Conta DocuSign Business', 'Certificado ICP-Brasil (opcional)'], version: '2.6.0', developer: 'DocSign Brasil', lastUpdated: new Date(2025, 1, 3), addedAt: new Date(2024, 4, 1), installCount: 87, isFeatured: false },
    ];

    return items.map((item, i) => ({
      ...item,
      id: `mkt-${String(i + 1).padStart(3, '0')}`,
      reviews: this.generateReviews(i),
    }));
  }

  private generateReviews(connectorIdx: number): MarketplaceReview[] {
    const users = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa', 'Pedro Lima'];
    const comments = [
      'Excelente integração, funcionou perfeitamente desde o primeiro dia.',
      'Boa solução, mas a configuração inicial poderia ser mais simples.',
      'Atendeu nossas necessidades. Suporte técnico muito bom.',
      'Fácil de usar e confiável. Recomendo para operações de exportação.',
      'Funcionalidade completa. Algumas melhorias na interface seriam bem-vindas.',
    ];
    const numReviews = Math.min(connectorIdx % 4 + 2, 5);
    return Array.from({ length: numReviews }, (_, j) => ({
      id: `rev-${connectorIdx}-${j}`,
      user: users[j % users.length],
      rating: Math.floor(Math.random() * 2) + 4,
      comment: comments[j % comments.length],
      date: new Date(2024, 6 + j, Math.floor(Math.random() * 28) + 1),
    }));
  }
}
