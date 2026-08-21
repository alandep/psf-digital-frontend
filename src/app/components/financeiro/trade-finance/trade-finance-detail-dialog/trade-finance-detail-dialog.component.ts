import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  TradeFinanceInstrument,
  InstrumentType,
  InstrumentStatus,
  TradeFinanceTimelineEvent
} from '../../../../../types/trade-finance';

export interface TradeFinanceDetailDialogData {
  instrument: TradeFinanceInstrument;
}

@Component({
  selector: 'app-trade-finance-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './trade-finance-detail-dialog.component.html',
  styleUrls: ['./trade-finance-detail-dialog.component.scss']
})
export class TradeFinanceDetailDialogComponent implements OnInit {

  instrument: TradeFinanceInstrument;
  timeline: TradeFinanceTimelineEvent[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: TradeFinanceDetailDialogData) {
    this.instrument = data.instrument;
  }

  ngOnInit(): void {
    this.timeline = this.instrument.timelineEvents;
  }

  getTypeLabel(type: InstrumentType): string {
    const map: Record<InstrumentType, string> = {
      'LC': 'Carta de Crédito',
      'COBRANCA_DOCUMENTARIA': 'Cobrança Doc.',
      'GARANTIA_BANCARIA': 'Garantia Bancária',
      'SBLC': 'Standby LC',
      'AVAL': 'Aval Bancário'
    };
    return map[type] || type;
  }

  getStatusColor(status: InstrumentStatus): string {
    const map: Record<InstrumentStatus, string> = {
      'ATIVA': 'status-ativa',
      'PENDENTE': 'status-pendente',
      'VENCIDA': 'status-vencida',
      'CANCELADA': 'status-cancelada',
      'EM_NEGOCIACAO': 'status-negociacao',
      'UTILIZADA': 'status-utilizada'
    };
    return map[status] || '';
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
