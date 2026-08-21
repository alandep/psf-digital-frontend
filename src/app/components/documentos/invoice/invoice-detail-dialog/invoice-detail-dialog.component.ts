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
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Services and Types
import { InvoiceMockService } from '../../../../../services/invoiceMockService';
import {
  Invoice,
  InvoiceStatus,
  InvoiceProduct,
  InvoiceRelatedDoc,
  InvoiceValidation,
  InvoiceTimelineEvent,
  InvoiceAIInsights,
} from '../../../../../types/invoice';

export interface InvoiceDetailDialogData {
  invoice: Invoice;
  statuses: { value: InvoiceStatus; label: string }[];
}

@Component({
  selector: 'app-invoice-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="invoice-detail-dialog">
      <!-- Hero Header (Portos identity) -->
      <div class="dialog-hero">
        <div class="hero-title">
          <mat-icon class="hero-icon">receipt</mat-icon>
          <div class="hero-text">
            <h2>{{ invoice.invoiceNumber }}</h2>
            <div class="hero-badges">
              <span class="status-chip" [ngClass]="'status-' + getStatusColor(invoice.status)">
                <mat-icon class="chip-icon">{{ getStatusIcon(invoice.status) }}</mat-icon>
                {{ getStatusLabel(invoice.status) }}
              </span>
              <span class="currency-badge currency-large" [ngClass]="'currency-' + invoice.currency.toLowerCase()">
                {{ formatCurrency(invoice.totalValue, invoice.currency) }}
              </span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <button mat-raised-button color="primary" (click)="approveInvoice()" matTooltip="Aprovar Invoice"
                  *ngIf="invoice.status !== 'APROVADA' && invoice.status !== 'ENVIADA' && invoice.status !== 'UTILIZADA' && invoice.status !== 'ARQUIVADA'">
            <mat-icon>check_circle</mat-icon> Aprovar
          </button>
          <button mat-raised-button (click)="generatePDF()" matTooltip="Gerar PDF" class="hero-raised-btn">
            <mat-icon>picture_as_pdf</mat-icon> PDF
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
                  <span class="detail-value">{{ invoice.exporterName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">CNPJ</span>
                  <span class="detail-value">{{ invoice.exporterCnpj }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Comprador</span>
                  <span class="detail-value">{{ invoice.buyerName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Endereço Comprador</span>
                  <span class="detail-value">{{ invoice.buyerAddress }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">País Destino</span>
                  <span class="detail-value">{{ invoice.buyerCountry }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Porto Origem</span>
                  <span class="detail-value">{{ invoice.portOrigin }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Porto Destino</span>
                  <span class="detail-value">{{ invoice.portDestination }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Incoterm</span>
                  <span class="detail-value">{{ invoice.incoterm }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Forma de Pagamento</span>
                  <span class="detail-value">{{ invoice.paymentMethod }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Moeda</span>
                  <span class="detail-value">{{ invoice.currency }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Taxa de Câmbio</span>
                  <span class="detail-value">{{ invoice.exchangeRate || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Data Emissão</span>
                  <span class="detail-value">{{ formatDate(invoice.issueDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Contrato Vinculado</span>
                  <span class="detail-value">{{ invoice.linkedContractNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Exportação Vinculada</span>
                  <span class="detail-value">{{ invoice.linkedExportId }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">DU-E Vinculada</span>
                  <span class="detail-value">{{ invoice.linkedDueNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Packing List</span>
                  <span class="detail-value">{{ invoice.linkedPackingList }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Versão</span>
                  <span class="detail-value">v{{ invoice.version }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Criado por</span>
                  <span class="detail-value">{{ invoice.createdBy }}</span>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Produtos -->
          <mat-tab label="Produtos">
            <div class="tab-content">
              <div class="table-container">
                <table mat-table [dataSource]="products" class="products-table" *ngIf="products.length > 0">
                  <ng-container matColumnDef="productName">
                    <th mat-header-cell *matHeaderCellDef>Produto</th>
                    <td mat-cell *matCellDef="let p">
                      <div class="product-cell">
                        <strong>{{ p.productName }}</strong>
                        <span class="product-description">{{ p.commercialDescription }}</span>
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="commercialDescription">
                    <th mat-header-cell *matHeaderCellDef>Descrição Técnica</th>
                    <td mat-cell *matCellDef="let p">{{ p.technicalDescription }}</td>
                  </ng-container>
                  <ng-container matColumnDef="ncm">
                    <th mat-header-cell *matHeaderCellDef>NCM</th>
                    <td mat-cell *matCellDef="let p">{{ p.ncm }}</td>
                  </ng-container>
                  <ng-container matColumnDef="quantity">
                    <th mat-header-cell *matHeaderCellDef>Qtd</th>
                    <td mat-cell *matCellDef="let p">{{ p.quantity }} {{ p.unit }}</td>
                  </ng-container>
                  <ng-container matColumnDef="netWeight">
                    <th mat-header-cell *matHeaderCellDef>Peso Líq. (kg)</th>
                    <td mat-cell *matCellDef="let p">{{ p.netWeight | number:'1.0-0' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="grossWeight">
                    <th mat-header-cell *matHeaderCellDef>Peso Bruto (kg)</th>
                    <td mat-cell *matCellDef="let p">{{ p.grossWeight | number:'1.0-0' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="unitPrice">
                    <th mat-header-cell *matHeaderCellDef>Preço Unit.</th>
                    <td mat-cell *matCellDef="let p">{{ invoice.currency }} {{ p.unitPrice | number:'1.2-2' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="totalValue">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let p">
                      <strong>{{ invoice.currency }} {{ p.totalValue | number:'1.2-2' }}</strong>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="linkedLot">
                    <th mat-header-cell *matHeaderCellDef>Lote</th>
                    <td mat-cell *matCellDef="let p">{{ p.linkedLot }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="productColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: productColumns;"></tr>
                </table>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 3: Totais -->
          <mat-tab label="Totais">
            <div class="tab-content">
              <div class="totals-card">
                <div class="totals-grid">
                  <div class="total-item">
                    <span class="total-label">Subtotal (Produtos)</span>
                    <span class="total-value">{{ formatCurrency(invoice.subtotal, invoice.currency) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="total-label">Frete</span>
                    <span class="total-value positive">+ {{ formatCurrency(invoice.freight, invoice.currency) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="total-label">Seguro</span>
                    <span class="total-value positive">+ {{ formatCurrency(invoice.insurance, invoice.currency) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="total-label">Desconto</span>
                    <span class="total-value negative">- {{ formatCurrency(invoice.discount, invoice.currency) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="total-label">Outras Despesas</span>
                    <span class="total-value positive">+ {{ formatCurrency(invoice.otherExpenses, invoice.currency) }}</span>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="total-item total-final">
                    <span class="total-label">VALOR TOTAL ({{ invoice.incoterm }})</span>
                    <span class="total-value final">{{ formatCurrency(invoice.totalValue, invoice.currency) }}</span>
                  </div>
                </div>
                <div class="totals-meta">
                  <div class="meta-card">
                    <mat-icon>scale</mat-icon>
                    <div class="meta-info">
                      <span class="meta-value">{{ invoice.totalWeight | number:'1.0-0' }} kg</span>
                      <span class="meta-label">Peso Total</span>
                    </div>
                  </div>
                  <div class="meta-card">
                    <mat-icon>inventory_2</mat-icon>
                    <div class="meta-info">
                      <span class="meta-value">{{ invoice.totalQuantity | number:'1.0-0' }}</span>
                      <span class="meta-label">Quantidade Total</span>
                    </div>
                  </div>
                  <div class="meta-card">
                    <mat-icon>currency_exchange</mat-icon>
                    <div class="meta-info">
                      <span class="meta-value">{{ invoice.exchangeRate || '-' }}</span>
                      <span class="meta-label">Taxa Câmbio (BRL)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 4: Documentos Relacionados -->
          <mat-tab label="Documentos Relacionados">
            <div class="tab-content">
              <div class="related-docs-list">
                <div class="doc-item" *ngFor="let doc of relatedDocs"
                     [ngClass]="'doc-' + getDocStatusColor(doc.status)">
                  <mat-icon [ngClass]="'text-' + getDocStatusColor(doc.status)">
                    {{ getDocStatusIcon(doc.status) }}
                  </mat-icon>
                  <div class="doc-info">
                    <strong>{{ doc.documentType }}</strong>
                    <span class="doc-number">{{ doc.documentNumber }}</span>
                  </div>
                  <span class="status-chip" [ngClass]="'status-' + getDocStatusColor(doc.status)">
                    {{ getDocStatusLabel(doc.status) }}
                  </span>
                </div>
              </div>
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

          <!-- Tab 6: IA & Insights -->
          <mat-tab label="IA & Insights">
            <div class="tab-content" *ngIf="aiInsights">
              <div class="insights-section">

                <!-- Scores -->
                <div class="insights-scores">
                  <div class="score-card">
                    <h4>Doc Score</h4>
                    <div class="score-gauge">
                      <div class="gauge-fill" [ngClass]="'gauge-' + getScoreColor(aiInsights.docScore)"
                           [style.width.%]="aiInsights.docScore"></div>
                    </div>
                    <span class="gauge-value">{{ aiInsights.docScore }}%</span>
                  </div>
                  <div class="score-card">
                    <h4>Probabilidade de Rejeição</h4>
                    <div class="score-gauge">
                      <div class="gauge-fill gauge-rejection"
                           [ngClass]="aiInsights.rejectionProbability > 15 ? 'gauge-red' : aiInsights.rejectionProbability > 8 ? 'gauge-yellow' : 'gauge-green'"
                           [style.width.%]="aiInsights.rejectionProbability"></div>
                    </div>
                    <span class="gauge-value">{{ aiInsights.rejectionProbability }}%</span>
                  </div>
                </div>

                <!-- Alerts -->
                <div class="alerts-section" *ngIf="aiInsights.alerts.length > 0">
                  <h4><mat-icon>warning</mat-icon> Alertas</h4>
                  <div class="alert-item" *ngFor="let alert of aiInsights.alerts"
                       [ngClass]="'alert-' + getSeverityColor(alert.severity)">
                    <mat-icon>report_problem</mat-icon>
                    <div class="alert-content">
                      <span class="alert-message">{{ alert.message }}</span>
                      <span class="severity-badge" [ngClass]="'severity-' + getSeverityColor(alert.severity)">
                        {{ alert.severity }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Suggestions -->
                <div class="suggestions-section">
                  <h4><mat-icon>lightbulb</mat-icon> Sugestões IA (com Explainability)</h4>
                  <div class="suggestion-item" *ngFor="let s of aiInsights.suggestions">
                    <div class="suggestion-header">
                      <strong>{{ s.suggestion }}</strong>
                      <span class="impact-badge" [ngClass]="'impact-' + s.impact.toLowerCase()">{{ s.impact }}</span>
                    </div>
                    <p class="suggestion-text">{{ s.reason }}</p>
                    <div class="suggestion-meta">
                      <span><mat-icon>source</mat-icon> Fonte: {{ s.source }}</span>
                      <span><mat-icon>tune</mat-icon> Campo: {{ s.field }}</span>
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
  styleUrls: ['./invoice-detail-dialog.component.scss']
})
export class InvoiceDetailDialogComponent implements OnInit, OnDestroy {
  private invoiceService = inject(InvoiceMockService);
  private dialogRef = inject(MatDialogRef<InvoiceDetailDialogComponent>);
  private snackBar = inject(MatSnackBar);

  invoice: Invoice;
  private statuses: { value: InvoiceStatus; label: string }[];

  // Detail collections (self-loaded)
  products: InvoiceProduct[] = [];
  relatedDocs: InvoiceRelatedDoc[] = [];
  validations: InvoiceValidation[] = [];
  timeline: InvoiceTimelineEvent[] = [];
  aiInsights: InvoiceAIInsights | null = null;

  // Column definitions (presentation)
  productColumns = ['productName', 'commercialDescription', 'ncm', 'quantity', 'netWeight', 'grossWeight', 'unitPrice', 'totalValue', 'linkedLot'];
  relatedDocsColumns = ['documentType', 'documentNumber', 'status'];

  private destroy$ = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) data: InvoiceDetailDialogData) {
    this.invoice = data.invoice;
    this.statuses = data.statuses;
  }

  ngOnInit(): void {
    this.loadDetails(this.invoice.id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDetails(invoiceId: string): void {
    this.invoiceService.getProducts(invoiceId).pipe(takeUntil(this.destroy$)).subscribe(p => this.products = p);
    this.invoiceService.getRelatedDocuments(invoiceId).pipe(takeUntil(this.destroy$)).subscribe(d => this.relatedDocs = d);
    this.invoiceService.getValidations(invoiceId).pipe(takeUntil(this.destroy$)).subscribe(v => this.validations = v);
    this.invoiceService.getTimeline(invoiceId).pipe(takeUntil(this.destroy$)).subscribe(t => this.timeline = t);
    this.invoiceService.getAIInsights(invoiceId).pipe(takeUntil(this.destroy$)).subscribe(i => this.aiInsights = i);
  }

  // ================================
  // ACTIONS
  // ================================

  approveInvoice(): void {
    this.invoiceService.approveInvoice(this.invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inv) => {
          this.showMessage(`Invoice ${inv.invoiceNumber} aprovada com sucesso`, 'success');
          this.invoice = inv;
          this.dialogRef.close('refresh');
        },
        error: () => this.showMessage('Erro ao aprovar invoice', 'error')
      });
  }

  generatePDF(): void {
    this.invoiceService.generatePDF(this.invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.showMessage(result.message, result.success ? 'success' : 'error');
        },
        error: () => this.showMessage('Erro ao gerar PDF', 'error')
      });
  }

  // ================================
  // PRESENTATION HELPERS
  // ================================

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number, currency: string): string {
    return `${currency} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getStatusColor(status: InvoiceStatus): string {
    switch (status) {
      case 'RASCUNHO': return 'grey';
      case 'GERADA': return 'blue';
      case 'EDITADA': return 'orange';
      case 'VALIDADA': return 'purple';
      case 'APROVADA': return 'green';
      case 'ENVIADA': return 'teal';
      case 'UTILIZADA': return 'indigo';
      case 'ARQUIVADA': return 'brown';
      default: return 'grey';
    }
  }

  getStatusIcon(status: InvoiceStatus): string {
    switch (status) {
      case 'RASCUNHO': return 'edit_note';
      case 'GERADA': return 'description';
      case 'EDITADA': return 'edit';
      case 'VALIDADA': return 'fact_check';
      case 'APROVADA': return 'check_circle';
      case 'ENVIADA': return 'send';
      case 'UTILIZADA': return 'task_alt';
      case 'ARQUIVADA': return 'archive';
      default: return 'circle';
    }
  }

  getStatusLabel(status: InvoiceStatus): string {
    const found = this.statuses.find(s => s.value === status);
    return found ? found.label : status;
  }

  getDocStatusColor(status: 'valid' | 'pending' | 'missing'): string {
    switch (status) {
      case 'valid': return 'green';
      case 'pending': return 'orange';
      case 'missing': return 'red';
      default: return 'grey';
    }
  }

  getDocStatusIcon(status: 'valid' | 'pending' | 'missing'): string {
    switch (status) {
      case 'valid': return 'check_circle';
      case 'pending': return 'hourglass_top';
      case 'missing': return 'cancel';
      default: return 'help';
    }
  }

  getDocStatusLabel(status: 'valid' | 'pending' | 'missing'): string {
    switch (status) {
      case 'valid': return 'Válido';
      case 'pending': return 'Pendente';
      case 'missing': return 'Ausente';
      default: return status;
    }
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

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
