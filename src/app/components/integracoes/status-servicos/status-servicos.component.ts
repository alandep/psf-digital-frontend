import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services and Types
import { SiscomexMockService } from '../../../../services/siscomexMockService';
import { MapaMockService } from '../../../../services/mapaMockService';
import { SiscomexService, SiscomexServiceStatus } from '../../../../types/integracoes-siscomex';

export interface ServiceCard {
  id: string;
  name: string;
  description: string;
  status: SiscomexServiceStatus;
  uptime: number;
  avgResponseTime: number;
  lastCheck: Date;
  lastIncident: Date | null;
}

export interface StatusSummary {
  online: number;
  degraded: number;
  offline: number;
  maintenance: number;
}

@Component({
  selector: 'app-status-servicos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './status-servicos.component.html',
  styleUrls: ['./status-servicos.component.scss']
})
export class StatusServicosComponent implements OnInit, OnDestroy {

  private siscomexService = inject(SiscomexMockService);
  private mapaService = inject(MapaMockService);
  private destroy$ = new Subject<void>();

  services: ServiceCard[] = [];
  summary: StatusSummary = { online: 0, degraded: 0, offline: 0, maintenance: 0 };
  overallUptime = 0;
  loading = true;
  lastRefresh = new Date();

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;

    this.siscomexService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe((siscomexServices: SiscomexService[]) => {
        // Map siscomex services + add MAPA-specific services
        this.services = [
          ...siscomexServices.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            status: s.status,
            uptime: s.uptime,
            avgResponseTime: s.avgResponseTime,
            lastCheck: s.lastCheck,
            lastIncident: s.lastIncident
          })),
          {
            id: 'SVC-MAPA-001',
            name: 'MAPA - Certificados Fitossanitários',
            description: 'Emissão de certificados fitossanitários para exportação',
            status: 'ONLINE' as SiscomexServiceStatus,
            uptime: 99.1,
            avgResponseTime: 380,
            lastCheck: new Date(),
            lastIncident: new Date('2024-11-28')
          },
          {
            id: 'SVC-MAPA-002',
            name: 'MAPA - Certificados Sanitários',
            description: 'Emissão de CSI para produtos de origem animal',
            status: 'ONLINE' as SiscomexServiceStatus,
            uptime: 98.8,
            avgResponseTime: 420,
            lastCheck: new Date(),
            lastIncident: new Date('2024-12-02')
          },
          {
            id: 'SVC-MAPA-003',
            name: 'MAPA - Habilitações',
            description: 'Gestão de habilitações de estabelecimentos exportadores',
            status: 'DEGRADED' as SiscomexServiceStatus,
            uptime: 96.5,
            avgResponseTime: 950,
            lastCheck: new Date(),
            lastIncident: new Date()
          }
        ];

        this.calculateSummary();
        this.loading = false;
        this.lastRefresh = new Date();
      });
  }

  private calculateSummary(): void {
    this.summary = {
      online: this.services.filter(s => s.status === 'ONLINE').length,
      degraded: this.services.filter(s => s.status === 'DEGRADED').length,
      offline: this.services.filter(s => s.status === 'OFFLINE').length,
      maintenance: this.services.filter(s => s.status === 'MAINTENANCE').length
    };

    if (this.services.length > 0) {
      this.overallUptime = this.services.reduce((sum, s) => sum + s.uptime, 0) / this.services.length;
    }
  }

  getStatusLabel(status: SiscomexServiceStatus): string {
    const labels: Record<SiscomexServiceStatus, string> = {
      'ONLINE': 'Online',
      'DEGRADED': 'Degradado',
      'OFFLINE': 'Offline',
      'MAINTENANCE': 'Manutenção'
    };
    return labels[status];
  }

  getStatusIcon(status: SiscomexServiceStatus): string {
    const icons: Record<SiscomexServiceStatus, string> = {
      'ONLINE': 'check_circle',
      'DEGRADED': 'warning',
      'OFFLINE': 'cancel',
      'MAINTENANCE': 'build'
    };
    return icons[status];
  }

  getUptimeColor(uptime: number): string {
    if (uptime >= 99) return 'primary';
    if (uptime >= 97) return 'accent';
    return 'warn';
  }

  formatResponseTime(ms: number): string {
    if (ms === 0) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  refreshData(): void {
    this.loadData();
  }
}
