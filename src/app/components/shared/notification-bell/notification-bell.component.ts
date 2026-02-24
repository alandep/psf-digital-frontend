import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService, Notification } from '../../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <button mat-icon-button 
            [matBadge]="(unreadCount$ | async) || 0"
            [matBadgeHidden]="(unreadCount$ | async) === 0"
            matBadgeColor="warn"
            matBadgeSize="small"
            [matMenuTriggerFor]="notificationMenu"
            matTooltip="Notificações"
            class="notification-button">
      <mat-icon>notifications</mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header" mat-menu-item disabled>
        <span class="notification-title">Notificações</span>
        <button mat-icon-button 
                (click)="markAllAsRead(); $event.stopPropagation()"
                matTooltip="Marcar todas como lidas"
                class="mark-all-button">
          <mat-icon>done_all</mat-icon>
        </button>
      </div>
      
      <mat-divider></mat-divider>

      <div class="notification-list">
        <div *ngIf="(notifications$ | async)?.length === 0" 
             class="no-notifications" 
             mat-menu-item disabled>
          <mat-icon>notifications_none</mat-icon>
          <span>Nenhuma notificação</span>
        </div>

        <div *ngFor="let notification of notifications$ | async" 
             class="notification-item"
             [class.unread]="!notification.read"
             mat-menu-item
             (click)="markAsRead(notification.id)">
          <div class="notification-content">
            <mat-icon [class]="'notification-icon ' + notification.type">
              {{getIconForType(notification.type)}}
            </mat-icon>
            <div class="notification-text">
              <p class="notification-message">{{notification.message}}</p>
              <span class="notification-time">{{formatTime(notification.timestamp)}}</span>
            </div>
            <button mat-icon-button 
                    class="remove-button"
                    (click)="removeNotification(notification.id); $event.stopPropagation()"
                    matTooltip="Remover">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <mat-divider *ngIf="(notifications$ | async)?.length && (notifications$ | async)!.length > 0"></mat-divider>
      
      <div class="notification-actions" mat-menu-item disabled>
        <button mat-button 
                color="primary" 
                (click)="clearAll(); $event.stopPropagation()"
                [disabled]="(notifications$ | async)?.length === 0">
          Limpar Todas
        </button>
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-button {
      color: white;
    }

    .notification-menu {
      width: 350px;
      max-height: 400px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      font-family: 'Inter', sans-serif;
    }

    .notification-title {
      font-weight: 600;
      font-size: 16px;
      color: #333;
    }

    .mark-all-button {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }

    .notification-list {
      max-height: 250px;
      overflow-y: auto;
    }

    .no-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      color: #666;
      font-family: 'Inter', sans-serif;
    }

    .no-notifications mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .notification-item {
      padding: 0 !important;
      min-height: auto !important;
      line-height: normal !important;
    }

    .notification-item.unread {
      background-color: #f3f4f6;
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      width: 100%;
      gap: 12px;
    }

    .notification-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-top: 2px;
    }

    .notification-icon.success { color: #4caf50; }
    .notification-icon.error { color: #f44336; }
    .notification-icon.warning { color: #ff9800; }
    .notification-icon.info { color: #2196f3; }

    .notification-text {
      flex: 1;
      font-family: 'Inter', sans-serif;
    }

    .notification-message {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #333;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 12px;
      color: #666;
    }

    .remove-button {
      width: 24px;
      height: 24px;
      line-height: 24px;
      opacity: 0.7;
    }

    .remove-button:hover {
      opacity: 1;
    }

    .notification-actions {
      padding: 12px 16px;
      text-align: center;
    }
  `]
})
export class NotificationBellComponent {
  private notificationService = inject(NotificationService);

  notifications$: Observable<Notification[]> = this.notificationService.notifications$;
  unreadCount$: Observable<number> = this.notificationService.getUnreadCount();

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  clearAll(): void {
    this.notificationService.clearAllNotifications();
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return timestamp.toLocaleDateString('pt-BR');
  }
}
