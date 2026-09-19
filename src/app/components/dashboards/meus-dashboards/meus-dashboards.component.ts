import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DashboardBuilderMockService } from '../../../../services/dashboardBuilderMockService';
import { ExportService } from '../../../../services/exportService';
import { UserDashboard, DashboardMetrics, DashboardWidget } from '../../../../types/dashboard-builder';
import { NovoDashboardDialogComponent } from '../dialogs/novo-dashboard-dialog.component';
import { ConfirmarAcaoDialogComponent, ConfirmDialogData } from '../../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-meus-dashboards',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    HasPermissionDirective
  ],
  templateUrl: './meus-dashboards.component.html',
  styleUrls: ['./meus-dashboards.component.scss']
})
export class MeusDashboardsComponent implements OnInit, OnDestroy {

  private dashboardService = inject(DashboardBuilderMockService);
  private exportService = inject(ExportService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  dashboards: UserDashboard[] = [];
  metrics: DashboardMetrics | null = null;
  selectedDashboard: UserDashboard | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.dashboardService.getUserDashboards()
      .pipe(takeUntil(this.destroy$))
      .subscribe(d => {
        this.dashboards = d;
        this.isLoading = false;
      });

    this.dashboardService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(m => this.metrics = m);
  }

  openNewDashboardDialog(): void {
    const dialogRef = this.dialog.open(NovoDashboardDialogComponent, {
      width: '500px',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result) {
          this.dashboardService.createDashboard(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.snackBar.open('Dashboard criado com sucesso!', 'OK', { duration: 3000 });
              this.loadData();
            });
        }
      });
  }

  selectDashboard(dashboard: UserDashboard): void {
    this.selectedDashboard = this.selectedDashboard?.id === dashboard.id ? null : dashboard;
  }

  shareDashboard(event: Event, dashboard: UserDashboard): void {
    event.stopPropagation();
    this.snackBar.open(`Link de compartilhamento de "${dashboard.name}" copiado.`, 'OK', { duration: 3000 });
  }

  deleteDashboard(event: Event, dashboard: UserDashboard): void {
    event.stopPropagation();
    const data: ConfirmDialogData = {
      title: 'Excluir Dashboard',
      message: `Tem certeza que deseja excluir o dashboard "${dashboard.name}"?`,
      icon: 'delete',
      iconColor: '#f44336',
      confirmText: 'Excluir',
      confirmColor: 'warn'
    };
    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '420px',
      autoFocus: false,
      data
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed: boolean) => {
        if (confirmed === true) {
          this.dashboardService.deleteDashboard(dashboard.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.snackBar.open('Dashboard removido', 'OK', { duration: 3000 });
              if (this.selectedDashboard?.id === dashboard.id) {
                this.selectedDashboard = null;
              }
              this.loadData();
            });
        }
      });
  }

  getLayoutLabel(layout: string): string {
    switch (layout) {
      case '1-COLUMN': return '1 Coluna';
      case '2-COLUMN': return '2 Colunas';
      case '3-COLUMN': return '3 Colunas';
      default: return layout;
    }
  }

  getLayoutColumns(layout: string): string {
    switch (layout) {
      case '1-COLUMN': return '1fr';
      case '2-COLUMN': return '1fr 1fr';
      case '3-COLUMN': return '1fr 1fr 1fr';
      default: return '1fr';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  exportToCSV(): void {
    const columns = [
      { key: 'name', label: 'Nome' },
      { key: 'description', label: 'Descrição' },
      { key: 'layout', label: 'Layout' },
      { key: 'shared', label: 'Compartilhado' }
    ];
    const data = this.dashboards.map(d => ({ ...d, shared: d.shared ? 'Sim' : 'Não' }));
    this.exportService.exportToCSV(data, columns, 'meus-dashboards');
  }
}
