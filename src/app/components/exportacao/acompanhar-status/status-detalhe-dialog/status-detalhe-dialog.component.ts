import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Exportacao } from '../../../../../types/exportacao';

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'delayed' | 'blocked';
  icon: string;
  details?: string;
  documents?: string[];
  estimatedCompletion?: Date;
}

export interface StatusAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  actionRequired: boolean;
  suggestedAction?: string;
  exportId: string;
}

export interface StatusDetalheDialogData {
  exportacao: Exportacao;
  timeline: TimelineEvent[];
  alerts: StatusAlert[];
  statusColor: string;
  statusLabel: string;
  progress: number;
  onResolveAlert?: (alert: StatusAlert) => void;
}

@Component({
  selector: 'app-status-detalhe-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './status-detalhe-dialog.component.html',
  styleUrls: ['./status-detalhe-dialog.component.scss']
})
export class StatusDetalheDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: StatusDetalheDialogData,
    public dialogRef: MatDialogRef<StatusDetalheDialogComponent>
  ) {}

  hasAlerts(): boolean {
    return (this.data.alerts?.length ?? 0) > 0;
  }

  getTimelineStatus(event: TimelineEvent): string {
    switch (event.status) {
      case 'completed': return 'completed';
      case 'current': return 'current';
      case 'pending': return 'pending';
      case 'delayed': return 'delayed';
      case 'blocked': return 'blocked';
      default: return 'pending';
    }
  }

  getTimelineIcon(event: TimelineEvent): string {
    return event.icon;
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }

  resolveAlert(alert: StatusAlert): void {
    if (this.data.onResolveAlert) {
      this.data.onResolveAlert(alert);
    }
    this.data.alerts = this.data.alerts.filter(a => a.id !== alert.id);
  }
}
