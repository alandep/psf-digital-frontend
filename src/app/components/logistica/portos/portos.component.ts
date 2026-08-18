import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services and Types
import { PortosMockService } from '../../../../services/portosMockService';
import {
  Porto,
  PortType,
  OperationalStatus,
  CongestionLevel,
  PortInfrastructure,
  OperationalIndicator,
  LogisticsRoute,
  PortShipment,
  PortAIInsights,
  PortFilters,
  PortMetrics,
  SimulationResult
} from '../../../../types/portos';

@Component({
  selector: 'app-portos',
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
    MatBadgeModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './portos.component.html',
  styleUrls: ['./portos.component.scss']
})
export class PortosComponent implements OnInit, OnDestroy {

  // Services
  private portosService = inject(PortosMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // Data State
  portos: Porto[] = [];
  filteredPortos: Porto[] = [];
  selectedPorto: Porto | null = null;
  infrastructure: PortInfrastructure | null = null;
  indicators: OperationalIndicator | null = null;
  routes: LogisticsRoute[] = [];
  shipments: PortShipment[] = [];
  aiInsights: PortAIInsights | null = null;
  metrics: PortMetrics | null = null;
  simulationResult: SimulationResult | null = null;

  // UI State
  isLoading = false;
  isDetailOpen = false;
  isSimulating = false;
  isSimulationExpanded = true;

  // Forms
  filterForm!: FormGroup;
  simulationForm!: FormGroup;

  // Table columns
  displayedColumns: string[] = ['name', 'unLocode', 'country', 'portType', 'operationalStatus', 'congestionLevel', 'aiLogisticsScore', 'actions'];

  // Dropdown data
  countries: string[] = [];
  portTypes: PortType[] = [];
  statuses: OperationalStatus[] = [];
  congestionLevels: CongestionLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.loadPortos();
    this.loadMetrics();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      country: [''],
      portType: [''],
      operationalStatus: [''],
      congestionLevel: ['']
    });

    this.simulationForm = this.formBuilder.group({
      product: ['Soja em Grãos', Validators.required],
      quantity: [5000, [Validators.required, Validators.min(1)]],
      origin: ['Rondonópolis - MT', Validators.required],
      destination: ['Shanghai - China', Validators.required],
      incoterm: ['FOB', Validators.required],
      date: [new Date(), Validators.required]
    });
  }

  private loadDropdownData(): void {
    this.countries = this.portosService.getCountries();
    this.portTypes = this.portosService.getPortTypes();
    this.statuses = this.portosService.getStatuses();
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

  loadPortos(): void {
    this.isLoading = true;
    this.portosService.getPortos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (portos) => {
          this.portos = portos;
          this.filteredPortos = portos;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar portos', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.portosService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  applyFilters(): void {
    const filters: PortFilters = this.filterForm.value;
    this.portosService.getPortos(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(portos => this.filteredPortos = portos);
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      country: '',
      portType: '',
      operationalStatus: '',
      congestionLevel: ''
    });
  }

  selectPorto(porto: Porto): void {
    this.selectedPorto = porto;
    this.isDetailOpen = true;
    this.loadPortoDetails(porto.id);
  }

  private loadPortoDetails(portId: string): void {
    this.portosService.getInfrastructure(portId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(infra => this.infrastructure = infra);

    this.portosService.getIndicators(portId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(ind => this.indicators = ind);

    this.portosService.getRoutes(portId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(routes => this.routes = routes);

    this.portosService.getShipments(portId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(shipments => this.shipments = shipments);

    this.portosService.getAIInsights(portId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(insights => this.aiInsights = insights);
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedPorto = null;
    this.infrastructure = null;
    this.indicators = null;
    this.routes = [];
    this.shipments = [];
    this.aiInsights = null;
  }

  createPorto(): void {
    this.snackBar.open('Funcionalidade de criação de porto em desenvolvimento', 'OK', { duration: 3000 });
  }

  simulate(): void {
    if (this.simulationForm.invalid) {
      this.snackBar.open('Preencha todos os campos da simulação', 'OK', { duration: 3000 });
      return;
    }
    this.isSimulating = true;
    this.simulationResult = null;

    this.portosService.simulateExport(this.simulationForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.simulationResult = result;
          this.isSimulating = false;
          this.snackBar.open('Simulação concluída com sucesso!', 'OK', { duration: 3000 });
        },
        error: () => {
          this.isSimulating = false;
          this.snackBar.open('Erro na simulação', 'Fechar', { duration: 3000 });
        }
      });
  }

  exportPDF(): void {
    this.snackBar.open('Exportando relatório em PDF...', 'OK', { duration: 2000 });
  }

  // ================================
  // HELPER METHODS FOR TEMPLATE
  // ================================

  getStatusClass(status: OperationalStatus): string {
    const map: Record<OperationalStatus, string> = {
      'OPERACIONAL': 'status-operacional',
      'PARCIAL': 'status-parcial',
      'CONGESTIONADO': 'status-congestionado',
      'INOPERANTE': 'status-inoperante',
      'MANUTENÇÃO': 'status-manutencao'
    };
    return map[status] || '';
  }

  getCongestionClass(level: CongestionLevel): string {
    const map: Record<CongestionLevel, string> = {
      'LOW': 'congestion-low',
      'MEDIUM': 'congestion-medium',
      'HIGH': 'congestion-high',
      'CRITICAL': 'congestion-critical'
    };
    return map[level] || '';
  }

  getCongestionLabel(level: CongestionLevel): string {
    const map: Record<CongestionLevel, string> = {
      'LOW': 'Baixo',
      'MEDIUM': 'Moderado',
      'HIGH': 'Alto',
      'CRITICAL': 'Crítico'
    };
    return map[level] || level;
  }

  getAlertIcon(severity: string): string {
    const map: Record<string, string> = {
      'LOW': 'info',
      'MEDIUM': 'warning',
      'HIGH': 'error',
      'CRITICAL': 'dangerous'
    };
    return map[severity] || 'info';
  }

  getAlertClass(severity: string): string {
    return `alert-${severity.toLowerCase()}`;
  }

  getShipmentStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Programado': 'shipment-programado',
      'Em Trânsito': 'shipment-transito',
      'Atracado': 'shipment-atracado',
      'Descarregado': 'shipment-descarregado',
      'Liberado': 'shipment-liberado'
    };
    return map[status] || '';
  }

  formatCapacity(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M ton';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K ton';
    }
    return value + ' ton';
  }
}
