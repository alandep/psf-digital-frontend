import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CAMBIO_SERVICE } from '../../../../services/finance/cambio-service.token';
import {
  ContratoCambio,
  ContractStatus,
  QuotationData,
  BankComparison,
  FinancialTimelineEvent,
  CambioAnalysis
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

  private cambioService = inject(CAMBIO_SERVICE);
  private destroyRef = inject(DestroyRef);
  readonly data = inject<CambioDetailDialogData>(MAT_DIALOG_DATA);

  contract: ContratoCambio = this.data.contract;
  quotations: QuotationData[] = this.data.quotations || [];
  timeline: FinancialTimelineEvent[] = [];
  analysis: CambioAnalysis | null = null;
  bankComparisons: BankComparison[] = [];
  bankComparisonsLoaded = false;

  ngOnInit(): void {
    this.cambioService.getTimeline(this.contract.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: tl => this.timeline = tl, error: () => this.timeline = [] });

    this.cambioService.getAnalysis(this.contract.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: a => this.analysis = a, error: () => this.analysis = null });

    this.cambioService.compareBanks(this.contract.currency, this.contract.foreignValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: comparisons => {
          this.bankComparisons = comparisons;
          this.bankComparisonsLoaded = true;
        },
        error: () => {
          this.bankComparisons = [];
          this.bankComparisonsLoaded = true;
        }
      });
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  formatCurrency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
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

  getFactClass(tone: string): string {
    return tone === 'warning' ? 'alert-medium' : 'alert-low';
  }

  getFactIcon(tone: string): string {
    return tone === 'warning' ? 'warning' : 'info';
  }
}
