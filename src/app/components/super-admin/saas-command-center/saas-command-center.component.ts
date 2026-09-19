import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import {
  SaasMetrics,
  TenantSummary,
  SubscriptionStatus,
  FinancialHealth,
  TenantUnitEconomics,
  FunnelStage,
  NorthStarMetric,
} from '../../../../types/saas-billing';
import {
  ConfirmarAcaoDialogComponent,
  ConfirmDialogData,
} from '../../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';

interface StatusView {
  label: string;
  color: string;
  bg: string;
}

interface ScoreView {
  label: string;
  color: string;
  bg: string;
}

interface AlertItem {
  icon: string;
  color: string;
  text: string;
}

interface MrrBar {
  plan: string;
  mrr: number;
  percent: number;
}

interface FunnelBar {
  key: string;
  label: string;
  count: number;
  percent: number;
  conversion: number | null;
}

@Component({
  selector: 'app-saas-command-center',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatMenuModule,
    MatTooltipModule, MatSnackBarModule, MatDialogModule, MatProgressBarModule,
  ],
  templateUrl: './saas-command-center.component.html',
  styleUrls: ['./saas-command-center.component.scss'],
})
export class SaasCommandCenterComponent implements OnInit, AfterViewInit {
  private saasBilling = inject(SaasBillingMockService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  metrics: SaasMetrics | null = null;
  mrrBars: MrrBar[] = [];
  alerts: AlertItem[] = [];
  isLoading = false;

  financial: FinancialHealth | null = null;
  unitEconomics: TenantUnitEconomics[] = [];

  funnel: FunnelStage[] = [];
  funnelBars: FunnelBar[] = [];
  northStar: NorthStarMetric | null = null;

  economicsColumns = [
    'company', 'subscription', 'aiCost', 'ocrCost', 'storageCost',
    'cloudCost', 'contribution', 'marginPercent', 'score',
  ];

  displayedColumns = [
    'company', 'cnpj', 'planName', 'status', 'mrr', 'nextBilling', 'usersCount', 'actions',
  ];
  dataSource = new MatTableDataSource<TenantSummary>([]);

  searchTerm = '';
  statusFilter: SubscriptionStatus | 'ALL' = 'ALL';

  statusOptions: { value: SubscriptionStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Todos os status' },
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'TRIALING', label: 'Em avaliação' },
    { value: 'PAST_DUE', label: 'Pagamento pendente' },
    { value: 'GRACE_PERIOD', label: 'Período de carência' },
    { value: 'SUSPENDED', label: 'Suspenso' },
    { value: 'CANCELED', label: 'Cancelado' },
  ];

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (t: TenantSummary, filter: string) => {
      const f = JSON.parse(filter) as { term: string; status: string };
      const term = f.term.trim().toLowerCase();
      const matchTerm =
        !term ||
        t.company.toLowerCase().includes(term) ||
        t.cnpj.toLowerCase().includes(term);
      const matchStatus = f.status === 'ALL' || t.status === f.status;
      return matchTerm && matchStatus;
    };
    this.applyFilter();
  }

  load(): void {
    this.isLoading = true;
    this.saasBilling.getSaasMetrics().subscribe((m) => {
      this.metrics = m;
      this.buildMrrBars(m);
      this.buildAlerts(m);
      this.isLoading = false;
    });
    this.saasBilling.getTenants().subscribe((t) => {
      this.dataSource.data = t;
      this.applyFilter();
    });
    this.saasBilling.getFinancialHealth().subscribe((f) => (this.financial = f));
    this.saasBilling.getTenantUnitEconomics().subscribe((u) => (this.unitEconomics = u));
    this.saasBilling.getFunnel().subscribe((f) => {
      this.funnel = f;
      const base = f.length ? f[0].count || 1 : 1;
      this.funnelBars = f.map((s) => ({
        key: s.key,
        label: s.label,
        count: s.count,
        percent: Math.round((s.count / base) * 100),
        conversion: s.conversionFromPrev,
      }));
    });
    this.saasBilling.getNorthStar().subscribe((n) => (this.northStar = n));
  }

  trackByTenantId(_: number, row: TenantUnitEconomics): string {
    return row.tenantId;
  }

  trackByStage(_: number, s: FunnelBar): string {
    return s.key;
  }

  formatNumber(n: number): string {
    return new Intl.NumberFormat('pt-BR').format(n || 0);
  }

  private buildMrrBars(m: SaasMetrics): void {
    const max = Math.max(...m.mrrByPlan.map((p) => p.mrr), 1);
    this.mrrBars = m.mrrByPlan.map((p) => ({
      plan: p.plan,
      mrr: p.mrr,
      percent: Math.round((p.mrr / max) * 100),
    }));
  }

  private buildAlerts(m: SaasMetrics): void {
    this.alerts = [
      {
        icon: 'error_outline',
        color: '#c62828',
        text: `${m.pastDue} pagamento(s) com falha`,
      },
      {
        icon: 'schedule',
        color: '#ef6c00',
        text: '1 trial termina amanhã',
      },
      {
        icon: 'auto_awesome',
        color: '#ef6c00',
        text: 'Empresa XYZ atingiu 90% da franquia de IA',
      },
    ];
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({
      term: this.searchTerm,
      status: this.statusFilter,
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  }

  statusView(status: SubscriptionStatus): StatusView {
    switch (status) {
      case 'ACTIVE': return { label: 'Ativo', color: '#2e7d32', bg: '#e8f5e9' };
      case 'PAST_DUE': return { label: 'Pagamento pendente', color: '#ef6c00', bg: '#fff3e0' };
      case 'GRACE_PERIOD': return { label: 'Período de carência', color: '#ef6c00', bg: '#fff3e0' };
      case 'SUSPENDED': return { label: 'Suspenso', color: '#c62828', bg: '#ffebee' };
      case 'TRIALING': return { label: 'Em avaliação', color: '#1565c0', bg: '#e3f2fd' };
      case 'CANCELED': return { label: 'Cancelado', color: '#616161', bg: '#f5f5f5' };
      case 'TERMINATED': return { label: 'Encerrado', color: '#616161', bg: '#f5f5f5' };
      default: return { label: status, color: '#616161', bg: '#f5f5f5' };
    }
  }

  scoreView(score: TenantUnitEconomics['score']): ScoreView {
    switch (score) {
      case 'GREEN': return { label: 'Saudável', color: '#2e7d32', bg: '#e8f5e9' };
      case 'YELLOW': return { label: 'Atenção', color: '#ef6c00', bg: '#fff3e0' };
      case 'RED': return { label: 'Crítico', color: '#c62828', bg: '#ffebee' };
      default: return { label: score, color: '#616161', bg: '#f5f5f5' };
    }
  }

  verAssinatura(t: TenantSummary): void {
    this.snackBar.open(`Abrindo assinatura de ${t.company} (mock)`, 'Fechar', { duration: 3000 });
  }

  alterarPlano(t: TenantSummary): void {
    this.snackBar.open(`Alterar plano de ${t.company} (mock)`, 'Fechar', { duration: 3000 });
  }

  isSuspended(t: TenantSummary): boolean {
    return t.status === 'SUSPENDED';
  }

  toggleSuspensao(t: TenantSummary): void {
    if (this.isSuspended(t)) {
      this.setStatus(t, 'ACTIVE');
      this.snackBar.open(`${t.company} reativada (mock)`, 'Fechar', { duration: 3000 });
      return;
    }
    const data: ConfirmDialogData = {
      title: 'Suspender empresa',
      message: `Deseja suspender o acesso de ${t.company}? A empresa perderá acesso ao EIP até ser reativada.`,
      icon: 'block',
      iconColor: '#f44336',
      confirmText: 'Suspender',
      confirmColor: 'warn',
    };
    const ref = this.dialog.open(ConfirmarAcaoDialogComponent, { width: '440px', data });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.setStatus(t, 'SUSPENDED');
        this.snackBar.open(`${t.company} suspensa (mock)`, 'Fechar', { duration: 3000 });
      }
    });
  }

  private setStatus(t: TenantSummary, status: SubscriptionStatus): void {
    this.dataSource.data = this.dataSource.data.map((row) =>
      row.id === t.id ? { ...row, status } : row
    );
    this.applyFilter();
  }
}
