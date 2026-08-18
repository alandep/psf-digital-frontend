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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services and Types
import { RelatorioLogisticaMockService } from '../../../../services/relatorioLogisticaMockService';
import { ExportService } from '../../../../services/exportService';
import { LogisticsReport, LogisticsMetrics, PortPerformance, CarrierPerformance } from '../../../../types/relatorio-logistica';

@Component({
  selector: 'app-relatorios-logistica',
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
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './relatorios-logistica.component.html',
  styleUrls: ['./relatorios-logistica.component.scss']
})
export class RelatoriosLogisticaComponent implements OnInit, OnDestroy {

  private logisticaService = inject(RelatorioLogisticaMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private exportService = inject(ExportService);
  private destroy$ = new Subject<void>();

  @ViewChild('logisticaPaginator') logisticaPaginator!: MatPaginator;
  @ViewChild('logisticaSort') logisticaSort!: MatSort;

  dataSource = new MatTableDataSource<LogisticsReport>([]);
  metrics: LogisticsMetrics = {
    totalShipments: 0, onTimeRate: 0, avgTransitDays: 0,
    totalContainers: 0, avgCostPerContainer: 0, delayedShipments: 0,
    topCarrier: '', topRoute: ''
  };
  ports: PortPerformance[] = [];
  carriers: CarrierPerformance[] = [];
  filterForm!: FormGroup;
  isLoading = false;

  displayedColumns: string[] = [
    'shipmentNumber', 'vessel', 'origin', 'destination', 'containerCount',
    'departureDate', 'arrivalDate', 'transitDays', 'status', 'carrier',
    'cost', 'onTime', 'delayDays'
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      carrier: [''],
      origin: [''],
      onTime: ['']
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

    this.logisticaService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);

    this.logisticaService.getPortPerformances()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ports => this.ports = ports);

    this.logisticaService.getCarrierPerformances()
      .pipe(takeUntil(this.destroy$))
      .subscribe(carriers => this.carriers = carriers);

    this.logisticaService.getShipments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(shipments => {
        this.dataSource.data = shipments;
        setTimeout(() => {
          this.dataSource.paginator = this.logisticaPaginator;
          this.dataSource.sort = this.logisticaSort;
        });
        this.isLoading = false;
      });
  }

  applyFilters(): void {
    const { searchText, carrier, origin, onTime } = this.filterForm.value;

    this.dataSource.filterPredicate = (data: LogisticsReport, filter: string) => {
      const filterObj = JSON.parse(filter);
      let match = true;

      if (filterObj.searchText) {
        const search = filterObj.searchText.toLowerCase();
        match = match && (
          data.shipmentNumber.toLowerCase().includes(search) ||
          data.vessel.toLowerCase().includes(search) ||
          data.destination.toLowerCase().includes(search)
        );
      }
      if (filterObj.carrier) {
        match = match && data.carrier === filterObj.carrier;
      }
      if (filterObj.origin) {
        match = match && data.origin === filterObj.origin;
      }
      if (filterObj.onTime !== '' && filterObj.onTime !== null) {
        match = match && data.onTime === (filterObj.onTime === 'true');
      }

      return match;
    };

    this.dataSource.filter = JSON.stringify({ searchText, carrier, origin, onTime });
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', carrier: '', origin: '', onTime: '' });
  }

  exportPDF(): void {
    const columns = [
      { key: 'shipmentNumber', label: 'Nº Embarque' },
      { key: 'vessel', label: 'Navio' },
      { key: 'origin', label: 'Origem' },
      { key: 'destination', label: 'Destino' },
      { key: 'containerCount', label: 'Containers' },
      { key: 'departureDate', label: 'Data Partida' },
      { key: 'arrivalDate', label: 'Data Chegada' },
      { key: 'transitDays', label: 'Dias Trânsito' },
      { key: 'status', label: 'Status' },
      { key: 'carrier', label: 'Transportadora' },
      { key: 'cost', label: 'Custo' },
      { key: 'onTime', label: 'No Prazo' },
      { key: 'delayDays', label: 'Dias Atraso' }
    ];
    this.exportService.exportToPDF('Relatório Logístico', this.dataSource.filteredData, columns, 'relatorio-logistica');
    this.snackBar.open('Relatório PDF gerado com sucesso!', 'OK', { duration: 3000 });
  }

  exportExcel(): void {
    const columns = [
      { key: 'shipmentNumber', label: 'Nº Embarque' },
      { key: 'vessel', label: 'Navio' },
      { key: 'origin', label: 'Origem' },
      { key: 'destination', label: 'Destino' },
      { key: 'containerCount', label: 'Containers' },
      { key: 'departureDate', label: 'Data Partida' },
      { key: 'arrivalDate', label: 'Data Chegada' },
      { key: 'transitDays', label: 'Dias Trânsito' },
      { key: 'status', label: 'Status' },
      { key: 'carrier', label: 'Transportadora' },
      { key: 'cost', label: 'Custo' },
      { key: 'onTime', label: 'No Prazo' },
      { key: 'delayDays', label: 'Dias Atraso' }
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'relatorio-logistica');
    this.snackBar.open('Arquivo CSV exportado com sucesso!', 'OK', { duration: 3000 });
  }

  getMaxCarrierOTIF(): number {
    return Math.max(...this.carriers.map(c => c.onTimeRate));
  }
}
