import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Supplier, SupplierCategory, QualificationStatus } from '../../../../../types/supplier';

export interface SupplierDetailDialogData {
  supplier: Supplier;
}

@Component({
  selector: 'app-supplier-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './supplier-detail-dialog.component.html',
  styleUrls: ['./supplier-detail-dialog.component.scss']
})
export class SupplierDetailDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: SupplierDetailDialogData) {}

  getCategoryLabel(category: SupplierCategory): string {
    const map: Record<SupplierCategory, string> = {
      'RAW_MATERIAL': 'Matéria-Prima',
      'PACKAGING': 'Embalagem',
      'LOGISTICS': 'Logística',
      'SERVICES': 'Serviços',
      'EQUIPMENT': 'Equipamentos'
    };
    return map[category] || category;
  }

  getStatusLabel(status: QualificationStatus): string {
    const map: Record<QualificationStatus, string> = {
      'QUALIFIED': 'Qualificado',
      'PENDING': 'Pendente',
      'CONDITIONAL': 'Condicional',
      'DISQUALIFIED': 'Desqualificado'
    };
    return map[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
