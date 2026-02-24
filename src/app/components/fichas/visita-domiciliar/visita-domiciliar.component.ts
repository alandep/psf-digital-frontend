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
import { VisitaDomiciliarEditDialogComponent } from './visita-domiciliar-edit-dialog/visita-domiciliar-edit-dialog.component';
import { NotificationService } from '../../../services/notification.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface VisitaDomiciliar {
  id: number;
  descricaoEndereco: string;
  logradouro: string;
  numero: string;
  complemento: string;
  numeroCartaoSus: string;
  dataCadastro: Date;
  agente: string;
  statusVisita: 'Realizada' | 'Recusada' | 'Ausente';
  microarea: string;
  bairro: string;
  cidade: string;
}

@Component({
  selector: 'app-visita-domiciliar',
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
    <div class="visita-domiciliar-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>medical_services</mat-icon>
          Visita Domiciliar
        </h1>
        <p>Registro e acompanhamento de visitas domiciliares</p>
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
                  [selected]="selectedFilterType === 'endereco'"
                  (click)="setFilterType('endereco')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>home</mat-icon>
                  Endereço
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedFilterType === 'agente'"
                  (click)="setFilterType('agente')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>support_agent</mat-icon>
                  Agente
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedFilterType === 'dataCadastro'"
                  (click)="setFilterType('dataCadastro')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>calendar_today</mat-icon>
                  Data Cadastro
                </mat-chip-option>
                
                <mat-chip-option 
                  [selected]="selectedFilterType === 'status'"
                  (click)="setFilterType('status')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>task_alt</mat-icon>
                  Status
                </mat-chip-option>
              </mat-chip-listbox>
            </div>

            <!-- Filtros específicos -->
            <div class="specific-filters">
              <mat-form-field appearance="outline" class="filter-select">
                <mat-label>Filtrar por Agente</mat-label>
                <mat-icon matPrefix>support_agent</mat-icon>
                <mat-select [formControl]="agentFilterControl">
                  <mat-option value="">Todos os Agentes</mat-option>
                  <mat-option *ngFor="let agent of uniqueAgents" [value]="agent">
                    {{ agent }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="filter-select">
                <mat-label>Filtrar por Status</mat-label>
                <mat-icon matPrefix>task_alt</mat-icon>
                <mat-select [formControl]="statusFilterControl">
                  <mat-option value="">Todos os Status</mat-option>
                  <mat-option value="Realizada">Realizada</mat-option>
                  <mat-option value="Recusada">Recusada</mat-option>
                  <mat-option value="Ausente">Ausente</mat-option>
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
              Lista de Visitas Domiciliares
            </h2>
            <button mat-raised-button 
                    color="primary"
                    (click)="openAddDialog()">
              <mat-icon>add</mat-icon>
              Nova Visita
            </button>
          </div>

          <div class="table-container">
            <table mat-table 
                   [dataSource]="dataSource" 
                   matSort
                   class="visitas-table">

              <!-- Coluna ID -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>tag</mat-icon>
                  ID
                </th>
                <td mat-cell *matCellDef="let visita">
                  <span class="id-cell">#{{visita.id}}</span>
                </td>
              </ng-container>

              <!-- Coluna Descrição Endereço -->
              <ng-container matColumnDef="descricaoEndereco">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>home</mat-icon>
                  Endereço
                </th>
                <td mat-cell *matCellDef="let visita">
                  <div class="endereco-cell">
                    <div class="endereco-principal">
                      <strong>{{visita.logradouro}}, {{visita.numero}}</strong>
                      <span *ngIf="visita.complemento"> - {{visita.complemento}}</span>
                    </div>
                    <div class="cartao-sus-info">
                      <span class="cartao-sus">CNS: {{visita.numeroCartaoSus}}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Data/Hora Cadastro -->
              <ng-container matColumnDef="dataCadastro">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>calendar_today</mat-icon>
                  Data/Hora Cadastro
                </th>
                <td mat-cell *matCellDef="let visita">
                  <span class="date-cell">
                    {{visita.dataCadastro | date:'dd/MM/yyyy HH:mm:ss'}}
                  </span>
                </td>
              </ng-container>

              <!-- Coluna Agente -->
              <ng-container matColumnDef="agente">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>support_agent</mat-icon>
                  Agente
                </th>
                <td mat-cell *matCellDef="let visita">
                  <span class="agent-cell">
                    <mat-icon class="agent-icon">person</mat-icon>
                    {{visita.agente}}
                  </span>
                </td>
              </ng-container>

              <!-- Coluna Status -->
              <ng-container matColumnDef="statusVisita">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>task_alt</mat-icon>
                  Status da Visita
                </th>
                <td mat-cell *matCellDef="let visita">
                  <span class="status-cell" [class]="'status-' + visita.statusVisita.toLowerCase()">
                    <mat-icon>{{getStatusIcon(visita.statusVisita)}}</mat-icon>
                    {{visita.statusVisita}}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row 
                  *matRowDef="let row; columns: displayedColumns;"
                  (dblclick)="editVisita(row)"
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

    .visita-domiciliar-container {
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
      color: #e91e63;
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
      max-width: 1800px;
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
      background-color: #fce4ec !important;
      color: #c2185b !important;
    }

    .specific-filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .filter-select {
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
      color: #e91e63;
      background: #fce4ec;
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

    .visitas-table {
      width: 100%;
    }

    .visitas-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
      padding: 16px;
    }

    .visitas-table th mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }

    .visitas-table td {
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

    .endereco-cell {
      font-size: 0.9rem;
    }

    .endereco-principal {
      margin-bottom: 8px;
    }

    .endereco-principal strong {
      color: #333;
    }

    .cartao-sus-info {
      display: flex;
      align-items: center;
    }

    .cartao-sus {
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      color: #1976d2;
      background: #e3f2fd;
      padding: 2px 6px;
      border-radius: 4px;
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

    .status-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.9rem;
      width: fit-content;
    }

    .status-cell mat-icon {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
    }

    .status-realizada {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-recusada {
      background: #ffebee;
      color: #c62828;
    }

    .status-ausente {
      background: #fff3e0;
      color: #ef6c00;
    }

    mat-paginator {
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .visita-domiciliar-container {
        padding: 16px;
      }

      .page-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 8px;
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

      .specific-filters {
        flex-direction: column;
        gap: 12px;
      }

      .filter-select {
        max-width: 100%;
      }

      .grid-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .visitas-table {
        font-size: 0.9rem;
      }
    }
  `]
})
export class VisitaDomiciliarComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  displayedColumns: string[] = ['id', 'descricaoEndereco', 'dataCadastro', 'agente', 'statusVisita'];
  dataSource = new MatTableDataSource<VisitaDomiciliar>([]);
  searchControl = new FormControl('');
  agentFilterControl = new FormControl('');
  statusFilterControl = new FormControl('');
  selectedFilterType = 'todos';
  uniqueAgents: string[] = [];

  // Mock data
  mockVisitas: VisitaDomiciliar[] = [
    {
      id: 1,
      descricaoEndereco: 'Avenida Azor Marques, 999',
      logradouro: 'Avenida Azor Marques',
      numero: '999',
      complemento: 'Apto 101',
      numeroCartaoSus: '70521066622223',
      dataCadastro: new Date('2024-10-10T08:15:52'),
      agente: 'Fernanda Carneiro',
      statusVisita: 'Realizada',
      microarea: '001',
      bairro: 'Centro',
      cidade: 'Belo Horizonte'
    },
    {
      id: 2,
      descricaoEndereco: 'Rua das Flores, 123',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: '',
      numeroCartaoSus: '12345678901234',
      dataCadastro: new Date('2024-10-12T14:30:20'),
      agente: 'Carlos Mendes',
      statusVisita: 'Recusada',
      microarea: '002',
      bairro: 'Savassi',
      cidade: 'Belo Horizonte'
    },
    {
      id: 3,
      descricaoEndereco: 'Rua da Liberdade, 456',
      logradouro: 'Rua da Liberdade',
      numero: '456',
      complemento: 'Casa 2',
      numeroCartaoSus: '98765432109876',
      dataCadastro: new Date('2024-10-15T09:45:10'),
      agente: 'Ana Paula Silva',
      statusVisita: 'Ausente',
      microarea: '003',
      bairro: 'Liberdade',
      cidade: 'São Paulo'
    },
    {
      id: 4,
      descricaoEndereco: 'Av. Brasil, 789',
      logradouro: 'Av. Brasil',
      numero: '789',
      complemento: 'Bloco B',
      numeroCartaoSus: '45678912345678',
      dataCadastro: new Date('2024-10-18T16:20:35'),
      agente: 'Mariana Lima',
      statusVisita: 'Realizada',
      microarea: '004',
      bairro: 'Centro',
      cidade: 'Belo Horizonte'
    },
    {
      id: 5,
      descricaoEndereco: 'Rua das Acácias, 321',
      logradouro: 'Rua das Acácias',
      numero: '321',
      complemento: 'Apto 302',
      numeroCartaoSus: '32165498732165',
      dataCadastro: new Date('2024-10-20T11:10:05'),
      agente: 'Roberto Santos',
      statusVisita: 'Realizada',
      microarea: '005',
      bairro: 'Savassi',
      cidade: 'Belo Horizonte'
    }
  ];

  ngOnInit(): void {
    this.dataSource.data = this.mockVisitas;
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
    this.uniqueAgents = [...new Set(this.mockVisitas.map(item => item.agente))].sort();
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

    this.statusFilterControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.dataSource.filterPredicate = (data: VisitaDomiciliar, filter: string) => {
      const filters = JSON.parse(filter);
      const searchText = filters.search?.toLowerCase() || '';
      const filterType = filters.filterType || 'todos';
      const agentFilter = filters.agent || '';
      const statusFilter = filters.status || '';

      let matchesSearch = true;
      let matchesAgent = true;
      let matchesStatus = true;

      if (agentFilter) {
        matchesAgent = data.agente === agentFilter;
      }

      if (statusFilter) {
        matchesStatus = data.statusVisita === statusFilter;
      }

      if (searchText) {
        if (filterType === 'todos') {
          matchesSearch = 
            data.descricaoEndereco.toLowerCase().includes(searchText) ||
            data.logradouro.toLowerCase().includes(searchText) ||
            data.numero.toLowerCase().includes(searchText) ||
            data.complemento.toLowerCase().includes(searchText) ||
            data.numeroCartaoSus.toLowerCase().includes(searchText) ||
            data.agente.toLowerCase().includes(searchText) ||
            data.statusVisita.toLowerCase().includes(searchText) ||
            data.dataCadastro.toLocaleDateString('pt-BR').includes(searchText);
        } else if (filterType === 'endereco') {
          matchesSearch = 
            data.descricaoEndereco.toLowerCase().includes(searchText) ||
            data.logradouro.toLowerCase().includes(searchText) ||
            data.numero.toLowerCase().includes(searchText) ||
            data.complemento.toLowerCase().includes(searchText);
        } else if (filterType === 'agente') {
          matchesSearch = data.agente.toLowerCase().includes(searchText);
        } else if (filterType === 'dataCadastro') {
          matchesSearch = 
            data.dataCadastro.toLocaleDateString('pt-BR').includes(searchText) ||
            data.dataCadastro.toLocaleString('pt-BR').includes(searchText);
        } else if (filterType === 'status') {
          matchesSearch = data.statusVisita.toLowerCase().includes(searchText);
        }
      }

      return matchesSearch && matchesAgent && matchesStatus;
    };
  }

  applyFilters(): void {
    const filters = {
      search: this.searchControl.value || '',
      filterType: this.selectedFilterType,
      agent: this.agentFilterControl.value || '',
      status: this.statusFilterControl.value || ''
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
      'endereco': 'Endereço',
      'agente': 'Agente',
      'dataCadastro': 'Data Cadastro',
      'status': 'Status'
    };
    return labels[this.selectedFilterType as keyof typeof labels] || 'Todos os Campos';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Realizada': return 'check_circle';
      case 'Recusada': return 'cancel';
      case 'Ausente': return 'schedule';
      default: return 'help';
    }
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.agentFilterControl.setValue('');
    this.statusFilterControl.setValue('');
    this.selectedFilterType = 'todos';
    this.applyFilters();
    this.notificationService.showInfo('Filtros limpos');
  }

  editVisita(visita: VisitaDomiciliar): void {
    const dialogRef = this.dialog.open(VisitaDomiciliarEditDialogComponent, {
      width: '95vw',
      height: '95vh',
      maxWidth: '1800px',
      maxHeight: '1000px',
      data: { visita, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.showSuccess('Visita Domiciliar atualizada com sucesso!');
        this.refreshData();
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(VisitaDomiciliarEditDialogComponent, {
      width: '95vw',
      height: '95vh',
      maxWidth: '1800px',
      maxHeight: '1000px',
      data: { visita: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.showSuccess('Visita Domiciliar criada com sucesso!');
        this.refreshData();
      }
    });
  }

  private refreshData(): void {
    this.dataSource.data = [...this.mockVisitas];
    this.extractUniqueAgents();
  }
}
