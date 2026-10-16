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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Services and Types
import { TransportadorasMockService } from '../../../../services/transportadorasMockService';
import {
  Transportadora,
  ModalType,
  CarrierStatus,
  TransportadoraFilters,
  TransportadoraMetrics
} from '../../../../types/transportadoras';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

// AI Hub: a SIMULAÇÃO passa a usar o backend real via AI_SERVICE (Req 15).
// A listagem/CRUD de transportadoras continua no TransportadorasMockService.
import { AI_SERVICE } from '../../../services/ai/ai-service.token';
import { TransportSimResult } from '../../../../types/ai-hub';

// Dialogs
import { TransportadoraDetailDialogComponent } from './transportadora-detail-dialog/transportadora-detail-dialog.component';
import { TransportadoraFormDialogComponent } from './transportadora-form-dialog/transportadora-form-dialog.component';

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
    MatNativeDateModule,
    MatDialogModule,
    HasPermissionDirective
  ],
  templateUrl: './transportadoras.component.html',
  styleUrls: ['./transportadoras.component.scss']
})
export class TransportadorasComponent implements OnInit, OnDestroy {

  // Services
  private transportadorasService = inject(TransportadorasMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  // Serviço de IA (HTTP real quando realApis.ai === true; mock caso contrário).
  private ai = inject(AI_SERVICE);

  // Destroy subject
  private destroy$ = new Subject<void>();

  // Data State
  transportadoras: Transportadora[] = [];
  filteredTransportadoras: Transportadora[] = [];
  metrics: TransportadoraMetrics | null = null;
  // Resultado da simulação de IA (shape do TransportSimResult devolvido pelo BFF).
  simulationResult: TransportSimResult | null = null;

  // UI State
  isLoading = false;
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
    this.dialog.open(TransportadoraDetailDialogComponent, {
      data: { carrier },
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'transportadora-detail-dialog-panel'
    });
  }

  createTransportadora(): void {
    const dialogRef = this.dialog.open(TransportadoraFormDialogComponent, {
      data: {
        modals: this.modals,
        states: this.states,
        statuses: this.statuses
      },
      width: '760px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'transportadora-form-dialog-panel'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Partial<Transportadora> | undefined) => {
        if (!result) {
          return;
        }
        this.transportadorasService.createTransportadora(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Transportadora cadastrada com sucesso!', 'OK', { duration: 3000 });
              this.loadTransportadoras();
              this.loadMetrics();
            },
            error: () => {
              this.snackBar.open('Erro ao cadastrar transportadora', 'Fechar', { duration: 3000 });
            }
          });
      });
  }

  simulate(): void {
    // Validação dos campos obrigatórios da Entrada_Transporte (Req 15.4):
    // bloqueia o envio enquanto o formulário estiver inválido.
    if (this.simulationForm.invalid) {
      this.simulationForm.markAllAsTouched();
      this.snackBar.open('Preencha todos os campos da simulação', 'OK', { duration: 3000 });
      return;
    }
    this.isSimulating = true;
    this.simulationResult = null;

    const form = this.simulationForm.value;

    // A simulação é apenas uma SUGESTÃO: nada é contratado automaticamente
    // (humano no circuito — Req 15.7). O backend real (AI_SERVICE) devolve o
    // TransportSimResult tipado; sem fallback mock no caminho real (Req 15.8).
    this.ai.simularTransporte({
      origin: form.origin,
      destination: form.destination,
      product: form.product,
      quantityTons: Number(form.quantity),
      preferredModal: form.modal || 'Qualquer',
      incoterm: form.incoterm,
      desiredDate: this.toIsoDate(form.desiredDate)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.simulationResult = result;
          this.isSimulating = false;
          this.snackBar.open('Simulação concluída. Esta é uma sugestão da IA — nenhuma contratação foi feita.', 'OK', { duration: 4000 });
        },
        error: (err: unknown) => {
          this.isSimulating = false;
          // Erros de IA são exibidos de forma explícita, sem recorrer ao mock (Req 15.9).
          this.snackBar.open(this.mensagemErroIa(err), 'Fechar', { duration: 4000 });
        }
      });
  }

  // Converte o valor do campo de data (Date ou string) para string ISO (yyyy-MM-dd),
  // formato esperado por TransportSimRequest.desiredDate.
  private toIsoDate(value: unknown): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value as string);
    if (isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '';
    }
    return date.toISOString().substring(0, 10);
  }

  // Mapeia o Erro_IA (já normalizado pelo errorInterceptor) para uma mensagem
  // simples pt-BR exibida via snackBar, sem fallback mock (Req 15.9).
  private mensagemErroIa(err: unknown): string {
    const e = err as { status?: number; code?: string; message?: string };
    if (e?.status === 402 || e?.code === 'AI_QUOTA_EXCEEDED') {
      return 'Seus créditos de IA acabaram. Compre créditos para continuar.';
    }
    switch (e?.status) {
      case 403:
        return 'Acesso negado: você não tem permissão para usar a IA.';
      case 422:
        return 'A resposta da IA foi inválida para a solicitação enviada.';
      case 429:
        return 'Limite de uso de IA atingido. Aguarde e tente novamente.';
      case 502:
      case 503:
        return 'O serviço de IA está temporariamente indisponível. Tente novamente em instantes.';
      case 504:
        return 'O serviço de IA demorou para responder. Tente novamente.';
      default:
        return e?.message || 'Erro na simulação com IA.';
    }
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
}
