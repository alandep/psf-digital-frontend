import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EmbarqueMockService } from '../../../../../services/embarqueMockService';
import { Embarque, EmbarqueFilters } from '../../../../../types/embarque';
import { ConfirmarAcaoDialogComponent, ConfirmDialogData } from '../../../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { HasPermissionDirective } from '../../../../directives/has-permission.directive';

@Component({
  selector: 'app-embarque-lista',
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
    MatListModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    HasPermissionDirective
  ],
  templateUrl: './embarque-lista.component.html',
  styleUrls: ['./embarque-lista.component.scss']
})
export class EmbarqueListaComponent implements OnInit {
  embarques: Embarque[] = [];
  filteredEmbarques: Embarque[] = [];
  loading = false;
  searchForm: FormGroup;
  
  // Novo modo de visualização
  viewMode: 'table' | 'cards' = 'table';
  
  // Propriedades para paginação e controle
  totalItems = 0;
  currentPage = 1;
  itemsPerPage = 25;

  // Dashboard Metrics - Mock Data
  dashboardMetrics = {
    activeShipments: 42,
    activeShipmentsTrend: 12.5,
    aiAlerts: 8,
    alertTypes: [
      { type: 'delay', count: 3, message: 'Atrasos previstos' },
      { type: 'weather', count: 2, message: 'Alertas meteorológicos' },
      { type: 'customs', count: 3, message: 'Questões aduaneiras' }
    ],
    pendingDocs: 15,
    pendingDUE: 7,
    pendingVigiagro: 8,
    aiETAAccuracy: 94.2,
    costSavings: 45000
  };

  // Real-time Alerts - Mock Data
  realTimeAlerts = [
    {
      id: 1,
      type: 'delay',
      severity: 'warning',
      message: 'Embarque SHIP-2024-001 com atraso previsto de 2 dias',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      shipmentId: 'SHIP-2024-001'
    },
    {
      id: 2,
      type: 'weather',
      severity: 'danger',
      message: 'Tempestade tropical detectada na rota Santos-Miami',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
      shipmentId: null
    },
    {
      id: 3,
      type: 'customs',
      severity: 'info',
      message: 'DU-E DUE26040001 aprovada pela Receita Federal',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      shipmentId: 'SHIP-2024-003'
    }
  ];
  
  // Material Table
  displayedColumns: string[] = [
    'shipment_number',
    'contract_id',
    'exporter_name', 
    'commodity',
    'quantity',
    'vessel_name',
    'ports_detail',
    'route',
    'departure_date',
    'arrival_date',
    'shipment_status',
    'tracking_status',
    'ai_status',
    'documentation_status',
    'delay_risk_score',
    'last_update',
    'actions'
  ];
  
  // Filtros
  statusOptions = ['Planned', 'Booked', 'In Transit', 'Delivered', 'Delayed'];
  trackingStatusOptions = ['On Time', 'Delayed', 'Risk'];
  
  // Ordenação
  sortField = 'last_update';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private embarqueService: EmbarqueMockService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      shipment_status: [''],
      tracking_status: [''],
      exporter_name: [''],
      commodity: [''],
      port_origin: [''],
      port_destination: [''],
      date_range_start: [''],
      date_range_end: ['']
    });
  }

  ngOnInit() {
    this.loadEmbarques();
    this.setupFormSubscription();
  }

  loadEmbarques() {
    this.loading = true;
    const filters: EmbarqueFilters = this.searchForm.value;
    
    this.embarqueService.getEmbarques(filters).subscribe({
      next: (embarques: Embarque[]) => {
        this.embarques = embarques;
        this.applyLocalFilters();
        this.loading = false;
      },
      error: () => {
        this.notify('Erro ao carregar embarques.');
        this.loading = false;
      }
    });
  }

  setupFormSubscription() {
    this.searchForm.valueChanges.subscribe(() => {
      this.loadEmbarques();
    });
  }

  applyLocalFilters() {
    this.filteredEmbarques = [...this.embarques];
    this.totalItems = this.filteredEmbarques.length;
    this.sortEmbarques();
    this.paginateEmbarques();
  }

  sortEmbarques() {
    this.filteredEmbarques.sort((a, b) => {
      let aValue = this.getFieldValue(a, this.sortField);
      let bValue = this.getFieldValue(b, this.sortField);
      
      if (aValue === null) aValue = '';
      if (bValue === null) bValue = '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, i) => o?.[i], obj);
  }

  paginateEmbarques() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredEmbarques = this.filteredEmbarques.slice(start, end);
  }

  onSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyLocalFilters();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.paginateEmbarques();
  }

  clearFilters() {
    this.searchForm.reset();
    this.currentPage = 1;
    this.loadEmbarques();
  }

  createEmbarque() {
    this.router.navigate(['/home-logged/logistica/embarque/novo']);
  }

  editEmbarque(embarque: Embarque) {
    this.router.navigate(['/home-logged/logistica/embarque/editar', embarque.shipment_id]);
  }

  viewEmbarque(embarque: Embarque) {
    this.router.navigate(['/home-logged/logistica/embarque/detalhes', embarque.shipment_id]);
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  deleteEmbarque(embarque: Embarque) {
    const data: ConfirmDialogData = {
      title: 'Excluir Embarque',
      message: `Confirma a exclusão do embarque ${embarque.shipment_number}? Esta ação não poderá ser desfeita.`,
      icon: 'delete',
      iconColor: '#f44336',
      confirmText: 'Excluir',
      confirmColor: 'warn'
    };

    this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '420px',
      data
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.loading = true;
      this.embarqueService.deleteEmbarque(embarque.shipment_id).subscribe({
        next: (success: boolean) => {
          if (success) {
            this.notify(`Embarque ${embarque.shipment_number} excluído com sucesso.`);
            this.loadEmbarques();
          } else {
            this.loading = false;
            this.notify('Não foi possível excluir o embarque.');
          }
        },
        error: () => {
          this.loading = false;
          this.notify('Erro ao excluir o embarque.');
        }
      });
    });
  }

  getStatusChipClass(status: string): string {
    switch (status) {
      case 'Planned': return 'status-planned';
      case 'Booked': return 'status-booked';
      case 'In Transit': return 'status-in-transit';
      case 'Delivered': return 'status-delivered';
      case 'Delayed': return 'status-delayed';
      default: return 'status-default';
    }
  }

  getTrackingChipClass(status: string): string {
    switch (status) {
      case 'On Time': return 'tracking-on-time';
      case 'Delayed': return 'tracking-delayed';
      case 'Risk': return 'tracking-risk';
      default: return 'tracking-default';
    }
  }

  // Métodos legados para compatibilidade (podem ser removidos após migração completa)
  getStatusBadgeClass(status: string): string {
    return this.getStatusChipClass(status);
  }

  getTrackingStatusBadgeClass(status: string): string {
    return this.getTrackingChipClass(status);
  }

  getRiskScoreClass(score?: number): string {
    if (!score) return 'text-muted';
    if (score < 20) return 'text-success';
    if (score < 50) return 'text-warning';
    return 'text-danger';
  }

  formatCurrency(value?: number): string {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date?: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatQuantity(quantity: number, unit: string): string {
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  }

  exportToExcel() {
    this.notify('Exportação para Excel iniciada. O arquivo será disponibilizado em instantes.');
  }

  generateReport() {
    this.notify('Geração de relatório iniciada. Você será notificado quando estiver pronto.');
  }

  refreshData() {
    this.loadEmbarques();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const maxVisible = 5;
    const pages: number[] = [];
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Expose Math to template
  Math = Math;

  // Dashboard and Alert Methods - Mock Implementations
  getAlertTypeClass(type: string): string {
    switch (type) {
      case 'delay': return 'text-warning';
      case 'weather': return 'text-info';
      case 'customs': return 'text-success';
      default: return 'text-muted';
    }
  }

  getAlertTypeIcon(type: string): string {
    switch (type) {
      case 'delay': return 'schedule';
      case 'weather': return 'cloud';
      case 'customs': return 'gavel';
      default: return 'info';
    }
  }

  getAlertSeverityClass(severity: string): string {
    switch (severity) {
      case 'danger': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      case 'success': return 'alert-success';
      default: return 'alert-secondary';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'delay': return 'access_time';
      case 'weather': return 'wb_cloudy';
      case 'customs': return 'account_balance';
      case 'document': return 'description';
      case 'system': return 'settings';
      default: return 'notification_important';
    }
  }

  formatAlertTime(timestamp: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Agora';
    if (diff < 60) return `${diff}min atrás`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h atrás`;
    return timestamp.toLocaleDateString('pt-BR');
  }

  dismissAlert(alert: any): void {
    const index = this.realTimeAlerts.findIndex(a => a.id === alert.id);
    if (index > -1) {
      this.realTimeAlerts.splice(index, 1);
      this.notify('Alerta dispensado.');
    }
  }

  getVigiAgroStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'text-success';
      case 'Pending': return 'text-warning';
      case 'Rejected': return 'text-danger';
      default: return 'text-muted';
    }
  }

  formatDateTime(date?: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // Action Methods - feedback ao usuário via MatSnackBar
  trackingEmbarque(embarque: Embarque): void {
    this.notify(`Abrindo rastreamento em tempo real do embarque ${embarque.shipment_number}.`);
  }

  generateDocuments(embarque: Embarque): void {
    this.notify(`Gerando documentos do embarque ${embarque.shipment_number}.`);
  }

  sendDUE(embarque: Embarque): void {
    this.notify(`DU-E do embarque ${embarque.shipment_number} enviada para processamento.`);
  }

  downloadBL(embarque: Embarque): void {
    this.notify(`Download do Bill of Lading do embarque ${embarque.shipment_number} iniciado.`);
  }

  simulateRoute(embarque: Embarque): void {
    this.notify(`Simulação de rota com IA iniciada para o embarque ${embarque.shipment_number}.`);
  }

  optimizeCargo(embarque: Embarque): void {
    this.notify(`Otimização de carga com IA iniciada para o embarque ${embarque.shipment_number}.`);
  }

  predictETA(embarque: Embarque): void {
    this.notify(`Previsão inteligente de ETA calculada para o embarque ${embarque.shipment_number}.`);
  }

  toggleAutoTracking(embarque: Embarque): void {
    embarque.ai_auto_tracking = !embarque.ai_auto_tracking;
    this.notify(`Rastreamento automático ${embarque.ai_auto_tracking ? 'ativado' : 'desativado'} para o embarque ${embarque.shipment_number}.`);
  }

  checkSiscomex(embarque: Embarque): void {
    this.notify(`Verificação no Siscomex iniciada para o embarque ${embarque.shipment_number}.`);
  }

  validateVigiagro(embarque: Embarque): void {
    this.notify(`Validação Vigiagro iniciada para o embarque ${embarque.shipment_number}.`);
  }

  duplicateEmbarque(embarque: Embarque): void {
    this.notify(`Embarque ${embarque.shipment_number} duplicado com sucesso.`);
  }

  exportEmbarqueData(embarque: Embarque): void {
    this.notify(`Exportação dos dados do embarque ${embarque.shipment_number} iniciada.`);
  }

  viewAuditLog(embarque: Embarque): void {
    this.notify(`Abrindo log de auditoria do embarque ${embarque.shipment_number}.`);
  }


  
  // Novos métodos para a interface melhorada
  
  // TrackBy functions para performance
  trackByEmbarqueId(index: number, item: Embarque): string {
    return item.shipment_id || index.toString();
  }
  
  trackByAlertId(index: number, item: any): number {
    return item.id || index;
  }
  
  // Métodos para status e classes CSS
  getStatusAvatarClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'planned': return 'avatar-planned';
      case 'booked': return 'avatar-booked';
      case 'in transit': case 'in-transit': return 'avatar-transit';
      case 'delivered': return 'avatar-delivered';
      case 'delayed': return 'avatar-delayed';
      default: return 'avatar-default';
    }
  }
  
  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'planned': return 'schedule';
      case 'booked': return 'book_online';
      case 'in transit': case 'in-transit': return 'local_shipping';
      case 'delivered': return 'check_circle';
      case 'delayed': return 'warning';
      default: return 'help';
    }
  }
  
  getRiskIconClass(riskScore: number): string {
    if (riskScore <= 20) return 'risk-low';
    if (riskScore <= 50) return 'risk-medium';
    return 'risk-high';
  }
}