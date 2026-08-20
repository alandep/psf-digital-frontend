import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MarketplaceMockService } from '../../../services/marketplaceMockService';
import {
  MarketplaceConnector,
  MarketplaceCategory,
  MarketplaceStatus,
  MarketplaceMetrics,
  MarketplaceFilters
} from '../../../types/marketplace';
import { ConfirmarAcaoDialogComponent, ConfirmDialogData } from '../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit, OnDestroy {

  private service = inject(MarketplaceMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();

  connectors: MarketplaceConnector[] = [];
  featured: MarketplaceConnector[] = [];
  metrics: MarketplaceMetrics | null = null;
  isLoading = false;

  categories: { value: MarketplaceCategory; label: string }[] = [];
  selectedCategories: MarketplaceCategory[] = [];
  statusFilter: MarketplaceStatus | '' = '';
  sortBy: 'name' | 'rating' | 'category' | 'recent' = 'rating';

  filterForm!: FormGroup;

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchText: [''],
      status: [''],
      sortBy: ['rating']
    });
    this.categories = this.service.getCategories();
    this.loadData();
    this.loadFeatured();
    this.loadMetrics();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterListeners(): void {
    this.filterForm.get('searchText')!.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadData());

    this.filterForm.get('status')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: string) => {
        this.statusFilter = val as MarketplaceStatus | '';
        this.loadData();
      });

    this.filterForm.get('sortBy')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: string) => {
        this.sortBy = val as 'name' | 'rating' | 'category' | 'recent';
        this.loadData();
      });
  }

  loadData(): void {
    this.isLoading = true;
    const filters: MarketplaceFilters = {
      searchText: this.filterForm.value.searchText || '',
      categories: this.selectedCategories,
      status: this.statusFilter,
      sortBy: this.sortBy
    };
    this.service.getConnectors(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.connectors = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar marketplace', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  loadFeatured(): void {
    this.service.getFeatured()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.featured = data);
  }

  loadMetrics(): void {
    this.service.getMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe(m => this.metrics = m);
  }

  toggleCategory(cat: MarketplaceCategory): void {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx >= 0) {
      this.selectedCategories.splice(idx, 1);
    } else {
      this.selectedCategories.push(cat);
    }
    this.loadData();
  }

  isCategorySelected(cat: MarketplaceCategory): boolean {
    return this.selectedCategories.includes(cat);
  }

  toggleActivation(connector: MarketplaceConnector): void {
    const isActivating = connector.status !== 'ACTIVE';
    const data: ConfirmDialogData = {
      title: isActivating ? 'Ativar Conector' : 'Desativar Conector',
      message: isActivating
        ? `Deseja ativar o conector "${connector.name}"? Ele será integrado à plataforma.`
        : `Deseja desativar o conector "${connector.name}"? A integração será interrompida.`,
      icon: isActivating ? 'power' : 'power_off',
      iconColor: isActivating ? '#4caf50' : '#f44336',
      confirmText: isActivating ? 'Ativar' : 'Desativar',
      confirmColor: isActivating ? 'primary' : 'warn'
    };

    this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '400px',
      data
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const obs = isActivating
          ? this.service.activateConnector(connector.id)
          : this.service.deactivateConnector(connector.id);
        obs.pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.snackBar.open(
            isActivating ? `${connector.name} ativado com sucesso!` : `${connector.name} desativado.`,
            'OK', { duration: 3000 }
          );
          this.loadData();
          this.loadMetrics();
        });
      }
    });
  }

  getStatusLabel(status: MarketplaceStatus): string {
    const map: Record<MarketplaceStatus, string> = {
      'ACTIVE': 'Ativo',
      'AVAILABLE': 'Disponível',
      'MAINTENANCE': 'Manutenção',
      'COMING_SOON': 'Em Breve'
    };
    return map[status] || status;
  }

  getStatusClass(status: MarketplaceStatus): string {
    const map: Record<MarketplaceStatus, string> = {
      'ACTIVE': 'status-active',
      'AVAILABLE': 'status-available',
      'MAINTENANCE': 'status-maintenance',
      'COMING_SOON': 'status-coming-soon'
    };
    return map[status] || '';
  }

  getCategoryLabel(cat: MarketplaceCategory): string {
    const found = this.categories.find(c => c.value === cat);
    return found ? found.label : cat;
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }
}
