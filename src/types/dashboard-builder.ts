export type DashboardLayout = '1-COLUMN' | '2-COLUMN' | '3-COLUMN';
export type WidgetType = 'KPI_CARD' | 'LINE_CHART' | 'BAR_CHART' | 'PIE_CHART' | 'DATA_TABLE' | 'STATUS_INDICATOR';
export type WidgetModule = 'EXPORTS' | 'FINANCIAL' | 'LOGISTICS' | 'COMPLIANCE' | 'ESG';

export interface UserDashboard {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
  shared: boolean;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  module: WidgetModule;
  value: string;
  icon: string;
  color: string;
}

export interface SharedDashboard {
  dashboardId: string;
  dashboardName: string;
  ownerName: string;
  sharedDate: Date;
  permission: 'VIEW_ONLY' | 'EDIT';
  widgets: number;
}

export interface WidgetCatalogItem {
  type: WidgetType;
  label: string;
  description: string;
  module: WidgetModule;
  icon: string;
}

export interface DashboardMetrics {
  totalDashboards: number;
  totalWidgets: number;
  sharedCount: number;
  lastModified: Date;
}
