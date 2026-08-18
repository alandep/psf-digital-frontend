import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

// Services and Types
import { RastreabilidadeMockService } from '../../../../services/rastreabilidadeMockService';
import {
  RastreabilidadeLote,
  TimelineEvent,
  TimelineEventType,
  TraceDocument,
  AITraceInsights,
  RiskLevel,
  SupplyChainNode,
  RastreabilidadeFilters,
  RastreabilidadeMetrics
} from '../../../../types/rastreabilidade';

@Component({
  selector: 'app-rastreabilidade',
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
    MatExpansionModule
  ],
  templateUrl: './rastreabilidade.component.html',
  styleUrls: ['./rastreabilidade.component.scss']
})
export class RastreabilidadeComponent implements OnInit, OnDestroy {

  // Services
  private rastreabilidadeService = inject(RastreabilidadeMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Data State
  lotes: RastreabilidadeLote[] = [];
  filteredLotes: RastreabilidadeLote[] = [];
  selectedLote: RastreabilidadeLote | null = null;
  timeline: TimelineEvent[] = [];
  documents: TraceDocument[] = [];
  aiInsights: AITraceInsights | null = null;
  metrics: RastreabilidadeMetrics | null = null;
  supplyChainNodes: SupplyChainNode[] = [];

  // UI State
  isLoading = false;
  isDetailOpen = false;

  // Forms
  filterForm!: FormGroup;
  aiSearchText = '';

  // Table Configuration
  displayedColumns = [
    'loteNumber',
    'productName',
    'harvest',
    'farmName',
    'currentStatus',
    'currentLocation',
    'destinationCountry',
    'clientName',
    'actions'
  ];

  docDisplayedColumns = ['documentType', 'documentNumber', 'issueDate', 'status', 'actions'];

  // Filter Options
  harvests: string[] = [];
  farms: string[] = [];
  warehouses: string[] = [];
  countries: string[] = [];
  clients: string[] = [];
  statuses: string[] = ['Em Produção', 'No Armazém', 'Em Trânsito', 'No Porto', 'Embarcado', 'Entregue'];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.loadFilterOptions();
    this.loadLotes();
    this.loadMetrics();
    this.setupFilterSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================================
  // INITIALIZATION
  // ================================

  private initializeForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      harvest: [''],
      farm: [''],
      warehouse: [''],
      container: [''],
      vessel: [''],
      destinationCountry: [''],
      client: [''],
      status: ['']
    });
  }

  private loadFilterOptions(): void {
    this.harvests = this.rastreabilidadeService.getHarvests();
    this.farms = this.rastreabilidadeService.getFarms();
    this.warehouses = this.rastreabilidadeService.getWarehouses();
    this.countries = this.rastreabilidadeService.getCountries();
    this.clients = this.rastreabilidadeService.getClients();
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  // ================================
  // DATA LOADING
  // ================================

  loadLotes(): void {
    this.isLoading = true;
    this.rastreabilidadeService.getLotes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lotes) => {
          this.lotes = lotes;
          this.filteredLotes = lotes;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar lotes:', error);
          this.showMessage('Erro ao carregar lotes rastreados', 'error');
          this.isLoading = false;
        }
      });
  }

  loadMetrics(): void {
    this.rastreabilidadeService.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          this.metrics = metrics;
        },
        error: (error) => {
          console.error('Erro ao carregar métricas:', error);
        }
      });
  }

  applyFilters(): void {
    const filters: RastreabilidadeFilters = this.filterForm.value;
    this.isLoading = true;

    this.rastreabilidadeService.getLotes(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lotes) => {
          this.filteredLotes = lotes;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao aplicar filtros:', error);
          this.showMessage('Erro ao aplicar filtros', 'error');
          this.isLoading = false;
        }
      });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadLotes();
  }

  // ================================
  // AI SEARCH
  // ================================

  searchNaturalLanguage(): void {
    if (!this.aiSearchText.trim()) {
      this.loadLotes();
      return;
    }

    this.isLoading = true;
    this.rastreabilidadeService.searchByNaturalLanguage(this.aiSearchText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lotes) => {
          this.filteredLotes = lotes;
          this.isLoading = false;
          this.showMessage(`${lotes.length} lotes encontrados`, 'info');
        },
        error: (error) => {
          console.error('Erro na busca IA:', error);
          this.showMessage('Erro na busca inteligente', 'error');
          this.isLoading = false;
        }
      });
  }

  onAISearchInput(event: Event): void {
    this.aiSearchText = (event.target as HTMLInputElement).value;
  }

  onAISearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchNaturalLanguage();
    }
  }

  applySearchChip(text: string): void {
    this.aiSearchText = text;
    this.searchNaturalLanguage();
  }

  // ================================
  // LOT SELECTION
  // ================================

  selectLote(lote: RastreabilidadeLote): void {
    this.selectedLote = lote;
    this.isDetailOpen = true;
    this.loadTimeline(lote.id);
    this.loadDocuments(lote.id);
    this.loadAIInsights(lote.id);
    this.loadSupplyChainNodes(lote.id);
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedLote = null;
    this.timeline = [];
    this.documents = [];
    this.aiInsights = null;
    this.supplyChainNodes = [];
  }

  private loadTimeline(loteId: string): void {
    this.rastreabilidadeService.getTimeline(loteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (timeline) => {
          this.timeline = timeline;
        },
        error: (error) => {
          console.error('Erro ao carregar timeline:', error);
        }
      });
  }

  private loadDocuments(loteId: string): void {
    this.rastreabilidadeService.getDocuments(loteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (docs) => {
          this.documents = docs;
        },
        error: (error) => {
          console.error('Erro ao carregar documentos:', error);
        }
      });
  }

  private loadAIInsights(loteId: string): void {
    this.rastreabilidadeService.getAIInsights(loteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (insights) => {
          this.aiInsights = insights;
        },
        error: (error) => {
          console.error('Erro ao carregar insights IA:', error);
        }
      });
  }

  private loadSupplyChainNodes(loteId: string): void {
    this.rastreabilidadeService.getSupplyChainNodes(loteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nodes) => {
          this.supplyChainNodes = nodes;
        },
        error: (error) => {
          console.error('Erro ao carregar cadeia logística:', error);
        }
      });
  }

  // ================================
  // EXPORT METHODS
  // ================================

  exportPDF(): void {
    this.showMessage('Exportando relatório PDF...', 'info');
  }

  exportExcel(): void {
    this.showMessage('Exportando dados Excel...', 'info');
  }

  // ================================
  // UTILITY METHODS
  // ================================

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getEventIcon(eventType: TimelineEventType): string {
    switch (eventType) {
      case 'SAFRA': return 'eco';
      case 'FAZENDA': return 'agriculture';
      case 'COLHEITA': return 'grass';
      case 'RECEBIMENTO': return 'move_to_inbox';
      case 'ARMAZEM': return 'warehouse';
      case 'QUALIDADE': return 'science';
      case 'CONTAINER': return 'inventory_2';
      case 'PORTO': return 'anchor';
      case 'NAVIO': return 'directions_boat';
      case 'EXPORTACAO': return 'description';
      case 'CLIENTE': return 'handshake';
      default: return 'circle';
    }
  }

  getEventColor(status: 'completed' | 'current' | 'pending'): string {
    switch (status) {
      case 'completed': return 'green';
      case 'current': return 'blue';
      case 'pending': return 'grey';
      default: return 'grey';
    }
  }

  getRiskColor(risk: RiskLevel): string {
    switch (risk) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'orange';
      case 'HIGH': return 'red';
      case 'CRITICAL': return 'red';
      default: return 'grey';
    }
  }

  getDocStatusColor(status: 'valid' | 'expired' | 'pending'): string {
    switch (status) {
      case 'valid': return 'green';
      case 'expired': return 'red';
      case 'pending': return 'orange';
      default: return 'grey';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Entregue': return 'green';
      case 'Embarcado': return 'blue';
      case 'Em Trânsito': return 'blue';
      case 'No Porto': return 'purple';
      case 'No Armazém': return 'orange';
      case 'Em Produção': return 'grey';
      default: return 'grey';
    }
  }

  getComplianceStatusColor(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return 'green';
      case 'fail': return 'red';
      case 'warning': return 'orange';
      default: return 'grey';
    }
  }

  getComplianceIcon(status: 'pass' | 'fail' | 'warning'): string {
    switch (status) {
      case 'pass': return 'check_circle';
      case 'fail': return 'cancel';
      case 'warning': return 'warning';
      default: return 'help';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  }

  trackByLoteId(index: number, lote: RastreabilidadeLote): string {
    return lote.id;
  }

  trackByEventId(index: number, event: TimelineEvent): string {
    return event.id;
  }

  trackByNodeId(index: number, node: SupplyChainNode): string {
    return node.id;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
