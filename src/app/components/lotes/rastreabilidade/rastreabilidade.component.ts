import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
import { RastreabilidadeDetailDialogComponent } from './rastreabilidade-detail-dialog/rastreabilidade-detail-dialog.component';
import {
  RastreabilidadeLote,
  RastreabilidadeFilters,
  RastreabilidadeMetrics
} from '../../../../types/rastreabilidade';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

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
    MatExpansionModule,
    MatDialogModule,
    HasPermissionDirective
  ],
  templateUrl: './rastreabilidade.component.html',
  styleUrls: ['./rastreabilidade.component.scss']
})
export class RastreabilidadeComponent implements OnInit, OnDestroy {

  // Services
  private rastreabilidadeService = inject(RastreabilidadeMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Data State
  lotes: RastreabilidadeLote[] = [];
  filteredLotes: RastreabilidadeLote[] = [];
  metrics: RastreabilidadeMetrics | null = null;

  // UI State
  isLoading = false;

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
        error: () => {
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
        error: () => {
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
        error: () => {
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
        error: () => {
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
    this.isLoading = true;
    forkJoin({
      timeline: this.rastreabilidadeService.getTimeline(lote.id),
      documents: this.rastreabilidadeService.getDocuments(lote.id),
      aiInsights: this.rastreabilidadeService.getAIInsights(lote.id),
      supplyChainNodes: this.rastreabilidadeService.getSupplyChainNodes(lote.id)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ timeline, documents, aiInsights, supplyChainNodes }) => {
          this.isLoading = false;
          this.dialog.open(RastreabilidadeDetailDialogComponent, {
            width: '1100px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            autoFocus: false,
            panelClass: 'rastreabilidade-detail-panel',
            data: { lote, timeline, documents, aiInsights, supplyChainNodes }
          });
        },
        error: () => {
          this.isLoading = false;
          this.showMessage('Erro ao carregar rastreabilidade do lote', 'error');
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

  trackByLoteId(index: number, lote: RastreabilidadeLote): string {
    return lote.id;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
