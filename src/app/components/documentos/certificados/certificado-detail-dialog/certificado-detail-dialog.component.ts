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
import { CertificadosExportacaoMockService } from '../../../../../services/certificadosExportacaoMockService';
import {
  CertificadoExportacao,
  CertificadoTipo,
  CertificadoStatus,
  CertificadoValidation,
  CertificadoTimelineEvent,
  CertificadoRelatedDoc,
  CertificadoAIInsights,
  CountryRequirement,
  RequirementLevel,
} from '../../../../../types/certificados-exportacao';

export interface CertificadoDetailDialogData {
  certificado: CertificadoExportacao;
  statuses: { value: CertificadoStatus; label: string }[];
  tipos: { value: CertificadoTipo; label: string }[];
}

@Component({
  selector: 'app-certificado-detail-dialog',
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
    <div class="certificado-detail-dialog">
      <!-- Hero Header (Portos identity) -->
      <div class="dialog-hero">
        <div class="hero-title">
          <mat-icon class="hero-icon">verified</mat-icon>
          <div class="hero-text">
            <h2>{{ cert.certificateNumber }}</h2>
            <div class="hero-chips">
              <span class="tipo-chip" [ngClass]="'tipo-' + getTipoColor(cert.tipo)">
                {{ getTipoLabel(cert.tipo) }}
              </span>
              <span class="status-chip" [ngClass]="'status-' + getStatusColor(cert.status)">
                <mat-icon class="chip-icon">{{ getStatusIcon(cert.status) }}</mat-icon>
                {{ getStatusLabel(cert.status) }}
              </span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <button mat-raised-button color="primary" (click)="validateCertificate()"
                  matTooltip="Validar Certificado">
            <mat-icon>fact_check</mat-icon> Validar
          </button>
          <button mat-raised-button (click)="renewCertificate()" class="hero-secondary-btn"
                  matTooltip="Renovar Certificado"
                  *ngIf="cert.status === 'VENCIDO' || cert.status === 'VÁLIDO'">
            <mat-icon>refresh</mat-icon> Renovar
          </button>
          <button mat-icon-button mat-dialog-close matTooltip="Fechar" class="hero-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Content -->
      <mat-dialog-content class="dialog-body">
        <mat-tab-group animationDuration="200ms">

          <!-- Tab 1: Dados Gerais -->
          <mat-tab label="Dados Gerais">
            <div class="tab-content">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Nº Certificado</span>
                  <span class="detail-value">{{ cert.certificateNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Tipo</span>
                  <span class="detail-value">{{ getTipoLabel(cert.tipo) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Produto</span>
                  <span class="detail-value">{{ cert.productName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">NCM</span>
                  <span class="detail-value">{{ cert.ncm }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">País Destino</span>
                  <span class="detail-value">{{ cert.destinationCountry }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Exportador</span>
                  <span class="detail-value">{{ cert.exporterName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Importador</span>
                  <span class="detail-value">{{ cert.importerName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Órgão Emissor</span>
                  <span class="detail-value">{{ cert.issuingAuthority }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Data Emissão</span>
                  <span class="detail-value">{{ formatDate(cert.issueDate) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Validade</span>
                  <span class="detail-value" [class.text-red]="cert.status === 'VENCIDO'">
                    {{ formatDate(cert.expiryDate) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Exportação Vinculada</span>
                  <span class="detail-value">{{ cert.linkedExportId }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Lote Vinculado</span>
                  <span class="detail-value">{{ cert.linkedLoteNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">DU-E Vinculada</span>
                  <span class="detail-value">{{ cert.linkedDueNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Score Conformidade</span>
                  <span class="detail-value">
                    <span class="score-badge" [ngClass]="'score-' + getScoreColor(cert.aiComplianceScore)">
                      {{ cert.aiComplianceScore }}%
                    </span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Risco de Rejeição</span>
                  <span class="detail-value">
                    <span class="risk-badge" [ngClass]="'risk-' + getRiskColor(cert.rejectionRisk)">
                      {{ getRiskLabel(cert.rejectionRisk) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Exigências por País -->
          <mat-tab label="Exigências por País">
            <div class="tab-content">
              <div class="requirements-header">
                <h3>Exigências de {{ cert.destinationCountry }} para {{ cert.productName }}</h3>
              </div>
              <table mat-table [dataSource]="countryRequirements" class="requirements-table" *ngIf="countryRequirements.length > 0">
                <ng-container matColumnDef="certificateType">
                  <th mat-header-cell *matHeaderCellDef>Certificado</th>
                  <td mat-cell *matCellDef="let req">{{ getTipoLabel(req.certificateType) }}</td>
                </ng-container>
                <ng-container matColumnDef="level">
                  <th mat-header-cell *matHeaderCellDef>Nível</th>
                  <td mat-cell *matCellDef="let req">
                    <span class="requirement-chip" [ngClass]="'req-' + getRequirementLevelColor(req.level)">
                      {{ getRequirementLevelLabel(req.level) }}
                    </span>
                  </td>
                </ng-container>
                <ng-container matColumnDef="issuingAuthority">
                  <th mat-header-cell *matHeaderCellDef>Órgão Emissor</th>
                  <td mat-cell *matCellDef="let req">{{ req.issuingAuthority }}</td>
                </ng-container>
                <ng-container matColumnDef="estimatedProcessingDays">
                  <th mat-header-cell *matHeaderCellDef>Prazo Estimado</th>
                  <td mat-cell *matCellDef="let req">{{ req.estimatedProcessingDays }} dias</td>
                </ng-container>
                <ng-container matColumnDef="validityMonths">
                  <th mat-header-cell *matHeaderCellDef>Validade</th>
                  <td mat-cell *matCellDef="let req">{{ req.validityMonths }} meses</td>
                </ng-container>
                <ng-container matColumnDef="notes">
                  <th mat-header-cell *matHeaderCellDef>Observações</th>
                  <td mat-cell *matCellDef="let req">{{ req.notes }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="requirementColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: requirementColumns;"></tr>
              </table>
              <div class="empty-state" *ngIf="countryRequirements.length === 0">
                <mat-icon>info</mat-icon>
                <p>Nenhuma exigência específica cadastrada para esta combinação país/produto.</p>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 3: Validação -->
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
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 4: Documentos Relacionados -->
          <mat-tab label="Documentos Relacionados">
            <div class="tab-content">
              <table mat-table [dataSource]="relatedDocs" class="related-docs-table" *ngIf="relatedDocs.length > 0">
                <ng-container matColumnDef="documentType">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let doc">{{ doc.documentType }}</td>
                </ng-container>
                <ng-container matColumnDef="documentNumber">
                  <th mat-header-cell *matHeaderCellDef>Número</th>
                  <td mat-cell *matCellDef="let doc">{{ doc.documentNumber }}</td>
                </ng-container>
                <ng-container matColumnDef="entity">
                  <th mat-header-cell *matHeaderCellDef>Entidade</th>
                  <td mat-cell *matCellDef="let doc">{{ doc.entity }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="relatedDocsColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: relatedDocsColumns;"></tr>
              </table>
            </div>
          </mat-tab>

          <!-- Tab 5: Timeline -->
          <mat-tab label="Timeline">
            <div class="tab-content">
              <div class="timeline-container">
                <div class="timeline-event" *ngFor="let event of timeline; let i = index"
                     [ngClass]="i === timeline.length - 1 ? 'event-blue' : 'event-green'">
                  <div class="timeline-marker">
                    <mat-icon>{{ i === timeline.length - 1 ? 'radio_button_checked' : 'check_circle' }}</mat-icon>
                  </div>
                  <div class="timeline-event-header">
                    <h4>{{ event.event }}</h4>
                    <span class="timeline-date">{{ formatDate(event.date) }}</span>
                  </div>
                  <p class="timeline-description">{{ event.observations }}</p>
                  <div class="timeline-meta">
                    <span class="meta-item">
                      <mat-icon>person</mat-icon> {{ event.user }}
                    </span>
                    <span class="meta-item">
                      <mat-icon>integration_instructions</mat-icon> {{ event.origin }}
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
                    <h4>Score de Conformidade</h4>
                    <div class="score-gauge">
                      <div class="gauge-fill" [ngClass]="'gauge-' + getScoreColor(aiInsights.complianceScore)"
                           [style.width.%]="aiInsights.complianceScore"></div>
                    </div>
                    <span class="gauge-value">{{ aiInsights.complianceScore }}%</span>
                  </div>
                  <div class="score-card">
                    <h4>Risco de Rejeição</h4>
                    <span class="risk-badge risk-large" [ngClass]="'risk-' + getRiskColor(aiInsights.rejectionRisk)">
                      {{ getRiskLabel(aiInsights.rejectionRisk) }}
                    </span>
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
                  <h4><mat-icon>lightbulb</mat-icon> Recomendações IA</h4>
                  <div class="suggestion-item" *ngFor="let s of aiInsights.suggestions">
                    <div class="suggestion-header">
                      <strong>{{ s.action }}</strong>
                      <span class="impact-badge" [ngClass]="'impact-' + s.impact.toLowerCase()">{{ s.impact }}</span>
                    </div>
                    <p class="suggestion-text">{{ s.reason }}</p>
                    <div class="suggestion-meta">
                      <span><mat-icon>gavel</mat-icon> {{ s.norm }}</span>
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
  styleUrls: ['./certificado-detail-dialog.component.scss']
})
export class CertificadoDetailDialogComponent implements OnInit, OnDestroy {
  private certificadosService = inject(CertificadosExportacaoMockService);
  private dialogRef = inject(MatDialogRef<CertificadoDetailDialogComponent>);
  private snackBar = inject(MatSnackBar);

  cert: CertificadoExportacao;
  private statuses: { value: CertificadoStatus; label: string }[];
  private tipos: { value: CertificadoTipo; label: string }[];

  // Detail collections (self-loaded)
  validations: CertificadoValidation[] = [];
  timeline: CertificadoTimelineEvent[] = [];
  relatedDocs: CertificadoRelatedDoc[] = [];
  aiInsights: CertificadoAIInsights | null = null;
  countryRequirements: CountryRequirement[] = [];

  // Column definitions (presentation)
  requirementColumns = ['certificateType', 'level', 'issuingAuthority', 'estimatedProcessingDays', 'validityMonths', 'notes'];
  relatedDocsColumns = ['documentType', 'documentNumber', 'entity'];

  private destroy$ = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) data: CertificadoDetailDialogData) {
    this.cert = data.certificado;
    this.statuses = data.statuses;
    this.tipos = data.tipos;
  }

  ngOnInit(): void {
    this.loadDetails(this.cert.id);
    this.loadCountryRequirements(this.cert.destinationCountry, this.cert.productName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDetails(certId: string): void {
    this.certificadosService.getValidations(certId).pipe(takeUntil(this.destroy$)).subscribe(v => this.validations = v);
    this.certificadosService.getTimeline(certId).pipe(takeUntil(this.destroy$)).subscribe(t => this.timeline = t);
    this.certificadosService.getRelatedDocuments(certId).pipe(takeUntil(this.destroy$)).subscribe(d => this.relatedDocs = d);
    this.certificadosService.getAIInsights(certId).pipe(takeUntil(this.destroy$)).subscribe(i => this.aiInsights = i);
  }

  private loadCountryRequirements(country: string, product: string): void {
    if (!country || !product) return;
    this.certificadosService.getCountryRequirements(country, product)
      .pipe(takeUntil(this.destroy$))
      .subscribe(reqs => this.countryRequirements = reqs);
  }

  // ================================
  // ACTIONS
  // ================================

  validateCertificate(): void {
    this.certificadosService.validateCertificate(this.cert.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (validations) => {
          this.validations = validations;
          this.showMessage('Validação realizada com sucesso', 'success');
        },
        error: () => this.showMessage('Erro ao validar certificado', 'error')
      });
  }

  renewCertificate(): void {
    this.certificadosService.renewCertificate(this.cert.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.showMessage(result.message, result.success ? 'success' : 'error');
          if (result.success) {
            this.dialogRef.close('refresh');
          }
        },
        error: () => this.showMessage('Erro ao renovar certificado', 'error')
      });
  }

  // ================================
  // PRESENTATION HELPERS
  // ================================

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getStatusColor(status: CertificadoStatus): string {
    switch (status) {
      case 'VÁLIDO': case 'VINCULADO': return 'green';
      case 'VENCIDO': return 'red';
      case 'PENDENTE': case 'SOLICITADO': return 'orange';
      case 'EMITIDO': return 'blue';
      case 'ARQUIVADO': return 'grey';
      default: return 'grey';
    }
  }

  getStatusIcon(status: CertificadoStatus): string {
    switch (status) {
      case 'VÁLIDO': return 'check_circle';
      case 'VENCIDO': return 'cancel';
      case 'PENDENTE': return 'hourglass_top';
      case 'SOLICITADO': return 'send';
      case 'EMITIDO': return 'task_alt';
      case 'VINCULADO': return 'link';
      case 'ARQUIVADO': return 'archive';
      default: return 'circle';
    }
  }

  getStatusLabel(status: CertificadoStatus): string {
    const found = this.statuses.find(s => s.value === status);
    return found ? found.label : status;
  }

  getTipoLabel(tipo: CertificadoTipo): string {
    const found = this.tipos.find(t => t.value === tipo);
    return found ? found.label : tipo;
  }

  getTipoColor(tipo: CertificadoTipo): string {
    switch (tipo) {
      case 'FITOSSANITÁRIO': return 'green';
      case 'ORIGEM': return 'blue';
      case 'QUALIDADE': return 'purple';
      case 'ANÁLISE_LABORATORIAL': return 'orange';
      case 'HALAL': return 'teal';
      case 'KOSHER': return 'indigo';
      case 'ORGÂNICO': return 'lime';
      case 'SANITÁRIO': return 'red';
      case 'FUMIGAÇÃO': return 'brown';
      default: return 'grey';
    }
  }

  getRequirementLevelColor(level: RequirementLevel): string {
    switch (level) {
      case 'OBRIGATÓRIO': return 'red';
      case 'RECOMENDADO': return 'orange';
      case 'OPCIONAL': return 'blue';
      case 'NÃO_APLICÁVEL': return 'grey';
      default: return 'grey';
    }
  }

  getRequirementLevelLabel(level: RequirementLevel): string {
    switch (level) {
      case 'OBRIGATÓRIO': return 'Obrigatório';
      case 'RECOMENDADO': return 'Recomendado';
      case 'OPCIONAL': return 'Opcional';
      case 'NÃO_APLICÁVEL': return 'N/A';
      default: return level;
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

  getRiskColor(risk: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    switch (risk) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'orange';
      case 'HIGH': return 'red';
      default: return 'grey';
    }
  }

  getRiskLabel(risk: 'LOW' | 'MEDIUM' | 'HIGH'): string {
    switch (risk) {
      case 'LOW': return 'Baixo';
      case 'MEDIUM': return 'Médio';
      case 'HIGH': return 'Alto';
      default: return risk;
    }
  }

  isExpiringSoon(date: Date | string): boolean {
    const expiry = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return diffDays > 0 && diffDays <= 30;
  }

  getDaysToExpiry(date: Date | string): number {
    const expiry = new Date(date);
    const now = new Date();
    return Math.floor((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
