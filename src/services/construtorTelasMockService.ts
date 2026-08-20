import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  CustomScreen, ScreenTemplate, WidgetCatalogItem, ScreenWidget,
  WidgetType, LayoutType, ScreenStatus, ScreenMetrics
} from '../types/construtor-telas';

@Injectable({ providedIn: 'root' })
export class ConstrutorTelasMockService {

  private screens: CustomScreen[] = this.generateScreens();
  private templates: ScreenTemplate[] = this.generateTemplates();

  getScreens(): Observable<CustomScreen[]> {
    return of([...this.screens]).pipe(delay(400));
  }

  getScreenById(id: string): Observable<CustomScreen | null> {
    return of(this.screens.find(s => s.id === id) || null).pipe(delay(200));
  }

  getTemplates(): Observable<ScreenTemplate[]> {
    return of([...this.templates]).pipe(delay(300));
  }

  getWidgetCatalog(): WidgetCatalogItem[] {
    return [
      { type: 'KPI_CARD', name: 'KPI Card', description: 'Indicador numérico com tendência', icon: 'speed' },
      { type: 'CHART', name: 'Gráfico', description: 'Gráfico de barras, linha ou pizza', icon: 'bar_chart' },
      { type: 'TABLE', name: 'Tabela', description: 'Tabela de dados com ordenação', icon: 'table_chart' },
      { type: 'MAP', name: 'Mapa', description: 'Mapa geográfico com marcadores', icon: 'map' },
      { type: 'TIMELINE', name: 'Timeline', description: 'Linha do tempo de eventos', icon: 'timeline' },
    ];
  }

  getMetrics(): Observable<ScreenMetrics> {
    const metrics: ScreenMetrics = {
      totalTelas: this.screens.length,
      publicadas: this.screens.filter(s => s.status === 'PUBLICADA').length,
      rascunhos: this.screens.filter(s => s.status === 'RASCUNHO').length,
      templatesDisponiveis: this.templates.length,
    };
    return of(metrics).pipe(delay(200));
  }

  createScreen(data: Partial<CustomScreen>): Observable<CustomScreen> {
    const newScreen: CustomScreen = {
      id: `screen-${Date.now()}`,
      name: data.name || 'Nova Tela',
      description: data.description || '',
      layout: data.layout || '2_COLUMNS',
      widgets: data.widgets || [],
      status: 'RASCUNHO',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin@empresa.com',
    };
    this.screens.unshift(newScreen);
    return of(newScreen).pipe(delay(500));
  }

  duplicateScreen(id: string): Observable<CustomScreen | null> {
    const original = this.screens.find(s => s.id === id);
    if (!original) return of(null).pipe(delay(200));
    const copy: CustomScreen = {
      ...original,
      id: `screen-${Date.now()}`,
      name: `${original.name} (Cópia)`,
      status: 'RASCUNHO',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.screens.unshift(copy);
    return of(copy).pipe(delay(400));
  }

  deleteScreen(id: string): Observable<boolean> {
    const idx = this.screens.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.screens.splice(idx, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(200));
  }

  createFromTemplate(templateId: string): Observable<CustomScreen | null> {
    const tpl = this.templates.find(t => t.id === templateId);
    if (!tpl) return of(null).pipe(delay(200));
    const widgets: ScreenWidget[] = tpl.previewWidgets.map((type, i) => ({
      id: `widget-${Date.now()}-${i}`,
      type,
      title: `Widget ${i + 1}`,
      config: {},
      position: i,
    }));
    const newScreen: CustomScreen = {
      id: `screen-${Date.now()}`,
      name: `${tpl.name} (Personalizado)`,
      description: `Baseado no template: ${tpl.name}`,
      layout: tpl.layout,
      widgets,
      status: 'RASCUNHO',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin@empresa.com',
    };
    this.screens.unshift(newScreen);
    return of(newScreen).pipe(delay(500));
  }

  getLayouts(): { value: LayoutType; label: string }[] {
    return [
      { value: '1_COLUMN', label: '1 Coluna' },
      { value: '2_COLUMNS', label: '2 Colunas' },
      { value: '3_COLUMNS', label: '3 Colunas' },
    ];
  }

  private generateScreens(): CustomScreen[] {
    const names = [
      'Dashboard Vendas', 'Painel Logística', 'Controle Financeiro',
      'Monitoramento Compliance', 'Visão Geral Exportações', 'KPIs Operacionais'
    ];
    const layouts: LayoutType[] = ['1_COLUMN', '2_COLUMNS', '3_COLUMNS', '2_COLUMNS', '3_COLUMNS', '2_COLUMNS'];
    const statuses: ScreenStatus[] = ['PUBLICADA', 'PUBLICADA', 'RASCUNHO', 'PUBLICADA', 'RASCUNHO', 'PUBLICADA'];
    const widgetTypes: WidgetType[] = ['KPI_CARD', 'CHART', 'TABLE', 'MAP', 'TIMELINE'];

    return names.map((name, i) => {
      const widgetCount = Math.floor(Math.random() * 4) + 2;
      const widgets: ScreenWidget[] = Array.from({ length: widgetCount }, (_, j) => ({
        id: `widget-${i}-${j}`,
        type: widgetTypes[(i + j) % widgetTypes.length],
        title: `Widget ${j + 1}`,
        config: {},
        position: j,
      }));
      return {
        id: `screen-${String(i + 1).padStart(3, '0')}`,
        name,
        description: `Tela personalizada: ${name}`,
        layout: layouts[i],
        widgets,
        status: statuses[i],
        createdAt: new Date(2025, Math.floor(i / 2), (i * 5) + 1),
        updatedAt: new Date(2025, Math.floor(i / 2), (i * 5) + 3),
        createdBy: 'admin@empresa.com',
      } as CustomScreen;
    });
  }

  private generateTemplates(): ScreenTemplate[] {
    return [
      { id: 'tpl-001', name: 'Dashboard Logístico', description: 'Visão completa de embarques, containers e rotas', category: 'Logística', icon: 'local_shipping', layout: '3_COLUMNS', widgetCount: 6, previewWidgets: ['KPI_CARD', 'CHART', 'TABLE', 'MAP', 'KPI_CARD', 'TIMELINE'], popularity: 95 },
      { id: 'tpl-002', name: 'Painel Financeiro', description: 'Câmbio, receitas, despesas e projeções', category: 'Financeiro', icon: 'account_balance', layout: '2_COLUMNS', widgetCount: 5, previewWidgets: ['KPI_CARD', 'CHART', 'KPI_CARD', 'CHART', 'TABLE'], popularity: 92 },
      { id: 'tpl-003', name: 'Controle de Exportações', description: 'Pipeline de exportações e status em tempo real', category: 'Exportações', icon: 'flight_takeoff', layout: '2_COLUMNS', widgetCount: 4, previewWidgets: ['KPI_CARD', 'TABLE', 'CHART', 'TIMELINE'], popularity: 88 },
      { id: 'tpl-004', name: 'Monitoramento Compliance', description: 'Licenças, regulamentações e alertas', category: 'Compliance', icon: 'gavel', layout: '2_COLUMNS', widgetCount: 5, previewWidgets: ['KPI_CARD', 'KPI_CARD', 'TABLE', 'CHART', 'TIMELINE'], popularity: 85 },
      { id: 'tpl-005', name: 'CRM - Visão Clientes', description: 'Clientes, oportunidades e pipeline comercial', category: 'CRM', icon: 'people', layout: '3_COLUMNS', widgetCount: 6, previewWidgets: ['KPI_CARD', 'CHART', 'TABLE', 'MAP', 'KPI_CARD', 'CHART'], popularity: 82 },
      { id: 'tpl-006', name: 'Gestão de Contratos', description: 'Contratos ativos, vencimentos e valores', category: 'Contratos', icon: 'description', layout: '2_COLUMNS', widgetCount: 4, previewWidgets: ['KPI_CARD', 'TABLE', 'CHART', 'TIMELINE'], popularity: 79 },
      { id: 'tpl-007', name: 'Supply Chain Monitor', description: 'Fornecedores, estoque e rastreabilidade', category: 'Supply Chain', icon: 'inventory', layout: '3_COLUMNS', widgetCount: 5, previewWidgets: ['KPI_CARD', 'MAP', 'TABLE', 'CHART', 'KPI_CARD'], popularity: 76 },
      { id: 'tpl-008', name: 'ESG Dashboard', description: 'Indicadores ambientais, sociais e governança', category: 'ESG', icon: 'eco', layout: '2_COLUMNS', widgetCount: 5, previewWidgets: ['KPI_CARD', 'CHART', 'KPI_CARD', 'TABLE', 'CHART'], popularity: 73 },
      { id: 'tpl-009', name: 'Operações AI', description: 'Modelos de IA, predições e automações', category: 'AI', icon: 'smart_toy', layout: '2_COLUMNS', widgetCount: 4, previewWidgets: ['KPI_CARD', 'CHART', 'TABLE', 'KPI_CARD'], popularity: 70 },
    ];
  }
}
