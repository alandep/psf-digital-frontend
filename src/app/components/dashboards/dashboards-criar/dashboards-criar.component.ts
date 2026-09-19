import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { NotificationService } from '../../../services/notification.service';

export interface DashboardWidget {
  id: string;
  tipo: 'grafico-linha' | 'grafico-barra' | 'grafico-pizza' | 'tabela' | 'kpi' | 'mapa';
  titulo: string;
  subtitulo?: string;
  fontesDados: string[];
  configuracao: any;
  posicao: { x: number; y: number; w: number; h: number };
  cor: string;
  icone: string;
}

export interface FonteDados {
  id: string;
  nome: string;
  categoria: 'exportacoes' | 'financeiro' | 'logistica' | 'rentabilidade';
  campos: string[];
  icone: string;
}

@Component({
  selector: 'app-dashboards-criar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSliderModule,
    MatTabsModule,
    MatCheckboxModule,
    MatTooltipModule,
    DragDropModule
  ],
  template: `
    <div class="dashboard-creator-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>dashboard_customize</mat-icon>
          Criar Dashboard Personalizado
        </h1>
        <p>Construa dashboards inteligentes sem programação</p>
      </div>

      <div class="creator-layout">
        
        <!-- Sidebar - Configurações -->
        <mat-card class="sidebar">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>settings</mat-icon>
              Configurações
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="dashboardForm" class="config-form">
              
              <!-- Configurações Básicas -->
              <div class="config-section">
                <h3>Informações Básicas</h3>
                
                <mat-form-field appearance="outline">
                  <mat-label>Nome do Dashboard</mat-label>
                  <mat-icon matPrefix>title</mat-icon>
                  <input matInput formControlName="nome" placeholder="Ex: Dashboard Exportações">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Descrição</mat-label>
                  <mat-icon matPrefix>description</mat-icon>
                  <textarea matInput formControlName="descricao" rows="3" 
                           placeholder="Descreva o objetivo deste dashboard"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Layout</mat-label>
                  <mat-icon matPrefix>view_module</mat-icon>
                  <mat-select formControlName="tipoLayout">
                    <mat-option value="grid">Grid Flexível</mat-option>
                    <mat-option value="freeform">Forma Livre</mat-option>
                    <mat-option value="kanban">Kanban</mat-option>
                    <mat-option value="analytics">Analytics</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Widgets Disponíveis -->
              <div class="config-section">
                <h3>Componentes Disponíveis</h3>
                
                <div class="widgets-grid" 
                     cdkDropList 
                     [cdkDropListData]="widgetsDisponiveis"
                     [cdkDropListConnectedTo]="['dashboard-area']"
                     (cdkDropListDropped)="onWidgetDrop($event)">
                  
                  <div class="widget-item" 
                       *ngFor="let widget of widgetsDisponiveis"
                       cdkDrag
                       [cdkDragData]="widget"
                       matTooltip="Arraste para o dashboard">
                    <mat-icon>{{widget.icone}}</mat-icon>
                    <span>{{widget.titulo}}</span>
                  </div>
                </div>
              </div>

              <!-- Fontes de Dados -->
              <div class="config-section">
                <h3>Fontes de Dados</h3>
                
                <div class="fonte-dados-list">
                  <mat-checkbox 
                    *ngFor="let fonte of fontesDisponiveis"
                    [checked]="fontesSelecionadas.includes(fonte.id)"
                    (change)="toggleFonteDados(fonte.id, $event.checked)"
                    class="fonte-checkbox">
                    <div class="fonte-info">
                      <mat-icon>{{fonte.icone}}</mat-icon>
                      <span>{{fonte.nome}}</span>
                      <mat-chip-listbox class="fonte-chips">
                        <mat-chip-option *ngFor="let campo of fonte.campos.slice(0, 3)">
                          {{campo}}
                        </mat-chip-option>
                      </mat-chip-listbox>
                    </div>
                  </mat-checkbox>
                </div>
              </div>

            </form>
          </mat-card-content>
        </mat-card>

        <!-- Main Area - Preview do Dashboard -->
        <div class="dashboard-preview">
          
          <!-- Toolbar -->
          <div class="preview-toolbar">
            <div class="toolbar-info">
              <h2>{{dashboardForm.get('nome')?.value || 'Novo Dashboard'}}</h2>
              <span>{{widgetsSelecionados.length}} widget(s) adicionado(s)</span>
            </div>
            
            <div class="toolbar-actions">
              <button mat-icon-button 
                      matTooltip="Visualizar em tela cheia"
                      (click)="toggleFullscreen()">
                <mat-icon>fullscreen</mat-icon>
              </button>
              
              <button mat-icon-button 
                      matTooltip="Resetar dashboard"
                      (click)="resetDashboard()">
                <mat-icon>refresh</mat-icon>
              </button>
              
              <button mat-raised-button 
                      color="accent"
                      (click)="previewDashboard()">
                <mat-icon>visibility</mat-icon>
                Visualizar
              </button>
              
              <button mat-raised-button 
                      color="primary"
                      (click)="salvarDashboard()"
                      [disabled]="dashboardForm.invalid || widgetsSelecionados.length === 0">
                <mat-icon>save</mat-icon>
                Salvar
              </button>
            </div>
          </div>

          <!-- Dashboard Canvas -->
          <mat-card class="dashboard-canvas">
            
            <!-- Empty State -->
            <div class="empty-state" *ngIf="widgetsSelecionados.length === 0">
              <mat-icon>dashboard</mat-icon>
              <h3>Comece seu Dashboard</h3>
              <p>Arraste componentes da barra lateral para criar seu dashboard personalizado</p>
              <div class="quick-templates">
                <h4>Templates Rápidos:</h4>
                <button mat-chip-option 
                        *ngFor="let template of templatesRapidos"
                        (click)="aplicarTemplate(template)"
                        class="template-chip">
                  <mat-icon matChipAvatar>{{template.icone}}</mat-icon>
                  {{template.nome}}
                </button>
              </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="dashboard-grid" 
                 *ngIf="widgetsSelecionados.length > 0"
                 cdkDropList
                 id="dashboard-area"
                 [cdkDropListData]="widgetsSelecionados"
                 (cdkDropListDropped)="onDashboardDrop($event)">
              
              <div class="widget-container" 
                   *ngFor="let widget of widgetsSelecionados; let i = index"
                   cdkDrag
                   [cdkDragData]="widget"
                   [style.grid-area]="getGridArea(widget)">
                
                <mat-card class="dashboard-widget" [class]="'widget-' + widget.tipo">
                  
                  <!-- Widget Header -->
                  <div class="widget-header">
                    <div class="widget-title">
                      <mat-icon>{{widget.icone}}</mat-icon>
                      <span>{{widget.titulo}}</span>
                    </div>
                    
                    <div class="widget-actions">
                      <button mat-icon-button 
                              matTooltip="Configurar widget"
                              (click)="configurarWidget(widget)">
                        <mat-icon>settings</mat-icon>
                      </button>
                      
                      <button mat-icon-button 
                              matTooltip="Remover widget"
                              (click)="removerWidget(i)">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Widget Content -->
                  <div class="widget-content">
                    <div [ngSwitch]="widget.tipo" class="widget-preview">
                      
                      <!-- Gráfico de Linha -->
                      <div *ngSwitchCase="'grafico-linha'" class="chart-preview">
                        <svg viewBox="0 0 200 100" class="line-chart">
                          <polyline points="10,80 50,40 90,60 130,20 170,30" 
                                   fill="none" stroke="#2196f3" stroke-width="2"/>
                          <circle cx="10" cy="80" r="2" fill="#2196f3"/>
                          <circle cx="50" cy="40" r="2" fill="#2196f3"/>
                          <circle cx="90" cy="60" r="2" fill="#2196f3"/>
                          <circle cx="130" cy="20" r="2" fill="#2196f3"/>
                          <circle cx="170" cy="30" r="2" fill="#2196f3"/>
                        </svg>
                        <span class="chart-label">Tendência de Exportações</span>
                      </div>

                      <!-- Gráfico de Barra -->
                      <div *ngSwitchCase="'grafico-barra'" class="chart-preview">
                        <div class="bar-chart">
                          <div class="bar" style="height: 60%"></div>
                          <div class="bar" style="height: 80%"></div>
                          <div class="bar" style="height: 40%"></div>
                          <div class="bar" style="height: 90%"></div>
                          <div class="bar" style="height: 70%"></div>
                        </div>
                        <span class="chart-label">Volume por Produto</span>
                      </div>

                      <!-- Gráfico de Pizza -->
                      <div *ngSwitchCase="'grafico-pizza'" class="chart-preview">
                        <svg viewBox="0 0 100 100" class="pie-chart">
                          <circle cx="50" cy="50" r="40" fill="#4caf50" 
                                 stroke="#fff" stroke-width="2"
                                 stroke-dasharray="75.4 75.4" 
                                 stroke-dashoffset="0"/>
                          <circle cx="50" cy="50" r="40" fill="#2196f3"
                                 stroke="#fff" stroke-width="2" 
                                 stroke-dasharray="50.3 125.7" 
                                 stroke-dashoffset="-75.4"/>
                        </svg>
                        <span class="chart-label">Distribuição por Região</span>
                      </div>

                      <!-- KPI -->
                      <div *ngSwitchCase="'kpi'" class="kpi-preview">
                        <div class="kpi-value">R$ 2.4M</div>
                        <div class="kpi-label">Receita Total</div>
                        <div class="kpi-trend positive">
                          <mat-icon>trending_up</mat-icon>
                          +15.2%
                        </div>
                      </div>

                      <!-- Tabela -->
                      <div *ngSwitchCase="'tabela'" class="table-preview">
                        <div class="table-header">
                          <span>Produto</span>
                          <span>Volume</span>
                          <span>Receita</span>
                        </div>
                        <div class="table-row">
                          <span>Soja</span>
                          <span>1,200t</span>
                          <span>R$ 840K</span>
                        </div>
                        <div class="table-row">
                          <span>Milho</span>
                          <span>850t</span>
                          <span>R$ 520K</span>
                        </div>
                        <div class="table-row">
                          <span>Café</span>
                          <span>300t</span>
                          <span>R$ 1.2M</span>
                        </div>
                      </div>

                      <!-- Mapa -->
                      <div *ngSwitchCase="'mapa'" class="map-preview">
                        <div class="map-placeholder">
                          <mat-icon>map</mat-icon>
                          <span>Mapa Geográfico</span>
                          <div class="map-points">
                            <div class="point brazil"></div>
                            <div class="point china"></div>
                            <div class="point usa"></div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </mat-card>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-creator-container {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: #fff;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(25, 118, 210, 0.3);
      text-align: left;
      margin-bottom: 32px;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #fff;
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .page-header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.2rem;
    }

    .creator-layout {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 24px;
      max-width: 1800px;
      margin: 0 auto;
      height: calc(100vh - 200px);
    }

    .sidebar {
      height: fit-content;
      max-height: 100%;
      overflow-y: auto;
      border-radius: 16px;
    }

    .config-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .config-section {
      padding: 16px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .config-section:last-child {
      border-bottom: none;
    }

    .config-section h3 {
      margin: 0 0 16px 0;
      color: #673ab7;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .widgets-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .widget-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px;
      border: 2px dashed #ddd;
      border-radius: 8px;
      cursor: grab;
      transition: all 0.3s ease;
      text-align: center;
      font-size: 0.8rem;
    }

    .widget-item:hover {
      border-color: #673ab7;
      background: #f3e5f5;
    }

    .widget-item.cdk-drag-placeholder {
      opacity: 0.5;
    }

    .fonte-dados-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fonte-checkbox {
      width: 100%;
    }

    .fonte-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-left: 8px;
    }

    .fonte-info span {
      font-weight: 500;
    }

    .fonte-chips {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .dashboard-preview {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .preview-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: white;
      border-radius: 16px 16px 0 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .toolbar-info h2 {
      margin: 0;
      color: #333;
      font-size: 1.3rem;
    }

    .toolbar-info span {
      color: #666;
      font-size: 0.9rem;
    }

    .toolbar-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .dashboard-canvas {
      flex: 1;
      border-radius: 0 0 16px 16px;
      margin: 0;
      overflow: hidden;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 400px;
      text-align: center;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 4rem !important;
      width: 4rem !important;
      height: 4rem !important;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .quick-templates {
      margin-top: 24px;
    }

    .quick-templates h4 {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .template-chip {
      margin: 4px !important;
      cursor: pointer;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-gap: 16px;
      padding: 24px;
      min-height: 400px;
    }

    .widget-container {
      position: relative;
    }

    .dashboard-widget {
      height: 100%;
      border-radius: 12px;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .dashboard-widget:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .widget-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #333;
    }

    .widget-actions {
      display: flex;
      gap: 4px;
    }

    .widget-content {
      padding: 16px;
      height: calc(100% - 60px);
    }

    .widget-preview {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    /* Chart Previews */
    .chart-preview {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .line-chart {
      width: 80%;
      height: 60%;
      margin-bottom: 12px;
    }

    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 60%;
      margin-bottom: 12px;
    }

    .bar {
      width: 20px;
      background: #2196f3;
      border-radius: 2px 2px 0 0;
      transition: height 0.3s ease;
    }

    .pie-chart {
      width: 80px;
      height: 80px;
      margin-bottom: 12px;
    }

    .chart-label {
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }

    .kpi-preview {
      text-align: center;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      color: #2196f3;
      margin-bottom: 8px;
    }

    .kpi-label {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 8px;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .kpi-trend.positive {
      color: #4caf50;
    }

    .table-preview {
      width: 100%;
      font-size: 0.8rem;
    }

    .table-header,
    .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      padding: 8px 0;
    }

    .table-header {
      font-weight: 600;
      border-bottom: 1px solid #e0e0e0;
      color: #666;
    }

    .table-row {
      border-bottom: 1px solid #f0f0f0;
    }

    .map-preview {
      width: 100%;
      height: 100%;
      position: relative;
      background: #e3f2fd;
      border-radius: 8px;
    }

    .map-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #1976d2;
    }

    .map-placeholder mat-icon {
      font-size: 2rem !important;
      width: 2rem !important;
      height: 2rem !important;
    }

    .map-points {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .point {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f44336;
    }

    .point.brazil { top: 60%; left: 30%; }
    .point.china { top: 30%; right: 20%; }
    .point.usa { top: 25%; left: 25%; }

    /* Widget Types */
    .widget-grafico-linha { border-left: 4px solid #2196f3; }
    .widget-grafico-barra { border-left: 4px solid #4caf50; }
    .widget-grafico-pizza { border-left: 4px solid #ff9800; }
    .widget-kpi { border-left: 4px solid #9c27b0; }
    .widget-tabela { border-left: 4px solid #607d8b; }
    .widget-mapa { border-left: 4px solid #e91e63; }

    /* Responsive */
    @media (max-width: 1200px) {
      .creator-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }

      .sidebar {
        max-height: 400px;
      }

      .dashboard-grid {
        grid-template-columns: repeat(6, 1fr);
      }
    }

    @media (max-width: 768px) {
      .dashboard-creator-container {
        padding: 16px;
      }

      .preview-toolbar {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .toolbar-actions {
        justify-content: center;
        flex-wrap: wrap;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
        padding: 16px;
      }

      .widgets-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardsCriarComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  dashboardForm!: FormGroup;
  widgetsSelecionados: DashboardWidget[] = [];
  fontesSelecionadas: string[] = [];
  isFullscreen = false;

  widgetsDisponiveis: DashboardWidget[] = [
    {
      id: 'grafico-linha',
      tipo: 'grafico-linha',
      titulo: 'Gráfico Linha',
      fontesDados: [],
      configuracao: {},
      posicao: { x: 0, y: 0, w: 6, h: 4 },
      cor: '#2196f3',
      icone: 'show_chart'
    },
    {
      id: 'grafico-barra',
      tipo: 'grafico-barra',
      titulo: 'Gráfico Barra',
      fontesDados: [],
      configuracao: {},
      posicao: { x: 0, y: 0, w: 6, h: 4 },
      cor: '#4caf50',
      icone: 'bar_chart'
    },
    {
      id: 'grafico-pizza',
      tipo: 'grafico-pizza',
      titulo: 'Gráfico Pizza',
      fontesDados: [],
      configuracao: {},
      posicao: { x: 0, y: 0, w: 4, h: 4 },
      cor: '#ff9800',
      icone: 'donut_large'
    },
    {
      id: 'kpi',
      tipo: 'kpi',
      titulo: 'Indicador KPI',
      fontesDados: [],
      configuracao: {},
      posicao: { x: 0, y: 0, w: 3, h: 2 },
      cor: '#9c27b0',
      icone: 'speed'
    },
    {
      id: 'tabela',
      tipo: 'tabela',
      titulo: 'Tabela',
      fontesDados: [],
      configuracao: {},
      posicao: { x: 0, y: 0, w: 8, h: 4 },
      cor: '#607d8b',
      icone: 'table_chart'
    },
    {
      id: 'mapa',
      tipo: 'mapa',
      titulo: 'Mapa Geográfico',
      fontesDados: [],
      configuracao: {},
      posicao: { x: 0, y: 0, w: 6, h: 6 },
      cor: '#e91e63',
      icone: 'map'
    }
  ];

  fontesDisponiveis: FonteDados[] = [
    {
      id: 'exportacoes',
      nome: 'Exportações',
      categoria: 'exportacoes',
      campos: ['Volume', 'Valor', 'Destino', 'Produto', 'Data'],
      icone: 'flight_takeoff'
    },
    {
      id: 'financeiro',
      nome: 'Financeiro',
      categoria: 'financeiro',
      campos: ['Receita', 'Custo', 'Lucro', 'Margem', 'ROI'],
      icone: 'account_balance'
    },
    {
      id: 'logistica',
      nome: 'Logística',
      categoria: 'logistica',
      campos: ['Embarques', 'Prazo', 'Frete', 'Porto', 'Status'],
      icone: 'local_shipping'
    },
    {
      id: 'rentabilidade',
      nome: 'Rentabilidade',
      categoria: 'rentabilidade',
      campos: ['Score', 'Margem', 'Risco', 'Tendência'],
      icone: 'analytics'
    }
  ];

  templatesRapidos = [
    { nome: 'Export Overview', icone: 'dashboard', widgets: ['kpi', 'grafico-linha', 'tabela'] },
    { nome: 'Financial Dashboard', icone: 'attach_money', widgets: ['kpi', 'grafico-barra', 'grafico-pizza'] },
    { nome: 'Logistics Control', icone: 'local_shipping', widgets: ['mapa', 'tabela', 'kpi'] },
    { nome: 'Analytics Pro', icone: 'analytics', widgets: ['grafico-linha', 'grafico-barra', 'grafico-pizza', 'kpi'] }
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.dashboardForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: [''],
      tipoLayout: ['grid', Validators.required]
    });
  }

  onWidgetDrop(event: CdkDragDrop<DashboardWidget[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const widget = { ...event.previousContainer.data[event.previousIndex] };
      widget.id = this.generateId();
      this.adicionarWidget(widget);
    }
  }

  onDashboardDrop(event: CdkDragDrop<DashboardWidget[]>): void {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }

  adicionarWidget(widget: DashboardWidget): void {
    // Auto-posicionar widget
    const position = this.calculateNextPosition();
    widget.posicao = position;
    
    this.widgetsSelecionados.push(widget);
    this.notificationService.showInfo(`Widget ${widget.titulo} adicionado`);
  }

  removerWidget(index: number): void {
    const widget = this.widgetsSelecionados[index];
    this.widgetsSelecionados.splice(index, 1);
    this.notificationService.showInfo(`Widget ${widget.titulo} removido`);
  }

  configurarWidget(widget: DashboardWidget): void {
    this.notificationService.showInfo(`Configurando widget ${widget.titulo}`);
    // Implementar dialog de configuração
  }

  toggleFonteDados(fonteId: string, selected: boolean): void {
    if (selected) {
      this.fontesSelecionadas.push(fonteId);
    } else {
      this.fontesSelecionadas = this.fontesSelecionadas.filter(id => id !== fonteId);
    }
  }

  aplicarTemplate(template: any): void {
    this.widgetsSelecionados = [];
    
    template.widgets.forEach((tipo: string, index: number) => {
      const baseWidget = this.widgetsDisponiveis.find(w => w.tipo === tipo);
      if (baseWidget) {
        const widget = { ...baseWidget };
        widget.id = this.generateId();
        widget.posicao = this.calculatePosition(index, template.widgets.length);
        this.widgetsSelecionados.push(widget);
      }
    });

    this.dashboardForm.patchValue({
      nome: template.nome,
      descricao: `Dashboard baseado no template ${template.nome}`
    });

    this.notificationService.showSuccess(`Template ${template.nome} aplicado!`);
  }

  getGridArea(widget: DashboardWidget): string {
    const { x, y, w, h } = widget.posicao;
    return `${y + 1} / ${x + 1} / ${y + h + 1} / ${x + w + 1}`;
  }

  private calculateNextPosition(): { x: number; y: number; w: number; h: number } {
    // Lógica simples para posicionamento automático
    const cols = 12;
    let row = 0;
    let col = 0;

    for (const widget of this.widgetsSelecionados) {
      const endCol = widget.posicao.x + widget.posicao.w;
      const endRow = widget.posicao.y + widget.posicao.h;
      
      if (endRow > row || (endRow === row && endCol > col)) {
        row = endRow;
        col = endCol % cols;
      }
    }

    return { x: col, y: row, w: 4, h: 3 };
  }

  private calculatePosition(index: number, total: number): { x: number; y: number; w: number; h: number } {
    const cols = 12;
    const itemsPerRow = Math.ceil(Math.sqrt(total));
    const itemWidth = Math.floor(cols / itemsPerRow);
    
    const row = Math.floor(index / itemsPerRow);
    const col = (index % itemsPerRow) * itemWidth;
    
    return { x: col, y: row * 4, w: itemWidth, h: 3 };
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    // Implementar lógica de tela cheia
  }

  resetDashboard(): void {
    if (confirm('Tem certeza que deseja resetar o dashboard? Todas as alterações serão perdidas.')) {
      this.widgetsSelecionados = [];
      this.fontesSelecionadas = [];
      this.dashboardForm.reset();
      this.notificationService.showInfo('Dashboard resetado');
    }
  }

  previewDashboard(): void {
    this.notificationService.showInfo('Abrindo preview do dashboard...');
    // Implementar preview em nova janela/modal
  }

  salvarDashboard(): void {
    if (this.dashboardForm.valid && this.widgetsSelecionados.length > 0) {
      const dashboard = {
        ...this.dashboardForm.value,
        widgets: this.widgetsSelecionados,
        fontesDados: this.fontesSelecionadas,
        criadoEm: new Date()
      };

      this.notificationService.showLoading({
        title: 'Salvando...',
        message: 'Salvando seu dashboard personalizado'
      });

      setTimeout(() => {
        this.notificationService.hideLoading();
        this.notificationService.showSuccess('Dashboard salvo com sucesso!');
        console.log('Dashboard salvo:', dashboard);
      }, 2000);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}