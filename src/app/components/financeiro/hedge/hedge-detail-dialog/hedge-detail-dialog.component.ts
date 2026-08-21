import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { HedgeContract, HedgeType, HedgeStatus } from '../../../../../types/hedge';

interface HedgeDetailDialogData {
  contract: HedgeContract;
}

@Component({
  selector: 'app-hedge-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './hedge-detail-dialog.component.html',
  styleUrls: ['./hedge-detail-dialog.component.scss']
})
export class HedgeDetailDialogComponent {

  contract: HedgeContract;

  constructor(@Inject(MAT_DIALOG_DATA) public data: HedgeDetailDialogData) {
    this.contract = data.contract;
  }

  getTypeLabel(type: HedgeType): string {
    const map: Record<HedgeType, string> = {
      'NDF': 'NDF',
      'FORWARD': 'Forward',
      'OPTION_CALL': 'Opção Call',
      'OPTION_PUT': 'Opção Put',
      'SWAP': 'Swap'
    };
    return map[type] || type;
  }

  getStatusColor(status: HedgeStatus): string {
    const map: Record<HedgeStatus, string> = {
      'ATIVO': 'status-ativo',
      'LIQUIDADO': 'status-liquidado',
      'VENCIDO': 'status-vencido',
      'CANCELADO': 'status-cancelado',
      'EM_NEGOCIACAO': 'status-negociacao'
    };
    return map[status] || '';
  }

  getMtmClass(value: number): string {
    if (value > 0) return 'mtm-positive';
    if (value < 0) return 'mtm-negative';
    return '';
  }

  getDirectionLabel(direction: 'BUY' | 'SELL'): string {
    return direction === 'BUY' ? 'Compra' : 'Venda';
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  formatBRL(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
