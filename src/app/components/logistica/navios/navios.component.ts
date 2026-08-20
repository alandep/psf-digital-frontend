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

import { NaviosMockService } from '../../../../services/naviosMockService';
import { ExportService } from '../../../../services/exportService';
import {
  Navio,
  VesselType,
  VesselStatus,
  NavioKPIs,
  NavioFilters,
  PortCall
} from '../../../../types/navios';

@Component({
  selector: 'app-navios',
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
  templateUrl: './navios.component.html',
  styleUrls: ['./navios.component.scss']
})
export class NaviosComponent implements OnInit, OnDestroy, AfterViewInit {

  private naviosService = inject(NaviosMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  navios: Navio[] = [];
  dataSource = new MatTableDataSource<Navio>([]);
  selectedNavio: Navio | null = null;
  kpis: NavioKPIs | null = null;

  isLoading = false;
  isDetailOpen = false;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'vesselName', 'imoNumber', 'flag', 'vesselType', 'capacity', 'currentPort', 'eta', 'status', 'actions'
  ];

  vesselTypes: VesselType[] = [];
  statuses: VesselStatus[] = [];
  flags: string[] = [];
  ports: string[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.loadNavios();
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
      vesselType: [''],
      status: [''],
      flag: [''],
      port: ['']
    });
  }

  private loadDropdownData(): void {
    this.vesselTypes = this.naviosService.getVesselTypes();
    this.statuses = this.naviosService.getStatuses();
    this.flags = this.naviosService.getFlags();
    this.ports = this.naviosService.getPorts();
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

  loadNavios(): void {
    this.isLoading = true;
    this.naviosService.getNavios()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.navios = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar navios', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadKPIs(): void {
    this.naviosService.getKPIs()
      .pipe(takeUntil(this.destroy$))
      .subscribe(kpis => this.kpis = kpis);
  }

  applyFilters(): void {
    const filters: NavioFilters = this.filterForm.value;
    this.naviosService.getNavios(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.navios = data;
        this.dataSource.data = data;
      });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', vesselType: '', status: '', flag: '', port: '' });
  }

  selectNavio(navio: Navio): void {
    this.selectedNavio = navio;
    this.isDetailOpen = true;
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedNavio = null;
  }

  openNovoNavioDialog(): void {
    import('../dialogs/novo-navio-dialog.component').then(m => {
      this.dialog.open(m.NovoNavioDialogComponent, {
        width: '700px',
        panelClass: 'novo-usuario-panel'
      }).afterClosed().subscribe(result => {
        if (result) {
          this.snackBar.open('Navio adicionado ao rastreamento!', 'OK', { duration: 3000 });
          this.loadNavios();
          this.loadKPIs();
        }
      });
    });
  }

  exportCSV(): void {
    const columns = [
      { key: 'vesselName', label: 'Navio' },
      { key: 'imoNumber', label: 'IMO' },
      { key: 'flag', label: 'Bandeira' },
      { key: 'vesselType', label: 'Tipo' },
      { key: 'capacity', label: 'Capacidade' },
      { key: 'currentPort', label: 'Localização' },
      { key: 'eta', label: 'ETA' },
      { key: 'status', label: 'Status' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'navios-rastreamento');
    this.snackBar.open('Exportação CSV concluída!', 'OK', { duration: 2000 });
  }

  exportPDF(): void {
    const columns = [
      { key: 'vesselName', label: 'Navio' },
      { key: 'imoNumber', label: 'IMO' },
      { key: 'flag', label: 'Bandeira' },
      { key: 'vesselType', label: 'Tipo' },
      { key: 'currentPort', label: 'Localização' },
      { key: 'eta', label: 'ETA' },
      { key: 'status', label: 'Status' }
    ];
    this.exportService.exportToPDF('Relatório de Navios', this.dataSource.filteredData, columns, 'navios-report');
  }

  isDelayed(navio: Navio): boolean {
    const eta = new Date(navio.eta).getTime();
    const originalEta = new Date(navio.originalEta).getTime();
    return Math.abs(eta - originalEta) > 24 * 60 * 60 * 1000;
  }

  getRowClass(navio: Navio): string {
    return this.isDelayed(navio) ? 'row-delay-alert' : '';
  }

  getVesselTypeLabel(type: VesselType): string {
    const map: Record<VesselType, string> = {
      'BULK_CARRIER': 'Graneleiro',
      'CONTAINER_SHIP': 'Porta-contêiner',
      'TANKER': 'Petroleiro',
      'REEFER': 'Frigorífico',
      'RORO': 'Ro-Ro',
      'GENERAL_CARGO': 'Carga Geral'
    };
    return map[type] || type;
  }

  getStatusLabel(status: VesselStatus): string {
    const map: Record<VesselStatus, string> = {
      'EM_TRANSITO': 'Em Trânsito',
      'NO_PORTO': 'No Porto',
      'FUNDEADO': 'Fundeado',
      'EM_MANUTENCAO': 'Em Manutenção',
      'ATRASADO': 'Atrasado',
      'CARREGANDO': 'Carregando',
      'DESCARREGANDO': 'Descarregando'
    };
    return map[status] || status;
  }

  getStatusColor(status: VesselStatus): string {
    const map: Record<VesselStatus, string> = {
      'EM_TRANSITO': 'status-transito',
      'NO_PORTO': 'status-porto',
      'FUNDEADO': 'status-fundeado',
      'EM_MANUTENCAO': 'status-manutencao',
      'ATRASADO': 'status-atrasado',
      'CARREGANDO': 'status-carregando',
      'DESCARREGANDO': 'status-descarregando'
    };
    return map[status] || '';
  }

  getStatusIcon(status: VesselStatus): string {
    const map: Record<VesselStatus, string> = {
      'EM_TRANSITO': 'sailing',
      'NO_PORTO': 'anchor',
      'FUNDEADO': 'location_on',
      'EM_MANUTENCAO': 'build',
      'ATRASADO': 'warning',
      'CARREGANDO': 'upload',
      'DESCARREGANDO': 'download'
    };
    return map[status] || 'directions_boat';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }
}
