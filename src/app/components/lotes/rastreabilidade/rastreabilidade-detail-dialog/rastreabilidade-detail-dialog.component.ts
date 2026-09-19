import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  RastreabilidadeLote,
  TimelineEvent,
  TimelineEventType,
  TraceDocument,
  AITraceInsights,
  RiskLevel,
  SupplyChainNode
} from '../../../../../types/rastreabilidade';

export interface RastreabilidadeDetailData {
  lote: RastreabilidadeLote;
  timeline: TimelineEvent[];
  documents: TraceDocument[];
  aiInsights: AITraceInsights | null;
  supplyChainNodes: SupplyChainNode[];
}

@Component({
  selector: 'app-rastreabilidade-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './rastreabilidade-detail-dialog.component.html',
  styleUrls: ['./rastreabilidade-detail-dialog.component.scss']
})
export class RastreabilidadeDetailDialogComponent {

  docDisplayedColumns = ['documentType', 'documentNumber', 'issueDate', 'status', 'actions'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: RastreabilidadeDetailData) {}

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getEventIcon(eventType: TimelineEventType): string {
    switch (eventType) {
      case 'SAFRA': return 'eco';
      case 'FAZENDA': return 'agriculture';
      case 'COLHEITA': return 'grass';
      case 'RECEBIMENTO': return 'move_to_inbox';
      case 'ARMAZEM': return 'warehouse';
      case 'QUALIDADE': return 'science';
      case 'CONTAINER': return 'inventory_2';
      case 'PORTO': return 'anchor';
      case 'NAVIO': return 'directions_boat';
      case 'EXPORTACAO': return 'description';
      case 'CLIENTE': return 'handshake';
      default: return 'circle';
    }
  }

  getEventColor(status: 'completed' | 'current' | 'pending'): string {
    switch (status) {
      case 'completed': return 'green';
      case 'current': return 'blue';
      case 'pending': return 'grey';
      default: return 'grey';
    }
  }

  getRiskColor(risk: RiskLevel): string {
    switch (risk) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'orange';
      case 'HIGH': return 'red';
      case 'CRITICAL': return 'red';
      default: return 'grey';
    }
  }

  getDocStatusColor(status: 'valid' | 'expired' | 'pending'): string {
    switch (status) {
      case 'valid': return 'green';
      case 'expired': return 'red';
      case 'pending': return 'orange';
      default: return 'grey';
    }
  }

  getComplianceStatusColor(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return 'green';
      case 'fail': return 'red';
      case 'warning': return 'orange';
      default: return 'grey';
    }
  }

  getComplianceIcon(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return 'check_circle';
      case 'fail': return 'cancel';
      case 'warning': return 'warning';
      default: return 'help';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  trackByEventId(index: number, event: TimelineEvent): string {
    return event.id;
  }

  trackByNodeId(index: number, node: SupplyChainNode): string {
    return node.id;
  }
}
