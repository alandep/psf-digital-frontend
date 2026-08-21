import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BillOfLading, BLStatus } from '../../../../../types/bill-of-lading';

export interface BlDetailDialogData {
  bl: BillOfLading;
  statuses: { value: BLStatus; label: string }[];
}

@Component({
  selector: 'app-bl-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="bl-detail-dialog">
      <!-- Hero Header (Portos identity) -->
      <div class="dialog-hero">
        <div class="hero-title">
          <mat-icon class="hero-icon">sailing</mat-icon>
          <div class="hero-text">
            <h2>{{ bl.blNumber }}</h2>
            <div class="hero-badges">
              <span class="status-badge" [ngClass]="bl.status">{{ getStatusLabel(bl.status) }}</span>
              <span class="type-chip" [ngClass]="bl.type">{{ bl.type }}</span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <button mat-raised-button class="hero-raised-btn" (click)="onEdit()" matTooltip="Editar BL">
            <mat-icon>edit</mat-icon> Editar
          </button>
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
              <span class="label">Tipo</span>
              <span class="type-chip" [ngClass]="bl.type">{{ bl.type }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Status</span>
              <span class="status-badge" [ngClass]="bl.status">{{ getStatusLabel(bl.status) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Data Emissão</span>
              <span class="value">{{ bl.issueDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Frete</span>
              <span class="value">{{ bl.freightTerms }}</span>
            </div>
          </div>
        </div>

        <!-- Partes -->
        <div class="detail-section">
          <h4>Partes</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Shipper</span>
              <span class="value">{{ bl.shipper }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Consignee</span>
              <span class="value">{{ bl.consignee }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Notify Party</span>
              <span class="value">{{ bl.notifyParty }}</span>
            </div>
          </div>
        </div>

        <!-- Transporte -->
        <div class="detail-section">
          <h4>Transporte</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Vessel</span>
              <span class="value">{{ bl.vessel }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Voyage</span>
              <span class="value">{{ bl.voyage }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Porto Embarque</span>
              <span class="value">{{ bl.portLoading }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Porto Descarga</span>
              <span class="value">{{ bl.portDischarge }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Peso Bruto</span>
              <span class="value">{{ bl.grossWeight | number:'1.2-2' }} kg</span>
            </div>
            <div class="detail-item">
              <span class="label">Medição</span>
              <span class="value">{{ bl.measurement | number:'1.2-2' }} m³</span>
            </div>
          </div>
        </div>

        <!-- Containers -->
        <div class="detail-section">
          <h4>Containers</h4>
          <div class="containers-list">
            <span *ngFor="let c of bl.containers" class="container-chip">{{ c }}</span>
          </div>
        </div>

        <!-- Observações -->
        <div class="detail-section" *ngIf="bl.observations">
          <h4>Observações</h4>
          <p class="observations">{{ bl.observations }}</p>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styleUrls: ['./bl-detail-dialog.component.scss']
})
export class BlDetailDialogComponent {
  bl: BillOfLading;
  private statuses: { value: BLStatus; label: string }[];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: BlDetailDialogData,
    private dialogRef: MatDialogRef<BlDetailDialogComponent>
  ) {
    this.bl = data.bl;
    this.statuses = data.statuses;
  }

  getStatusLabel(status: BLStatus): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }

  onEdit(): void {
    this.dialogRef.close('edit');
  }
}
