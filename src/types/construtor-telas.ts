export type WidgetType = 'KPI_CARD' | 'CHART' | 'TABLE' | 'MAP' | 'TIMELINE';
export type LayoutType = '1_COLUMN' | '2_COLUMNS' | '3_COLUMNS';
export type ScreenStatus = 'RASCUNHO' | 'PUBLICADA' | 'ARQUIVADA';

export interface ScreenWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, any>;
  position: number;
}

export interface CustomScreen {
  id: string;
  name: string;
  description: string;
  layout: LayoutType;
  widgets: ScreenWidget[];
  status: ScreenStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ScreenTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  layout: LayoutType;
  widgetCount: number;
  previewWidgets: WidgetType[];
  popularity: number;
}

export interface WidgetCatalogItem {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
}

export interface ScreenMetrics {
  totalTelas: number;
  publicadas: number;
  rascunhos: number;
  templatesDisponiveis: number;
}
