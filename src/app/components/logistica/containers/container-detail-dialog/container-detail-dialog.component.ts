import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Container, ContainerStatus, ContainerType } from '../../../../../types/containers';

export interface ContainerDetailDialogData {
  container: Container;
}

@Component({
  selector: 'app-container-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './container-detail-dialog.component.html',
  styleUrls: ['./container-detail-dialog.component.scss']
})
export class ContainerDetailDialogComponent {

  container: Container;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ContainerDetailDialogData) {
    this.container = data.container;
  }

  getStatusLabel(status: ContainerStatus): string {
    const map: Record<ContainerStatus, string> = {
      'BOOKED': 'Reservado',
      'GATE_IN': 'Gate-In',
      'LOADED': 'Carregado',
      'IN_TRANSIT': 'Em Trânsito',
      'ARRIVED': 'Chegou',
      'GATE_OUT': 'Gate-Out',
      'RETURNED': 'Devolvido',
      'DETAINED': 'Retido'
    };
    return map[status] || status;
  }

  getStatusColor(status: ContainerStatus): string {
    const map: Record<ContainerStatus, string> = {
      'BOOKED': 'status-booked',
      'GATE_IN': 'status-gatein',
      'LOADED': 'status-loaded',
      'IN_TRANSIT': 'status-transit',
      'ARRIVED': 'status-arrived',
      'GATE_OUT': 'status-gateout',
      'RETURNED': 'status-returned',
      'DETAINED': 'status-detained'
    };
    return map[status] || '';
  }

  getTypeLabel(type: ContainerType): string {
    const map: Record<ContainerType, string> = {
      'DRY': 'Dry',
      'REEFER': 'Reefer',
      'OPEN_TOP': 'Open Top',
      'FLAT_RACK': 'Flat Rack',
      'TANK': 'Tank'
    };
    return map[type] || type;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatDate(date: Date | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  calculateDemurrageProjection(container: Container): number {
    if (container.freeDaysRemaining >= 0) return 0;
    return Math.abs(container.freeDaysRemaining) * container.demurrageRate;
  }
}
