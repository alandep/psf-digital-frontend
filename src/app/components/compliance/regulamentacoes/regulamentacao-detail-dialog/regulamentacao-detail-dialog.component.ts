import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Regulamentacao,
  RegulationRequirement,
  CountryProductMatrix,
  ImpactAnalysis,
  NonConformity,
  RegulationTimelineEvent,
  RegulationAIInsights,
  RegulationCategory,
  RegulationStatus,
  RegulationType,
  Criticality
} from '../../../../../types/regulamentacoes';

export interface RegulamentacaoDetailDialogData {
  regulation: Regulamentacao;
  requirements: RegulationRequirement[];
  matrix: CountryProductMatrix[];
  impactAnalysis: ImpactAnalysis | null;
  nonConformities: NonConformity[];
  timeline: RegulationTimelineEvent[];
  aiInsights: RegulationAIInsights | null;
}
@Component({
  selector: 'app-regulamentacao-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './regulamentacao-detail-dialog.component.html',
  styleUrls: ['./regulamentacao-detail-dialog.component.scss']
})
export class RegulamentacaoDetailDialogComponent {
  data = inject<RegulamentacaoDetailDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<RegulamentacaoDetailDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }

  getCategoryLabel(category: RegulationCategory): string {
    const map: Record<RegulationCategory, string> = {
      'ADUANEIRA': 'Aduaneira',
      'FISCAL': 'Fiscal',
      'SANITÁRIA': 'Sanitária',
      'FITOSSANITÁRIA': 'Fitossanitária',
      'AMBIENTAL': 'Ambiental',
      'CAMBIAL': 'Cambial',
      'SEGURANÇA_ALIMENTAR': 'Seg. Alimentar',
      'QUALIDADE': 'Qualidade',
      'ESG': 'ESG',
      'CERTIFICAÇÕES': 'Certificações',
      'ROTULAGEM': 'Rotulagem',
      'EMBALAGEM': 'Embalagem'
    };
    return map[category] || category;
  }

  getCategoryClass(category: RegulationCategory): string {
    const map: Record<RegulationCategory, string> = {
      'ADUANEIRA': 'cat-aduaneira',
      'FISCAL': 'cat-fiscal',
      'SANITÁRIA': 'cat-sanitaria',
      'FITOSSANITÁRIA': 'cat-fitossanitaria',
      'AMBIENTAL': 'cat-ambiental',
      'CAMBIAL': 'cat-cambial',
      'SEGURANÇA_ALIMENTAR': 'cat-seguranca',
      'QUALIDADE': 'cat-qualidade',
      'ESG': 'cat-esg',
      'CERTIFICAÇÕES': 'cat-certificacoes',
      'ROTULAGEM': 'cat-rotulagem',
      'EMBALAGEM': 'cat-embalagem'
    };
    return map[category] || '';
  }

  getCriticalityLabel(criticality: Criticality): string {
    const map: Record<Criticality, string> = {
      'LOW': 'Baixo',
      'MEDIUM': 'Médio',
      'HIGH': 'Alto',
      'CRITICAL': 'Crítico'
    };
    return map[criticality] || criticality;
  }

  getCriticalityClass(criticality: Criticality): string {
    const map: Record<Criticality, string> = {
      'LOW': 'crit-low',
      'MEDIUM': 'crit-medium',
      'HIGH': 'crit-high',
      'CRITICAL': 'crit-critical'
    };
    return map[criticality] || '';
  }

  getStatusLabel(status: RegulationStatus): string {
    const map: Record<RegulationStatus, string> = {
      'DRAFT': 'Rascunho',
      'UNDER_REVIEW': 'Em Revisão',
      'ACTIVE': 'Ativa',
      'SUSPENDED': 'Suspensa',
      'REVOKED': 'Revogada',
      'EXPIRED': 'Expirada',
      'REPLACED': 'Substituída',
      'ARCHIVED': 'Arquivada'
    };
    return map[status] || status;
  }

  getStatusClass(status: RegulationStatus): string {
    const map: Record<RegulationStatus, string> = {
      'DRAFT': 'status-draft',
      'UNDER_REVIEW': 'status-review',
      'ACTIVE': 'status-active',
      'SUSPENDED': 'status-suspended',
      'REVOKED': 'status-revoked',
      'EXPIRED': 'status-expired',
      'REPLACED': 'status-replaced',
      'ARCHIVED': 'status-archived'
    };
    return map[status] || '';
  }

  getTypeLabel(type: RegulationType): string {
    const map: Record<RegulationType, string> = {
      'LAW': 'Lei',
      'DECREE': 'Decreto',
      'RESOLUTION': 'Resolução',
      'ORDINANCE': 'Portaria',
      'NORMATIVE_INSTRUCTION': 'Instrução Normativa',
      'TECHNICAL_STANDARD': 'Norma Técnica',
      'TRADE_AGREEMENT': 'Acordo Comercial',
      'INTERNAL_POLICY': 'Política Interna',
      'CLIENT_REQUIREMENT': 'Requisito Cliente',
      'OTHER': 'Outro'
    };
    return map[type] || type;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'score-critical';
    if (score >= 60) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  }

  getMatrixAllowedClass(allowed: string): string {
    const map: Record<string, string> = {
      'SIM': 'allowed-sim',
      'CONDICIONAL': 'allowed-condicional',
      'NÃO': 'allowed-nao'
    };
    return map[allowed] || '';
  }

  getMatrixComplianceClass(status: string): string {
    const map: Record<string, string> = {
      'CONFORME': 'compliance-conforme',
      'PENDENTE': 'compliance-pendente',
      'NÃO_CONFORME': 'compliance-nao-conforme'
    };
    return map[status] || '';
  }

  getMatrixComplianceLabel(status: string): string {
    const map: Record<string, string> = {
      'CONFORME': 'Conforme',
      'PENDENTE': 'Pendente',
      'NÃO_CONFORME': 'Não Conforme'
    };
    return map[status] || status;
  }

  getNcStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'ABERTA': 'Aberta',
      'EM_TRATAMENTO': 'Em Tratamento',
      'RESOLVIDA': 'Resolvida',
      'CANCELADA': 'Cancelada'
    };
    return map[status] || status;
  }

  getNcStatusClass(status: string): string {
    const map: Record<string, string> = {
      'ABERTA': 'nc-aberta',
      'EM_TRATAMENTO': 'nc-tratamento',
      'RESOLVIDA': 'nc-resolvida',
      'CANCELADA': 'nc-cancelada'
    };
    return map[status] || '';
  }

  getAlertIcon(severity: string): string {
    const map: Record<string, string> = {
      'LOW': 'info',
      'MEDIUM': 'warning',
      'HIGH': 'error',
      'CRITICAL': 'dangerous'
    };
    return map[severity] || 'info';
  }

  getAlertClass(severity: string): string {
    return `alert-${severity.toLowerCase()}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
