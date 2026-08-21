import { Component, OnInit, OnDestroy, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Services and Types
import { DueMockService } from '../../../../../services/dueMockService';
import {
  DUE, DueStatus, DueProduct, DueAttribute, DueDocument,
  DueValidation, DueTimelineEvent, DueAIInsights
} from '../../../../../types/due';

export interface DueDetailDialogData {
  due: DUE;
  statuses: { value: DueStatus; label: string }[];
}

@Component({
  selector: 'app-due-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="due-detail-dialog">
      <!-- Hero Header (Portos identity) -->
      <div class="dialog-hero">
        <div class="hero-title">
          <mat-icon class="hero-icon">description</mat-icon>
          <div class="hero-text">
            <h2>{{ due.dueNumber }}</h2>
            <span class="status-chip" [ngClass]="'status-' + getStatusColor(due.status)">
              <mat-icon class="chip-icon">{{ getStatusIcon(due.status) }}</mat-icon>
              {{ getStatusLabel(due.status) }}
            </span>
          </div>
        </div>
        <div class="hero-actions">
          <button mat-raised-button color="primary" (click)="sendToSiscomex()"
                  *ngIf="due.status === 'PRONTO_ENVIO'"
                  matTooltip="Enviar ao Siscomex">
            <mat-icon>send</mat-icon> Enviar Siscomex
          </button>
          <button mat-icon-button (click)="syncSiscomex()" matTooltip="Sincronizar Siscomex" class="hero-btn">
            <mat-icon>sync</mat-icon>
          </button>
          <button mat-icon-button mat-dialog-close matTooltip="Fechar" class="hero-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content -->
      <mat-dialog-content class="dialog-body">
        <mat-tab-group>
          <!-- Tab 1: Dados Gerais -->
          <mat-tab label="Dados Gerais">
            <div class="tab-content">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Exportador</span>
                  <span class="detail-value">{{ due.exporterName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">CNPJ</span>
                  <span class="detail-value">{{ due.exporterCnpj }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Importador</span>
                  <span class="detail-value">{{ due.importerName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">País Destino</span>
                  <span class="detail-value">{{ due.destinationCountry }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Porto Origem</span>
                  <span class="detail-value">{{ due.portOrigin }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Porto Destino</span>
                  <span class="detail-value">{{ due.portDestination }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Incoterm</span>
                  <span class="detail-value">{{ due.incoterm }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Modal Transporte</span>
                  <span class="detail-value">{{ due.transportMode }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Contrato</span>
                  <span class="detail-value">{{ due.contractNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Invoice</span>
                  <span class="detail-value">{{ due.invoiceNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Valor Total</span>
                  <span class="detail-value">{{ formatCurrency(due.totalValue, due.currency) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Última Sincronia</span>
                  <span class="detail-value">{{ formatDate(due.lastSiscomexSync) }}</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Produtos -->
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
                  <th mat-header-cell *matHeaderCellDef>Qtd</th>
                  <td mat-cell *matCellDef="let p">{{ p.quantity | number:'1.0-0' }}</td>
                </ng-container>
                <ng-container matColumnDef="unit">
                  <th mat-header-cell *matHeaderCellDef>Unid</th>
                  <td mat-cell *matCellDef="let p">{{ p.unit }}</td>
                </ng-container>
                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef>Preço Unit.</th>
                  <td mat-cell *matCellDef="let p">{{ formatCurrency(p.unitPrice) }}</td>
                </ng-container>
                <ng-container matColumnDef="totalValue">
                  <th mat-header-cell *matHeaderCellDef>Valor Total</th>
                  <td mat-cell *matCellDef="let p">{{ formatCurrency(p.totalValue) }}</td>
                </ng-container>
                <ng-container matColumnDef="netWeight">
                  <th mat-header-cell *matHeaderCellDef>Peso Líq (t)</th>
                  <td mat-cell *matCellDef="let p">{{ p.netWeight | number:'1.2-2' }}</td>
                </ng-container>
                <ng-container matColumnDef="grossWeight">
                  <th mat-header-cell *matHeaderCellDef>Peso Bruto (t)</th>
                  <td mat-cell *matCellDef="let p">{{ p.grossWeight | number:'1.2-2' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="productColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: productColumns;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- Tab 3: Atributos -->
          <mat-tab label="Atributos">
            <div class="tab-content">
              <table mat-table [dataSource]="attributes" class="attributes-table">
                <ng-container matColumnDef="attributeName">
                  <th mat-header-cell *matHeaderCellDef>Atributo</th>
                  <td mat-cell *matCellDef="let a">{{ a.attributeName }}</td>
                </ng-container>
                <ng-container matColumnDef="attributeValue">
                  <th mat-header-cell *matHeaderCellDef>Valor</th>
                  <td mat-cell *matCellDef="let a">{{ a.attributeValue }}</td>
                </ng-container>
                <ng-container matColumnDef="required">
                  <th mat-header-cell *matHeaderCellDef>Obrigatório</th>
                  <td mat-cell *matCellDef="let a">
                    <mat-icon [class.text-green]="a.required" [class.text-grey]="!a.required">
                      {{ a.required ? 'check_circle' : 'remove_circle_outline' }}
                    </mat-icon>
                  </td>
                </ng-container>
                <ng-container matColumnDef="aiSuggested">
                  <th mat-header-cell *matHeaderCellDef>IA Sugerido</th>
                  <td mat-cell *matCellDef="let a">
                    <mat-icon *ngIf="a.aiSuggested" class="text-blue">smart_toy</mat-icon>
                  </td>
                </ng-container>
                <ng-container matColumnDef="aiConfidence">
                  <th mat-header-cell *matHeaderCellDef>Confiança IA</th>
                  <td mat-cell *matCellDef="let a">
                    <span class="confidence-badge" *ngIf="a.aiSuggested"
                          [ngClass]="'score-' + getScoreColor(a.aiConfidence)">
                      {{ a.aiConfidence }}%
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="source">
                  <th mat-header-cell *matHeaderCellDef>Fonte</th>
                  <td mat-cell *matCellDef="let a">{{ a.source }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="attributeColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: attributeColumns;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- Tab 4: Documentos -->
          <mat-tab label="Documentos">
            <div class="tab-content">
              <table mat-table [dataSource]="documents" class="docs-table">
                <ng-container matColumnDef="documentType">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let d">{{ d.documentType }}</td>
                </ng-container>
                <ng-container matColumnDef="documentNumber">
                  <th mat-header-cell *matHeaderCellDef>Número</th>
                  <td mat-cell *matCellDef="let d">{{ d.documentNumber }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let d">
                    <span class="status-chip" [ngClass]="'status-' + getDocStatusColor(d.status)">
                      {{ d.status }}
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="issueDate">
                  <th mat-header-cell *matHeaderCellDef>Data Emissão</th>
                  <td mat-cell *matCellDef="let d">{{ formatDate(d.issueDate) }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="documentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: documentColumns;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- Tab 5: Validação -->
          <mat-tab label="Validação">
            <div class="tab-content">
              <div class="validations-list">
                <div class="validation-item" *ngFor="let v of validations"
                     [ngClass]="'validation-' + getValidationColor(v.status)">
                  <mat-icon [ngClass]="'text-' + getValidationColor(v.status)">
                    {{ getValidationIcon(v.status) }}
                  </mat-icon>
                  <div class="validation-info">
                    <div class="validation-header">
                      <strong>{{ v.checkName }}</strong>
                      <span class="severity-badge" [ngClass]="'severity-' + getSeverityColor(v.severity)">
                        {{ v.severity }}
                      </span>
                    </div>
                    <span class="validation-message">{{ v.message }}</span>
                    <span class="validation-suggestion" *ngIf="v.suggestion">
                      <mat-icon>lightbulb</mat-icon> {{ v.suggestion }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 6: Timeline -->
          <mat-tab label="Timeline">
            <div class="tab-content">
              <div class="timeline-container">
                <div class="timeline-event" *ngFor="let event of timeline"
                     [ngClass]="'event-' + getStatusColor(event.status)">
                  <div class="timeline-marker">
                    <mat-icon>{{ getStatusIcon(event.status) }}</mat-icon>
                  </div>
                  <div class="timeline-event-header">
                    <h4>{{ getStatusLabel(event.status) }}</h4>
                    <span class="timeline-date">{{ formatDate(event.date) }}</span>
                  </div>
                  <p class="timeline-description">{{ event.observations }}</p>
                  <div class="timeline-meta">
                    <span class="meta-item">
                      <mat-icon>person</mat-icon> {{ event.user }}
                    </span>
                    <span class="meta-item">
                      <mat-icon>integration_instructions</mat-icon> {{ event.integration }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 7: IA & Insights -->
          <mat-tab label="IA & Insights">
            <div class="tab-content" *ngIf="aiInsights">
              <div class="insights-section">

                <!-- Scores -->
                <div class="insights-scores">
                  <div class="score-card">
                    <h4>Score de Conformidade</h4>
                    <div class="score-gauge">
                      <div class="gauge-fill" [ngClass]="'gauge-' + getScoreColor(aiInsights.complianceScore)"
                           [style.width.%]="aiInsights.complianceScore"></div>
                    </div>
                    <span class="gauge-value">{{ aiInsights.complianceScore }}%</span>
                  </div>
                  <div class="score-card">
                    <h4>Probabilidade de Rejeição</h4>
                    <div class="score-gauge">
                      <div class="gauge-fill gauge-red"
                           [style.width.%]="aiInsights.rejectionProbability"></div>
                    </div>
                    <span class="gauge-value">{{ aiInsights.rejectionProbability }}%</span>
                  </div>
                </div>

                <!-- Bottlenecks -->
                <div class="alerts-section">
                  <h4><mat-icon>warning</mat-icon> Gargalos Identificados</h4>
                  <div class="alert-item alert-orange" *ngFor="let b of aiInsights.bottlenecks">
                    <mat-icon>report_problem</mat-icon>
                    <span>{{ b }}</span>
                  </div>
                </div>

                <!-- Suggestions -->
                <div class="suggestions-section">
                  <h4><mat-icon>lightbulb</mat-icon> Recomendações IA</h4>
                  <div class="suggestion-item" *ngFor="let s of aiInsights.suggestions">
                    <div class="suggestion-header">
                      <strong>{{ s.field }}</strong>
                      <span class="impact-badge" [ngClass]="'impact-' + s.impact.toLowerCase()">{{ s.impact }}</span>
                    </div>
                    <p class="suggestion-text">{{ s.suggestion }}</p>
                    <div class="suggestion-meta">
                      <span><mat-icon>info</mat-icon> {{ s.reason }}</span>
                      <span><mat-icon>source</mat-icon> {{ s.source }}</span>
                      <span class="confidence-badge" [ngClass]="'score-' + getScoreColor(s.confidence)">
                        {{ s.confidence }}% confiança
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Executive Summary -->
                <div class="executive-summary">
                  <h4><mat-icon>summarize</mat-icon> Resumo Executivo</h4>
                  <p>{{ aiInsights.executiveSummary }}</p>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>
    </div>
  `,
  styleUrls: ['./due-detail-dialog.component.scss']
})
export class DueDetailDialogComponent implements OnInit, OnDestroy {
  private dueService = inject(DueMockService);
  private dialogRef = inject(MatDialogRef<DueDetailDialogComponent>);
  private snackBar = inject(MatSnackBar);

  due: DUE;
  private statuses: { value: DueStatus; label: string }[];

  // Detail collections (self-loaded)
  products: DueProduct[] = [];
  attributes: DueAttribute[] = [];
  documents: DueDocument[] = [];
  validations: DueValidation[] = [];
  timeline: DueTimelineEvent[] = [];
  aiInsights: DueAIInsights | null = null;

  // Column definitions (presentation)
  productColumns = ['productName', 'ncm', 'quantity', 'unit', 'unitPrice', 'totalValue', 'netWeight', 'grossWeight'];
  attributeColumns = ['attributeName', 'attributeValue', 'required', 'aiSuggested', 'aiConfidence', 'source'];
  documentColumns = ['documentType', 'documentNumber', 'status', 'issueDate'];

  private destroy$ = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) data: DueDetailDialogData) {
    this.due = data.due;
    this.statuses = data.statuses;
  }

  ngOnInit(): void {
    this.loadDetails(this.due.id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDetails(dueId: string): void {
    this.dueService.getProducts(dueId).pipe(takeUntil(this.destroy$)).subscribe(p => this.products = p);
    this.dueService.getAttributes(dueId).pipe(takeUntil(this.destroy$)).subscribe(a => this.attributes = a);
    this.dueService.getDocuments(dueId).pipe(takeUntil(this.destroy$)).subscribe(d => this.documents = d);
    this.dueService.getValidations(dueId).pipe(takeUntil(this.destroy$)).subscribe(v => this.validations = v);
    this.dueService.getTimeline(dueId).pipe(takeUntil(this.destroy$)).subscribe(t => this.timeline = t);
    this.dueService.getAIInsights(dueId).pipe(takeUntil(this.destroy$)).subscribe(i => this.aiInsights = i);
  }

  // ================================
  // ACTIONS (mutate parent state via close result)
  // ================================

  sendToSiscomex(): void {
    this.dueService.sendToSiscomex(this.due.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.showMessage(result.message, result.success ? 'success' : 'error');
          if (result.success) {
            this.dialogRef.close('refresh');
          }
        },
        error: () => this.showMessage('Erro ao enviar ao Siscomex', 'error')
      });
  }

  syncSiscomex(): void {
    this.dueService.syncSiscomex(this.due.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (due) => {
          this.due = due;
          this.showMessage('Sincronização com Siscomex realizada', 'success');
          this.dialogRef.close('refresh');
        },
        error: () => this.showMessage('Erro na sincronização', 'error')
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

  getStatusColor(status: DueStatus): string {
    switch (status) {
      case 'CONCLUÍDO': case 'AVERBADO': case 'LIBERADO': return 'green';
      case 'REJEITADO': return 'red';
      case 'ENVIADO': case 'RECEBIDO': case 'EM_ANÁLISE': return 'blue';
      case 'PRONTO_ENVIO': case 'VALIDAÇÃO': return 'orange';
      case 'RASCUNHO': return 'grey';
      default: return 'grey';
    }
  }

  getStatusIcon(status: DueStatus): string {
    switch (status) {
      case 'CONCLUÍDO': return 'check_circle';
      case 'AVERBADO': return 'verified';
      case 'LIBERADO': return 'task_alt';
      case 'REJEITADO': return 'cancel';
      case 'ENVIADO': return 'send';
      case 'RECEBIDO': return 'inbox';
      case 'EM_ANÁLISE': return 'hourglass_top';
      case 'PRONTO_ENVIO': return 'rocket_launch';
      case 'VALIDAÇÃO': return 'fact_check';
      case 'RASCUNHO': return 'draft';
      default: return 'circle';
    }
  }

  getStatusLabel(status: DueStatus): string {
    const found = this.statuses.find(s => s.value === status);
    return found ? found.label : status;
  }

  getValidationColor(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return 'green';
      case 'fail': return 'red';
      case 'warning': return 'orange';
      default: return 'grey';
    }
  }

  getValidationIcon(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return 'check_circle';
      case 'fail': return 'cancel';
      case 'warning': return 'warning';
      default: return 'help';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'grey';
    }
  }

  getDocStatusColor(status: string): string {
    switch (status) {
      case 'valid': return 'green';
      case 'expired': return 'red';
      case 'pending': return 'orange';
      case 'missing': return 'grey';
      default: return 'grey';
    }
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
