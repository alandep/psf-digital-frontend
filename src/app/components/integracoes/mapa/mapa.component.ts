import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material
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

// Services and Types
import { MapaMockService } from '../../../../services/mapaMockService';
import {
  MapaCertificate,
  CertificateStatus,
  MapaInspection,
  InspectionStatus,
  MapaHabilitacao,
  HabilitacaoStatus,
  MapaMetrics
} from '../../../../types/integracoes-mapa';

@Component({
  selector: 'app-mapa',
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
    MatTooltipModule
  ],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements OnInit, OnDestroy {

  // Services
  private mapaService = inject(MapaMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // ViewChild references
  @ViewChild('certPaginator') certPaginator!: MatPaginator;
  @ViewChild('certSort') certSort!: MatSort;
  @ViewChild('inspPaginator') inspPaginator!: MatPaginator;
  @ViewChild('inspSort') inspSort!: MatSort;
  @ViewChild('habPaginator') habPaginator!: MatPaginator;
  @ViewChild('habSort') habSort!: MatSort;

  // Data State
  metrics: MapaMetrics | null = null;

  // Table DataSources
  certDataSource = new MatTableDataSource<MapaCertificate>([]);
  inspDataSource = new MatTableDataSource<MapaInspection>([]);
  habDataSource = new MatTableDataSource<MapaHabilitacao>([]);

  // UI State
  isLoading = false;

  // Forms
  filterForm!: FormGroup;

  // Table columns
  certDisplayedColumns: string[] = [
    'number', 'type', 'product', 'ncm', 'destination', 'establishment',
    'issueDate', 'expirationDate', 'status', 'inspector', 'linkedDue', 'volume'
  ];

  inspDisplayedColumns: string[] = [
    'type', 'product', 'establishment', 'scheduledDate', 'inspector',
    'status', 'result', 'observations', 'linkedCertificate'
  ];

  habDisplayedColumns: string[] = [
    'establishment', 'cnpj', 'sifNumber', 'products', 'markets',
    'status', 'issueDate', 'expirationDate', 'lastAudit'
  ];

  // Dropdown data
  certStatuses: CertificateStatus[] = ['VIGENTE', 'VENCIDO', 'EM_EMISSÃO', 'SUSPENSO', 'CANCELADO'];
  inspStatuses: InspectionStatus[] = ['AGENDADA', 'EM_ANDAMENTO', 'APROVADA', 'REPROVADA', 'CANCELADA'];

  ngOnInit(): void {
    this.initForms();
    this.loadData();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: ['']
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

  private loadData(): void {
    this.isLoading = true;

    this.mapaService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.mapaService.getCertificates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(certs => {
        this.certDataSource.data = certs;
        setTimeout(() => {
          this.certDataSource.paginator = this.certPaginator;
          this.certDataSource.sort = this.certSort;
        });
        this.isLoading = false;
      });

    this.mapaService.getInspections()
      .pipe(takeUntil(this.destroy$))
      .subscribe(insps => {
        this.inspDataSource.data = insps;
        setTimeout(() => {
          this.inspDataSource.paginator = this.inspPaginator;
          this.inspDataSource.sort = this.inspSort;
        });
      });

    this.mapaService.getHabilitacoes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(habs => {
        this.habDataSource.data = habs;
        setTimeout(() => {
          this.habDataSource.paginator = this.habPaginator;
          this.habDataSource.sort = this.habSort;
        });
      });
  }

  applyFilters(): void {
    const search = this.filterForm.get('searchText')?.value?.toLowerCase() || '';
    this.certDataSource.filter = search;
    this.inspDataSource.filter = search;
    this.habDataSource.filter = search;
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '' });
  }

  refreshData(): void {
    this.loadData();
    this.snackBar.open('Dados MAPA atualizados', 'OK', { duration: 2000 });
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  getCertStatusClass(status: CertificateStatus): string {
    const map: Record<CertificateStatus, string> = {
      'VIGENTE': 'status-vigente',
      'VENCIDO': 'status-vencido',
      'EM_EMISSÃO': 'status-emissao',
      'SUSPENSO': 'status-suspenso',
      'CANCELADO': 'status-cancelado'
    };
    return map[status] || '';
  }

  getCertStatusLabel(status: CertificateStatus): string {
    const map: Record<CertificateStatus, string> = {
      'VIGENTE': 'Vigente',
      'VENCIDO': 'Vencido',
      'EM_EMISSÃO': 'Em Emissão',
      'SUSPENSO': 'Suspenso',
      'CANCELADO': 'Cancelado'
    };
    return map[status] || status;
  }

  getInspStatusClass(status: InspectionStatus): string {
    const map: Record<InspectionStatus, string> = {
      'AGENDADA': 'status-agendada',
      'EM_ANDAMENTO': 'status-andamento',
      'APROVADA': 'status-aprovada',
      'REPROVADA': 'status-reprovada',
      'CANCELADA': 'status-cancelada'
    };
    return map[status] || '';
  }

  getInspStatusLabel(status: InspectionStatus): string {
    const map: Record<InspectionStatus, string> = {
      'AGENDADA': 'Agendada',
      'EM_ANDAMENTO': 'Em Andamento',
      'APROVADA': 'Aprovada',
      'REPROVADA': 'Reprovada',
      'CANCELADA': 'Cancelada'
    };
    return map[status] || status;
  }

  getHabStatusClass(status: HabilitacaoStatus): string {
    const map: Record<HabilitacaoStatus, string> = {
      'ATIVA': 'status-ativa',
      'SUSPENSA': 'status-suspensa',
      'VENCIDA': 'status-vencida',
      'EM_RENOVAÇÃO': 'status-renovacao'
    };
    return map[status] || '';
  }

  getHabStatusLabel(status: HabilitacaoStatus): string {
    const map: Record<HabilitacaoStatus, string> = {
      'ATIVA': 'Ativa',
      'SUSPENSA': 'Suspensa',
      'VENCIDA': 'Vencida',
      'EM_RENOVAÇÃO': 'Em Renovação'
    };
    return map[status] || status;
  }
}
