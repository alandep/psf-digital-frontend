import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { LeadsMockService } from '../../../../services/leadsMockService';
import { ChannelConversion } from '../../../../types/lead';

interface ConversionKpis {
  totalLeads: number;
  totalTrials: number;
  totalCustomers: number;
  avgConversion: number;
}

interface ConversionBar {
  channel: string;
  conversionPercent: number;
  percentWidth: number;
}

@Component({
  selector: 'app-conversao',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatTableModule, MatProgressBarModule,
  ],
  templateUrl: './conversao.component.html',
  styleUrls: ['./conversao.component.scss'],
})
export class ConversaoComponent implements OnInit {
  private leadsService = inject(LeadsMockService);

  isLoading = false;
  kpis: ConversionKpis | null = null;

  displayedColumns = ['channel', 'leads', 'trials', 'customers', 'conversionPercent'];
  channels: ChannelConversion[] = [];
  bars: ConversionBar[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.leadsService.getChannelConversion().subscribe((data) => {
      this.channels = data;
      this.buildKpis(data);
      this.buildBars(data);
      this.isLoading = false;
    });
  }

  private buildKpis(data: ChannelConversion[]): void {
    const totalLeads = data.reduce((s, c) => s + c.leads, 0);
    const totalTrials = data.reduce((s, c) => s + c.trials, 0);
    const totalCustomers = data.reduce((s, c) => s + c.customers, 0);
    const avgConversion = totalLeads ? (totalCustomers / totalLeads) * 100 : 0;
    this.kpis = {
      totalLeads,
      totalTrials,
      totalCustomers,
      avgConversion: Math.round(avgConversion * 100) / 100,
    };
  }

  private buildBars(data: ChannelConversion[]): void {
    const max = Math.max(...data.map((c) => c.conversionPercent), 1);
    this.bars = data.map((c) => ({
      channel: c.channel,
      conversionPercent: c.conversionPercent,
      percentWidth: Math.round((c.conversionPercent / max) * 100),
    }));
  }

  trackByChannel(_: number, row: ChannelConversion): string {
    return row.channel;
  }

  trackByBar(_: number, row: ConversionBar): string {
    return row.channel;
  }
}
