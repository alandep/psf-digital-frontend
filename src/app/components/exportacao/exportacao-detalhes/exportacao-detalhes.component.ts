import { MatBadgeModule } from '@angular/material/badge';
import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { EXPORTACAO_SERVICE } from '../../../services/exportacao/exportacao-service.token';
import { IExportacaoService } from '../../../services/exportacao/exportacao-service.interface';
import { Exportacao, ExportacaoDocumento, RiskAlert } from '../../../../types/exportacao';
import { Observable } from 'rxjs';

// Imports Angular Material
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-exportacao-detalhes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './exportacao-detalhes.component.html',
  styleUrls: ['./exportacao-detalhes.component.scss']
})
export class ExportacaoDetalhesComponent implements OnInit {
  
  exportacao?: Exportacao;
  loading = false;
  notFound = false;
  isDialog: boolean = false;
  exportacaoId?: string;
  
  // Dados para as abas
  trackingData: any[] = [];
  documentsData: ExportacaoDocumento[] = [];
  complianceData: any = null;
  aiAnalysis: any = null;
  
  // Colunas para tabelas
  documentsColumns = ['document_type', 'status', 'upload_date', 'actions'];
  trackingColumns = ['date', 'status', 'location', 'description'];
  
  constructor(
    @Inject(EXPORTACAO_SERVICE) private exportacaoService: IExportacaoService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    @Optional() public dialogRef?: MatDialogRef<ExportacaoDetalhesComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { exportacao: Exportacao }
  ) {
    this.isDialog = !!dialogRef;
    
    if (this.isDialog && this.data) {
      this.exportacao = this.data.exportacao;
    } else {
      this.exportacaoId = this.route.snapshot.params['id'];
    }
  }

  ngOnInit(): void {
    if (this.isDialog && this.exportacao) {
      // Modo dialog: exportação já veio via MAT_DIALOG_DATA
      this.loadExportacaoDetails();
    } else if (this.exportacaoId) {
      // Modo rota: carregar pelo ID informado na URL
      this.loadExportacaoById(this.exportacaoId);
    } else {
      this.notFound = true;
      this.loading = false;
    }
  }

  private loadExportacaoById(id: string): void {
    this.loading = true;
    this.notFound = false;
    this.exportacaoService.getExportacaoById(id).subscribe({
      next: (exportacao: any) => {
        if (exportacao) {
          this.exportacao = exportacao;
          this.loadExportacaoDetails();
        } else {
          console.error('Exportação não encontrada');
          this.notFound = true;
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Erro ao carregar exportação:', error);
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  private async loadExportacaoDetails(): Promise<void> {
    if (!this.exportacao) {
      this.loading = false;
      return;
    }
    this.loading = true;
    try {
      // Carregar detalhes completos
      const details = await this.exportacaoService.getExportacaoDetails(this.exportacao.export_id).toPromise();
      
      if (details) {
        this.trackingData = details.tracking || [];
        this.documentsData = details.documents || [];
        this.complianceData = details.compliance || null;
        this.aiAnalysis = details.ai_analysis || null;
      }
      
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      this.loading = false;
    }
  }

  // Métodos de formatação
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
  }

  formatDateTime(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR');
  }

  formatQuantity(quantity: number, unit: string): string {
    return `${quantity.toLocaleString('pt-BR')} ${unit}`;
  }

  // Métodos de estilo CSS
  getStatusChipClass(status: string): string {
    return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  getComplianceChipClass(status: string): string {
    return `compliance-${status.toLowerCase()}`;
  }

  getRiskScoreClass(score: number): string {
    if (score <= 30) return 'low-risk';
    if (score <= 70) return 'medium-risk';
    return 'high-risk';
  }

  getProgressPercentage(): number {
    return this.exportacao?.completion_percentage || 0;
  }

  getProgressColor(): string {
    const percentage = this.getProgressPercentage();
    if (percentage <= 30) return 'warn';
    if (percentage <= 70) return 'accent';
    return 'primary';
  }

  // Utilitário: exibe uma notificação (snackbar)
  private notify(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, { duration: 4000 });
  }

  // Gera um blob (mock) descrevendo o documento para download/visualização
  private buildDocumentBlob(document: ExportacaoDocumento): Blob {
    const content = {
      documento: document.document_name,
      tipo: document.document_type,
      status: document.status,
      exportacao: this.exportacao?.export_number,
      gerado_em: new Date().toISOString()
    };
    return new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  }

  // Normaliza o nome do documento para um nome de arquivo seguro
  private buildFileName(document: ExportacaoDocumento): string {
    const base = (document.document_name || 'documento')
      .trim()
      .replace(/[^\w.-]+/g, '_');
    return base.toLowerCase().endsWith('.json') ? base : `${base}.json`;
  }

  // Ações
  downloadDocument(document: ExportacaoDocumento): void {
    const blob = this.buildDocumentBlob(document);
    const url = URL.createObjectURL(blob);

    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = this.buildFileName(document);
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);

    // Libera o objeto URL após o disparo do download
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    this.notify(`Download iniciado: ${document.document_name}`);
  }

  viewDocument(document: ExportacaoDocumento): void {
    const blob = this.buildDocumentBlob(document);
    const url = URL.createObjectURL(blob);

    const opened = window.open(url, '_blank');

    if (!opened) {
      this.notify(`Não foi possível abrir o documento: ${document.document_name}`);
    } else {
      this.notify(`Abrindo documento: ${document.document_name}`);
    }

    // Libera o objeto URL depois de dar tempo da aba carregar
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  regenerateDocument(document: ExportacaoDocumento): void {
    if (!this.exportacao) { return; }
    this.exportacaoService.regenerateDocument(this.exportacao.export_id, document.document_id).subscribe({
      next: (newDoc: ExportacaoDocumento) => {
        this.loadExportacaoDetails();
        this.notify('Documento regenerado');
      },
      error: (error: any) => {
        this.notify('Erro ao regenerar documento');
      }
    });
  }

  // Validação de compliance
  revalidateCompliance(): void {
    if (!this.exportacao) { return; }
    this.loading = true;
    
    this.exportacaoService.validateCompliance(this.exportacao.export_id).subscribe({
      next: (result: any) => {
        this.complianceData = result;
        this.loading = false;
        this.notify('Compliance revalidado');
      },
      error: (error: any) => {
        this.loading = false;
        this.notify('Erro ao revalidar compliance');
      }
    });
  }

  // Siscomex
  sendToSiscomex(): void {
    if (!this.exportacao) { return; }
    this.loading = true;
    
    this.exportacaoService.sendToSiscomex(this.exportacao.export_id).subscribe({
      next: (result: any) => {
        if (this.exportacao) {
          this.exportacao.siscomex_status = 'Sent';
        }
        this.loading = false;
        this.notify('Exportação enviada para o Siscomex');
      },
      error: (error: any) => {
        this.loading = false;
        this.notify('Erro ao enviar para o Siscomex');
      }
    });
  }

  // Análise IA
  runAIAnalysis(): void {
    if (!this.exportacao) { return; }
    this.loading = true;
    
    this.exportacaoService.runAIAnalysis(this.exportacao.export_id).subscribe({
      next: (analysis: any) => {
        this.aiAnalysis = analysis;
        this.loading = false;
        this.notify('Análise de IA concluída');
      },
      error: (error: any) => {
        this.loading = false;
        this.notify('Erro na análise de IA');
      }
    });
  }

  // Fechar dialog ou navegar de volta
  onClose(): void {
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/home-logged/exportacoes/gerenciar']);
    }
  }

  // Editar exportação
  onEdit(): void {
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close({ action: 'edit', exportacao: this.exportacao });
    } else if (this.exportacao) {
      this.router.navigate(['/home-logged/exportacao/editar', this.exportacao.export_id]);
    }
  }

  // Track by functions
  trackByDocumentId(index: number, item: ExportacaoDocumento): string {
    return item.document_id;
  }

  trackByTrackingIndex(index: number, item: any): number {
    return index;
  }
}