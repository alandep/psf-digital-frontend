import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { DueDiligenceMockService } from '../../../../services/dueDiligenceMockService';
import { ExportService } from '../../../../services/exportService';
import { Screening, ScreeningStatus, DueDiligenceMetrics } from '../../../../types/due-diligence';
import { NovaScreeningDialogComponent } from '../dialogs/nova-screening-dialog.component';
import { ResolucaoDialogComponent } from '../dialogs/resolucao-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-due-diligence',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDialogModule,
    HasPermissionDirective
  ],
  templateUrl: './due-diligence.component.html',
  styleUrls: ['./due-diligence.component.scss']
})
export class DueDiligenceComponent implements OnInit, OnDestroy {

  private dueDiligenceService = inject(DueDiligenceMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  screenings: Screening[] = [];
  dataSource = new MatTableDataSource<Screening>([]);
  metrics: DueDiligenceMetrics | null = null;

  isLoading = false;
  selectedTabIndex = 0;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'entityName', 'entityType', 'screeningType', 'status', 'riskLevel',
    'assignedAnalyst', 'createdAt', 'slaDeadline', 'actions'
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadScreenings();
    this.loadMetrics();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      screeningType: [''],
      status: [''],
      riskLevel: ['']
    });
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
  }

  loadScreenings(): void {
    this.isLoading = true;
    this.dueDiligenceService.getScreenings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.screenings = data;
          this.filterByTab(this.selectedTabIndex);
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar screenings', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.dueDiligenceService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.dueDiligenceService.getScreenings(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.screenings = data;
        this.filterByTab(this.selectedTabIndex);
      });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.filterByTab(index);
  }

  private filterByTab(tabIndex: number): void {
    let filtered: Screening[];
    switch (tabIndex) {
      case 0: // Pendentes
        filtered = this.screenings.filter(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS');
        break;
      case 1: // Concluídos
        filtered = this.screenings.filter(s => s.status === 'COMPLETED');
        break;
      case 2: // Sinalizados
        filtered = this.screenings.filter(s => s.status === 'FLAGGED');
        break;
      case 3: // Expirados
        filtered = this.screenings.filter(s => s.status === 'EXPIRED');
        break;
      default:
        filtered = this.screenings;
    }
    this.dataSource.data = filtered;
  }

  createScreening(): void {
    const dialogRef = this.dialog.open(NovaScreeningDialogComponent, {
      width: '90vw',
      maxWidth: '700px',
      height: '80vh',
      maxHeight: '600px',
      disableClose: false,
      panelClass: 'novo-usuario-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.dueDiligenceService.createScreening(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Screening criada com sucesso!', 'OK', { duration: 3000 });
              this.loadScreenings();
              this.loadMetrics();
              this.isLoading = false;
            },
            error: () => {
              this.snackBar.open('Erro ao criar screening', 'Fechar', { duration: 5000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  openResolution(screening: Screening): void {
    const dialogRef = this.dialog.open(ResolucaoDialogComponent, {
      width: '90vw',
      maxWidth: '600px',
      height: '70vh',
      maxHeight: '500px',
      disableClose: false,
      panelClass: 'novo-usuario-panel',
      data: { screening }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.dueDiligenceService.submitResolution(screening.id, result.resolution, result.justification)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Resolução registrada com sucesso!', 'OK', { duration: 3000 });
              this.loadScreenings();
              this.loadMetrics();
              this.isLoading = false;
            },
            error: () => {
              this.snackBar.open('Erro ao registrar resolução', 'Fechar', { duration: 5000 });
              this.isLoading = false;
            }
          });
      }
    });
  }

  exportCSV(): void {
    const columns = [
      { key: 'entityName', label: 'Entidade' },
      { key: 'entityType', label: 'Tipo' },
      { key: 'screeningType', label: 'Tipo Screening' },
      { key: 'status', label: 'Status' },
      { key: 'riskLevel', label: 'Nível Risco' },
      { key: 'assignedAnalyst', label: 'Analista' },
      { key: 'country', label: 'País' }
    ];
    this.exportService.exportToCSV(this.screenings, columns, 'due-diligence-screenings');
  }

  // Helper methods
  getScreeningTypeLabel(type: string): string {
    const map: Record<string, string> = { 'KYC': 'KYC', 'AML': 'AML', 'SANCTIONS': 'Sanções', 'PEP': 'PEP' };
    return map[type] || type;
  }

  getScreeningTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'Pendente', 'IN_PROGRESS': 'Em Análise', 'COMPLETED': 'Concluído',
      'FLAGGED': 'Sinalizado', 'EXPIRED': 'Expirado'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  getRiskLabel(risk: string): string {
    const map: Record<string, string> = { 'LOW': 'Baixo', 'MEDIUM': 'Médio', 'HIGH': 'Alto', 'CRITICAL': 'Crítico' };
    return map[risk] || risk;
  }

  getRiskClass(risk: string): string {
    return `risk-${risk.toLowerCase()}`;
  }

  getSlaStatus(screening: Screening): string {
    const remaining = this.dueDiligenceService.calculateBusinessDaysRemaining(screening.slaDeadline);
    if (remaining <= 0) return 'Expirado';
    return `${remaining} dias restantes`;
  }

  isSlaExpired(screening: Screening): boolean {
    return this.dueDiligenceService.calculateBusinessDaysRemaining(screening.slaDeadline) <= 0;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
