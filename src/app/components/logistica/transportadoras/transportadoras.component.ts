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
import { TransportadorasMockService } from '../../../../services/transportadorasMockService';
import {
  Transportadora,
  ModalType,
  CarrierStatus,
  CarrierService,
  CarrierCoverage,
  CarrierFleet,
  TrackingEvent,
  PerformanceIndicator,
  CarrierAIInsights,
  TransportadoraFilters,
  TransportadoraMetrics,
  TransportSimulationResult
} from '../../../../types/transportadoras';

@Component({
  selector: 'app-transportadoras',
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
  templateUrl: './transportadoras.component.html',
  styleUrls: ['./transportadoras.component.scss']
})
export class TransportadorasComponent implements OnInit, OnDestroy {

  // Services
  private transportadorasService = inject(TransportadorasMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // Data State
  transportadoras: Transportadora[] = [];
  filteredTransportadoras: Transportadora[] = [];
  selectedTransportadora: Transportadora | null = null;
  services: CarrierService[] = [];
  carrierCoverage: CarrierCoverage | null = null;
  fleet: CarrierFleet | null = null;
  trackingEvents: TrackingEvent[] = [];
  performanceData: PerformanceIndicator | null = null;
  aiInsights: CarrierAIInsights | null = null;
  metrics: TransportadoraMetrics | null = null;
  simulationResult: TransportSimulationResult | null = null;

  // UI State
  isLoading = false;
  isDetailOpen = false;
  isSimulating = false;
  isSimulationExpanded = true;

  // Forms
  filterForm!: FormGroup;
  simulationForm!: FormGroup;

  // Table columns
  displayedColumns: string[] = [
    'nomeFantasia', 'cnpj', 'modalPrincipal', 'state',
    'status', 'aiScore', 'avgSLA', 'onTimeRate', 'costPerTon', 'actions'
  ];

  // Dropdown data
  modals: ModalType[] = [];
  states: string[] = [];
  statuses: CarrierStatus[] = [];

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.loadTransportadoras();
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
      modalPrincipal: [''],
      status: [''],
      state: [''],
      minScore: [null],
      maxCostPerTon: [null]
    });

    this.simulationForm = this.formBuilder.group({
      origin: ['Rondonópolis - MT', Validators.required],
      destination: ['Santos - SP', Validators.required],
      product: ['Soja em Grãos', Validators.required],
      quantity: [5000, [Validators.required, Validators.min(1)]],
      modal: [''],
      incoterm: ['FOB', Validators.required],
      desiredDate: [new Date(), Validators.required]
    });
  }

  private loadDropdownData(): void {
    this.modals = this.transportadorasService.getModals();
    this.states = this.transportadorasService.getStates();
    this.statuses = this.transportadorasService.getStatuses();
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

  loadTransportadoras(): void {
    this.isLoading = true;
    this.transportadorasService.getTransportadoras()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.transportadoras = data;
          this.filteredTransportadoras = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar transportadoras', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.transportadorasService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(metrics => this.metrics = metrics);
  }

  applyFilters(): void {
    const filters: TransportadoraFilters = this.filterForm.value;
    this.transportadorasService.getTransportadoras(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.filteredTransportadoras = data);
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchText: '',
      modalPrincipal: '',
      status: '',
      state: '',
      minScore: null,
      maxCostPerTon: null
    });
  }

  selectTransportadora(carrier: Transportadora): void {
    this.selectedTransportadora = carrier;
    this.isDetailOpen = true;
    this.loadCarrierDetails(carrier.id);
  }

  private loadCarrierDetails(carrierId: string): void {
    this.transportadorasService.getServices(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(svcs => this.services = svcs);

    this.transportadorasService.getCoverage(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(cov => this.carrierCoverage = cov);

    this.transportadorasService.getFleet(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(fl => this.fleet = fl);

    this.transportadorasService.getTracking(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(trk => this.trackingEvents = trk);

    this.transportadorasService.getPerformance(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(perf => this.performanceData = perf);

    this.transportadorasService.getAIInsights(carrierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(insights => this.aiInsights = insights);
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedTransportadora = null;
    this.services = [];
    this.carrierCoverage = null;
    this.fleet = null;
    this.trackingEvents = [];
    this.performanceData = null;
    this.aiInsights = null;
  }

  createTransportadora(): void {
    this.snackBar.open('Funcionalidade de cadastro de transportadora em desenvolvimento', 'OK', { duration: 3000 });
  }

  simulate(): void {
    if (this.simulationForm.invalid) {
      this.snackBar.open('Preencha todos os campos da simulação', 'OK', { duration: 3000 });
      return;
    }
    this.isSimulating = true;
    this.simulationResult = null;

    this.transportadorasService.simulateTransport(this.simulationForm.value)
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

  getModalClass(modal: ModalType): string {
    const map: Record<ModalType, string> = {
      'RODOVIÁRIO': 'modal-rodoviario',
      'FERROVIÁRIO': 'modal-ferroviario',
      'MARÍTIMO': 'modal-maritimo',
      'FLUVIAL': 'modal-fluvial',
      'AÉREO': 'modal-aereo',
      'MULTIMODAL': 'modal-multimodal'
    };
    return map[modal] || '';
  }

  getStatusClass(status: CarrierStatus): string {
    const map: Record<CarrierStatus, string> = {
      'ATIVA': 'status-ativa',
      'INATIVA': 'status-inativa',
      'SUSPENSA': 'status-suspensa',
      'HOMOLOGAÇÃO': 'status-homologacao'
    };
    return map[status] || '';
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

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-average';
    return 'score-poor';
  }
}
