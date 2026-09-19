import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { DashboardBuilderMockService } from '../../../../services/dashboardBuilderMockService';
import { ExportService } from '../../../../services/exportService';
import { SharedDashboard } from '../../../../types/dashboard-builder';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-compartilhados',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    HasPermissionDirective
  ],
  templateUrl: './compartilhados.component.html',
  styleUrls: ['./compartilhados.component.scss']
})
export class CompartilhadosComponent implements OnInit, OnDestroy, AfterViewInit {

  private dashboardService = inject(DashboardBuilderMockService);
  private exportService = inject(ExportService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  sharedDashboards: SharedDashboard[] = [];
  dataSource = new MatTableDataSource<SharedDashboard>([]);
  isLoading = false;

  displayedColumns: string[] = [
    'dashboardName', 'ownerName', 'sharedDate', 'permission', 'widgets', 'actions'
  ];

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadData(): void {
    this.isLoading = true;
    this.dashboardService.getSharedDashboards()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.sharedDashboards = data;
        this.dataSource.data = data;
        this.isLoading = false;
      });
  }

  getPermissionLabel(permission: string): string {
    return permission === 'VIEW_ONLY' ? 'Somente Leitura' : 'Edição';
  }

  getPermissionColor(permission: string): string {
    return permission === 'VIEW_ONLY' ? '#9e9e9e' : '#4caf50';
  }

  isEditDisabled(permission: string): boolean {
    return permission === 'VIEW_ONLY';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  openDashboard(row: SharedDashboard): void {
    this.snackBar.open(`Abrindo dashboard "${row.dashboardName}"...`, 'OK', { duration: 3000 });
  }

  editDashboard(row: SharedDashboard): void {
    this.snackBar.open(`Editando "${row.dashboardName}"...`, 'OK', { duration: 3000 });
  }

  removeWidget(row: SharedDashboard): void {
    this.snackBar.open(`Widget removido de "${row.dashboardName}".`, 'OK', { duration: 3000 });
  }

  exportToCSV(): void {
    const columns = [
      { key: 'dashboardName', label: 'Dashboard' },
      { key: 'ownerName', label: 'Proprietário' },
      { key: 'sharedDate', label: 'Data Compartilhamento' },
      { key: 'permission', label: 'Permissão' },
      { key: 'widgets', label: 'Widgets' }
    ];
    this.exportService.exportToCSV(this.sharedDashboards, columns, 'dashboards-compartilhados');
  }

  exportToPDF(): void {
    const columns = [
      { key: 'dashboardName', label: 'Dashboard' },
      { key: 'ownerName', label: 'Proprietário' },
      { key: 'sharedDate', label: 'Data Compartilhamento' },
      { key: 'permission', label: 'Permissão' },
      { key: 'widgets', label: 'Widgets' }
    ];
    this.exportService.exportToPDF('Dashboards Compartilhados', this.sharedDashboards, columns, 'dashboards-compartilhados');
  }
}
