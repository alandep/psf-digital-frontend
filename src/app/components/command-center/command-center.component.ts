import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { CommandCenterMockService } from '../../../services/commandCenterMockService';
import { ExportService } from '../../../services/exportService';
import { ActiveOperation, CommandCenterMetrics } from '../../../types/command-center';

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonToggleModule
  ],
  templateUrl: './command-center.component.html',
  styleUrls: ['./command-center.component.scss']
})
export class CommandCenterComponent implements OnInit, OnDestroy, AfterViewInit {

  private commandCenterService = inject(CommandCenterMockService);
  private exportService = inject(ExportService);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  operations: ActiveOperation[] = [];
  dataSource = new MatTableDataSource<ActiveOperation>([]);
  metrics: CommandCenterMetrics | null = null;
  selectedOperation: ActiveOperation | null = null;
  viewMode: 'operations' | 'digital-twin' = 'operations';
  lastUpdated: string = '';
  isLoading = false;

  displayedColumns: string[] = [
    'exportId', 'customer', 'product', 'origin', 'destination',
    'currentStatus', 'eta', 'riskLevel', 'value'
  ];

  ngOnInit(): void {
    this.loadData();
    this.setupAutoRefresh();
    this.updateTimestamp();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadData(): void {
    this.isLoading = true;
    this.commandCenterService.getActiveOperations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ops => {
        this.operations = ops;
        this.dataSource.data = ops;
        this.isLoading = false;
      });

    this.commandCenterService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(m => this.metrics = m);
  }

  private setupAutoRefresh(): void {
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadData();
        this.updateTimestamp();
      });
  }

  private updateTimestamp(): void {
    const now = new Date();
    this.lastUpdated = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  selectOperation(op: ActiveOperation): void {
    this.selectedOperation = this.selectedOperation?.id === op.id ? null : op;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ON_TIME': return '#4caf50';
      case 'AT_RISK': return '#ff9800';
      case 'DELAYED': return '#f44336';
      default: return '#9e9e9e';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ON_TIME': return 'No Prazo';
      case 'AT_RISK': return 'Em Risco';
      case 'DELAYED': return 'Atrasado';
      default: return status;
    }
  }

  getRiskColor(risk: string): string {
    switch (risk) {
      case 'LOW': return '#4caf50';
      case 'MEDIUM': return '#ff9800';
      case 'HIGH': return '#f44336';
      default: return '#9e9e9e';
    }
  }

  getRiskLabel(risk: string): string {
    switch (risk) {
      case 'LOW': return 'Baixo';
      case 'MEDIUM': return 'Médio';
      case 'HIGH': return 'Alto';
      default: return risk;
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'operations' ? 'digital-twin' : 'operations';
  }

  exportToCSV(): void {
    const columns = [
      { key: 'exportId', label: 'Export ID' },
      { key: 'customer', label: 'Cliente' },
      { key: 'product', label: 'Produto' },
      { key: 'origin', label: 'Origem' },
      { key: 'destination', label: 'Destino' },
      { key: 'currentStatus', label: 'Status' },
      { key: 'eta', label: 'ETA' },
      { key: 'riskLevel', label: 'Risco' },
      { key: 'value', label: 'Valor (USD)' }
    ];
    this.exportService.exportToCSV(this.operations, columns, 'command-center-operations');
  }

  exportToPDF(): void {
    const columns = [
      { key: 'exportId', label: 'Export ID' },
      { key: 'customer', label: 'Cliente' },
      { key: 'product', label: 'Produto' },
      { key: 'destination', label: 'Destino' },
      { key: 'currentStatus', label: 'Status' },
      { key: 'value', label: 'Valor (USD)' }
    ];
    this.exportService.exportToPDF('Command Center - Operações Ativas', this.operations, columns, 'command-center');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
