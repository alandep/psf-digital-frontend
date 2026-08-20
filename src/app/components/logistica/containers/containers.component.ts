import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

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
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ContainersMockService } from '../../../../services/containersMockService';
import { ExportService } from '../../../../services/exportService';
import {
  Container,
  ContainerSize,
  ContainerType,
  ContainerStatus,
  ContainerKPIs,
  ContainerFilters,
  CONTAINER_NUMBER_REGEX
} from '../../../../types/containers';

@Component({
  selector: 'app-containers',
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
    MatDividerModule,
    MatBadgeModule,
    MatDialogModule
  ],
  templateUrl: './containers.component.html',
  styleUrls: ['./containers.component.scss']
})
export class ContainersComponent implements OnInit, OnDestroy, AfterViewInit {

  private containersService = inject(ContainersMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  containers: Container[] = [];
  dataSource = new MatTableDataSource<Container>([]);
  selectedContainer: Container | null = null;
  kpis: ContainerKPIs | null = null;

  isLoading = false;
  isDetailOpen = false;
  activeStatusFilter: ContainerStatus | '' = '';

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'containerNumber', 'size', 'type', 'status', 'currentLocation', 'vessel', 'bookingRef', 'freeDaysRemaining', 'actions'
  ];

  sizes: ContainerSize[] = [];
  types: ContainerType[] = [];
  statuses: ContainerStatus[] = [];
  vessels: string[] = [];

  statusChips: ContainerStatus[] = ['BOOKED', 'GATE_IN', 'LOADED', 'IN_TRANSIT', 'ARRIVED', 'GATE_OUT', 'RETURNED', 'DETAINED'];

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.loadContainers();
    this.loadKPIs();
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

  private initForm(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      size: [''],
      type: [''],
      status: [''],
      vessel: ['']
    });
  }

  private loadDropdownData(): void {
    this.sizes = this.containersService.getSizes();
    this.types = this.containersService.getTypes();
    this.statuses = this.containersService.getStatuses();
    this.vessels = this.containersService.getVessels();
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

  loadContainers(): void {
    this.isLoading = true;
    this.containersService.getContainers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.containers = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar containers', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadKPIs(): void {
    this.containersService.getKPIs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(kpis => this.kpis = kpis);
  }

  applyFilters(): void {
    const filters: ContainerFilters = this.filterForm.value;
    this.containersService.getContainers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.containers = data;
        this.dataSource.data = data;
      });
  }

  filterByStatus(status: ContainerStatus | ''): void {
    this.activeStatusFilter = status;
    this.filterForm.patchValue({ status });
  }

  clearFilters(): void {
    this.activeStatusFilter = '';
    this.filterForm.reset({ searchText: '', size: '', type: '', status: '', vessel: '' });
  }

  selectContainer(container: Container): void {
    this.selectedContainer = container;
    this.isDetailOpen = true;
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedContainer = null;
  }

  openNovoContainerDialog(): void {
    import('../dialogs/novo-container-dialog.component').then(m => {
      this.dialog.open(m.NovoContainerDialogComponent, {
        width: '700px',
        panelClass: 'novo-usuario-panel'
      }).afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Container adicionado com sucesso!', 'OK', { duration: 3000 });
          this.loadContainers();
          this.loadKPIs();
        }
      });
    });
  }

  exportCSV(): void {
    const columns = [
      { key: 'containerNumber', label: 'Container' },
      { key: 'size', label: 'Tamanho' },
      { key: 'type', label: 'Tipo' },
      { key: 'status', label: 'Status' },
      { key: 'currentLocation', label: 'Localização' },
      { key: 'vessel', label: 'Navio' },
      { key: 'bookingRef', label: 'Booking' },
      { key: 'freeDaysRemaining', label: 'Free Days' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'containers');
    this.snackBar.open('Exportação CSV concluída!', 'OK', { duration: 2000 });
  }

  exportPDF(): void {
    const columns = [
      { key: 'containerNumber', label: 'Container' },
      { key: 'size', label: 'Tamanho' },
      { key: 'type', label: 'Tipo' },
      { key: 'status', label: 'Status' },
      { key: 'currentLocation', label: 'Localização' },
      { key: 'vessel', label: 'Navio' },
      { key: 'freeDaysRemaining', label: 'Free Days' }
    ];
    this.exportService.exportToPDF('Relatório de Containers', this.dataSource.filteredData, columns, 'containers-report');
  }

  isDemurrageCritical(container: Container): boolean {
    return container.freeDaysRemaining <= 0;
  }

  getRowClass(container: Container): string {
    return this.isDemurrageCritical(container) ? 'row-demurrage-critical' : '';
  }

  isValidContainerNumber(number: string): boolean {
    return CONTAINER_NUMBER_REGEX.test(number);
  }

  calculateDemurrageProjection(container: Container): number {
    if (container.freeDaysRemaining >= 0) return 0;
    return Math.abs(container.freeDaysRemaining) * container.demurrageRate;
  }

  getStatusLabel(status: ContainerStatus): string {
    const map: Record<ContainerStatus, string> = {
      'BOOKED': 'Reservado',
      'GATE_IN': 'Gate-In',
      'LOADED': 'Carregado',
      'IN_TRANSIT': 'Em Trânsito',
      'ARRIVED': 'Chegou',
      'GATE_OUT': 'Gate-Out',
      'RETURNED': 'Devolvido',
      'DETAINED': 'Retido'
    };
    return map[status] || status;
  }

  getStatusColor(status: ContainerStatus): string {
    const map: Record<ContainerStatus, string> = {
      'BOOKED': 'status-booked',
      'GATE_IN': 'status-gatein',
      'LOADED': 'status-loaded',
      'IN_TRANSIT': 'status-transit',
      'ARRIVED': 'status-arrived',
      'GATE_OUT': 'status-gateout',
      'RETURNED': 'status-returned',
      'DETAINED': 'status-detained'
    };
    return map[status] || '';
  }

  getTypeLabel(type: ContainerType): string {
    const map: Record<ContainerType, string> = {
      'DRY': 'Dry',
      'REEFER': 'Reefer',
      'OPEN_TOP': 'Open Top',
      'FLAT_RACK': 'Flat Rack',
      'TANK': 'Tank'
    };
    return map[type] || type;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
  }

  formatDate(date: Date | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
