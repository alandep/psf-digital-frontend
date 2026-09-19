import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Types
import { PAGAMENTOS_SERVICE } from '../../../../services/finance/pagamentos-service.token';
import {
  Pagamento,
  PaymentReconciliation,
  PaymentNotification,
  PaymentTimelineEvent,
  PaymentAIInsights,
  PaymentStatus,
  PaymentCategory
} from '../../../../../types/pagamentos';

export interface PagamentoDetailDialogData {
  payment: Pagamento;
}

@Component({
  selector: 'app-pagamento-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './pagamento-detail-dialog.component.html',
  styleUrls: ['./pagamento-detail-dialog.component.scss']
})
export class PagamentoDetailDialogComponent implements OnInit {

  private pagamentosService = inject(PAGAMENTOS_SERVICE);
  public data: PagamentoDetailDialogData = inject(MAT_DIALOG_DATA);

  payment!: Pagamento;
  reconciliations: PaymentReconciliation[] = [];
  notifications: PaymentNotification[] = [];
  timeline: PaymentTimelineEvent[] = [];
  aiInsights: PaymentAIInsights | null = null;

  notificationColumns: string[] = ['type', 'message', 'channel', 'sentAt', 'read'];

  ngOnInit(): void {
    this.payment = this.data.payment;
    this.loadPaymentDetails(this.payment.id);
  }

  private loadPaymentDetails(paymentId: string): void {
    this.pagamentosService.getReconciliations(paymentId)
      .subscribe(rec => this.reconciliations = rec);

    this.pagamentosService.getNotifications(paymentId)
      .subscribe(notif => this.notifications = notif);

    this.pagamentosService.getTimeline(paymentId)
      .subscribe(tl => this.timeline = tl);

    this.pagamentosService.getAIInsights(paymentId)
      .subscribe(insights => this.aiInsights = insights);
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  formatCurrency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStatusColor(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      'PENDENTE': 'status-pendente',
      'APROVADO': 'status-aprovado',
      'PAGO': 'status-pago',
      'VENCIDO': 'status-vencido',
      'CANCELADO': 'status-cancelado',
      'CONCILIADO': 'status-conciliado'
    };
    return map[status] || '';
  }

  getCategoryLabel(category: PaymentCategory): string {
    const map: Record<PaymentCategory, string> = {
      'FRETE': 'Frete',
      'ARMAZENAGEM': 'Armazenagem',
      'DESPACHANTE': 'Despachante',
      'SEGURO': 'Seguro',
      'COMISSÃO': 'Comissão',
      'TAXAS_PORTUÁRIAS': 'Taxas Portuárias',
      'TAXAS_BANCÁRIAS': 'Taxas Bancárias',
      'CERTIFICADOS': 'Certificados',
      'TRANSPORTE': 'Transporte',
      'TRIBUTOS': 'Tributos',
      'FORNECEDORES': 'Fornecedores',
      'OUTROS': 'Outros'
    };
    return map[category] || category;
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

  getReconciliationStatusColor(status: string): string {
    const map: Record<string, string> = {
      'CONCILIADO': 'rec-conciliado',
      'DIVERGENTE': 'rec-divergente',
      'PENDENTE': 'rec-pendente'
    };
    return map[status] || '';
  }
}
