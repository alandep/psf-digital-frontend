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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services and Types
import { SiscomexMockService } from '../../../../services/siscomexMockService';
import {
  SiscomexService,
  SiscomexServiceStatus,
  DueRegistration,
  DueStatus,
  LpcoRecord,
  LpcoStatus,
  SiscomexMetrics,
  SiscomexEvent,
  SiscomexFilters
} from '../../../../types/integracoes-siscomex';

@Component({
  selector: 'app-siscomex',
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
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './siscomex.component.html',
  styleUrls: ['./siscomex.component.scss']
})
export class SiscomexComponent implements OnInit, OnDestroy {

  // Services
  private siscomexService = inject(SiscomexMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // ViewChild references
  @ViewChild('duePaginator') duePaginator!: MatPaginator;
  @ViewChild('dueSort') dueSort!: MatSort;
  @ViewChild('lpcoPaginator') lpcoPaginator!: MatPaginator;
  @ViewChild('lpcoSort') lpcoSort!: MatSort;

  // Data State
  services: SiscomexService[] = [];
  metrics: SiscomexMetrics | null = null;
  events: SiscomexEvent[] = [];

  // Table DataSources
  dueDataSource = new MatTableDataSource<DueRegistration>([]);
  lpcoDataSource = new MatTableDataSource<LpcoRecord>([]);

  // UI State
  isLoading = false;

  // Forms
  filterForm!: FormGroup;

  // Table columns
  dueDisplayedColumns: string[] = [
    'dueNumber', 'exporterName', 'status', 'country', 'totalValue',
    'ncm', 'product', 'port', 'channel', 'registrationDate', 'lastUpdate', 'actions'
  ];

  lpcoDisplayedColumns: string[] = [
    'lpcoNumber', 'type', 'organ', 'product', 'status',
    'requestDate', 'volume', 'usedVolume', 'linkedDue'
  ];

  // Dropdown data
  dueStatuses: DueStatus[] = ['RASCUNHO', 'REGISTRADA', 'DESEMBARACADA', 'AVERBADA', 'CANCELADA', 'COM_EXIGENCIA'];
  channels: string[] = ['Verde', 'Amarelo', 'Vermelho', 'Cinza'];

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
      searchText: [''],
      status: [''],
      channel: [''],
      dateStart: [null],
      dateEnd: [null]
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

    this.siscomexService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(services => this.services = services);

    this.siscomexService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.siscomexService.getDueRegistrations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(dues => {
        this.dueDataSource.data = dues;
        setTimeout(() => {
          this.dueDataSource.paginator = this.duePaginator;
          this.dueDataSource.sort = this.dueSort;
        });
        this.isLoading = false;
      });

    this.siscomexService.getLpcoRecords()
      .pipe(takeUntil(this.destroy$))
      .subscribe(lpcos => {
        this.lpcoDataSource.data = lpcos;
        setTimeout(() => {
          this.lpcoDataSource.paginator = this.lpcoPaginator;
          this.lpcoDataSource.sort = this.lpcoSort;
        });
      });

    this.siscomexService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(events => this.events = events);
  }

  applyFilters(): void {
    const filters: SiscomexFilters = this.filterForm.value;
    this.siscomexService.getDueRegistrations(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(dues => {
        this.dueDataSource.data = dues;
      });
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      status: '',
      channel: '',
      dateStart: null,
      dateEnd: null
    });
  }

  refreshServices(): void {
    this.siscomexService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(services => {
        this.services = services;
        this.snackBar.open('Status dos serviços atualizado', 'OK', { duration: 2000 });
      });
  }

  viewDueDetails(due: DueRegistration): void {
    this.snackBar.open(`Detalhes DU-E ${due.dueNumber} - ${due.product}`, 'Fechar', { duration: 3000 });
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  getServiceStatusClass(status: SiscomexServiceStatus): string {
    const map: Record<SiscomexServiceStatus, string> = {
      'ONLINE': 'service-online',
      'DEGRADED': 'service-degraded',
      'OFFLINE': 'service-offline',
      'MAINTENANCE': 'service-maintenance'
    };
    return map[status] || '';
  }

  getServiceStatusLabel(status: SiscomexServiceStatus): string {
    const map: Record<SiscomexServiceStatus, string> = {
      'ONLINE': 'Online',
      'DEGRADED': 'Degradado',
      'OFFLINE': 'Offline',
      'MAINTENANCE': 'Manutenção'
    };
    return map[status] || status;
  }

  getServiceStatusIcon(status: SiscomexServiceStatus): string {
    const map: Record<SiscomexServiceStatus, string> = {
      'ONLINE': 'check_circle',
      'DEGRADED': 'warning',
      'OFFLINE': 'cancel',
      'MAINTENANCE': 'build'
    };
    return map[status] || 'help';
  }

  getDueStatusClass(status: DueStatus): string {
    const map: Record<DueStatus, string> = {
      'RASCUNHO': 'due-rascunho',
      'REGISTRADA': 'due-registrada',
      'DESEMBARACADA': 'due-desembaracada',
      'AVERBADA': 'due-averbada',
      'CANCELADA': 'due-cancelada',
      'COM_EXIGENCIA': 'due-exigencia'
    };
    return map[status] || '';
  }

  getDueStatusLabel(status: DueStatus): string {
    const map: Record<DueStatus, string> = {
      'RASCUNHO': 'Rascunho',
      'REGISTRADA': 'Registrada',
      'DESEMBARACADA': 'Desembaraçada',
      'AVERBADA': 'Averbada',
      'CANCELADA': 'Cancelada',
      'COM_EXIGENCIA': 'Com Exigência'
    };
    return map[status] || status;
  }

  getChannelClass(channel: string): string {
    const map: Record<string, string> = {
      'Verde': 'channel-verde',
      'Amarelo': 'channel-amarelo',
      'Vermelho': 'channel-vermelho',
      'Cinza': 'channel-cinza'
    };
    return map[channel] || '';
  }

  getLpcoStatusClass(status: LpcoStatus): string {
    const map: Record<LpcoStatus, string> = {
      'SOLICITADA': 'lpco-solicitada',
      'EM_ANALISE': 'lpco-em-analise',
      'DEFERIDA': 'lpco-deferida',
      'INDEFERIDA': 'lpco-indeferida',
      'CANCELADA': 'lpco-cancelada'
    };
    return map[status] || '';
  }

  getLpcoStatusLabel(status: LpcoStatus): string {
    const map: Record<LpcoStatus, string> = {
      'SOLICITADA': 'Solicitada',
      'EM_ANALISE': 'Em Análise',
      'DEFERIDA': 'Deferida',
      'INDEFERIDA': 'Indeferida',
      'CANCELADA': 'Cancelada'
    };
    return map[status] || status;
  }

  getEventIcon(type: SiscomexEvent['type']): string {
    const map: Record<SiscomexEvent['type'], string> = {
      'DUE_REGISTERED': 'description',
      'DUE_CLEARED': 'verified',
      'LPCO_APPROVED': 'task_alt',
      'SERVICE_DOWN': 'cloud_off',
      'SERVICE_RESTORED': 'cloud_done',
      'EXIGENCIA': 'report_problem'
    };
    return map[type] || 'info';
  }

  getEventSeverityClass(severity: SiscomexEvent['severity']): string {
    return `event-${severity.toLowerCase()}`;
  }

  formatCurrency(value: number, currency: string): string {
    return `${currency} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
}
