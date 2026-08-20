import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { AiOperationsMockService } from '../../../../services/aiOperationsMockService';
import { ExportService } from '../../../../services/exportService';
import { AiAgent, AiOperationsMetrics, AiErrorEntry } from '../../../../types/ai-operations';

@Component({
  selector: 'app-ai-operations-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './ai-operations-dashboard.component.html',
  styleUrls: ['./ai-operations-dashboard.component.scss']
})
export class AiOperationsDashboardComponent implements OnInit, OnDestroy {

  private aiOpsService = inject(AiOperationsMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  agents: AiAgent[] = [];
  dataSource = new MatTableDataSource<AiAgent>([]);
  metrics: AiOperationsMetrics | null = null;
  selectedAgent: AiAgent | null = null;
  agentErrors: AiErrorEntry[] = [];
  lowAccuracyAgents: AiAgent[] = [];

  isLoading = false;
  isDetailOpen = false;
  filterForm!: FormGroup;

  modules: string[] = [];

  displayedColumns: string[] = [
    'name', 'module', 'requests24h', 'avgResponseTime',
    'accuracy', 'cost', 'status', 'lastError'
  ];

  errorColumns: string[] = ['timestamp', 'type', 'message'];

  ngOnInit(): void {
    this.initForms();
    this.loadAgents();
    this.loadMetrics();
    this.loadLowAccuracyAgents();
    this.modules = this.aiOpsService.getModules();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      status: [''],
      module: ['']
    });
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
  }

  loadAgents(): void {
    this.isLoading = true;
    this.aiOpsService.getAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.agents = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar agentes', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.aiOpsService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  loadLowAccuracyAgents(): void {
    this.aiOpsService.getLowAccuracyAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(agents => this.lowAccuracyAgents = agents);
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.aiOpsService.getAgents(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.agents = data;
        this.dataSource.data = data;
      });
  }

  selectAgent(agent: AiAgent): void {
    this.selectedAgent = agent;
    this.isDetailOpen = true;
    this.aiOpsService.getAgentErrors(agent.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(errors => this.agentErrors = errors);
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedAgent = null;
    this.agentErrors = [];
  }

  exportCSV(): void {
    const columns = [
      { key: 'name', label: 'Agente' },
      { key: 'module', label: 'Módulo' },
      { key: 'requests24h', label: 'Requests (24h)' },
      { key: 'avgResponseTime', label: 'Tempo Resp. (ms)' },
      { key: 'accuracy', label: 'Acurácia (%)' },
      { key: 'cost', label: 'Custo (USD)' },
      { key: 'status', label: 'Status' }
    ];
    this.exportService.exportToCSV(this.agents, columns, 'ai-operations-agents');
  }

  // Helper methods
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'Ativo', 'DEGRADED': 'Degradado', 'OFFLINE': 'Offline', 'MAINTENANCE': 'Manutenção'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  isLowAccuracy(agent: AiAgent): boolean {
    return agent.accuracy < 85;
  }

  formatResponseTime(ms: number): string {
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
    return ms + 'ms';
  }

  formatCost(cost: number): string {
    return '$' + cost.toFixed(2);
  }

  formatDateTime(date: Date | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('pt-BR');
  }

  getAccuracyColor(accuracy: number): string {
    if (accuracy >= 95) return '#4caf50';
    if (accuracy >= 90) return '#8bc34a';
    if (accuracy >= 85) return '#ff9800';
    return '#f44336';
  }
}
