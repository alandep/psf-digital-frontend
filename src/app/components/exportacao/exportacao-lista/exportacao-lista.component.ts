import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ExportacaoMockService } from '../../../../services/exportacaoMockService';
import {
  ConfirmarAcaoDialogComponent,
  ConfirmDialogData
} from '../../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { 
  Exportacao, 
  ExportacaoFilterOptions, 
  ExportacaoDashboard, 
  RiskAlert,
  AIAssistantMessage 
} from '../../../../types/exportacao';
import {
  AiAssistantDialogComponent,
  AiAssistantDialogData
} from '../ai-assistant-dialog/ai-assistant-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-exportacao-lista',
  standalone: true,
  imports: [
    HasPermissionDirective,
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
    MatProgressBarModule,
    MatBadgeModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './exportacao-lista.component.html',
  styleUrls: ['./exportacao-lista.component.scss']
})
export class ExportacaoListaComponent implements OnInit, AfterViewInit {
  
  // Dados principais
  exportacoes: Exportacao[] = [];
  dataSource = new MatTableDataSource<Exportacao>([]);
  dashboardData: ExportacaoDashboard | null = null;
  loading = false;
  
  // Formulário de filtros
  searchForm: FormGroup;

  // Paginação / ordenação
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  // Tabela
  displayedColumns: string[] = [
    'export_number',
    'product_name', 
    'importer_name',
    'destination_country',
    'quantity_value',
    'status_compliance',
    'ai_scores',
    'etd_eta',
    'siscomex_status',
    'actions'
  ];
  
  // Filtros disponíveis
  statusOptions = ['Draft', 'Processing', 'Approved', 'Shipped', 'Completed', 'Blocked'];
  complianceOptions = ['OK', 'Warning', 'Error', 'Pending'];
  
  // Assistente IA
  aiMessages: AIAssistantMessage[] = [];

  // Comando NLP
  nlpCommand = '';
  nlpProcessing = false;

  constructor(
    private exportacaoService: ExportacaoMockService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.searchForm = this.fb.group({
      export_status: [''],
      compliance_status: [''],
      destination_country: [''],
      product_name: [''],
      importer_name: [''],
      date_range_start: [''],
      date_range_end: [''],
      ai_risk_score_min: [''],
      ai_risk_score_max: ['']
    });
  }

  ngOnInit(): void {
    this.loadExportacoes();
    this.loadDashboardData();
    this.setupFormSubscription();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: Exportacao, property: string) => {
      switch (property) {
        case 'export_number': return item.export_number;
        case 'product_name': return item.product_name;
        case 'importer_name': return item.importer_name;
        case 'destination_country': return item.destination_country;
        case 'quantity_value': return item.total_value;
        case 'status_compliance': return item.export_status;
        case 'etd_eta': return item.etd ? new Date(item.etd).getTime() : 0;
        case 'siscomex_status': return item.siscomex_status || '';
        default: return (item as any)[property];
      }
    };
  }

  loadExportacoes(): void {
    this.loading = true;
    const filters: ExportacaoFilterOptions = this.searchForm.value;
    
    this.exportacaoService.getExportacoes(filters).subscribe({
      next: (exportacoes: Exportacao[]) => {
        this.exportacoes = exportacoes;
        this.applyLocalFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar exportações:', error);
        this.loading = false;
      }
    });
  }

  loadDashboardData(): void {
    this.exportacaoService.getDashboardData().subscribe({
      next: (dashboard: ExportacaoDashboard) => {
        this.dashboardData = dashboard;
      },
      error: (error: any) => {
        console.error('Erro ao carregar dashboard:', error);
      }
    });
  }

  setupFormSubscription(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.applyLocalFilters();
    });
  }

  applyLocalFilters(): void {
    this.dataSource.data = [...this.exportacoes];
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  get totalItems(): number {
    return this.dataSource.data.length;
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.loadExportacoes();
  }

  // Navegação
  createExportacao(): void {
    this.router.navigate(['/home-logged/exportacao/novo']);
  }

  editExportacao(exportacao: Exportacao): void {
    this.router.navigate(['/home-logged/exportacao/editar', exportacao.export_id]);
  }

  viewExportacao(exportacao: Exportacao): void {
    this.router.navigate(['/home-logged/exportacao/detalhes', exportacao.export_id]);
  }

  /** Navega para os detalhes da exportação relacionada a um alerta de risco. */
  openAlert(alert: RiskAlert): void {
    if (alert?.export_id) {
      this.router.navigate(['/home-logged/exportacao/detalhes', alert.export_id]);
    }
  }

  duplicateExportacao(exportacao: Exportacao): void {
    this.loading = true;

    // Constrói uma cópia da exportação: remove identificadores/carimbos únicos
    // para que o serviço gere novos, e reseta o status para 'Draft'.
    const {
      export_id,
      export_number,
      created_at,
      updated_at,
      created_by,
      created_by_name,
      updated_by,
      updated_by_name,
      siscomex_status,
      siscomex_sent_date,
      siscomex_response,
      due_number,
      ...rest
    } = exportacao as any;

    const copy: Partial<Exportacao> = {
      ...rest,
      export_status: 'Draft',
      siscomex_status: 'Not Sent'
    };

    this.exportacaoService.createExportacao(copy).subscribe({
      next: () => {
        this.loadExportacoes();
        this.showSnack('Exportação duplicada com sucesso');
      },
      error: (error: any) => {
        console.error('Erro ao duplicar exportação:', error);
        this.loading = false;
        this.showSnack('Erro ao duplicar a exportação', true);
      }
    });
  }

  deleteExportacao(exportacao: Exportacao): void {
    const data: ConfirmDialogData = {
      title: 'Excluir Exportação',
      message: `Tem certeza que deseja excluir a exportação ${exportacao.export_number}? Esta ação não pode ser desfeita.`,
      icon: 'delete',
      iconColor: '#f44336',
      confirmText: 'Excluir',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      data,
      width: '420px',
      panelClass: 'rounded-dialog'
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      this.loading = true;
      this.exportacaoService.deleteExportacao(exportacao.export_id).subscribe({
        next: (success: boolean) => {
          if (success) {
            this.loadExportacoes();
            this.showSnack('Exportação excluída com sucesso');
          } else {
            this.loading = false;
            this.showSnack('Não foi possível excluir a exportação', true);
          }
        },
        error: (error: any) => {
          console.error('Erro ao excluir exportação:', error);
          this.loading = false;
          this.showSnack('Erro ao excluir a exportação', true);
        }
      });
    });
  }

  // Funcionalidades IA
  processNLPCommand(): void {
    if (!this.nlpCommand.trim()) return;
    
    this.nlpProcessing = true;
    this.exportacaoService.createExportacaoByNLP(this.nlpCommand).subscribe({
      next: (exportacao: Exportacao) => {
        this.nlpCommand = '';
        this.nlpProcessing = false;
        this.loadExportacoes();
        this.showSnack('Exportação criada com sucesso via IA');
        // Navegar para edição
        this.editExportacao(exportacao);
      },
      error: (error: any) => {
        console.error('Erro no processamento NLP:', error);
        this.nlpProcessing = false;
        this.showSnack('Erro ao criar exportação via IA', true);
      }
    });
  }

  processOCRUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    this.loading = true;
    this.exportacaoService.processOCRDocument(file).subscribe({
      next: (exportacao: Exportacao) => {
        this.loading = false;
        this.loadExportacoes();
        this.showSnack('Exportação criada com sucesso via OCR');
        // Navegar para edição
        this.editExportacao(exportacao);
      },
      error: (error: any) => {
        console.error('Erro no processamento OCR:', error);
        this.loading = false;
        this.showSnack('Erro ao processar o documento via OCR', true);
      }
    });
  }

  // Assistente IA - abre o diálogo centralizado compartilhado
  toggleAIAssistant(): void {
    const data: AiAssistantDialogData = {
      messages: this.aiMessages,
      onSend: (query: string) => this.exportacaoService.processAIQuery(query)
    };

    this.dialog.open(AiAssistantDialogComponent, {
      data,
      width: '560px',
      maxWidth: '92vw',
      autoFocus: true,
      panelClass: 'ai-assistant-dialog-panel'
    });
  }

  // Ações rápidas
  generateDocuments(exportacao: Exportacao): void {
    this.loading = true;
    this.exportacaoService.generateDocuments(exportacao.export_id).subscribe({
      next: (success: boolean) => {
        this.loading = false;
        if (success) {
          this.showSnack('Documentos gerados com sucesso');
        } else {
          this.showSnack('Não foi possível gerar os documentos', true);
        }
      },
      error: (error: any) => {
        console.error('Erro ao gerar documentos:', error);
        this.loading = false;
        this.showSnack('Erro ao gerar os documentos', true);
      }
    });
  }

  sendToSiscomex(exportacao: Exportacao): void {
    this.loading = true;
    this.exportacaoService.sendToSiscomex(exportacao.export_id).subscribe({
      next: () => {
        this.loadExportacoes();
        this.showSnack('Exportação enviada para o Siscomex');
      },
      error: (error: any) => {
        console.error('Erro ao enviar para o Siscomex:', error);
        this.loading = false;
        this.showSnack('Erro ao enviar para o Siscomex', true);
      }
    });
  }

  validateExportacao(exportacao: Exportacao): void {
    this.loading = true;
    this.exportacaoService.validateExportacao(exportacao.export_id).subscribe({
      next: (result: { valid: boolean; errors: string[] }) => {
        this.loading = false;
        if (result.valid) {
          this.showSnack('Validação concluída: exportação em conformidade');
        } else {
          const count = result.errors?.length ?? 0;
          this.showSnack(
            `Validação encontrou ${count} pendência(s)`,
            false,
            6000
          );
        }
      },
      error: (error: any) => {
        console.error('Erro ao validar exportação:', error);
        this.loading = false;
        this.showSnack('Erro ao validar a exportação', true);
      }
    });
  }

  /** Exibe uma mensagem de feedback ao usuário via snackbar. */
  private showSnack(message: string, isError = false, duration = 4000): void {
    this.snackBar.open(message, 'Fechar', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: isError ? ['snack-error'] : ['snack-success']
    });
  }

  // Métodos de formatação e utilidade
  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  formatQuantity(quantity: number, unit: string): string {
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  formatDateTime(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusChipClass(status: string): string {
    switch (status) {
      case 'Draft': return 'status-draft';
      case 'Processing': return 'status-processing';
      case 'Approved': return 'status-approved';
      case 'Shipped': return 'status-shipped';
      case 'Completed': return 'status-completed';
      case 'Blocked': return 'status-blocked';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  getComplianceChipClass(status: string): string {
    switch (status) {
      case 'OK': return 'compliance-ok';
      case 'Warning': return 'compliance-warning';
      case 'Error': return 'compliance-error';
      case 'Pending': return 'compliance-pending';
      default: return 'compliance-default';
    }
  }

  getRiskScoreClass(score: number): string {
    if (score <= 20) return 'risk-low';
    if (score <= 50) return 'risk-medium';
    return 'risk-high';
  }

  getSiscomexStatusClass(status: string | undefined): string {
    switch (status) {
      case 'Approved': return 'siscomex-approved';
      case 'Processing': return 'siscomex-processing';
      case 'Rejected': return 'siscomex-rejected';
      case 'Sent': return 'siscomex-sent';
      default: return 'siscomex-not-sent';
    }
  }

  getSiscomexStatusIcon(status: string | undefined): string {
    switch (status) {
      case 'Approved': return 'check_circle';
      case 'Processing': return 'sync';
      case 'Rejected': return 'error';
      case 'Sent': return 'send';
      default: return 'help_outline';
    }
  }

  trackByExportacaoId(index: number, item: Exportacao): string {
    return item.export_id;
  }

  trackByAlertId(index: number, item: RiskAlert): string {
    return item.id;
  }

  // Métodos para dashboard
  getTrendIcon(value: number): string {
    return value >= 0 ? 'trending_up' : 'trending_down';
  }

  getTrendClass(value: number): string {
    return value >= 0 ? 'trend-positive' : 'trend-negative';
  }

  // Utilitários
  private generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  // Expose Math to template
  Math = Math;
}
