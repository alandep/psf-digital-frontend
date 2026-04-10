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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';

import { ExportacaoMockService } from '../../../../services/exportacaoMockService';
import { 
  Exportacao, 
  ExportacaoFilterOptions, 
  ExportacaoDashboard, 
  RiskAlert,
  AIAssistantMessage 
} from '../../../../types/exportacao';

@Component({
  selector: 'app-exportacao-lista',
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
    MatDialogModule
  ],
  templateUrl: './exportacao-lista.component.html',
  styleUrls: ['./exportacao-lista.component.scss']
})
export class ExportacaoListaComponent implements OnInit {
  
  // Dados principais
  exportacoes: Exportacao[] = [];
  filteredExportacoes: Exportacao[] = [];
  dashboardData: ExportacaoDashboard | null = null;
  loading = false;
  
  // Formulário de filtros
  searchForm: FormGroup;
  
  // Controles de visualização
  viewMode: 'table' | 'cards' | 'kanban' = 'table';
  showAIAssistant = false;
  
  // Paginação
  currentPage = 1;
  itemsPerPage = 25;
  totalItems = 0;
  
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
  aiQuery = '';
  aiProcessing = false;
  
  // Comando NLP
  nlpCommand = '';
  nlpProcessing = false;

  constructor(
    private exportacaoService: ExportacaoMockService,
    private fb: FormBuilder,
    private router: Router
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
    this.filteredExportacoes = [...this.exportacoes];
    this.totalItems = this.filteredExportacoes.length;
    this.paginateExportacoes();
  }

  paginateExportacoes(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredExportacoes = this.filteredExportacoes.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyLocalFilters();
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.currentPage = 1;
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

  duplicateExportacao(exportacao: Exportacao): void {
    // Implementar duplicação
    console.log('Duplicando exportação:', exportacao.export_number);
  }

  deleteExportacao(exportacao: Exportacao): void {
    if (confirm(`Confirma a exclusão da exportação ${exportacao.export_number}?`)) {
      this.loading = true;
      this.exportacaoService.deleteExportacao(exportacao.export_id).subscribe({
        next: (success: boolean) => {
          if (success) {
            this.loadExportacoes();
          }
        },
        error: (error: any) => {
          console.error('Erro ao excluir exportação:', error);
          this.loading = false;
        }
      });
    }
  }

  // Funcionalidades IA
  processNLPCommand(): void {
    if (!this.nlpCommand.trim()) return;
    
    this.nlpProcessing = true;
    this.exportacaoService.createExportacaoByNLP(this.nlpCommand).subscribe({
      next: (exportacao: Exportacao) => {
        console.log('Exportação criada via IA:', exportacao.export_number);
        this.nlpCommand = '';
        this.nlpProcessing = false;
        this.loadExportacoes();
        // Navegar para edição
        this.editExportacao(exportacao);
      },
      error: (error: any) => {
        console.error('Erro no processamento NLP:', error);
        this.nlpProcessing = false;
      }
    });
  }

  processOCRUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    this.loading = true;
    this.exportacaoService.processOCRDocument(file).subscribe({
      next: (exportacao: Exportacao) => {
        console.log('Exportação criada via OCR:', exportacao.export_number);
        this.loading = false;
        this.loadExportacoes();
        // Navegar para edição
        this.editExportacao(exportacao);
      },
      error: (error: any) => {
        console.error('Erro no processamento OCR:', error);
        this.loading = false;
      }
    });
  }

  // Assistente IA
  toggleAIAssistant(): void {
    this.showAIAssistant = !this.showAIAssistant;
    console.log('🤖 AI Assistant toggled:', this.showAIAssistant ? 'OPENED' : 'CLOSED');
  }

  sendAIQuery(): void {
    if (!this.aiQuery.trim()) return;
    
    this.aiProcessing = true;
    this.exportacaoService.processAIQuery(this.aiQuery).subscribe({
      next: (messages: AIAssistantMessage[]) => {
        this.aiMessages.push(...messages);
        this.aiQuery = '';
        this.aiProcessing = false;
      },
      error: (error: any) => {
        console.error('Erro na consulta IA:', error);
        this.aiProcessing = false;
      }
    });
  }

  // Ações rápidas
  generateDocuments(exportacao: Exportacao): void {
    console.log('Gerando documentos para:', exportacao.export_number);
    this.exportacaoService.generateDocuments(exportacao.export_id).subscribe({
      next: (success: boolean) => {
        if (success) {
          console.log('Documentos gerados com sucesso');
        }
      }
    });
  }

  sendToSiscomex(exportacao: Exportacao): void {
    console.log('Enviando para Siscomex:', exportacao.export_number);
    this.exportacaoService.sendToSiscomex(exportacao.export_id).subscribe({
      next: (response) => {
        console.log('Enviado para Siscomex:', response);
        this.loadExportacoes();
      }
    });
  }

  validateExportacao(exportacao: Exportacao): void {
    console.log('Validando exportação:', exportacao.export_number);
    this.exportacaoService.validateExportacao(exportacao.export_id).subscribe({
      next: (result) => {
        console.log('Resultado da validação:', result);
        if (!result.valid) {
          console.warn('Erros encontrados:', result.errors);
        }
      }
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