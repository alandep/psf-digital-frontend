import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Types
import { PAGAMENTOS_SERVICE } from '../../../../services/finance/pagamentos-service.token';
import { CAMBIO_SERVICE } from '../../../../services/finance/cambio-service.token';
import {
  Pagamento,
  PaymentTimelineEvent,
  PaymentStatus
} from '../../../../../types/pagamentos';
import { ContratoCambio } from '../../../../../types/cambio';

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
    MatTooltipModule
  ],
  templateUrl: './pagamento-detail-dialog.component.html',
  styleUrls: ['./pagamento-detail-dialog.component.scss']
})
export class PagamentoDetailDialogComponent implements OnInit {

  private pagamentosService = inject(PAGAMENTOS_SERVICE);
  private cambioService = inject(CAMBIO_SERVICE);
  private destroyRef = inject(DestroyRef);
  public data: PagamentoDetailDialogData = inject(MAT_DIALOG_DATA);

  payment!: Pagamento;
  timeline: PaymentTimelineEvent[] = [];
  exchangeContract: ContratoCambio | null = null;

  ngOnInit(): void {
    this.payment = this.data.payment;

    this.pagamentosService.getTimeline(this.payment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: tl => this.timeline = tl, error: () => this.timeline = [] });

    if (this.payment.linkedExchangeContractId) {
      this.cambioService.getContractById(this.payment.linkedExchangeContractId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: c => this.exchangeContract = c, error: () => this.exchangeContract = null });
    }
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  formatCurrency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
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
}
