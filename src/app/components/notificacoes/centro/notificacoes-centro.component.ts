import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NotificationsMockService } from '../../../../services/notificationsMockService';
import {
  AppNotification,
  NotificationChannel,
  NotificationPriority,
  NotificationMetrics,
  NotificationFilters
} from '../../../../types/notifications';

@Component({
  selector: 'app-notificacoes-centro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './notificacoes-centro.component.html',
  styleUrls: ['./notificacoes-centro.component.scss']
})
export class NotificacoesCentroComponent implements OnInit, OnDestroy {

  private service = inject(NotificationsMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  notifications: AppNotification[] = [];
  metrics: NotificationMetrics | null = null;
  isLoading = false;

  channels: { value: NotificationChannel; label: string; icon: string }[] = [];
  priorities: { value: NotificationPriority; label: string }[] = [];

  selectedChannels: NotificationChannel[] = [];
  selectedPriorities: NotificationPriority[] = [];
  readStatus: 'all' | 'read' | 'unread' = 'all';
  searchText = '';

  filterForm!: FormGroup;

  ngOnInit(): void {
    this.filterForm = this.fb.group({ searchText: [''] });
    this.channels = this.service.getChannels();
    this.priorities = this.service.getPriorities();
    this.loadNotifications();
    this.loadMetrics();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.filterForm.get('searchText')!.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe((val: string) => {
        this.searchText = val || '';
        this.loadNotifications();
      });
  }

  loadNotifications(): void {
    this.isLoading = true;
    const filters: NotificationFilters = {
      searchText: this.searchText,
      channels: this.selectedChannels,
      priorities: this.selectedPriorities,
      readStatus: this.readStatus,
      dateStart: null,
      dateEnd: null
    };
    this.service.getNotifications(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.notifications = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar notificações', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.service.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(m => this.metrics = m);
  }

  toggleChannel(channel: NotificationChannel): void {
    const idx = this.selectedChannels.indexOf(channel);
    if (idx >= 0) {
      this.selectedChannels.splice(idx, 1);
    } else {
      this.selectedChannels.push(channel);
    }
    this.loadNotifications();
  }

  isChannelSelected(channel: NotificationChannel): boolean {
    return this.selectedChannels.includes(channel);
  }

  togglePriority(priority: NotificationPriority): void {
    const idx = this.selectedPriorities.indexOf(priority);
    if (idx >= 0) {
      this.selectedPriorities.splice(idx, 1);
    } else {
      this.selectedPriorities.push(priority);
    }
    this.loadNotifications();
  }

  isPrioritySelected(priority: NotificationPriority): boolean {
    return this.selectedPriorities.includes(priority);
  }

  setReadStatus(status: 'all' | 'read' | 'unread'): void {
    this.readStatus = status;
    this.loadNotifications();
  }

  markAsRead(notification: AppNotification): void {
    this.service.markAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        notification.isRead = true;
        this.loadMetrics();
      });
  }

  markAllAsRead(): void {
    this.service.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.snackBar.open(`${result.count} notificações marcadas como lidas`, 'OK', { duration: 3000 });
        this.loadNotifications();
        this.loadMetrics();
      });
  }

  getChannelIcon(channel: NotificationChannel): string {
    const map: Record<NotificationChannel, string> = {
      'PLATFORM': 'computer',
      'EMAIL': 'email',
      'PUSH': 'notifications',
      'WHATSAPP': 'chat'
    };
    return map[channel] || 'notifications';
  }

  getPriorityClass(priority: NotificationPriority): string {
    const map: Record<NotificationPriority, string> = {
      'CRITICAL': 'priority-critical',
      'HIGH': 'priority-high',
      'MEDIUM': 'priority-medium',
      'LOW': 'priority-low'
    };
    return map[priority] || '';
  }

  getPriorityLabel(priority: NotificationPriority): string {
    const map: Record<NotificationPriority, string> = {
      'CRITICAL': 'Crítica',
      'HIGH': 'Alta',
      'MEDIUM': 'Média',
      'LOW': 'Baixa'
    };
    return map[priority] || priority;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
