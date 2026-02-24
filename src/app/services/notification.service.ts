import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

export interface LoadingConfig {
  title?: string;
  message?: string;
  showProgress?: boolean;
  diameter?: number;
  strokeWidth?: number;
  color?: 'primary' | 'accent' | 'warn';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingConfigSubject = new BehaviorSubject<LoadingConfig>({});
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  constructor(private snackBar: MatSnackBar) {}

  // Loading State com configurações
  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get loadingConfig$(): Observable<LoadingConfig> {
    return this.loadingConfigSubject.asObservable();
  }

  showLoading(config: LoadingConfig = {}): void {
    const defaultConfig: LoadingConfig = {
      title: 'Carregando...',
      message: 'Por favor, aguarde enquanto processamos sua solicitação.',
      showProgress: false,
      diameter: 60,
      strokeWidth: 6,
      color: 'primary',
    };

    this.loadingConfigSubject.next({ ...defaultConfig, ...config });
    this.loadingSubject.next(true);
  }

  hideLoading(): void {
    this.loadingSubject.next(false);
  }

  // Métodos específicos para diferentes tipos de loading
  showDataLoading(): void {
    this.showLoading({
      title: 'Carregando dados...',
      message: 'Obtendo informações do servidor.',
      diameter: 50,
      strokeWidth: 5,
    });
  }

  showSaveLoading(): void {
    this.showLoading({
      title: 'Salvando...',
      message: 'Salvando suas alterações.',
      color: 'accent',
      diameter: 45,
    });
  }

  showProgressLoading(
    title: string = 'Processando...',
    message: string = 'Operação em andamento.'
  ): void {
    this.showLoading({
      title,
      message,
      showProgress: true,
      diameter: 55,
    });
  }

  // Toast Messages
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  // Push Notifications
  get notifications$(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  addNotification(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      read: false,
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }

  markAsRead(id: string): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
  }

  removeNotification(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }

  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const unreadCount = notifications.filter(n => !n.read).length;
        observer.next(unreadCount);
      });
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
