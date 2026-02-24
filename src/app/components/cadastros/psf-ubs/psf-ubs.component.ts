import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { PsfUbsEditDialogComponent } from './psf-ubs-edit-dialog/psf-ubs-edit-dialog.component';
import { NotificationService } from '../../../services/notification.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface PsfUbs {
  id: number;
  cidade: string;
  descricao: string;
  dataCadastro: Date;
  status: 'Ativo' | 'Inativo';
}

@Component({
  selector: 'app-psf-ubs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSelectModule
    // Remover PageLayoutComponent
  ],
  template: `
    <div class="psf-ubs-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>business</mat-icon>
          Cadastro de PSF/UBS
        </h1>
        <p>Gerencie as unidades de saúde do sistema PSF Digital</p>
      </div>

      <!-- Card Principal -->
      <mat-card class="main-card">
        <!-- Filtros -->
        <div class="filters-section">
          <div class="filter-header">
            <h2>
              <mat-icon>filter_list</mat-icon>
              Filtros
            </h2>
            <button mat-icon-button 
                    matTooltip="Limpar filtros"
                    (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
            </button>
          </div>

          <div class="filter-content">
            <!-- Filtro de busca -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar PSF/UBS</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput 
                     [formControl]="searchControl"
                     placeholder="Digite o nome do PSF/UBS ou cidade...">
              <button matSuffix 
                      mat-icon-button 
                      *ngIf="searchControl.value"
                      (click)="searchControl.setValue('')">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>

            <!-- Status Filter Chips -->
            <div class="status-chips">
              <span class="filter-label">Status:</span>
              <mat-chip-listbox class="chip-listbox">
                <mat-chip-option 
                  [selected]="selectedStatusFilter === 'Todos'"
                  (click)="setStatusFilter('Todos')"
                  class="status-chip">
                  <mat-icon matChipAvatar>all_inclusive</mat-icon>
                  Todos
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedStatusFilter === 'Ativo'"
                  (click)="setStatusFilter('Ativo')"
                  class="status-chip active">
                  <mat-icon matChipAvatar>check_circle</mat-icon>
                  Ativo
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedStatusFilter === 'Inativo'"
                  (click)="setStatusFilter('Inativo')"
                  class="status-chip inactive">
                  <mat-icon matChipAvatar>cancel</mat-icon>
                  Inativo
                </mat-chip-option>
              </mat-chip-listbox>
            </div>

            <!-- City Filter Chips -->
            <div class="city-chips">
              <span class="filter-label">Cidades:</span>
              <mat-chip-listbox class="chip-listbox">
                <mat-chip-option 
                  [selected]="selectedCityFilter === 'Todas'"
                  (click)="setCityFilter('Todas')"
                  class="city-chip">
                  <mat-icon matChipAvatar>location_city</mat-icon>
                  Todas
                </mat-chip-option>
                
                <mat-chip-option 
                  *ngFor="let city of uniqueCities"
                  [selected]="selectedCityFilter === city"
                  (click)="setCityFilter(city)"
                  class="city-chip">
                  <mat-icon matChipAvatar>place</mat-icon>
                  {{city}}
                </mat-chip-option>
              </mat-chip-listbox>
            </div>
          </div>

          <!-- Resultados -->
          <div class="results-info">
            <span class="results-count">
              <mat-icon>info</mat-icon>
              {{dataSource.filteredData.length}} registro(s) encontrado(s)
            </span>
          </div>
        </div>

        <!-- Grid -->
        <div class="grid-section">
          <div class="grid-header">
            <h2>
              <mat-icon>grid_on</mat-icon>
              Lista de PSF/UBS
            </h2>
            <button mat-raised-button 
                    color="primary"
                    (click)="openAddDialog()">
              <mat-icon>add</mat-icon>
              Novo PSF/UBS
            </button>
          </div>

          <div class="table-container">
            <table mat-table 
                   [dataSource]="dataSource" 
                   matSort
                   class="psf-ubs-table">

              <!-- Coluna ID -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>tag</mat-icon>
                  ID
                </th>
                <td mat-cell *matCellDef="let psfUbs">
                  <span class="id-cell">#{{psfUbs.id}}</span>
                </td>
              </ng-container>

              <!-- Coluna Cidade -->
              <ng-container matColumnDef="cidade">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>location_city</mat-icon>
                  Cidade
                </th>
                <td mat-cell *matCellDef="let psfUbs">
                  <span class="cidade-cell">{{psfUbs.cidade}}</span>
                </td>
              </ng-container>

              <!-- Coluna Descrição -->
              <ng-container matColumnDef="descricao">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>business</mat-icon>
                  Descrição PSF/UBS
                </th>
                <td mat-cell *matCellDef="let psfUbs">
                  <span class="descricao-cell">{{psfUbs.descricao}}</span>
                </td>
              </ng-container>

              <!-- Coluna Data Cadastro -->
              <ng-container matColumnDef="dataCadastro">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>calendar_today</mat-icon>
                  Data Cadastro
                </th>
                <td mat-cell *matCellDef="let psfUbs">
                  <span class="date-cell">
                    {{psfUbs.dataCadastro | date:'dd/MM/yyyy HH:mm'}}
                  </span>
                </td>
              </ng-container>

              <!-- Coluna Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>info</mat-icon>
                  Status
                </th>
                <td mat-cell *matCellDef="let psfUbs">
                  <mat-chip [class]="'status-chip-table ' + (psfUbs.status === 'Ativo' ? 'active' : 'inactive')">
                    <mat-icon matChipAvatar>
                      {{psfUbs.status === 'Ativo' ? 'check_circle' : 'cancel'}}
                    </mat-icon>
                    {{psfUbs.status}}
                  </mat-chip>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row 
                  *matRowDef="let row; columns: displayedColumns;"
                  (dblclick)="editPsfUbs(row)"
                  class="data-row"
                  matTooltip="Duplo clique para editar">
              </tr>
            </table>

            <!-- Paginação -->
            <mat-paginator #paginator
                           [pageSizeOptions]="[5, 10, 25, 50]"
                           [pageSize]="10"
                           [showFirstLastButtons]="true"
                           aria-label="Selecione a página">
            </mat-paginator>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    * {
      font-family: 'Inter', sans-serif;
    }

    .psf-ubs-container {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #1976d2;
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }

    .page-header h1 mat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .page-header p {
      color: #666;
      font-size: 1.2rem;
      font-weight: 400;
    }

    .main-card {
      max-width: 1400px;
      margin: 0 auto;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .filters-section {
      padding: 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
      border-radius: 16px 16px 0 0;
    }

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .filter-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
    }

    .filter-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .search-field {
      max-width: 500px;
    }

    .status-chips,
    .city-chips {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-label {
      font-weight: 500;
      color: #666;
      min-width: fit-content;
    }

    .chip-listbox {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .status-chip,
    .city-chip {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .status-chip:hover,
    .city-chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .status-chip.active[aria-selected="true"] {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .status-chip.inactive[aria-selected="true"] {
      background-color: #ffebee !important;
      color: #d32f2f !important;
    }

    .city-chip[aria-selected="true"] {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
    }

    .results-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .results-count {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-weight: 500;
    }

    .grid-section {
      padding: 24px;
    }

    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .grid-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
    }

    .table-container {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      background: white;
    }

    .psf-ubs-table {
      width: 100%;
    }

    .psf-ubs-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
      padding: 16px;
    }

    .psf-ubs-table th mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .psf-ubs-table td {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .data-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .data-row:hover {
      background-color: #f8f9fa;
    }

    .id-cell {
      font-weight: 600;
      color: #666;
      font-family: 'Fira Code', monospace;
    }

    .cidade-cell {
      font-weight: 500;
      color: #1565c0;
      background: #e3f2fd;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .descricao-cell {
      font-weight: 500;
      color: #333;
    }

    .date-cell {
      color: #666;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
    }

    .status-chip-table {
      font-size: 0.85rem;
      height: 32px;
    }

    .status-chip-table.active {
      background: #e8f5e8 !important;
      color: #2e7d32 !important;
    }

    .status-chip_table.inactive {
      background: #ffebee !important;
      color: #d32f2f !important;
    }

    mat-paginator {
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .psf-ubs-container {
        padding: 16px;
      }

      .page-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 8px;
      }

      .page-header h1 mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }

      .filters-section {
        padding: 16px;
      }

      .filter-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .status-chips,
      .city-chips {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .grid-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .psf-ubs-table {
        font-size: 0.9rem;
      }

      .psf-ubs-table th,
      .psf-ubs-table td {
        padding: 12px 8px;
      }
    }
  `]
})
export class PsfUbsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  displayedColumns: string[] = ['id', 'cidade', 'descricao', 'dataCadastro', 'status'];
  dataSource = new MatTableDataSource<PsfUbs>();
  searchControl = new FormControl('');
  selectedStatusFilter = 'Todos';
  selectedCityFilter = 'Todas';
  uniqueCities: string[] = [];

  // Mock data
  mockPsfUbs: PsfUbs[] = [
    { id: 1, cidade: 'Belo Horizonte', descricao: 'PSF Centro', dataCadastro: new Date('2024-01-15T08:30:00'), status: 'Ativo' },
    { id: 2, cidade: 'Belo Horizonte', descricao: 'UBS Savassi', dataCadastro: new Date('2024-01-20T10:15:00'), status: 'Ativo' },
    { id: 3, cidade: 'Contagem', descricao: 'PSF Industrial', dataCadastro: new Date('2024-02-01T14:20:00'), status: 'Inativo' },
    { id: 4, cidade: 'Juiz de Fora', descricao: 'UBS Central', dataCadastro: new Date('2024-02-10T09:45:00'), status: 'Ativo' },
    { id: 5, cidade: 'Betim', descricao: 'PSF Jardim Teresópolis', dataCadastro: new Date('2024-02-15T16:30:00'), status: 'Ativo' },
    { id: 6, cidade: 'Montes Claros', descricao: 'UBS Norte', dataCadastro: new Date('2024-03-01T11:00:00'), status: 'Inativo' },
    { id: 7, cidade: 'Uberlândia', descricao: 'PSF Santa Mônica', dataCadastro: new Date('2024-03-10T08:30:00'), status: 'Ativo' },
    { id: 8, cidade: 'Uberaba', descricao: 'UBS Mercês', dataCadastro: new Date('2024-03-15T10:15:00'), status: 'Ativo' },
    { id: 9, cidade: 'Belo Horizonte', descricao: 'PSF Pampulha', dataCadastro: new Date('2024-04-01T14:20:00'), status: 'Inativo' },
    { id: 10, cidade: 'Ipatinga', descricao: 'UBS Horto', dataCadastro: new Date('2024-04-10T09:45:00'), status: 'Ativo' },
    { id: 11, cidade: 'Sete Lagoas', descricao: 'PSF Centro-Oeste', dataCadastro: new Date('2024-04-15T16:30:00'), status: 'Ativo' },
    { id: 12, cidade: 'Divinópolis', descricao: 'UBS Belvedere', dataCadastro: new Date('2024-05-01T11:00:00'), status: 'Inativo' },
    { id: 13, cidade: 'Santa Luzia', descricao: 'PSF São Benedito', dataCadastro: new Date('2024-05-10T08:30:00'), status: 'Ativo' },
    { id: 14, cidade: 'Contagem', descricao: 'UBS Nacional', dataCadastro: new Date('2024-05-15T10:15:00'), status: 'Ativo' },
    { id: 15, cidade: 'Juiz de Fora', descricao: 'PSF Santa Helena', dataCadastro: new Date('2024-06-01T14:20:00'), status: 'Inativo' }
  ];

  ngOnInit(): void {
    this.dataSource.data = this.mockPsfUbs;
    this.extractUniqueCities();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  extractUniqueCities(): void {
    this.uniqueCities = [...new Set(this.mockPsfUbs.map(item => item.cidade))].sort();
  }

  setupFilters(): void {
    // Filtro de busca
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    // Filtro customizado
    this.dataSource.filterPredicate = (data: PsfUbs, filter: string) => {
      const filters = JSON.parse(filter);
      const searchText = filters.search?.toLowerCase() || '';
      const statusFilter = filters.status || 'Todos';
      const cityFilter = filters.city || 'Todas';

      const matchesSearch = data.descricao.toLowerCase().includes(searchText) || 
                           data.cidade.toLowerCase().includes(searchText);
      const matchesStatus = statusFilter === 'Todos' || data.status === statusFilter;
      const matchesCity = cityFilter === 'Todas' || data.cidade === cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    };
  }

  applyFilters(): void {
    const filters = {
      search: this.searchControl.value || '',
      status: this.selectedStatusFilter,
      city: this.selectedCityFilter
    };
    this.dataSource.filter = JSON.stringify(filters);
  }

  setStatusFilter(status: string): void {
    this.selectedStatusFilter = status;
    this.applyFilters();
  }

  setCityFilter(city: string): void {
    this.selectedCityFilter = city;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.selectedStatusFilter = 'Todos';
    this.selectedCityFilter = 'Todas';
    this.applyFilters();
  }

  editPsfUbs(psfUbs: PsfUbs): void {
    const dialogRef = this.dialog.open(PsfUbsEditDialogComponent, {
      width: '600px',
      data: { psfUbs, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.showSuccess('PSF/UBS atualizado com sucesso!');
        this.refreshData();
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(PsfUbsEditDialogComponent, {
      width: '600px',
      data: { psfUbs: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.showSuccess('PSF/UBS cadastrado com sucesso!');
        this.refreshData();
      }
    });
  }

  private refreshData(): void {
    this.dataSource.data = [...this.mockPsfUbs];
  }
}