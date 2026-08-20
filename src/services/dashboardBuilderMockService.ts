import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  UserDashboard,
  SharedDashboard,
  DashboardWidget,
  WidgetCatalogItem,
  DashboardMetrics,
  DashboardLayout
} from '../types/dashboard-builder';

@Injectable({ providedIn: 'root' })
export class DashboardBuilderMockService {

  private userDashboards: UserDashboard[] = [
    {
      id: 'DB-001', name: 'Visão Geral Exportações', description: 'KPIs principais de exportação com acompanhamento em tempo real',
      layout: '3-COLUMN', ownerId: 'USR-001', ownerName: 'Carlos Silva', createdAt: new Date('2024-11-01'), updatedAt: new Date('2025-01-15'), shared: true,
      widgets: [
        { id: 'W-001', type: 'KPI_CARD', title: 'Exportações Ativas', module: 'EXPORTS', value: '47', icon: 'flight_takeoff', color: '#1976d2' },
        { id: 'W-002', type: 'LINE_CHART', title: 'Tendência Mensal', module: 'EXPORTS', value: 'chart', icon: 'show_chart', color: '#4caf50' },
        { id: 'W-003', type: 'PIE_CHART', title: 'Por Destino', module: 'EXPORTS', value: 'chart', icon: 'pie_chart', color: '#ff9800' },
        { id: 'W-004', type: 'KPI_CARD', title: 'Revenue USD', module: 'FINANCIAL', value: '$12.4M', icon: 'attach_money', color: '#4caf50' },
        { id: 'W-005', type: 'STATUS_INDICATOR', title: 'Compliance Status', module: 'COMPLIANCE', value: 'OK', icon: 'verified', color: '#2e7d32' }
      ]
    },
    {
      id: 'DB-002', name: 'Financeiro Detalhado', description: 'Análise financeira com câmbio e pagamentos',
      layout: '2-COLUMN', ownerId: 'USR-001', ownerName: 'Carlos Silva', createdAt: new Date('2024-12-01'), updatedAt: new Date('2025-01-20'), shared: false,
      widgets: [
        { id: 'W-006', type: 'KPI_CARD', title: 'Contas a Receber', module: 'FINANCIAL', value: 'R$ 8.2M', icon: 'account_balance', color: '#1565c0' },
        { id: 'W-007', type: 'BAR_CHART', title: 'Recebimentos por Mês', module: 'FINANCIAL', value: 'chart', icon: 'bar_chart', color: '#7b1fa2' },
        { id: 'W-008', type: 'LINE_CHART', title: 'Câmbio USD/BRL', module: 'FINANCIAL', value: 'chart', icon: 'currency_exchange', color: '#f57c00' },
        { id: 'W-009', type: 'DATA_TABLE', title: 'Pagamentos Pendentes', module: 'FINANCIAL', value: 'table', icon: 'table_chart', color: '#c62828' }
      ]
    },
    {
      id: 'DB-003', name: 'Logística e Embarques', description: 'Rastreamento e indicadores logísticos',
      layout: '2-COLUMN', ownerId: 'USR-001', ownerName: 'Carlos Silva', createdAt: new Date('2025-01-05'), updatedAt: new Date('2025-01-25'), shared: true,
      widgets: [
        { id: 'W-010', type: 'KPI_CARD', title: 'Embarques Ativos', module: 'LOGISTICS', value: '12', icon: 'local_shipping', color: '#0277bd' },
        { id: 'W-011', type: 'STATUS_INDICATOR', title: 'On-Time Delivery', module: 'LOGISTICS', value: '94%', icon: 'schedule', color: '#2e7d32' },
        { id: 'W-012', type: 'BAR_CHART', title: 'Volume por Porto', module: 'LOGISTICS', value: 'chart', icon: 'anchor', color: '#4527a0' }
      ]
    },
    {
      id: 'DB-004', name: 'ESG Monitor', description: 'Métricas de sustentabilidade e impacto ambiental',
      layout: '3-COLUMN', ownerId: 'USR-001', ownerName: 'Carlos Silva', createdAt: new Date('2025-01-10'), updatedAt: new Date('2025-01-22'), shared: false,
      widgets: [
        { id: 'W-013', type: 'KPI_CARD', title: 'ESG Score', module: 'ESG', value: '78/100', icon: 'eco', color: '#2e7d32' },
        { id: 'W-014', type: 'PIE_CHART', title: 'Emissões por Categoria', module: 'ESG', value: 'chart', icon: 'co2', color: '#558b2f' },
        { id: 'W-015', type: 'LINE_CHART', title: 'Carbon Footprint Trend', module: 'ESG', value: 'chart', icon: 'nature', color: '#33691e' }
      ]
    },
    {
      id: 'DB-005', name: 'Compliance Dashboard', description: 'Licenças, regulamentações e alertas de compliance',
      layout: '1-COLUMN', ownerId: 'USR-001', ownerName: 'Carlos Silva', createdAt: new Date('2025-01-12'), updatedAt: new Date('2025-01-28'), shared: true,
      widgets: [
        { id: 'W-016', type: 'KPI_CARD', title: 'Licenças Ativas', module: 'COMPLIANCE', value: '23', icon: 'assignment', color: '#e65100' },
        { id: 'W-017', type: 'STATUS_INDICATOR', title: 'Alertas', module: 'COMPLIANCE', value: '3 pendentes', icon: 'warning', color: '#f44336' },
        { id: 'W-018', type: 'DATA_TABLE', title: 'Próximos Vencimentos', module: 'COMPLIANCE', value: 'table', icon: 'event', color: '#ad1457' }
      ]
    }
  ];

  private sharedDashboards: SharedDashboard[] = [
    { dashboardId: 'DB-101', dashboardName: 'KPIs Diretoria', ownerName: 'Ana Rodrigues', sharedDate: new Date('2025-01-10'), permission: 'VIEW_ONLY', widgets: 8 },
    { dashboardId: 'DB-102', dashboardName: 'Operações Logísticas', ownerName: 'Pedro Santos', sharedDate: new Date('2025-01-12'), permission: 'EDIT', widgets: 6 },
    { dashboardId: 'DB-103', dashboardName: 'Financeiro Consolidado', ownerName: 'Maria Oliveira', sharedDate: new Date('2025-01-08'), permission: 'VIEW_ONLY', widgets: 10 },
    { dashboardId: 'DB-104', dashboardName: 'Compliance Monitor', ownerName: 'Ricardo Lima', sharedDate: new Date('2025-01-15'), permission: 'VIEW_ONLY', widgets: 5 },
    { dashboardId: 'DB-105', dashboardName: 'ESG Reporting', ownerName: 'Fernanda Costa', sharedDate: new Date('2025-01-18'), permission: 'EDIT', widgets: 7 },
    { dashboardId: 'DB-106', dashboardName: 'Supply Chain Overview', ownerName: 'Lucas Almeida', sharedDate: new Date('2025-01-20'), permission: 'VIEW_ONLY', widgets: 9 },
    { dashboardId: 'DB-107', dashboardName: 'Vendas por Região', ownerName: 'Ana Rodrigues', sharedDate: new Date('2025-01-22'), permission: 'EDIT', widgets: 4 },
    { dashboardId: 'DB-108', dashboardName: 'Risk Management', ownerName: 'Pedro Santos', sharedDate: new Date('2025-01-25'), permission: 'VIEW_ONLY', widgets: 6 }
  ];

  private widgetCatalog: WidgetCatalogItem[] = [
    { type: 'KPI_CARD', label: 'Exportações Ativas', description: 'Número total de exportações em andamento', module: 'EXPORTS', icon: 'flight_takeoff' },
    { type: 'LINE_CHART', label: 'Tendência de Exportações', description: 'Gráfico de linha com evolução mensal', module: 'EXPORTS', icon: 'show_chart' },
    { type: 'PIE_CHART', label: 'Exportações por Destino', description: 'Distribuição percentual por país', module: 'EXPORTS', icon: 'pie_chart' },
    { type: 'KPI_CARD', label: 'Revenue Total', description: 'Faturamento total em USD', module: 'FINANCIAL', icon: 'attach_money' },
    { type: 'BAR_CHART', label: 'Recebimentos Mensais', description: 'Gráfico de barras com recebimentos', module: 'FINANCIAL', icon: 'bar_chart' },
    { type: 'LINE_CHART', label: 'Câmbio USD/BRL', description: 'Evolução da taxa de câmbio', module: 'FINANCIAL', icon: 'currency_exchange' },
    { type: 'KPI_CARD', label: 'Embarques Ativos', description: 'Total de embarques em trânsito', module: 'LOGISTICS', icon: 'local_shipping' },
    { type: 'STATUS_INDICATOR', label: 'On-Time Delivery', description: 'Taxa de entregas no prazo', module: 'LOGISTICS', icon: 'schedule' },
    { type: 'DATA_TABLE', label: 'Próximos Embarques', description: 'Tabela com embarques programados', module: 'LOGISTICS', icon: 'table_chart' },
    { type: 'KPI_CARD', label: 'Licenças Ativas', description: 'Total de licenças válidas', module: 'COMPLIANCE', icon: 'assignment' },
    { type: 'STATUS_INDICATOR', label: 'Alertas Compliance', description: 'Indicador de alertas pendentes', module: 'COMPLIANCE', icon: 'warning' },
    { type: 'KPI_CARD', label: 'ESG Score', description: 'Pontuação ESG consolidada', module: 'ESG', icon: 'eco' },
    { type: 'PIE_CHART', label: 'Emissões por Categoria', description: 'Distribuição de emissões de CO2', module: 'ESG', icon: 'co2' },
    { type: 'LINE_CHART', label: 'Carbon Footprint Trend', description: 'Evolução da pegada de carbono', module: 'ESG', icon: 'nature' }
  ];

  getUserDashboards(): Observable<UserDashboard[]> {
    return of(this.userDashboards).pipe(delay(300));
  }

  getSharedDashboards(): Observable<SharedDashboard[]> {
    return of(this.sharedDashboards).pipe(delay(300));
  }

  createDashboard(data: { name: string; description: string; layout: DashboardLayout }): Observable<UserDashboard> {
    const newDashboard: UserDashboard = {
      id: `DB-${String(this.userDashboards.length + 1).padStart(3, '0')}`,
      name: data.name,
      description: data.description,
      layout: data.layout,
      widgets: [],
      ownerId: 'USR-001',
      ownerName: 'Carlos Silva',
      createdAt: new Date(),
      updatedAt: new Date(),
      shared: false
    };
    this.userDashboards.push(newDashboard);
    return of(newDashboard).pipe(delay(500));
  }

  deleteDashboard(id: string): Observable<boolean> {
    const index = this.userDashboards.findIndex(d => d.id === id);
    if (index >= 0) {
      this.userDashboards.splice(index, 1);
    }
    return of(true).pipe(delay(300));
  }

  getWidgetCatalog(): Observable<WidgetCatalogItem[]> {
    return of(this.widgetCatalog).pipe(delay(200));
  }

  getMetrics(): Observable<DashboardMetrics> {
    const totalWidgets = this.userDashboards.reduce((sum, d) => sum + d.widgets.length, 0);
    const sharedCount = this.userDashboards.filter(d => d.shared).length;
    const lastModified = this.userDashboards.reduce((latest, d) => d.updatedAt > latest ? d.updatedAt : latest, new Date(0));

    return of({
      totalDashboards: this.userDashboards.length,
      totalWidgets,
      sharedCount,
      lastModified
    }).pipe(delay(200));
  }
}
