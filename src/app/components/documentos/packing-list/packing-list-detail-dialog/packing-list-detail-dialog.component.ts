import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PackingList, PackingListStatus } from '../../../../../types/packing-list';

export interface PackingListDetailDialogData {
  item: PackingList;
  statuses: { value: PackingListStatus; label: string }[];
}

@Component({
  selector: 'app-packing-list-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="pl-detail-dialog">
      <!-- Hero Header (Portos identity) -->
      <div class="dialog-hero">
        <div class="hero-title">
          <mat-icon class="hero-icon">inventory_2</mat-icon>
          <div class="hero-text">
            <h2>{{ item.packingListNumber }}</h2>
            <div class="hero-badges">
              <span class="status-chip" [ngClass]="getStatusColor(item.status)">
                {{ getStatusLabel(item.status) }}
              </span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <button mat-icon-button mat-dialog-close matTooltip="Fechar" class="hero-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content -->
      <mat-dialog-content class="dialog-body">
        <!-- Informações Gerais -->
        <div class="detail-section">
          <h4>Informações Gerais</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Invoice Vinculada</span>
              <span class="value">{{ item.linkedInvoice }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Exportador</span>
              <span class="value">{{ item.exporter }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Comprador</span>
              <span class="value">{{ item.buyer }} ({{ item.buyerCountry }})</span>
            </div>
            <div class="detail-item">
              <span class="label">Porto Origem</span>
              <span class="value">{{ item.portOrigin }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Porto Destino</span>
              <span class="value">{{ item.portDestination }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Status</span>
              <span class="status-chip" [ngClass]="getStatusColor(item.status)">
                {{ getStatusLabel(item.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Resumo de Pesos -->
        <div class="detail-section">
          <h4>Resumo de Pesos</h4>
          <div class="weight-summary">
            <div class="weight-item">
              <span class="label">Peso Bruto Total</span>
              <span class="value">{{ formatWeight(item.totalGrossWeight) }}</span>
            </div>
            <div class="weight-item">
              <span class="label">Peso Líquido Total</span>
              <span class="value">{{ formatWeight(item.totalNetWeight) }}</span>
            </div>
            <div class="weight-item">
              <span class="label">Total Volumes</span>
              <span class="value">{{ item.totalPackages }}</span>
            </div>
            <div class="weight-item">
              <span class="label">Discrepância Peso</span>
              <span class="value"
                    [ngClass]="item.weightDiscrepancyPercent > 2 ? 'value--danger' : 'value--success'">
                {{ item.weightDiscrepancyPercent | number:'1.2-2' }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Score de Completude -->
        <div class="detail-section">
          <h4>Score de Completude</h4>
          <div class="score-section">
            <mat-progress-bar mode="determinate"
              [value]="item.completenessScore"
              [color]="item.completenessScore >= 80 ? 'primary' : 'warn'">
            </mat-progress-bar>
            <span class="score-value" [ngClass]="getScoreClass(item.completenessScore)">
              {{ item.completenessScore }}%
            </span>
          </div>
        </div>

        <!-- Embarque Vinculado -->
        <div class="detail-section" *ngIf="item.linkedEmbarqueNumber">
          <h4>Embarque Vinculado</h4>
          <p class="linked-embarque">{{ item.linkedEmbarqueNumber }}</p>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styleUrls: ['./packing-list-detail-dialog.component.scss']
})
export class PackingListDetailDialogComponent {
  item: PackingList;
  private statuses: { value: PackingListStatus; label: string }[];

  constructor(@Inject(MAT_DIALOG_DATA) data: PackingListDetailDialogData) {
    this.item = data.item;
    this.statuses = data.statuses;
  }

  getStatusLabel(status: PackingListStatus): string {
    const found = this.statuses.find(s => s.value === status);
    if (found) return found.label;
    const map: Record<PackingListStatus, string> = {
      'RASCUNHO': 'Rascunho',
      'PENDENTE_VALIDACAO': 'Pendente Validação',
      'VALIDADO': 'Validado',
      'APROVADO': 'Aprovado',
      'VINCULADO_EMBARQUE': 'Vinculado Embarque',
      'FINALIZADO': 'Finalizado'
    };
    return map[status] || status;
  }

  getStatusColor(status: PackingListStatus): string {
    const map: Record<PackingListStatus, string> = {
      'RASCUNHO': 'status-draft',
      'PENDENTE_VALIDACAO': 'status-pending',
      'VALIDADO': 'status-validated',
      'APROVADO': 'status-approved',
      'VINCULADO_EMBARQUE': 'status-linked',
      'FINALIZADO': 'status-finished'
    };
    return map[status] || '';
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'score--success';
    if (score >= 70) return 'score--warning';
    return 'score--danger';
  }

  formatWeight(value: number): string {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + ' kg';
  }
}
