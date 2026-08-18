import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Angular Material Components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Dialog Component
import { LoteDialogComponent } from './lote-dialog/lote-dialog.component';

// Services and Types
import { LotesMockService } from '../../../../services/lotesMockService';
import {
  Lote,
  LoteStatus,
  LoteFilters,
  KPIMetrics,
  AILotScore,
  QualityInspection,
  StockMovement
} from '../../../../types/lotes';

@Component({
  selector: 'app-lotes-controle',
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
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './lotes-controle.component.html',
  styleUrls: ['./lotes-controle.component.scss']
})
export class LotesControleComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Services
  private lotesService = inject(LotesMockService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Data State
  lots: Lote[] = [];
  filteredLots: Lote[] = [];
  selectedLot: Lote | null = null;
  kpiMetrics: KPIMetrics | null = null;
  aiInsights: AILotScore | null = null;
  qualityInspections: QualityInspection[] = [];
  movementHistory: StockMovement[] = [];

  // UI State
  isLoading = false;

  // Forms
  filterForm!: FormGroup;

  // Table Configuration
  displayedColumns = [
    'loteNumber',
    'productName',
    'harvest',
    'status',
    'warehouseName',
    'quantity',
    'expiryDate',
    'aiScore',
    'actions'
  ];

  // Filter Options
  products: string[] = [];
  harvests: string[] = [];
  warehouses: { id: string; name: string }[] = [];
  countries: string[] = [];
  statuses: LoteStatus[] = ['DISPONÍVEL', 'BLOQUEADO', 'QUARENTENA', 'EM_TRÂNSITO', 'RESERVADO', 'ESGOTADO'];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForms();
    this.loadFilterOptions();
    this.loadLots();
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
      product: [''],
      harvest: [''],
      status: [''],
      warehouseId: [''],
      destinationCountry: [''],
      expiryDateStart: [null],
      expiryDateEnd: [null],
      aiScoreMin: [null],
      aiScoreMax: [null]
    });
  }

  private loadFilterOptions(): void {
    this.products = this.lotesService.getProducts();
    this.harvests = this.lotesService.getHarvests();
    this.warehouses = this.lotesService.getWarehouses();
    this.countries = this.lotesService.getCountries();
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

  loadLots(): void {
    this.isLoading = true;
    this.lotesService.getLotes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lots) => {
          this.lots = lots;
          this.filteredLots = lots;
          this.kpiMetrics = this.lotesService.getKPIMetrics(lots);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar lotes:', error);
          this.showMessage('Erro ao carregar lotes', 'error');
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    const filters: LoteFilters = this.filterForm.value;
    this.isLoading = true;

    this.lotesService.getLotes(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lots) => {
          this.filteredLots = lots;
          this.kpiMetrics = this.lotesService.getKPIMetrics(lots);
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
    this.loadLots();
  }

  // ================================
  // LOT SELECTION & DIALOG
  // ================================

  selectLot(lot: Lote): void {
    this.selectedLot = lot;
    this.loadAIInsights(lot.id);
    this.loadMovementHistory(lot.id);
    this.loadQualityInspections(lot.id);

    // Wait for data to load, then open dialog
    setTimeout(() => {
      this.openLotDialog('view');
    }, 500);
  }

  createLot(): void {
    this.selectedLot = null;
    this.openLotDialog('create');
  }

  editLot(lot: Lote): void {
    this.selectedLot = lot;
    this.openLotDialog('edit');
  }

  private openLotDialog(mode: 'view' | 'create' | 'edit'): void {
    const dialogRef = this.dialog.open(LoteDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '850px',
      panelClass: 'lote-dialog-container',
      disableClose: false,
      data: {
        lot: this.selectedLot,
        mode,
        products: this.products,
        harvests: this.harvests,
        warehouses: this.warehouses,
        countries: this.countries,
        qualityInspections: this.qualityInspections,
        movementHistory: this.movementHistory,
        aiInsights: this.aiInsights
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleDialogResult(result);
      }
      this.selectedLot = null;
    });
  }

  private handleDialogResult(result: { action: string; data: any }): void {
    switch (result.action) {
      case 'create':
        this.isLoading = true;
        this.lotesService.createLote(result.data)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showMessage('Lote criado com sucesso!', 'success');
              this.loadLots();
            },
            error: (error) => {
              console.error('Erro ao criar lote:', error);
              this.showMessage('Erro ao criar lote', 'error');
              this.isLoading = false;
            }
          });
        break;

      case 'update':
        if (this.selectedLot) {
          this.isLoading = true;
          this.lotesService.updateLote(this.selectedLot.id, result.data)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showMessage('Lote atualizado com sucesso!', 'success');
                this.loadLots();
              },
              error: (error) => {
                console.error('Erro ao atualizar lote:', error);
                this.showMessage('Erro ao atualizar lote', 'error');
                this.isLoading = false;
              }
            });
        }
        break;

      case 'quality_inspection':
        this.isLoading = true;
        this.lotesService.saveQualityInspection(result.data)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showMessage('Inspeção de qualidade salva com sucesso!', 'success');
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Erro ao salvar inspeção:', error);
              this.showMessage('Erro ao salvar inspeção de qualidade', 'error');
              this.isLoading = false;
            }
          });
        break;
    }
  }

  private loadAIInsights(loteId: string): void {
    this.lotesService.getAIInsights(loteId)
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

  private loadMovementHistory(loteId: string): void {
    this.lotesService.getMovementHistory(loteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.movementHistory = history;
        },
        error: (error) => {
          console.error('Erro ao carregar histórico:', error);
        }
      });
  }

  private loadQualityInspections(loteId: string): void {
    this.lotesService.getQualityInspections(loteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inspections) => {
          this.qualityInspections = inspections;
        },
        error: (error) => {
          console.error('Erro ao carregar inspeções:', error);
        }
      });
  }

  // ================================
  // STATUS TRANSITIONS
  // ================================

  blockLot(lot: Lote): void {
    this.isLoading = true;
    this.lotesService.blockLote(lot.id, 'Bloqueio manual pelo operador')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage(`Lote ${lot.loteNumber} bloqueado com sucesso!`, 'success');
          this.loadLots();
        },
        error: (error) => {
          this.showMessage(error.message || 'Erro ao bloquear lote', 'error');
          this.isLoading = false;
        }
      });
  }

  unblockLot(lot: Lote): void {
    this.isLoading = true;
    this.lotesService.unblockLote(lot.id, 'Desbloqueio manual pelo operador')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage(`Lote ${lot.loteNumber} desbloqueado com sucesso!`, 'success');
          this.loadLots();
        },
        error: (error) => {
          this.showMessage(error.message || 'Erro ao desbloquear lote', 'error');
          this.isLoading = false;
        }
      });
  }

  reserveLot(lot: Lote): void {
    const quantity = lot.availableQuantity;
    this.isLoading = true;
    this.lotesService.reserveLote(lot.id, quantity, lot.destinationCountry)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showMessage(`Lote ${lot.loteNumber} reservado com sucesso!`, 'success');
          this.loadLots();
        },
        error: (error) => {
          this.showMessage(error.message || 'Erro ao reservar lote', 'error');
          this.isLoading = false;
        }
      });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatQuantity(value: number | undefined): string {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value) + ' kg';
  }

  getStatusColor(status: LoteStatus): string {
    switch (status) {
      case 'DISPONÍVEL': return 'green';
      case 'BLOQUEADO': return 'red';
      case 'QUARENTENA': return 'orange';
      case 'EM_TRÂNSITO': return 'blue';
      case 'RESERVADO': return 'purple';
      case 'ESGOTADO': return 'grey';
      default: return 'grey';
    }
  }

  getStatusIcon(status: LoteStatus): string {
    switch (status) {
      case 'DISPONÍVEL': return 'check_circle';
      case 'BLOQUEADO': return 'block';
      case 'QUARENTENA': return 'warning';
      case 'EM_TRÂNSITO': return 'local_shipping';
      case 'RESERVADO': return 'bookmark';
      case 'ESGOTADO': return 'remove_circle';
      default: return 'help';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'yellow';
      case 'LOW': return 'green';
      default: return 'grey';
    }
  }

  trackByLotId(index: number, lot: Lote): string {
    return lot.id;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'error' ? 5000 : 3000,
      panelClass: [`snackbar-${type}`]
    });
  }
}
