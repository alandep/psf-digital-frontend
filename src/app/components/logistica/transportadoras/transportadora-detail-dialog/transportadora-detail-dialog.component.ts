import { Component, Inject, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TransportadorasMockService } from '../../../../../services/transportadorasMockService';
import {
  Transportadora,
  ModalType,
  CarrierStatus,
  CarrierService,
  CarrierCoverage,
  CarrierFleet,
  TrackingEvent,
  PerformanceIndicator,
  CarrierAIInsights
} from '../../../../../types/transportadoras';

export interface TransportadoraDetailDialogData {
  carrier: Transportadora;
}

@Component({
  selector: 'app-transportadora-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './transportadora-detail-dialog.component.html',
  styleUrls: ['./transportadora-detail-dialog.component.scss']
})
export class TransportadoraDetailDialogComponent implements OnInit, OnDestroy {

  private transportadorasService = inject(TransportadorasMockService);
  private destroy$ = new Subject<void>();

  carrier: Transportadora;

  services: CarrierService[] = [];
  carrierCoverage: CarrierCoverage | null = null;
  fleet: CarrierFleet | null = null;
  trackingEvents: TrackingEvent[] = [];
  performanceData: PerformanceIndicator | null = null;
  aiInsights: CarrierAIInsights | null = null;

  // Table columns (detail tabs)
  routesColumns: string[] = ['origin', 'destination', 'avgTime', 'avgCost', 'frequency'];
  trackingColumns: string[] = ['timestamp', 'location', 'speed', 'event', 'status', 'details'];
  rankingColumns: string[] = ['carrierName', 'score', 'cost', 'sla', 'availability'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: TransportadoraDetailDialogData) {
    this.carrier = data.carrier;
  }

  ngOnInit(): void {
    this.loadCarrierDetails(this.carrier.id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCarrierDetails(carrierId: string): void {
    this.transportadorasService.getServices(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(svcs => this.services = svcs);

    this.transportadorasService.getCoverage(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(cov => this.carrierCoverage = cov);

    this.transportadorasService.getFleet(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(fl => this.fleet = fl);

    this.transportadorasService.getTracking(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(trk => this.trackingEvents = trk);

    this.transportadorasService.getPerformance(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(perf => this.performanceData = perf);

    this.transportadorasService.getAIInsights(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(insights => this.aiInsights = insights);
  }

  getModalClass(modal: ModalType): string {
    const map: Record<ModalType, string> = {
      'RODOVIÁRIO': 'modal-rodoviario',
      'FERROVIÁRIO': 'modal-ferroviario',
      'MARÍTIMO': 'modal-maritimo',
      'FLUVIAL': 'modal-fluvial',
      'AÉREO': 'modal-aereo',
      'MULTIMODAL': 'modal-multimodal'
    };
    return map[modal] || '';
  }

  getStatusClass(status: CarrierStatus): string {
    const map: Record<CarrierStatus, string> = {
      'ATIVA': 'status-ativa',
      'INATIVA': 'status-inativa',
      'SUSPENSA': 'status-suspensa',
      'HOMOLOGAÇÃO': 'status-homologacao'
    };
    return map[status] || '';
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

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    return 'score-poor';
  }
}
