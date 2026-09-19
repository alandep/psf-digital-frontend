import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { LeadsMockService } from '../../../../services/leadsMockService';
import { Lead, LeadSource, LeadStatus } from '../../../../types/lead';

interface ChipView { label: string; color: string; bg: string; }

interface LeadKpis {
  total: number;
  novos: number;
  trial: number;
  clientes: number;
  perdidos: number;
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  HOME: 'Home', DEMO: 'Demonstração', PRICING: 'Preços',
  INTELLIGENCE: 'Intelligence', EVENT: 'Evento', REFERRAL: 'Indicação',
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Novo', CONTACTED: 'Contatado', QUALIFIED: 'Qualificado',
  TRIAL: 'Em trial', CUSTOMER: 'Cliente', LOST: 'Perdido',
};

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatMenuModule, MatTooltipModule,
    MatSnackBarModule, MatProgressBarModule,
  ],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss'],
})
export class LeadsComponent implements OnInit, AfterViewInit {
  private leadsService = inject(LeadsMockService);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  kpis: LeadKpis | null = null;

  displayedColumns = [
    'name', 'companyName', 'email', 'phone', 'source', 'origin', 'status', 'createdAt',
  ];
  dataSource = new MatTableDataSource<Lead>([]);

  searchTerm = '';
  statusFilter: LeadStatus | 'ALL' = 'ALL';
  sourceFilter: LeadSource | 'ALL' = 'ALL';

  statusOptions: { value: LeadStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todos os status' },
    { value: 'NEW', label: 'Novo' },
    { value: 'CONTACTED', label: 'Contatado' },
    { value: 'QUALIFIED', label: 'Qualificado' },
    { value: 'TRIAL', label: 'Em trial' },
    { value: 'CUSTOMER', label: 'Cliente' },
    { value: 'LOST', label: 'Perdido' },
  ];

  sourceOptions: { value: LeadSource | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todas as origens' },
    { value: 'HOME', label: 'Home' },
    { value: 'DEMO', label: 'Demonstração' },
    { value: 'PRICING', label: 'Preços' },
    { value: 'INTELLIGENCE', label: 'Intelligence' },
    { value: 'EVENT', label: 'Evento' },
    { value: 'REFERRAL', label: 'Indicação' },
  ];

  statusChangeOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'TRIAL', 'CUSTOMER', 'LOST'];

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (l: Lead, filter: string) => {
      const f = JSON.parse(filter) as { term: string; status: string; source: string };
      const term = f.term.trim().toLowerCase();
      const matchTerm =
        !term ||
        l.name.toLowerCase().includes(term) ||
        l.companyName.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term);
      const matchStatus = f.status === 'ALL' || l.status === f.status;
      const matchSource = f.source === 'ALL' || l.source === f.source;
      return matchTerm && matchStatus && matchSource;
    };
    this.applyFilter();
  }

  load(): void {
    this.isLoading = true;
    this.leadsService.getLeads().subscribe((leads) => {
      this.dataSource.data = leads;
      this.buildKpis(leads);
      this.applyFilter();
      this.isLoading = false;
    });
  }

  private buildKpis(leads: Lead[]): void {
    this.kpis = {
      total: leads.length,
      novos: leads.filter((l) => l.status === 'NEW').length,
      trial: leads.filter((l) => l.status === 'TRIAL').length,
      clientes: leads.filter((l) => l.status === 'CUSTOMER').length,
      perdidos: leads.filter((l) => l.status === 'LOST').length,
    };
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({
      term: this.searchTerm,
      status: this.statusFilter,
      source: this.sourceFilter,
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  trackById(_: number, row: Lead): string {
    return row.id;
  }

  sourceLabel(source: LeadSource): string {
    return SOURCE_LABELS[source];
  }

  statusLabel(status: LeadStatus): string {
    return STATUS_LABELS[status];
  }

  statusView(status: LeadStatus): ChipView {
    switch (status) {
      case 'NEW': return { label: STATUS_LABELS.NEW, color: '#1565c0', bg: '#e3f2fd' };
      case 'CONTACTED': return { label: STATUS_LABELS.CONTACTED, color: '#5e35b1', bg: '#ede7f6' };
      case 'QUALIFIED': return { label: STATUS_LABELS.QUALIFIED, color: '#00796b', bg: '#e0f2f1' };
      case 'TRIAL': return { label: STATUS_LABELS.TRIAL, color: '#ef6c00', bg: '#fff3e0' };
      case 'CUSTOMER': return { label: STATUS_LABELS.CUSTOMER, color: '#2e7d32', bg: '#e8f5e9' };
      case 'LOST': return { label: STATUS_LABELS.LOST, color: '#c62828', bg: '#ffebee' };
      default: return { label: status, color: '#616161', bg: '#f5f5f5' };
    }
  }

  changeStatus(row: Lead, status: LeadStatus): void {
    this.isLoading = true;
    this.leadsService.updateStatus(row.id, status).subscribe((leads) => {
      this.dataSource.data = leads;
      this.buildKpis(leads);
      this.applyFilter();
      this.isLoading = false;
      this.snackBar.open(`Status de ${row.name} atualizado para "${STATUS_LABELS[status]}" (mock)`, 'Fechar', { duration: 3000 });
    });
  }
}
