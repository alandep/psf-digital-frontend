import { Component, OnInit, OnDestroy, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Services and Types
import { RegistroExportacaoMockService } from '../../../../../services/registroExportacaoMockService';
import {
  RegistroExportacao, REStatus, REProduct, REDocument,
  REDivergence, RETimelineEvent, REAIInsights
} from '../../../../../types/registro-exportacao';

export interface ReDetailDialogData {
  re: RegistroExportacao;
  statuses: { value: REStatus; label: string }[];
}

@Component({
  selector: 'app-re-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="re-detail-dialog">
      <!-- Hero Header (Portos identity) -->
      <div class="dialog-hero">
        <div class="hero-title">
          <mat-icon class="hero-icon">receipt_long</mat-icon>
          <div class="hero-text">
            <h2>{{ re.reNumber }}</h2>
            <span class="status-chip" [ngClass]="'status-' + getStatusColor(re.status)">
              <mat-icon class="chip-icon">{{ getStatusIcon(re.status) }}</mat-icon>
              {{ re.status }}
            </span>
          </div>
        </div>
        <div class="hero-actions">
          <button mat-raised-button color="primary" (click)="convertToDUE()"
                  [disabled]="re.status === 'CONVERTIDO' || re.status === 'ARQUIVADO'"
                  matTooltip="Converter para DU-E">
            <mat-icon>swap_horiz</mat-icon> Converter
          </button>
          <button mat-icon-button mat-dialog-close matTooltip="Fechar" class="hero-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content -->
      <mat-dialog-content class="dialog-body">
        <mat-tab-group animationDuration="200ms">

          <!-- Tab 1 - Dados Gerais -->
          <mat-tab label="Dados Gerais">
            <div class="tab-content">
              <mat-list class="detail-list">
                <mat-list-item>
                  <mat-icon matListItemIcon>tag</mat-icon>
                  <span matListItemTitle>Número do RE</span>
                  <span matListItemLine>{{ re.reNumber }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>business</mat-icon>
                  <span matListItemTitle>Exportador</span>
                  <span matListItemLine>{{ re.exporterName }} ({{ re.exporterCnpj }})</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>person</mat-icon>
                  <span matListItemTitle>Cliente</span>
                  <span matListItemLine>{{ re.clientName }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>flight_takeoff</mat-icon>
                  <span matListItemTitle>País Destino</span>
                  <span matListItemLine>{{ re.destinationCountry }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>swap_vert</mat-icon>
                  <span matListItemTitle>Incoterm</span>
                  <span matListItemLine>{{ re.incoterm }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>anchor</mat-icon>
                  <span matListItemTitle>Porto de Origem</span>
                  <span matListItemLine>{{ re.portOrigin }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>local_shipping</mat-icon>
                  <span matListItemTitle>Modo de Transporte</span>
                  <span matListItemLine>{{ re.transportMode }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>description</mat-icon>
                  <span matListItemTitle>Natureza da Operação</span>
                  <span matListItemLine>{{ re.operationNature }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>source</mat-icon>
                  <span matListItemTitle>Fonte Original</span>
                  <span matListItemLine>{{ re.originalSource }}</span>
                </mat-list-item>
                <mat-divider></mat-divider>
                <mat-list-item>
                  <mat-icon matListItemIcon>link</mat-icon>
                  <span matListItemTitle>DU-E Vinculada</span>
                  <span matListItemLine>{{ re.linkedDueNumber || 'Nenhuma' }}</span>
                </mat-list-item>
              </mat-list>
            </div>
          </mat-tab>

          <!-- Tab 2 - Produtos -->
          <mat-tab label="Produtos">
            <div class="tab-content">
              <table mat-table [dataSource]="products" class="products-table">
                <ng-container matColumnDef="productName">
                  <th mat-header-cell *matHeaderCellDef>Produto</th>
                  <td mat-cell *matCellDef="let p">{{ p.productName }}</td>
                </ng-container>
                <ng-container matColumnDef="ncm">
                  <th mat-header-cell *matHeaderCellDef>NCM</th>
                  <td mat-cell *matCellDef="let p">{{ p.ncm }}</td>
                </ng-container>
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantidade</th>
                  <td mat-cell *matCellDef="let p">{{ p.quantity | number:'1.0-0' }}</td>
                </ng-container>
                <ng-container matColumnDef="unit">
                  <th mat-header-cell *matHeaderCellDef>Unidade</th>
                  <td mat-cell *matCellDef="let p">{{ p.unit }}</td>
                </ng-container>
                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Valor</th>
                  <td mat-cell *matCellDef="let p">{{ formatCurrency(p.value) }}</td>
                </ng-container>
                <ng-container matColumnDef="netWeight">
                  <th mat-header-cell *matHeaderCellDef>Peso Líquido (kg)</th>
                  <td mat-cell *matCellDef="let p">{{ p.netWeight | number:'1.0-0' }}</td>
                </ng-container>
                <ng-container matColumnDef="grossWeight">
                  <th mat-header-cell *matHeaderCellDef>Peso Bruto (kg)</th>
                  <td mat-cell *matCellDef="let p">{{ p.grossWeight | number:'1.0-0' }}</td>
                </ng-container>
                <ng-container matColumnDef="linkedLot">
                  <th mat-header-cell *matHeaderCellDef>Lote Vinculado</th>
                  <td mat-cell *matCellDef="let p">{{ p.linkedLot }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="productColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: productColumns;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- Tab 3 - Documentos -->
          <mat-tab label="Documentos">
            <div class="tab-content">
              <table mat-table [dataSource]="documents" class="docs-table">
                <ng-container matColumnDef="documentType">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let doc">{{ doc.documentType }}</td>
                </ng-container>
                <ng-container matColumnDef="documentNumber">
                  <th mat-header-cell *matHeaderCellDef>Número</th>
                  <td mat-cell *matCellDef="let doc">{{ doc.documentNumber }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let doc">
                    <span class="status-chip" [ngClass]="'status-' + getDocStatusColor(doc.status)">
                      {{ getDocStatusLabel(doc.status) }}
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="issueDate">
                  <th mat-header-cell *matHeaderCellDef>Emissão</th>
                  <td mat-cell *matCellDef="let doc">{{ formatDate(doc.issueDate) }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="documentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: documentColumns;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- Tab 4 - Divergências -->
          <mat-tab label="Divergências">
            <div class="tab-content">
              <div *ngIf="divergences.length === 0" class="empty-state">
                <mat-icon>check_circle</mat-icon>
                <p>Nenhuma divergência identificada</p>
              </div>

              <table mat-table [dataSource]="divergences" class="divergence-table" *ngIf="divergences.length > 0">
                <ng-container matColumnDef="field">
                  <th mat-header-cell *matHeaderCellDef>Campo</th>
                  <td mat-cell *matCellDef="let d">
                    <strong>{{ d.field }}</strong>
                  </td>
                </ng-container>
                <ng-container matColumnDef="reValue">
                  <th mat-header-cell *matHeaderCellDef>Valor no RE</th>
                  <td mat-cell *matCellDef="let d">
                    <span class="re-value">{{ d.reValue }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="currentValue">
                  <th mat-header-cell *matHeaderCellDef>Valor Atual</th>
                  <td mat-cell *matCellDef="let d">
                    <span class="current-value">{{ d.currentValue }}</span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="severity">
                  <th mat-header-cell *matHeaderCellDef>Severidade</th>
                  <td mat-cell *matCellDef="let d">
                    <span class="status-chip" [ngClass]="'status-' + getSeverityColor(d.severity)">
                      {{ d.severity }}
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="suggestion">
                  <th mat-header-cell *matHeaderCellDef>Sugestão IA</th>
                  <td mat-cell *matCellDef="let d">
                    <div class="suggestion-cell">
                      <mat-icon class="ai-icon">auto_awesome</mat-icon>
                      <span>{{ d.suggestion }}</span>
                      <span class="confidence-badge">{{ (d.aiConfidence * 100) | number:'1.0-0' }}%</span>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="divergenceColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: divergenceColumns;"
                    [ngClass]="'divergence-row-' + getSeverityColor(row.severity)">
                </tr>
              </table>

              <div class="validate-action" *ngIf="divergences.length > 0">
                <button mat-raised-button color="primary" (click)="validateConsistency()">
                  <mat-icon>refresh</mat-icon> Revalidar Consistência
                </button>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 5 - Timeline -->
          <mat-tab label="Timeline">
            <div class="tab-content">
              <div class="timeline-container">
                <div class="timeline-event" *ngFor="let event of timeline"
                     [ngClass]="event.event.includes('Conversão') ? 'event-green' : 'event-blue'">
                  <div class="timeline-marker">
                    <mat-icon>{{ event.event.includes('Criação') ? 'add_circle' :
                                 event.event.includes('Importação') ? 'download' :
                                 event.event.includes('Validação') ? 'fact_check' :
                                 event.event.includes('Conversão') ? 'swap_horiz' :
                                 'warning' }}</mat-icon>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-event-header">
                      <h4>{{ event.event }}</h4>
                      <span class="timeline-date">{{ formatDate(event.date) }}</span>
                    </div>
                    <p class="timeline-description">{{ event.details }}</p>
                    <div class="timeline-meta">
                      <span class="meta-item"><mat-icon>person</mat-icon> {{ event.user }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 6 - IA & Insights -->
          <mat-tab label="IA & Insights">
            <div class="tab-content" *ngIf="aiInsights">
              <div class="insights-section">

                <!-- Score Gauges -->
                <div class="insights-scores">
                  <div class="score-card">
                    <h4>Score de Migração</h4>
                    <div class="score-gauge">
                      <div class="gauge-fill" [style.width.%]="aiInsights.migrationScore"
                           [ngClass]="'gauge-' + getScoreColor(aiInsights.migrationScore)">
                      </div>
                    </div>
                    <span class="gauge-value">{{ aiInsights.migrationScore }}/100</span>
                  </div>
                  <div class="score-card">
                    <h4>Score de Consistência</h4>
                    <div class="score-gauge">
                      <div class="gauge-fill" [style.width.%]="aiInsights.consistencyScore"
                           [ngClass]="'gauge-' + getScoreColor(aiInsights.consistencyScore)">
                      </div>
                    </div>
                    <span class="gauge-value">{{ aiInsights.consistencyScore }}/100</span>
                  </div>
                </div>

                <!-- Conversion Readiness -->
                <div class="risk-badge-section">
                  <span class="risk-label">Prontidão para Conversão:</span>
                  <span class="risk-badge" [ngClass]="'risk-' + getReadinessColor(aiInsights.conversionReadiness)">
                    {{ getReadinessLabel(aiInsights.conversionReadiness) }}
                  </span>
                </div>

                <!-- Executive Summary -->
                <div class="executive-summary">
                  <h4><mat-icon>auto_awesome</mat-icon> Resumo Executivo</h4>
                  <p>{{ aiInsights.executiveSummary }}</p>
                </div>

                <!-- AI Suggestions -->
                <div class="suggestions-section" *ngIf="aiInsights.suggestions.length > 0">
                  <h4><mat-icon>lightbulb</mat-icon> Sugestões da IA</h4>
                  <div class="suggestion-item" *ngFor="let s of aiInsights.suggestions">
                    <div class="suggestion-header">
                      <strong>{{ s.field }}</strong>
                      <span class="confidence-badge">{{ (s.confidence * 100) | number:'1.0-0' }}% confiança</span>
                    </div>
                    <p class="suggestion-text">{{ s.suggestion }}</p>
                    <p class="suggestion-reason"><em>Razão:</em> {{ s.reason }}</p>
                    <span class="suggestion-source">Fonte: {{ s.source }}</span>
                  </div>
                </div>

              </div>
            </div>
          </mat-tab>

        </mat-tab-group>
      </mat-dialog-content>
    </div>
  `,
  styleUrls: ['./re-detail-dialog.component.scss']
})
export class ReDetailDialogComponent implements OnInit, OnDestroy {
  private reService = inject(RegistroExportacaoMockService);
  private dialogRef = inject(MatDialogRef<ReDetailDialogComponent>);
  private snackBar = inject(MatSnackBar);

  re: RegistroExportacao;
  private statuses: { value: REStatus; label: string }[];

  // Detail collections (self-loaded)
  products: REProduct[] = [];
  documents: REDocument[] = [];
  divergences: REDivergence[] = [];
  timeline: RETimelineEvent[] = [];
  aiInsights: REAIInsights | null = null;

  // Column definitions (presentation)
  productColumns = ['productName', 'ncm', 'quantity', 'unit', 'value', 'netWeight', 'grossWeight', 'linkedLot'];
  documentColumns = ['documentType', 'documentNumber', 'status', 'issueDate'];
  divergenceColumns = ['field', 'reValue', 'currentValue', 'severity', 'suggestion'];

  private destroy$ = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) data: ReDetailDialogData) {
    this.re = data.re;
    this.statuses = data.statuses;
  }

  ngOnInit(): void {
    this.loadDetails(this.re.id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDetails(reId: string): void {
    this.reService.getProducts(reId).pipe(takeUntil(this.destroy$)).subscribe(p => this.products = p);
    this.reService.getDocuments(reId).pipe(takeUntil(this.destroy$)).subscribe(d => this.documents = d);
    this.reService.getDivergences(reId).pipe(takeUntil(this.destroy$)).subscribe(d => this.divergences = d);
    this.reService.getTimeline(reId).pipe(takeUntil(this.destroy$)).subscribe(t => this.timeline = t);
    this.reService.getAIInsights(reId).pipe(takeUntil(this.destroy$)).subscribe(i => this.aiInsights = i);
  }

  // ================================
  // ACTIONS
  // ================================

  convertToDUE(): void {
    this.reService.convertToDUE(this.re.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.showMessage(result.message, result.success ? 'success' : 'error');
          if (result.success) {
            this.dialogRef.close('refresh');
          }
        },
        error: () => this.showMessage('Erro ao converter para DU-E', 'error')
      });
  }

  validateConsistency(): void {
    this.reService.validateConsistency(this.re.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (divergences) => {
          this.divergences = [...divergences];
          if (divergences.length === 0) {
            this.showMessage('Nenhuma divergência encontrada', 'success');
          } else {
            this.showMessage(`${divergences.length} divergência(s) identificada(s)`, 'info');
          }
        },
        error: () => this.showMessage('Erro ao validar consistência', 'error')
      });
  }

  // ================================
  // PRESENTATION HELPERS
  // ================================

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }

  getStatusColor(status: REStatus): string {
    switch (status) {
      case 'CONVERTIDO': return 'green';
      case 'VALIDADO': return 'blue';
      case 'IMPORTADO': return 'purple';
      case 'PENDENTE': return 'orange';
      case 'DIVERGENTE': return 'red';
      case 'ARQUIVADO': return 'grey';
      default: return 'grey';
    }
  }

  getStatusIcon(status: REStatus): string {
    switch (status) {
      case 'CONVERTIDO': return 'check_circle';
      case 'VALIDADO': return 'verified';
      case 'IMPORTADO': return 'download_done';
      case 'PENDENTE': return 'hourglass_top';
      case 'DIVERGENTE': return 'warning';
      case 'ARQUIVADO': return 'archive';
      default: return 'circle';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  getSeverityColor(severity: 'HIGH' | 'MEDIUM' | 'LOW'): string {
    switch (severity) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'grey';
    }
  }

  getDocStatusColor(status: string): string {
    switch (status) {
      case 'valid': return 'green';
      case 'expired': return 'red';
      case 'pending': return 'orange';
      case 'converted': return 'blue';
      default: return 'grey';
    }
  }

  getDocStatusLabel(status: string): string {
    switch (status) {
      case 'valid': return 'Válido';
      case 'expired': return 'Vencido';
      case 'pending': return 'Pendente';
      case 'converted': return 'Convertido';
      default: return status;
    }
  }

  getReadinessColor(readiness: string): string {
    switch (readiness) {
      case 'READY': return 'green';
      case 'NEEDS_REVIEW': return 'orange';
      case 'NOT_READY': return 'red';
      default: return 'grey';
    }
  }

  getReadinessLabel(readiness: string): string {
    switch (readiness) {
      case 'READY': return 'Pronto para Conversão';
      case 'NEEDS_REVIEW': return 'Necessita Revisão';
      case 'NOT_READY': return 'Não Pronto';
      default: return readiness;
    }
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
