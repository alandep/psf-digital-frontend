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
  Licenca,
  LicenseType,
  LicenseStatus,
  RiskLevel,
  ComplianceValidation,
  CountryRequirement,
  RegulatoryRestriction,
  ActionPlan,
  LicenseTimelineEvent,
  LicenseAIInsights
} from '../../../../../types/licencas';

export interface LicencaDetailDialogData {
  license: Licenca;
  validations: ComplianceValidation[];
  countryRequirements: CountryRequirement[];
  restrictions: RegulatoryRestriction[];
  actionPlans: ActionPlan[];
  timeline: LicenseTimelineEvent[];
  aiInsights: LicenseAIInsights | null;
}

@Component({
  selector: 'app-licenca-detail-dialog',
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
  templateUrl: './licenca-detail-dialog.component.html',
  styleUrls: ['./licenca-detail-dialog.component.scss']
})
export class LicencaDetailDialogComponent {
  data = inject<LicencaDetailDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<LicencaDetailDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getLicenseTypeLabel(type: LicenseType): string {
    const map: Record<LicenseType, string> = {
      'EXPORTAÇÃO': 'Exportação',
      'REGISTRO_ESPECIAL': 'Reg. Especial',
      'SANITÁRIA': 'Sanitária',
      'FITOSSANITÁRIA': 'Fitossanitária',
      'AMBIENTAL': 'Ambiental',
      'PRODUTOS_CONTROLADOS': 'Prod. Controlados',
      'OUTRAS': 'Outras'
    };
    return map[type] || type;
  }

  getLicenseTypeClass(type: LicenseType): string {
    const map: Record<LicenseType, string> = {
      'EXPORTAÇÃO': 'type-exportacao',
      'REGISTRO_ESPECIAL': 'type-registro',
      'SANITÁRIA': 'type-sanitaria',
      'FITOSSANITÁRIA': 'type-fitossanitaria',
      'AMBIENTAL': 'type-ambiental',
      'PRODUTOS_CONTROLADOS': 'type-controlados',
      'OUTRAS': 'type-outras'
    };
    return map[type] || '';
  }

  getStatusColor(status: LicenseStatus): string {
    const map: Record<LicenseStatus, string> = {
      'VÁLIDA': 'status-valida',
      'VENCIDA': 'status-vencida',
      'PENDENTE': 'status-pendente',
      'EM_RENOVAÇÃO': 'status-renovacao',
      'SUSPENSA': 'status-suspensa',
      'CANCELADA': 'status-cancelada'
    };
    return map[status] || '';
  }

  getRiskClass(risk: RiskLevel): string {
    const map: Record<RiskLevel, string> = {
      'MUITO_BAIXO': 'risk-muito-baixo',
      'BAIXO': 'risk-baixo',
      'MÉDIO': 'risk-medio',
      'ALTO': 'risk-alto',
      'CRÍTICO': 'risk-critico'
    };
    return map[risk] || '';
  }

  getRiskLabel(risk: RiskLevel): string {
    const map: Record<RiskLevel, string> = {
      'MUITO_BAIXO': 'Muito Baixo',
      'BAIXO': 'Baixo',
      'MÉDIO': 'Médio',
      'ALTO': 'Alto',
      'CRÍTICO': 'Crítico'
    };
    return map[risk] || risk;
  }

  getValidationStatusClass(status: string): string {
    const map: Record<string, string> = {
      'CONFORME': 'val-conforme',
      'NÃO_CONFORME': 'val-nao-conforme',
      'PENDENTE': 'val-pendente',
      'EM_ANÁLISE': 'val-analise'
    };
    return map[status] || '';
  }

  getActionPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'BAIXA': 'priority-baixa',
      'MÉDIA': 'priority-media',
      'ALTA': 'priority-alta',
      'CRÍTICA': 'priority-critica'
    };
    return map[priority] || '';
  }

  getActionStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'ABERTO': 'Aberto',
      'EM_ANDAMENTO': 'Em Andamento',
      'CONCLUÍDO': 'Concluído',
      'CANCELADO': 'Cancelado'
    };
    return map[status] || status;
  }

  getScoreColor(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-average';
    return 'score-poor';
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
}
