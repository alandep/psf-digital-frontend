import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AiAgent, AiErrorEntry } from '../../../../../types/ai-operations';

export interface AgentDetailDialogData {
  agent: AiAgent;
  errors: AiErrorEntry[];
}

@Component({
  selector: 'app-agent-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './agent-detail-dialog.component.html',
  styleUrls: ['./agent-detail-dialog.component.scss']
})
export class AgentDetailDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AgentDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AgentDetailDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'Ativo', 'DEGRADED': 'Degradado', 'OFFLINE': 'Offline', 'MAINTENANCE': 'Manutenção'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatResponseTime(ms: number): string {
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
    return ms + 'ms';
  }

  formatCost(cost: number): string {
    return '$' + cost.toFixed(2);
  }

  formatDateTime(date: Date | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('pt-BR');
  }

  getAccuracyColor(accuracy: number): string {
    if (accuracy >= 95) return '#4caf50';
    if (accuracy >= 90) return '#8bc34a';
    if (accuracy >= 85) return '#ff9800';
    return '#f44336';
  }
}
