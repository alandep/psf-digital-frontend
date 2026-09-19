import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import {
  ProductEvent,
  ProductEventName,
  EventTypeCount,
} from '../../../../types/saas-billing';

interface TypeBar {
  event: ProductEventName;
  label: string;
  count: number;
  percent: number;
}

interface EventView {
  label: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-product-events',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatTableModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatProgressBarModule, MatTooltipModule,
  ],
  templateUrl: './product-events.component.html',
  styleUrls: ['./product-events.component.scss'],
})
export class ProductEventsComponent implements OnInit, AfterViewInit {
  private saasBilling = inject(SaasBillingMockService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isLoading = false;

  typeBars: TypeBar[] = [];
  totalEvents = 0;
  topEventLabel = '—';
  activeTenants = 0;
  firstExportCount = 0;

  displayedColumns = ['occurredAt', 'company', 'event', 'properties', 'userId'];
  dataSource = new MatTableDataSource<ProductEvent>([]);

  searchTerm = '';
  eventFilter: ProductEventName | 'ALL' = 'ALL';

  eventOptions: { value: ProductEventName | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todos os eventos' },
  ];

  private labelMap: Partial<Record<ProductEventName, string>> = {};

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (e: ProductEvent, filter: string) => {
      const f = JSON.parse(filter) as { term: string; event: string };
      const term = f.term.trim().toLowerCase();
      const matchTerm =
        !term ||
        e.company.toLowerCase().includes(term) ||
        e.userId.toLowerCase().includes(term) ||
        e.properties.toLowerCase().includes(term);
      const matchEvent = f.event === 'ALL' || e.event === f.event;
      return matchTerm && matchEvent;
    };
    this.applyFilter();
  }

  load(): void {
    this.isLoading = true;
    this.saasBilling.getEventTypeCounts().subscribe((counts) => {
      this.buildTypeBars(counts);
      counts.forEach((c) => (this.labelMap[c.event] = c.label));
      this.eventOptions = [
        { value: 'ALL', label: 'Todos os eventos' },
        ...counts.map((c) => ({ value: c.event, label: c.label })),
      ];
      this.totalEvents = counts.reduce((sum, c) => sum + c.count, 0);
      this.topEventLabel = counts.length ? counts[0].label : '—';
      const fe = counts.find((c) => c.event === 'FIRST_EXPORT_CREATED');
      this.firstExportCount = fe ? fe.count : 0;
      this.isLoading = false;
    });
    this.saasBilling.getProductEvents().subscribe((events) => {
      this.dataSource.data = events;
      this.activeTenants = new Set(events.map((e) => e.company)).size;
      this.applyFilter();
    });
  }

  private buildTypeBars(counts: EventTypeCount[]): void {
    const max = Math.max(...counts.map((c) => c.count), 1);
    this.typeBars = counts.map((c) => ({
      event: c.event,
      label: c.label,
      count: c.count,
      percent: Math.round((c.count / max) * 100),
    }));
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({
      term: this.searchTerm,
      event: this.eventFilter,
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  trackByEvent(_: number, row: TypeBar): string {
    return row.event;
  }

  formatNumber(n: number): string {
    return new Intl.NumberFormat('pt-BR').format(n || 0);
  }

  eventView(name: ProductEventName): EventView {
    const label = this.labelMap[name] ?? name;
    switch (name) {
      case 'SIGNUP_STARTED':
      case 'SIGNUP_COMPLETED':
      case 'PLAN_VIEWED':
      case 'CHECKOUT_STARTED':
      case 'CHECKOUT_COMPLETED':
        return { label, color: '#1565c0', bg: '#e3f2fd' };
      case 'ONBOARDING_STARTED':
      case 'PRODUCT_CREATED':
      case 'CUSTOMER_CREATED':
        return { label, color: '#5e35b1', bg: '#ede7f6' };
      case 'EXPORT_CREATED':
      case 'FIRST_EXPORT_CREATED':
        return { label, color: '#2e7d32', bg: '#e8f5e9' };
      case 'DOCUMENT_GENERATED':
      case 'AI_USED':
        return { label, color: '#00796b', bg: '#e0f2f1' };
      default:
        return { label, color: '#616161', bg: '#f5f5f5' };
    }
  }
}
