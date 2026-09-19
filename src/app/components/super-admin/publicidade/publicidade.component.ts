import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AdvertisingMockService } from '../../../../services/advertisingMockService';
import { AdCampaign, AdCampaignStatus, Advertiser } from '../../../../types/ad-campaign';

interface ChipView { label: string; color: string; bg: string; }

interface AdKpis {
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
  avgCtr: number;
}

@Component({
  selector: 'app-publicidade',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatMenuModule,
    MatTooltipModule, MatSnackBarModule, MatProgressBarModule,
  ],
  templateUrl: './publicidade.component.html',
  styleUrls: ['./publicidade.component.scss'],
})
export class PublicidadeComponent implements OnInit, AfterViewInit {
  private ads = inject(AdvertisingMockService);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  advertisers: Advertiser[] = [];
  kpis: AdKpis | null = null;

  displayedColumns = [
    'advertiser', 'name', 'placement', 'period', 'status',
    'impressions', 'clicks', 'ctr', 'revenue', 'actions',
  ];
  dataSource = new MatTableDataSource<AdCampaign>([]);

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(): void {
    this.isLoading = true;
    this.ads.getAdvertisers().subscribe((a) => (this.advertisers = a));
    this.ads.getCampaigns().subscribe((c) => {
      this.dataSource.data = c;
      this.buildKpis(c);
      this.isLoading = false;
    });
  }

  private buildKpis(campaigns: AdCampaign[]): void {
    const active = campaigns.filter((c) => c.status === 'ACTIVE');
    const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
    const avgCtr = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;
    this.kpis = {
      activeCampaigns: active.length,
      totalImpressions,
      totalClicks,
      totalRevenue,
      avgCtr: Math.round(avgCtr * 100) / 100,
    };
  }

  trackByCampaignId(_: number, row: AdCampaign): string {
    return row.id;
  }

  trackByAdvertiserId(_: number, row: Advertiser): string {
    return row.id;
  }

  statusView(status: AdCampaignStatus): ChipView {
    switch (status) {
      case 'ACTIVE': return { label: 'Ativa', color: '#2e7d32', bg: '#e8f5e9' };
      case 'PAUSED': return { label: 'Pausada', color: '#ef6c00', bg: '#fff3e0' };
      case 'ENDED': return { label: 'Encerrada', color: '#616161', bg: '#f5f5f5' };
      case 'PENDING_APPROVAL': return { label: 'Aguardando aprovação', color: '#1565c0', bg: '#e3f2fd' };
      case 'DRAFT': return { label: 'Rascunho', color: '#616161', bg: '#f5f5f5' };
      default: return { label: status, color: '#616161', bg: '#f5f5f5' };
    }
  }

  advertiserStatusView(status: Advertiser['status']): ChipView {
    return status === 'ACTIVE'
      ? { label: 'Ativo', color: '#2e7d32', bg: '#e8f5e9' }
      : { label: 'Inativo', color: '#616161', bg: '#f5f5f5' };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }

  formatNumber(n: number): string {
    return new Intl.NumberFormat('pt-BR').format(n || 0);
  }

  private setStatus(row: AdCampaign, status: AdCampaignStatus, msg: string): void {
    this.isLoading = true;
    this.ads.setStatus(row.id, status).subscribe((list) => {
      this.dataSource.data = list;
      this.buildKpis(list);
      this.isLoading = false;
      this.snackBar.open(msg, 'Fechar', { duration: 3000 });
    });
  }

  ativar(row: AdCampaign): void {
    this.setStatus(row, 'ACTIVE', `Campanha "${row.name}" ativada (mock)`);
  }

  pausar(row: AdCampaign): void {
    this.setStatus(row, 'PAUSED', `Campanha "${row.name}" pausada (mock)`);
  }

  encerrar(row: AdCampaign): void {
    this.setStatus(row, 'ENDED', `Campanha "${row.name}" encerrada (mock)`);
  }
}
