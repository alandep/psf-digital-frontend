export type NotificationChannel = 'PLATFORM' | 'EMAIL' | 'PUSH' | 'WHATSAPP';
export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  category: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  readAt: Date | null;
  sender: string;
  actionUrl: string;
  metadata: Record<string, string>;
}

export interface NotificationMetrics {
  naoLidas: number;
  criticasNaoLidas: number;
  hoje: number;
  estaSemana: number;
}

export interface NotificationFilters {
  searchText: string;
  channels: NotificationChannel[];
  priorities: NotificationPriority[];
  readStatus: 'all' | 'read' | 'unread';
  dateStart: Date | null;
  dateEnd: Date | null;
}
