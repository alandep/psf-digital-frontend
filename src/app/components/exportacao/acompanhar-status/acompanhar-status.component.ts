import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ExportacaoMockService } from '../../../../services/exportacaoMockService';
import { ExportService } from '../../../../services/exportService';
import { 
  Exportacao, 
  ExportacaoFilterOptions, 
  ExportacaoDashboard, 
  RiskAlert,
  AIAssistantMessage,
  SiscomexIntegration,
  AISuggestion
} from '../../../../types/exportacao';

interface StatusTrackingData {
  exportacao: Exportacao;
  timeline: TimelineEvent[];
  alerts: StatusAlert[];
  predictions: StatusPrediction[];
  siscomexSync: SiscomexSyncStatus;
}

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'delayed' | 'blocked';
  icon: string;
  details?: string;
  documents?: string[];
  estimatedCompletion?: Date;
}

interface StatusAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  actionRequired: boolean;
  suggestedAction?: string;
  exportId: string;
}

interface StatusPrediction {
  category: string;
  confidence: number;
  prediction: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface SiscomexSyncStatus {
  lastSync: Date;
  status: 'synced' | 'pending' | 'error';
  nextSync: Date;
  errorMessage?: string;
}

@Component({
  selector: 'app-acompanhar-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './acompanhar-status.component.html',
  styleUrls: ['./acompanhar-status.component.scss']
})
export class AcompanharStatusComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  // Dados principais
  exportacoes: Exportacao[] = [];
  trackingData: StatusTrackingData[] = [];
  dashboardData!: ExportacaoDashboard;
  alerts: StatusAlert[] = [];
  
  // Controles de filtro
  filterForm!: FormGroup;
  selectedView: 'cards' | 'timeline' | 'table' = 'cards';
  statusFilter: string[] = [];
  priorityFilter: string[] = [];
  
  // Estados da UI
  loading = false;
  realTimeUpdates = true;
  sidenavOpened = false;
  selectedExport: Exportacao | null = null;
  
  // Configurações de atualização
  refreshInterval = 30000; // 30 segundos
  
  // Matríz de dados para tabela
  dataSource = new MatTableDataSource<Exportacao>();
  displayedColumns: string[] = [
    'select',
    'export_number', 
    'product_name', 
    'importer_name',
    'status',
    'progress',
    'eta_delivery',
    'alerts',
    'actions'
  ];

  // Opções de filtro
  statusOptions = [
    { value: 'Draft', label: 'Rascunho', color: 'grey' },
    { value: 'Processing', label: 'Processando', color: 'blue' },
    { value: 'Approved', label: 'Aprovado', color: 'green' },
    { value: 'Shipped', label: 'Embarcado', color: 'indigo' },
    { value: 'Completed', label: 'Concluído', color: 'success' },
    { value: 'Blocked', label: 'Bloqueado', color: 'warn' },
    { value: 'Cancelled', label: 'Cancelado', color: 'red' }
  ];

  priorityOptions = [
    { value: 'Low', label: 'Baixa', color: 'grey' },
    { value: 'Medium', label: 'Média', color: 'orange' },
    { value: 'High', label: 'Alta', color: 'red' },
    { value: 'Critical', label: 'Crítica', color: 'warn' }
  ];

  constructor(
    private exportacaoService: ExportacaoMockService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private exportService: ExportService
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.setupRealTimeUpdates();
    this.generateMockTrackingData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      status: [[]],
      priority: [[]],
      dateFrom: [null],
      dateTo: [null],
      importer: [''],
      product: [''],
      alertsOnly: [false],
      delayedOnly: [false]
    });

    // Reação aos filtros em tempo real
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private loadData(): void {
    this.loading = true;

    // Carrega exportações
    this.exportacaoService.getExportacoes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exportacoes) => {
          this.exportacoes = exportacoes;
          this.dataSource.data = exportacoes;
          this.setupTableConfiguration();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar exportações:', error);
          this.showMessage('Erro ao carregar dados', 'error');
          this.loading = false;
        }
      });

    // Carrega dashboard
    this.exportacaoService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboard) => {
          this.dashboardData = dashboard;
        },
        error: (error) => {
          console.error('Erro ao carregar dashboard:', error);
        }
      });

    // Carrega alertas
    this.loadAlerts();
  }

  private setupTableConfiguration(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  private setupRealTimeUpdates(): void {
    if (this.realTimeUpdates) {
      interval(this.refreshInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.refreshData();
        });
    }
  }

  private generateMockTrackingData(): void {
    this.trackingData = this.exportacoes.map(exp => ({
      exportacao: exp,
      timeline: this.generateTimeline(exp),
      alerts: this.generateAlerts(exp),
      predictions: this.generatePredictions(exp),
      siscomexSync: this.generateSiscomexSync()
    }));
  }

  private generateTimeline(exportacao: Exportacao): TimelineEvent[] {
    const events: TimelineEvent[] = [
      {
        id: '1',
        date: new Date(exportacao.created_at!),
        title: 'Pedido Criado',
        description: 'Exportação iniciada no sistema',
        status: 'completed',
        icon: 'add_circle',
        details: 'Dados iniciais cadastrados com sucesso'
      },
      {
        id: '2', 
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        title: 'Documentação Enviada',
        description: 'Documentos enviados para análise',
        status: exportacao.export_status === 'Draft' ? 'pending' : 'completed',
        icon: 'description',
        documents: ['Fatura Comercial', 'Packing List', 'Certificado de Origem']
      },
      {
        id: '3',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        title: 'Análise Siscomex',
        description: 'Processamento no sistema oficial',  
        status: ['Processing', 'Approved'].includes(exportacao.export_status) ? 'current' : 
                exportacao.export_status === 'Draft' ? 'pending' : 'completed',
        icon: 'verified_user',
        estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    ];

    if (['Approved', 'Processing', 'Shipped', 'Completed'].includes(exportacao.export_status)) {
      events.push({
        id: '4',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        title: 'Embarque Programado', 
        description: 'Carregamento no porto de origem',
        status: exportacao.export_status === 'Approved' ? 'pending' : 
                exportacao.export_status === 'Processing' ? 'current' : 'completed',
        icon: 'local_shipping',
        estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      });
    }

    if (['Shipped', 'Completed'].includes(exportacao.export_status)) {
      events.push({
        id: '5',
        date: exportacao.eta ? new Date(exportacao.eta) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        title: 'Entrega Prevista',
        description: 'Chegada ao destino final',
        status: exportacao.export_status === 'Completed' ? 'completed' : 
                exportacao.export_status === 'Shipped' ? 'current' : 'pending',
        icon: 'flag',
        details: `Porto: ${exportacao.port_destination}`
      });
    }

    return events;
  }

  private generateAlerts(exportacao: Exportacao): StatusAlert[] {
    const alerts: StatusAlert[] = [];

    // Alertas baseados no status
    if (exportacao.export_status === 'Blocked') {
      alerts.push({
        id: `alert_${exportacao.export_id}_1`,
        type: 'critical',
        title: 'Exportação Bloqueada',
        message: 'Documentação requires correção urgente',
        timestamp: new Date(),
        actionRequired: true,
        suggestedAction: 'Verificar documentos pendentes',
        exportId: exportacao.export_id
      });
    }

    // Alertas de prazo
    if (exportacao.eta) {
      const daysToDelivery = Math.ceil((new Date(exportacao.eta).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysToDelivery <= 3 && exportacao.export_status !== 'Shipped') {
        alerts.push({
          id: `alert_${exportacao.export_id}_2`,
          type: 'warning',
          title: 'Prazo de Entrega Apertado',
          message: `Apenas ${daysToDelivery} dias para entrega`,
          timestamp: new Date(),
          actionRequired: true,
          suggestedAction: 'Acelerar processo de embarque',
          exportId: exportacao.export_id
        });
      }
    }

    return alerts;
  }

  private generatePredictions(exportacao: Exportacao): StatusPrediction[] {
    return [
      {
        category: 'Prazo de Entrega',
        confidence: 0.85,
        prediction: 'Entrega dentro do prazo',
        impact: 'low',
        recommendation: 'Continuar monitoramento normal'
      },
      {
        category: 'Documentação',
        confidence: 0.92,
        prediction: 'Aprovação em 24h',
        impact: 'medium', 
        recommendation: 'Preparar documentos de embarque'
      }
    ];
  }

  private generateSiscomexSync(): SiscomexSyncStatus {
    return {
      lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
      status: 'synced',
      nextSync: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
    };
  }

  private loadAlerts(): void {
    // Combina alertas de todas as exportações
    this.alerts = this.trackingData.flatMap(data => data.alerts);
  }

  private applyFilters(): void {
    const filters = this.filterForm.value;
    let filteredData = [...this.exportacoes];

    // Filtro de texto
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredData = filteredData.filter(exp => 
        exp.export_number.toLowerCase().includes(searchLower) ||
        exp.product_name.toLowerCase().includes(searchLower) ||
        exp.importer_name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de status
    if (filters.status?.length > 0) {
      filteredData = filteredData.filter(exp => 
        filters.status.includes(exp.export_status)
      );
    }

    // Filtro apenas com alertas
    if (filters.alertsOnly) {
      const exportsWithAlerts = this.alerts.map(alert => alert.exportId);
      filteredData = filteredData.filter(exp => 
        exportsWithAlerts.includes(exp.export_id)
      );
    }

    // Filtro apenas atrasados
    if (filters.delayedOnly) {
      filteredData = filteredData.filter(exp => {
        if (!exp.eta) return false;
        const today = new Date();
        const delivery = new Date(exp.eta);
        return delivery < today && !['Completed'].includes(exp.export_status);
      });
    }

    this.dataSource.data = filteredData;
  }

  private refreshData(): void {
    // Simula atualização de dados em tempo real
    this.exportacaoService.getExportacoes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(exportacoes => {
        if (JSON.stringify(exportacoes) !== JSON.stringify(this.exportacoes)) {
          this.exportacoes = exportacoes;
          this.dataSource.data = exportacoes;
          this.generateMockTrackingData();
          this.loadAlerts();
          
          this.showMessage('Dados atualizados', 'success');
        }
      });
  }

  // Métodos de UI
  changeView(view: 'cards' | 'timeline' | 'table'): void {
    this.selectedView = view;
  }

  toggleRealTimeUpdates(): void {
    this.realTimeUpdates = !this.realTimeUpdates;
    if (this.realTimeUpdates) {
      this.setupRealTimeUpdates();
      this.showMessage('Atualizações em tempo real ativadas', 'success');
    } else {
      this.showMessage('Atualizações em tempo real desativadas', 'info');
    }
  }

  selectExport(exportacao: Exportacao): void {
    this.selectedExport = exportacao;
    this.sidenavOpened = true;
  }

  getStatusColor(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'grey';
  }

  getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(opt => opt.value === status);
    return statusOption?.label || status;
  }

  getProgressPercentage(status: string): number {
    const progressMap: { [key: string]: number } = {
      'Draft': 10,
      'Processing': 40,
      'Approved': 60,
      'Shipped': 85,
      'Completed': 100,
      'Cancelled': 0,
      'Blocked': 0
    };
    return progressMap[status] || 0;
  }

  getTimelineIcon(event: TimelineEvent): string {
    return event.icon;
  }

  getTimelineStatus(event: TimelineEvent): string {
    switch (event.status) {
      case 'completed': return 'completed';
      case 'current': return 'current'; 
      case 'pending': return 'pending';
      case 'delayed': return 'delayed';
      case 'blocked': return 'blocked';
      default: return 'pending';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning'; 
      case 'info': return 'info';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }

  getAlertColor(type: string): string {
    switch (type) {
      case 'critical': return 'warn';
      case 'warning': return 'accent';
      case 'info': return 'primary';
      case 'success': return 'primary'; 
      default: return 'primary';
    }
  }

  // Actions
  viewDetails(exportacao: Exportacao): void {
    this.router.navigate(['/home-logged/exportacao/detalhes', exportacao.export_id]);
  }

  exportToExcel(): void {
    const columns = [
      { key: 'export_number', label: 'Nº Exportação' },
      { key: 'product_name', label: 'Produto' },
      { key: 'importer_name', label: 'Importador' },
      { key: 'destination_country', label: 'País Destino' },
      { key: 'quantity', label: 'Quantidade' },
      { key: 'total_value', label: 'Valor Total' },
      { key: 'currency', label: 'Moeda' },
      { key: 'incoterm', label: 'Incoterm' },
      { key: 'port_origin', label: 'Porto Origem' },
      { key: 'export_status', label: 'Status' },
      { key: 'eta', label: 'ETA Entrega' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'acompanhar-status-exportacoes');
    this.showMessage('Arquivo exportado com sucesso!', 'success');
  }

  refreshManual(): void {
    this.loading = true; 
    this.refreshData();
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      status: [],
      priority: [],
      dateFrom: null,
      dateTo: null,
      importer: '', 
      product: '',
      alertsOnly: false,
      delayedOnly: false
    });
  }

  resolveAlert(alert: StatusAlert): void {
    this.alerts = this.alerts.filter(a => a.id !== alert.id);
    this.showMessage('Alerta resolvido com sucesso', 'success');
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: [`snack-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  // Método para otimização de performance na lista
  trackByExportId(index: number, item: Exportacao): string {
    return item.export_id;
  }

  // Métodos auxiliares para filtros de alertas
  getAlertsForExport(exportId: string): StatusAlert[] {
    return this.alerts.filter(alert => alert.exportId === exportId);
  }

  hasAlertsForExport(exportId: string): boolean {
    return this.alerts.some(alert => alert.exportId === exportId);
  }

  getAlertCountForExport(exportId: string): number {
    return this.alerts.filter(alert => alert.exportId === exportId).length;
  }

  hasMultipleAlertsForExport(exportId: string): boolean {
    return this.getAlertCountForExport(exportId) > 1;
  }

  // Métodos auxiliares para tipos de alertas
  hasCriticalAlerts(): boolean {
    return this.alerts.some(alert => alert.type === 'critical');
  }

  hasWarningAlerts(): boolean {
    return this.alerts.some(alert => alert.type === 'warning');
  }

  hasInfoAlerts(): boolean {
    return this.alerts.some(alert => alert.type === 'info');
  }

  getCriticalAlertsCount(): number {
    return this.alerts.filter(alert => alert.type === 'critical').length;
  }

  getWarningAlertsCount(): number {
    return this.alerts.filter(alert => alert.type === 'warning').length;
  }

  getInfoAlertsCount(): number {
    return this.alerts.filter(alert => alert.type === 'info').length;
  }

  hasOnlyInfoAlerts(): boolean {
    return !this.hasCriticalAlerts() && !this.hasWarningAlerts() && this.hasInfoAlerts();
  }
}