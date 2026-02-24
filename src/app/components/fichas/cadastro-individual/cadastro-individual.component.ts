import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { CadastroIndividualEditDialogComponent } from './cadastro-individual-edit-dialog/cadastro-individual-edit-dialog.component';
import { NotificationService } from '../../../services/notification.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface CadastroIndividual {
  id: number;
  cartaoSus: string;
  nome: string;
  dataNascimento: Date;
  dataCadastro: Date;
  agenteResponsavel: string;
}

@Component({
  selector: 'app-cadastro-individual',
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
  ],
  template: `
    <div class="cadastro-individual-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>person</mat-icon>
          Cadastro Individual
        </h1>
        <p>Gerencie os cadastros individuais dos cidadãos</p>
      </div>

      <!-- Card Principal -->
      <mat-card class="main-card">
        <!-- Filtros -->
        <div class="filters-section">
          <div class="filter-header">
            <h2>
              <mat-icon>filter_list</mat-icon>
              Filtros de Busca
            </h2>
            <button mat-icon-button 
                    matTooltip="Limpar filtros"
                    (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
            </button>
          </div>

          <div class="filter-content">
            <!-- Campo de busca geral -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Busca geral</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput 
                     [formControl]="searchControl"
                     placeholder="Digite para buscar...">
              <button matSuffix 
                      mat-icon-button 
                      *ngIf="searchControl.value"
                      (click)="searchControl.setValue('')">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>

            <!-- Filtros específicos em chips -->
            <div class="filter-chips">
              <span class="filter-label">Filtrar por:</span>
              <mat-chip-listbox class="chip-listbox">
                <mat-chip-option 
                  [selected]="selectedFilterType === 'todos'"
                  (click)="setFilterType('todos')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>all_inclusive</mat-icon>
                  Todos os Campos
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedFilterType === 'cartaoSus'"
                  (click)="setFilterType('cartaoSus')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>credit_card</mat-icon>
                  Nº Cartão SUS
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedFilterType === 'nome'"
                  (click)="setFilterType('nome')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>person</mat-icon>
                  Nome
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedFilterType === 'dataNascimento'"
                  (click)="setFilterType('dataNascimento')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>cake</mat-icon>
                  Data Nascimento
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedFilterType === 'dataCadastro'"
                  (click)="setFilterType('dataCadastro')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>calendar_today</mat-icon>
                  Data/Hora Cadastro
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedFilterType === 'agenteResponsavel'"
                  (click)="setFilterType('agenteResponsavel')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>support_agent</mat-icon>
                  Agente Responsável
                </mat-chip-option>
              </mat-chip-listbox>
            </div>

            <!-- Filtros por agente -->
            <div class="agent-filter">
              <mat-form-field appearance="outline" class="agent-select">
                <mat-label>Filtrar por Agente</mat-label>
                <mat-icon matPrefix>support_agent</mat-icon>
                <mat-select [formControl]="agentFilterControl">
                  <mat-option value="">Todos os Agentes</mat-option>
                  <mat-option *ngFor="let agent of uniqueAgents" [value]="agent">
                    {{ agent }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Resultados -->
          <div class="results-info">
            <span class="results-count">
              <mat-icon>info</mat-icon>
              {{dataSource.filteredData.length}} registro(s) encontrado(s)
            </span>
            <span class="filter-info" *ngIf="selectedFilterType !== 'todos'">
              <mat-icon>filter_alt</mat-icon>
              Filtrando por: {{getFilterTypeLabel()}}
            </span>
          </div>
        </div>

        <!-- Grid -->
        <div class="grid-section">
          <div class="grid-header">
            <h2>
              <mat-icon>grid_on</mat-icon>
              Lista de Cadastros Individuais
            </h2>
            <button mat-raised-button 
                    color="primary"
                    (click)="openAddDialog()">
              <mat-icon>add</mat-icon>
              Novo Cadastro
            </button>
          </div>

          <div class="table-container">
            <table mat-table 
                   [dataSource]="dataSource" 
                   matSort
                   class="cadastros-table">

              <!-- Coluna ID -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>tag</mat-icon>
                  ID
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <span class="id-cell">#{{cadastro.id}}</span>
                </td>
              </ng-container>

              <!-- Coluna Cartão SUS -->
              <ng-container matColumnDef="cartaoSus">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>credit_card</mat-icon>
                  Nº Cartão SUS
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <span class="cartao-sus-cell">{{cadastro.cartaoSus}}</span>
                </td>
              </ng-container>

              <!-- Coluna Nome -->
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>person</mat-icon>
                  Nome
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <span class="nome-cell">{{cadastro.nome}}</span>
                </td>
              </ng-container>

              <!-- Coluna Data Nascimento -->
              <ng-container matColumnDef="dataNascimento">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>cake</mat-icon>
                  Data Nascimento
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <span class="date-cell">
                    {{cadastro.dataNascimento | date:'dd/MM/yyyy'}}
                  </span>
                </td>
              </ng-container>

              <!-- Coluna Data/Hora Cadastro -->
              <ng-container matColumnDef="dataCadastro">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>calendar_today</mat-icon>
                  Data/Hora Cadastro
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <span class="date-cell">
                    {{cadastro.dataCadastro | date:'dd/MM/yyyy HH:mm'}}
                  </span>
                </td>
              </ng-container>

              <!-- Coluna Agente Responsável -->
              <ng-container matColumnDef="agenteResponsavel">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>support_agent</mat-icon>
                  Agente Responsável
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <span class="agent-cell">
                    <mat-icon class="agent-icon">person</mat-icon>
                    {{cadastro.agenteResponsavel}}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row 
                  *matRowDef="let row; columns: displayedColumns;"
                  (dblclick)="editCadastro(row)"
                  class="data-row"
                  matTooltip="Duplo clique para editar">
              </tr>
            </table>

            <!-- Paginação -->
            <mat-paginator #paginator
                           [pageSizeOptions]="[5, 10, 25, 50, 100]"
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

    .cadastro-individual-container {
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
      max-width: 1600px;
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

    .filter-chips {
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

    .filter-chip {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .filter-chip[aria-selected="true"] {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
    }

    .agent-filter {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .agent-select {
      max-width: 300px;
    }

    .results-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .results-count,
    .filter-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-weight: 500;
    }

    .filter-info {
      color: #1976d2;
      background: #e3f2fd;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.9rem;
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

    .cadastros-table {
      width: 100%;
    }

    .cadastros-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
      padding: 16px;
    }

    .cadastros-table th mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .cadastros-table td {
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

    .cartao-sus-cell {
      font-weight: 500;
      color: #1976d2;
      background: #e3f2fd;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
    }

    .nome-cell {
      font-weight: 500;
      color: #333;
    }

    .date-cell {
      color: #666;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
    }

    .agent-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      font-weight: 500;
    }

    .agent-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      color: #4caf50;
    }

    mat-paginator {
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .cadastro-individual-container {
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

      .filter-chips {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .grid-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .cadastros-table {
        font-size: 0.9rem;
      }

      .cadastros-table th,
      .cadastros-table td {
        padding: 12px 8px;
      }
    }
  `]
})
export class CadastroIndividualComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  displayedColumns: string[] = ['id', 'cartaoSus', 'nome', 'dataNascimento', 'dataCadastro', 'agenteResponsavel'];
  dataSource = new MatTableDataSource<CadastroIndividual>([]);
  searchControl = new FormControl('');
  agentFilterControl = new FormControl('');
  selectedFilterType = 'todos';
  uniqueAgents: string[] = [];

  // Mock data
  mockCadastros: CadastroIndividual[] = [
    { id: 1, cartaoSus: '123456789012345', nome: 'Maria Silva Santos', dataNascimento: new Date('1985-03-15'), dataCadastro: new Date('2024-01-15T08:30:00'), agenteResponsavel: 'Ana Costa' },
    { id: 2, cartaoSus: '234567890123456', nome: 'João Oliveira Lima', dataNascimento: new Date('1978-07-22'), dataCadastro: new Date('2024-01-20T10:15:00'), agenteResponsavel: 'Carlos Mendes' },
    { id: 3, cartaoSus: '345678901234567', nome: 'Pedro Rodrigues', dataNascimento: new Date('1992-11-08'), dataCadastro: new Date('2024-02-01T14:20:00'), agenteResponsavel: 'Ana Costa' },
    { id: 4, cartaoSus: '456789012345678', nome: 'Ana Carolina Ferreira', dataNascimento: new Date('1988-05-30'), dataCadastro: new Date('2024-02-10T09:45:00'), agenteResponsavel: 'Roberto Silva' },
    { id: 5, cartaoSus: '567890123456789', nome: 'José Carlos Almeida', dataNascimento: new Date('1970-12-12'), dataCadastro: new Date('2024-02-15T16:30:00'), agenteResponsavel: 'Mariana Souza' }
  ];

  ngOnInit(): void {
    this.dataSource.data = this.mockCadastros;
    this.extractUniqueAgents();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  extractUniqueAgents(): void {
    this.uniqueAgents = [...new Set(this.mockCadastros.map(item => item.agenteResponsavel))].sort();
  }

  setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    this.agentFilterControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.dataSource.filterPredicate = (data: CadastroIndividual, filter: string) => {
      const filters = JSON.parse(filter);
      const searchText = filters.search?.toLowerCase() || '';
      const filterType = filters.filterType || 'todos';
      const agentFilter = filters.agent || '';

      let matchesSearch = true;
      let matchesAgent = true;

      if (agentFilter) {
        matchesAgent = data.agenteResponsavel === agentFilter;
      }

      if (searchText) {
        if (filterType === 'todos') {
          matchesSearch = 
            data.cartaoSus.toLowerCase().includes(searchText) ||
            data.nome.toLowerCase().includes(searchText) ||
            data.dataNascimento.toLocaleDateString('pt-BR').includes(searchText) ||
            data.dataCadastro.toLocaleDateString('pt-BR').includes(searchText) ||
            data.agenteResponsavel.toLowerCase().includes(searchText);
        } else if (filterType === 'cartaoSus') {
          matchesSearch = data.cartaoSus.toLowerCase().includes(searchText);
        } else if (filterType === 'nome') {
          matchesSearch = data.nome.toLowerCase().includes(searchText);
        } else if (filterType === 'dataNascimento') {
          matchesSearch = data.dataNascimento.toLocaleDateString('pt-BR').includes(searchText);
        } else if (filterType === 'dataCadastro') {
          matchesSearch = data.dataCadastro.toLocaleDateString('pt-BR').includes(searchText) ||
                        data.dataCadastro.toLocaleString('pt-BR').includes(searchText);
        } else if (filterType === 'agenteResponsavel') {
          matchesSearch = data.agenteResponsavel.toLowerCase().includes(searchText);
        }
      }

      return matchesSearch && matchesAgent;
    };
  }

  applyFilters(): void {
    const filters = {
      search: this.searchControl.value || '',
      filterType: this.selectedFilterType,
      agent: this.agentFilterControl.value || ''
    };
    this.dataSource.filter = JSON.stringify(filters);
  }

  setFilterType(type: string): void {
    this.selectedFilterType = type;
    this.applyFilters();
  }

  getFilterTypeLabel(): string {
    const labels = {
      'todos': 'Todos os Campos',
      'cartaoSus': 'Nº Cartão SUS',
      'nome': 'Nome',
      'dataNascimento': 'Data Nascimento',
      'dataCadastro': 'Data/Hora Cadastro',
      'agenteResponsavel': 'Agente Responsável'
    };
    return labels[this.selectedFilterType as keyof typeof labels] || 'Todos os Campos';
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.agentFilterControl.setValue('');
    this.selectedFilterType = 'todos';
    this.applyFilters();
    this.notificationService.showInfo('Filtros limpos');
  }

  editCadastro(cadastro: CadastroIndividual): void {
    const dialogRef = this.dialog.open(CadastroIndividualEditDialogComponent, {
      width: '95vw',
      height: '95vh',
      maxWidth: '1800px',
      maxHeight: '1000px',
      data: { cadastro, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.showSuccess('Cadastro Individual atualizado com sucesso!');
        this.refreshData();
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(CadastroIndividualEditDialogComponent, {
      width: '95vw',
      height: '95vh',
      maxWidth: '1800px',
      maxHeight: '1000px',
      data: { cadastro: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.showSuccess('Cadastro Individual criado com sucesso!');
        this.refreshData();
      }
    });
  }

  private refreshData(): void {
    this.dataSource.data = [...this.mockCadastros];
    this.extractUniqueAgents();
  }
}
