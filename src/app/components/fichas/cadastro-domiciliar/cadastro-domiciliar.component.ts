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
import { MatExpansionModule } from '@angular/material/expansion';
import { CadastroDomiciliarEditDialogComponent } from './cadastro-domiciliar-edit-dialog/cadastro-domiciliar-edit-dialog.component';
// import { ComponentesFamiliaresDialogComponent } from './componentes-familiares-dialog/componentes-familiares-dialog.component';
import { NotificationService } from '../../../services/notification.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface CadastroDomiciliar {
  id: number;
  descricaoEndereco: string;
  logradouro: string;
  numero: string;
  complemento: string;
  nomeResponsavel: string;
  cartaoSusResponsavel: string;
  agente: string;
  dataCadastro: Date;
  microarea: string;
  bairro: string;
  cidade: string;
}

export interface ResponsavelFamiliar {
  nome: string;
  cartaoSus: string;
  agente: string;
  dataCadastro: Date;
}

export interface EnderecoAgrupado {
  endereco: string;
  responsaveis: ResponsavelFamiliar[];
  expanded?: boolean;
}

@Component({
  selector: 'app-cadastro-domiciliar',
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
    MatSelectModule,
    MatExpansionModule
  ],
  template: `
    <div class="cadastro-domiciliar-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>home_work</mat-icon>
          Cadastro Domiciliar
        </h1>
        <p>Gerencie os cadastros domiciliares e familiares</p>
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
            <div class="header-actions">
              <button mat-icon-button 
                      matTooltip="Limpar filtros"
                      (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
              </button>
              <button mat-raised-button 
                      color="accent"
                      (click)="toggleViewMode()"
                      [matTooltip]="viewMode === 'individual' ? 'Visualizar por Endereço' : 'Visualizar Individual'">
                <mat-icon>{{viewMode === 'individual' ? 'apartment' : 'view_list'}}</mat-icon>
                {{viewMode === 'individual' ? 'Por Endereço' : 'Individual'}}
              </button>
            </div>
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
                  [selected]="selectedFilterType === 'responsavel'"
                  (click)="setFilterType('responsavel')"
                  class="filter-chip">
                  <mat-icon matChipAvatar>person</mat-icon>
                  Responsável
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

              <mat-form-field appearance="outline" class="city-select">
                <mat-label>Filtrar por Cidade</mat-label>
                <mat-icon matPrefix>location_city</mat-icon>
                <mat-select [formControl]="cityFilterControl">
                  <mat-option value="">Todas as Cidades</mat-option>
                  <mat-option *ngFor="let city of uniqueCities" [value]="city">
                    {{ city }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Resultados -->
          <div class="results-info">
            <span class="results-count">
              <mat-icon>info</mat-icon>
              {{getResultsCount()}} registro(s) encontrado(s)
            </span>
            <span class="filter-info" *ngIf="selectedFilterType !== 'todos'">
              <mat-icon>filter_alt</mat-icon>
              Filtrando por: {{getFilterTypeLabel()}}
            </span>
          </div>
        </div>

        <!-- Grid Individual -->
        <div class="grid-section" *ngIf="viewMode === 'individual'">
          <div class="grid-header">
            <h2>
              <mat-icon>grid_on</mat-icon>
              Lista de Cadastros Domiciliares
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

              <!-- Coluna Descrição Endereço -->
              <ng-container matColumnDef="descricaoEndereco">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>home</mat-icon>
                  Endereço
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <div class="endereco-cell">
                    <strong>{{cadastro.logradouro}}, {{cadastro.numero}}</strong>
                    <span *ngIf="cadastro.complemento"> - {{cadastro.complemento}}</span>
                    <br>
                    <small>{{cadastro.bairro}} - {{cadastro.cidade}}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Responsável -->
              <ng-container matColumnDef="nomeResponsavel">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>person</mat-icon>
                  Responsável Familiar
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <div class="responsavel-cell">
                    <strong>{{cadastro.nomeResponsavel}}</strong>
                    <br>
                    <span class="cartao-sus">SUS: {{cadastro.cartaoSusResponsavel}}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Coluna Agente -->
              <ng-container matColumnDef="agente">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>support_agent</mat-icon>
                  Agente
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <span class="agent-cell">
                    <mat-icon class="agent-icon">person</mat-icon>
                    {{cadastro.agente}}
                  </span>
                </td>
              </ng-container>

              <!-- Coluna Data Cadastro -->
              <ng-container matColumnDef="dataCadastro">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>
                  <mat-icon>calendar_today</mat-icon>
                  Data Cadastro
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <span class="date-cell">
                    {{cadastro.dataCadastro | date:'dd/MM/yyyy HH:mm'}}
                  </span>
                </td>
              </ng-container>

              <!-- Coluna Ações -->
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-icon>settings</mat-icon>
                  Ações
                </th>
                <td mat-cell *matCellDef="let cadastro">
                  <div class="action-buttons">
                    <button mat-icon-button 
                            matTooltip="Visualizar Cadastro Completo"
                            (click)="viewCadastro(cadastro); $event.stopPropagation()">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button 
                            matTooltip="Componentes Familiares"
                            (click)="viewComponentesFamiliares(cadastro); $event.stopPropagation()">
                      <mat-icon>group</mat-icon>
                    </button>
                  </div>
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

        <!-- Visualização Agrupada por Endereço -->
        <div class="grouped-section" *ngIf="viewMode === 'grouped'">
          <div class="grid-header">
            <h2>
              <mat-icon>apartment</mat-icon>
              Cadastros Agrupados por Endereço
            </h2>
            <button mat-raised-button 
                    color="primary"
                    (click)="openAddDialog()">
              <mat-icon>add</mat-icon>
              Novo Cadastro
            </button>
          </div>

          <div class="grouped-container">
            <mat-accordion multi="true">
              <mat-expansion-panel *ngFor="let grupo of enderecosAgrupados" 
                                   [expanded]="grupo.expanded">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>home</mat-icon>
                    {{grupo.endereco}}
                  </mat-panel-title>
                  <mat-panel-description>
                    {{grupo.responsaveis.length}} responsável(eis) familiar(es)
                  </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="responsaveis-list">
                  <mat-card *ngFor="let resp of grupo.responsaveis" class="responsavel-card">
                    <mat-card-content>
                      <div class="responsavel-info">
                        <div class="info-section">
                          <h4>{{resp.nome}}</h4>
                          <p><strong>Cartão SUS:</strong> {{resp.cartaoSus}}</p>
                          <p><strong>Agente:</strong> {{resp.agente}}</p>
                          <p><strong>Cadastro:</strong> {{resp.dataCadastro | date:'dd/MM/yyyy HH:mm'}}</p>
                        </div>
                        <div class="action-section">
                          <button mat-icon-button 
                                  matTooltip="Visualizar Cadastro Completo"
                                  (click)="viewCadastroByResponsavel(resp)">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button 
                                  matTooltip="Componentes Familiares"
                                  (click)="viewComponentesFamiliaresByResponsavel(resp)">
                            <mat-icon>group</mat-icon>
                          </button>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    * {
      font-family: 'Inter', sans-serif;
    }

    .cadastro-domiciliar-container {
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
      color: #ff9800;
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

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
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
      background-color: #fff3e0 !important;
      color: #e65100 !important;
    }

    .agent-filter {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .agent-select,
    .city-select {
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
      color: #ff9800;
      background: #fff3e0;
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

    .endereco-cell {
      font-size: 0.9rem;
    }

    .endereco-cell strong {
      color: #333;
    }

    .endereco-cell small {
      color: #666;
    }

    .responsavel-cell strong {
      color: #333;
    }

    .cartao-sus {
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      color: #1976d2;
      background: #e3f2fd;
      padding: 2px 6px;
      border-radius: 4px;
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

    .date-cell {
      color: #666;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .grouped-section {
      padding: 24px;
    }

    .grouped-container {
      margin-top: 24px;
    }

    .responsaveis-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .responsavel-card {
      border-left: 4px solid #ff9800;
    }

    .responsavel-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-section h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .info-section p {
      margin: 4px 0;
      font-size: 0.9rem;
      color: #666;
    }

    .action-section {
      display: flex;
      gap: 8px;
    }

    mat-paginator {
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .cadastro-domiciliar-container {
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

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }

      .filter-chips {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .agent-filter {
        flex-direction: column;
        gap: 12px;
      }

      .agent-select,
      .city-select {
        max-width: 100%;
      }

      .grid-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .cadastros-table {
        font-size: 0.9rem;
      }

      .responsavel-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class CadastroDomiciliarComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  // Novos campos para funcionalidades expandidas
  viewMode: 'individual' | 'grouped' = 'individual';
  enderecosAgrupados: EnderecoAgrupado[] = [];
  uniqueCities: string[] = [];
  cityFilterControl = new FormControl('');
  
  // Colunas da tabela atualizada
  displayedColumns: string[] = [
    'id',
    'descricaoEndereco', 
    'nomeResponsavel',
    'cartaoSusResponsavel',
    'agente',
    'dataCadastro',
    'acoes'
  ];

  dataSource = new MatTableDataSource<CadastroDomiciliar>([]);
  searchControl = new FormControl('');
  agentFilterControl = new FormControl('');
  selectedFilterType = 'todos';
  uniqueAgents: string[] = [];

  // Mock data
  mockCadastros: CadastroDomiciliar[] = [
    { 
      id: 1, 
      descricaoEndereco: 'Av. Azor Marques, 999',
      logradouro: 'Av. Azor Marques',
      numero: '999',
      complemento: 'Apto 101',
      nomeResponsavel: 'José Antonio de Souza',
      cartaoSusResponsavel: '70521066622223',
      agente: 'Fernanda Carneiro',
      dataCadastro: new Date('2024-01-15T08:30:00'),
      microarea: 'A01',
      bairro: 'Centro',
      cidade: 'Belo Horizonte'
    },
    { 
      id: 2, 
      descricaoEndereco: 'Rua das Flores, 123',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: '',
      nomeResponsavel: 'Maria Silva Santos',
      cartaoSusResponsavel: '12345678901234',
      agente: 'Carlos Mendes',
      dataCadastro: new Date('2024-01-20T10:15:00'),
      microarea: 'B02',
      bairro: 'Savassi',
      cidade: 'Belo Horizonte'
    },
    { 
      id: 3, 
      descricaoEndereco: 'Av. Azor Marques, 999',
      logradouro: 'Av. Azor Marques',
      numero: '999',
      complemento: 'Apto 201',
      nomeResponsavel: 'Ana Paula Costa',
      cartaoSusResponsavel: '98765432109876',
      agente: 'Fernanda Carneiro',
      dataCadastro: new Date('2024-02-01T14:20:00'),
      microarea: 'A01',
      bairro: 'Centro',
      cidade: 'Belo Horizonte'
    },
    { 
      id: 4, 
      descricaoEndereco: 'Rua da Liberdade, 456',
      logradouro: 'Rua da Liberdade',
      numero: '456',
      complemento: 'Casa 2',
      nomeResponsavel: 'Roberto Carlos da Silva',
      cartaoSusResponsavel: '45678912345678',
      agente: 'Mariana Lima',
      dataCadastro: new Date('2024-02-10T09:00:00'),
      microarea: 'C03',
      bairro: 'Liberdade',
      cidade: 'São Paulo'
    },
    { 
      id: 5, 
      descricaoEndereco: 'Av. Brasil, 789',
      logradouro: 'Av. Brasil',
      numero: '789',
      complemento: 'Bloco B',
      nomeResponsavel: 'Fernanda Souza Oliveira',
      cartaoSusResponsavel: '32165498732165',
      agente: 'Fernanda Carneiro',
      dataCadastro: new Date('2024-02-15T11:45:00'),
      microarea: 'A01',
      bairro: 'Centro',
      cidade: 'Belo Horizonte'
    },
    { 
      id: 6, 
      descricaoEndereco: 'Rua das Acácias, 321',
      logradouro: 'Rua das Acácias',
      numero: '321',
      complemento: 'Apto 302',
      nomeResponsavel: 'Carlos Eduardo Martins',
      cartaoSusResponsavel: '65432198765432',
      agente: 'Carlos Mendes',
      dataCadastro: new Date('2024-03-01T15:30:00'),
      microarea: 'B02',
      bairro: 'Savassi',
      cidade: 'Belo Horizonte'
    },
    { 
      id: 7, 
      descricaoEndereco: 'Av. dos Trabalhadores, 147',
      logradouro: 'Av. dos Trabalhadores',
      numero: '147',
      complemento: 'Sala 1',
      nomeResponsavel: 'Ana Clara Pires',
      cartaoSusResponsavel: '78945612378945',
      agente: 'Mariana Lima',
      dataCadastro: new Date('2024-03-10T08:00:00'),
      microarea: 'C03',
      bairro: 'Liberdade',
      cidade: 'São Paulo'
    },
    { 
      id: 8, 
      descricaoEndereco: 'Rua do Comércio, 852',
      logradouro: 'Rua do Comércio',
      numero: '852',
      complemento: 'Loja 3',
      nomeResponsavel: 'Roberta Almeida',
      cartaoSusResponsavel: '15975348615975',
      agente: 'Fernanda Carneiro',
      dataCadastro: new Date('2024-03-15T10:15:00'),
      microarea: 'A01',
      bairro: 'Centro',
      cidade: 'Belo Horizonte'
    },
    { 
      id: 9, 
      descricaoEndereco: 'Av. Ipiranga, 500',
      logradouro: 'Av. Ipiranga',
      numero: '500',
      complemento: 'Apto 101',
      nomeResponsavel: 'José da Silva',
      cartaoSusResponsavel: '75315948675312',
      agente: 'Carlos Mendes',
      dataCadastro: new Date('2024-04-01T14:00:00'),
      microarea: 'B02',
      bairro: 'Savassi',
      cidade: 'Belo Horizonte'
    },
    { 
      id: 10, 
      descricaoEndereco: 'Rua São João, 234',
      logradouro: 'Rua São João',
      numero: '234',
      complemento: 'Casa 1',
      nomeResponsavel: 'Maria Oliveira',
      cartaoSusResponsavel: '95175348615987',
      agente: 'Mariana Lima',
      dataCadastro: new Date('2024-04-10T09:30:00'),
      microarea: 'C03',
      bairro: 'Liberdade',
      cidade: 'São Paulo'
    }
  ];

  ngOnInit(): void {
    this.loadMockData();
    this.setupFilters();
    this.setupPagination();
    this.generateUniqueValues();
    this.generateGroupedData();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  private loadMockData(): void {
    this.dataSource.data = [...this.mockCadastros];
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });

    this.agentFilterControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.cityFilterControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Configurar o filterPredicate corretamente
    this.dataSource.filterPredicate = (data: CadastroDomiciliar, filter: string) => {
      const filters = JSON.parse(filter);
      const searchText = filters.search?.toLowerCase() || '';
      const filterType = filters.filterType || 'todos';
      const agentFilter = filters.agent || '';
      const cityFilter = filters.city || '';

      let matchesSearch = true;
      let matchesAgent = true;
      let matchesCity = true;

      // Filtro por agente
      if (agentFilter) {
        matchesAgent = data.agente === agentFilter;
      }

      // Filtro por cidade
      if (cityFilter) {
        matchesCity = data.cidade === cityFilter;
      }

      // Filtro por texto
      if (searchText) {
        if (filterType === 'todos') {
          matchesSearch = 
            data.descricaoEndereco.toLowerCase().includes(searchText) ||
            data.logradouro.toLowerCase().includes(searchText) ||
            data.numero.toLowerCase().includes(searchText) ||
            data.complemento.toLowerCase().includes(searchText) ||
            data.nomeResponsavel.toLowerCase().includes(searchText) ||
            data.cartaoSusResponsavel.toLowerCase().includes(searchText) ||
            data.agente.toLowerCase().includes(searchText) ||
            data.dataCadastro.toLocaleDateString('pt-BR').includes(searchText) ||
            data.bairro.toLowerCase().includes(searchText) ||
            data.cidade.toLowerCase().includes(searchText);
        } else if (filterType === 'endereco') {
          matchesSearch = 
            data.descricaoEndereco.toLowerCase().includes(searchText) ||
            data.logradouro.toLowerCase().includes(searchText) ||
            data.numero.toLowerCase().includes(searchText) ||
            data.complemento.toLowerCase().includes(searchText) ||
            data.bairro.toLowerCase().includes(searchText);
        } else if (filterType === 'responsavel') {
          matchesSearch = 
            data.nomeResponsavel.toLowerCase().includes(searchText) ||
            data.cartaoSusResponsavel.toLowerCase().includes(searchText);
        } else if (filterType === 'agente') {
          matchesSearch = data.agente.toLowerCase().includes(searchText);
        } else if (filterType === 'dataCadastro') {
          matchesSearch = 
            data.dataCadastro.toLocaleDateString('pt-BR').includes(searchText) ||
            data.dataCadastro.toLocaleString('pt-BR').includes(searchText);
        }
      }

      return matchesSearch && matchesAgent && matchesCity;
    };
  }

  private setupPagination(): void {
    // Configuração da paginação será feita no ngAfterViewInit
  }

  applyFilters(): void {
    const filters = {
      search: this.searchControl.value || '',
      filterType: this.selectedFilterType,
      agent: this.agentFilterControl.value || '',
      city: this.cityFilterControl.value || ''
    };
    
    // Aplicar filtro usando string JSON
    this.dataSource.filter = JSON.stringify(filters);

    // Atualizar dados agrupados se estiver no modo agrupado
    if (this.viewMode === 'grouped') {
      this.updateGroupedData();
    }
  }

  private updateGroupedData(): void {
    const searchValue = this.searchControl.value?.trim().toLowerCase() || '';
    const agentValue = this.agentFilterControl.value || '';
    const cityValue = this.cityFilterControl.value || '';

    // Filtrar dados primeiro
    let filteredData = this.dataSource.data;

    if (searchValue || agentValue || cityValue) {
      filteredData = this.dataSource.data.filter(cadastro => {
        let matchesSearch = true;
        let matchesAgent = true;
        let matchesCity = true;

        if (searchValue) {
          if (this.selectedFilterType === 'todos') {
            matchesSearch = 
              cadastro.descricaoEndereco.toLowerCase().includes(searchValue) ||
              cadastro.nomeResponsavel.toLowerCase().includes(searchValue) ||
              cadastro.agente.toLowerCase().includes(searchValue) ||
              cadastro.cartaoSusResponsavel.toLowerCase().includes(searchValue);
          } else if (this.selectedFilterType === 'endereco') {
            matchesSearch = cadastro.descricaoEndereco.toLowerCase().includes(searchValue);
          } else if (this.selectedFilterType === 'responsavel') {
            matchesSearch = cadastro.nomeResponsavel.toLowerCase().includes(searchValue);
          } else if (this.selectedFilterType === 'agente') {
            matchesSearch = cadastro.agente.toLowerCase().includes(searchValue);
          }
        }

        if (agentValue) {
          matchesAgent = cadastro.agente === agentValue;
        }

        if (cityValue) {
          matchesCity = cadastro.cidade === cityValue;
        }

        return matchesSearch && matchesAgent && matchesCity;
      });
    }

    // Reagrupar dados filtrados
    const grouped = new Map<string, ResponsavelFamiliar[]>();
    
    filteredData.forEach(cadastro => {
      const enderecoKey = `${cadastro.logradouro}, ${cadastro.numero}`;
      if (!grouped.has(enderecoKey)) {
        grouped.set(enderecoKey, []);
      }
      
      grouped.get(enderecoKey)!.push({
        nome: cadastro.nomeResponsavel,
        cartaoSus: cadastro.cartaoSusResponsavel,
        agente: cadastro.agente,
        dataCadastro: cadastro.dataCadastro
      });
    });

    this.enderecosAgrupados = Array.from(grouped.entries()).map(([endereco, responsaveis]) => ({
      endereco,
      responsaveis,
      expanded: false
    }));
  }

  private generateUniqueValues(): void {
    const data = this.dataSource.data;
    this.uniqueAgents = [...new Set(data.map(item => item.agente))].sort();
    this.uniqueCities = [...new Set(data.map(item => item.cidade))].sort();
  }

  private generateGroupedData(): void {
    const grouped = new Map<string, ResponsavelFamiliar[]>();
    
    this.dataSource.data.forEach(cadastro => {
      const enderecoKey = `${cadastro.logradouro}, ${cadastro.numero}`;
      if (!grouped.has(enderecoKey)) {
        grouped.set(enderecoKey, []);
      }
      
      grouped.get(enderecoKey)!.push({
        nome: cadastro.nomeResponsavel,
        cartaoSus: cadastro.cartaoSusResponsavel,
        agente: cadastro.agente,
        dataCadastro: cadastro.dataCadastro
      });
    });

    this.enderecosAgrupados = Array.from(grouped.entries()).map(([endereco, responsaveis]) => ({
      endereco,
      responsaveis,
      expanded: false
    }));
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'individual' ? 'grouped' : 'individual';
    if (this.viewMode === 'grouped') {
      this.generateGroupedData();
    }
  }

  getResultsCount(): number {
    return this.viewMode === 'individual' 
      ? this.dataSource.filteredData.length 
      : this.enderecosAgrupados.length;
  }

  setFilterType(type: string): void {
    this.selectedFilterType = type;
    this.applyFilters();
  }

  getFilterTypeLabel(): string {
    const labels = {
      'todos': 'Todos os Campos',
      'endereco': 'Endereço',
      'responsavel': 'Responsável',
      'agente': 'Agente',
      'dataCadastro': 'Data Cadastro'
    };
    return labels[this.selectedFilterType as keyof typeof labels] || 'Todos os Campos';
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.agentFilterControl.setValue('');
    this.cityFilterControl.setValue('');
    this.selectedFilterType = 'todos';
    this.applyFilters();
    this.notificationService.showInfo('Filtros limpos');
  }

  editCadastro(cadastro: CadastroDomiciliar): void {
    this.openEditDialog(cadastro, false);
  }

  viewCadastro(cadastro: CadastroDomiciliar): void {
    this.notificationService.showInfo(`Visualizando cadastro de ${cadastro.nomeResponsavel}`);
    this.openEditDialog(cadastro, true);
  }

  viewComponentesFamiliares(cadastro: CadastroDomiciliar): void {
    this.notificationService.showInfo(`Carregando componentes familiares de ${cadastro.nomeResponsavel}`);
    // TODO: Implementar dialog de componentes familiares
    // this.dialog.open(ComponentesFamiliaresDialogComponent, {
    //   width: '95vw',
    //   height: '90vh',
    //   maxWidth: '1400px',
    //   data: { cadastro: { ...cadastro } }
    // });
    console.log('Funcionalidade de componentes familiares será implementada em breve');
  }

  viewCadastroByResponsavel(responsavel: ResponsavelFamiliar): void {
    const cadastro = this.dataSource.data.find(c => c.cartaoSusResponsavel === responsavel.cartaoSus);
    if (cadastro) {
      this.viewCadastro(cadastro);
    }
  }

  viewComponentesFamiliaresByResponsavel(responsavel: ResponsavelFamiliar): void {
    const cadastro = this.dataSource.data.find(c => c.cartaoSusResponsavel === responsavel.cartaoSus);
    if (cadastro) {
      this.viewComponentesFamiliares(cadastro);
    }
  }

  // Método para abrir dialog de edição com abas
  private openEditDialog(cadastro: CadastroDomiciliar, viewOnly: boolean = false): void {
    const dialogRef = this.dialog.open(CadastroDomiciliarEditDialogComponent, {
      width: '95vw',
      height: '90vh',
      maxWidth: '1400px',
      data: { 
        cadastro: { ...cadastro },
        viewOnly: viewOnly,
        cities: this.uniqueCities
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && !viewOnly) {
        this.notificationService.showSuccess('Cadastro domiciliar atualizado com sucesso!');
        this.refreshData();
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(CadastroDomiciliarEditDialogComponent, {
      width: '95vw',
      height: '95vh',
      maxWidth: '1800px',
      maxHeight: '1000px',
      data: { cadastro: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.showSuccess('Cadastro Domiciliar criado com sucesso!');
        this.refreshData();
      }
    });
  }

  private refreshData(): void {
    this.loadMockData();
    this.generateUniqueValues();
    this.generateGroupedData();
  }
}
