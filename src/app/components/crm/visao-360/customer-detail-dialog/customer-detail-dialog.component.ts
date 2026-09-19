import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Customer, CustomerSegment } from '../../../../../types/crm';

export interface CustomerDetailDialogData {
  customer: Customer;
}

@Component({
  selector: 'app-customer-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './customer-detail-dialog.component.html',
  styleUrls: ['./customer-detail-dialog.component.scss']
})
export class CustomerDetailDialogComponent {

  customer: Customer;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CustomerDetailDialogData) {
    this.customer = data.customer;
  }

  getSegmentLabel(segment: CustomerSegment): string {
    const map: Record<CustomerSegment, string> = {
      'AGRO': 'Agro',
      'INDUSTRIAL': 'Industrial',
      'TRADING': 'Trading',
      'RETAIL': 'Varejo',
      'SERVICES': 'Serviços'
    };
    return map[segment] || segment;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
