import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Navio, VesselType, VesselStatus } from '../../../../../types/navios';

export interface NavioDetailDialogData {
  navio: Navio;
}

@Component({
  selector: 'app-navio-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './navio-detail-dialog.component.html',
  styleUrls: ['./navio-detail-dialog.component.scss']
})
export class NavioDetailDialogComponent {

  navio: Navio;

  constructor(@Inject(MAT_DIALOG_DATA) public data: NavioDetailDialogData) {
    this.navio = data.navio;
  }

  getVesselTypeLabel(type: VesselType): string {
    const map: Record<VesselType, string> = {
      'BULK_CARRIER': 'Graneleiro',
      'CONTAINER_SHIP': 'Porta-contêiner',
      'TANKER': 'Petroleiro',
      'REEFER': 'Frigorífico',
      'RORO': 'Ro-Ro',
      'GENERAL_CARGO': 'Carga Geral'
    };
    return map[type] || type;
  }

  getStatusLabel(status: VesselStatus): string {
    const map: Record<VesselStatus, string> = {
      'EM_TRANSITO': 'Em Trânsito',
      'NO_PORTO': 'No Porto',
      'FUNDEADO': 'Fundeado',
      'EM_MANUTENCAO': 'Em Manutenção',
      'ATRASADO': 'Atrasado',
      'CARREGANDO': 'Carregando',
      'DESCARREGANDO': 'Descarregando'
    };
    return map[status] || status;
  }

  getStatusColor(status: VesselStatus): string {
    const map: Record<VesselStatus, string> = {
      'EM_TRANSITO': 'status-transito',
      'NO_PORTO': 'status-porto',
      'FUNDEADO': 'status-fundeado',
      'EM_MANUTENCAO': 'status-manutencao',
      'ATRASADO': 'status-atrasado',
      'CARREGANDO': 'status-carregando',
      'DESCARREGANDO': 'status-descarregando'
    };
    return map[status] || '';
  }

  getStatusIcon(status: VesselStatus): string {
    const map: Record<VesselStatus, string> = {
      'EM_TRANSITO': 'sailing',
      'NO_PORTO': 'anchor',
      'FUNDEADO': 'location_on',
      'EM_MANUTENCAO': 'build',
      'ATRASADO': 'warning',
      'CARREGANDO': 'upload',
      'DESCARREGANDO': 'download'
    };
    return map[status] || 'directions_boat';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }
}
