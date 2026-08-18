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
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
  
  exportacao!: Exportacao;
  loading = false;
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
    if (!this.isDialog && this.exportacaoId) {
      this.loadExportacaoById(this.exportacaoId);
    } else {
      this.loadExportacaoDetails();
    }
  }

  private loadExportacaoById(id: string): void {
    this.loading = true;
    this.exportacaoService.getExportacaoById(id).subscribe({
      next: (exportacao: any) => {
        if (exportacao) {
          this.exportacao = exportacao;
          this.loadExportacaoDetails();
        } else {
          console.error('Exportação não encontrada');
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Erro ao carregar exportação:', error);
        this.loading = false;
      }
    });
  }

  private async loadExportacaoDetails(): Promise<void> {
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
    return this.exportacao.completion_percentage || 0;
  }

  getProgressColor(): string {
    const percentage = this.getProgressPercentage();
    if (percentage <= 30) return 'warn';
    if (percentage <= 70) return 'accent';
    return 'primary';
  }

  // Ações
  downloadDocument(document: ExportacaoDocumento): void {
    console.log('Download document:', document.document_name);
    // TODO: Implementar download real
  }

  viewDocument(document: ExportacaoDocumento): void {
    console.log('View document:', document.document_name);
    // TODO: Implementar visualização
  }

  regenerateDocument(document: ExportacaoDocumento): void {
    console.log('Regenerate document:', document.document_name);
    
    this.exportacaoService.regenerateDocument(this.exportacao.export_id, document.document_id).subscribe({
      next: (newDoc: ExportacaoDocumento) => {
        console.log('Document regenerated:', newDoc);
        this.loadExportacaoDetails();
      },
      error: (error: any) => {
        console.error('Erro ao regenerar documento:', error);
      }
    });
  }

  // Validação de compliance
  revalidateCompliance(): void {
    this.loading = true;
    
    this.exportacaoService.validateCompliance(this.exportacao.export_id).subscribe({
      next: (result: any) => {
        console.log('Compliance revalidated:', result);
        this.complianceData = result;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro na revalidação:', error);
        this.loading = false;
      }
    });
  }

  // Siscomex
  sendToSiscomex(): void {
    this.loading = true;
    
    this.exportacaoService.sendToSiscomex(this.exportacao.export_id).subscribe({
      next: (result: any) => {
        console.log('Sent to Siscomex:', result);
        this.exportacao.siscomex_status = 'Sent';
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao enviar para Siscomex:', error);
        this.loading = false;
      }
    });
  }

  // Análise IA
  runAIAnalysis(): void {
    this.loading = true;
    
    this.exportacaoService.runAIAnalysis(this.exportacao.export_id).subscribe({
      next: (analysis: any) => {
        console.log('AI Analysis completed:', analysis);
        this.aiAnalysis = analysis;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro na análise IA:', error);
        this.loading = false;
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
    } else {
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