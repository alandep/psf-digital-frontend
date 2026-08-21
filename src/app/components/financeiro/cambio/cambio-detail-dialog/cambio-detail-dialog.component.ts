import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CambioContratsMockService } from '../../../../../services/cambioContratsMockService';
import {
  ContratoCambio,
  ContractStatus,
  QuotationData,
  BankComparison,
  FinancialTimelineEvent,
  CambioAIInsights
} from '../../../../../types/cambio';

interface CambioDetailDialogData {
  contract: ContratoCambio;
  quotations: QuotationData[];
}

@Component({
  selector: 'app-cambio-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './cambio-detail-dialog.component.html',
  styleUrls: ['./cambio-detail-dialog.component.scss']
})
export class CambioDetailDialogComponent implements OnInit {

  private cambioService = inject(CambioContratsMockService);
  readonly data = inject<CambioDetailDialogData>(MAT_DIALOG_DATA);

  contract: ContratoCambio = this.data.contract;
  quotations: QuotationData[] = this.data.quotations || [];
  timeline: FinancialTimelineEvent[] = [];
  aiInsights: CambioAIInsights | null = null;
  bankComparisons: BankComparison[] = [];

  ngOnInit(): void {
    this.cambioService.getTimeline(this.contract.id)
      .subscribe(tl => this.timeline = tl);

    this.cambioService.getAIInsights(this.contract.id)
      .subscribe(insights => this.aiInsights = insights);

    this.cambioService.compareBanks(this.contract.currency, this.contract.foreignValue)
      .subscribe(comparisons => this.bankComparisons = comparisons);
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  formatCurrency(value: number, currency: string = 'BRL'): string {
    if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStatusColor(status: ContractStatus): string {
    const map: Record<ContractStatus, string> = {
      'ABERTO': 'status-aberto',
      'FECHADO': 'status-fechado',
      'LIQUIDADO': 'status-liquidado',
      'VENCIDO': 'status-vencido',
      'CANCELADO': 'status-cancelado',
      'RENEGOCIADO': 'status-renegociado'
    };
    return map[status] || '';
  }

  getRiskColor(risk: string): string {
    const map: Record<string, string> = {
      'BAIXO': 'risk-low',
      'MÉDIO': 'risk-medium',
      'ALTO': 'risk-high'
    };
    return map[risk] || '';
  }

  getScoreColor(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
  }

  getTrendIcon(trend: string): string {
    const map: Record<string, string> = {
      'UP': 'trending_up',
      'DOWN': 'trending_down',
      'STABLE': 'trending_flat'
    };
    return map[trend] || 'trending_flat';
  }

  getTrendColor(trend: string): string {
    const map: Record<string, string> = {
      'UP': 'trend-up',
      'DOWN': 'trend-down',
      'STABLE': 'trend-stable'
    };
    return map[trend] || '';
  }

  getAlertIcon(severity: string): string {
    const map: Record<string, string> = {
      'LOW': 'info',
      'MEDIUM': 'warning',
      'HIGH': 'error',
      'CRITICAL': 'dangerous'
    };
    return map[severity] || 'info';
  }

  getAlertClass(severity: string): string {
    return `alert-${severity.toLowerCase()}`;
  }

  getScenarioClass(type: string): string {
    const map: Record<string, string> = {
      'OTIMISTA': 'scenario-optimistic',
      'PROVÁVEL': 'scenario-probable',
      'CONSERVADOR': 'scenario-conservative'
    };
    return map[type] || '';
  }
}
