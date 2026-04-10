import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ContractTemplatesMockService } from '../../../../services/contractTemplatesMockService';
import { 
  ContractTemplate, 
  TemplateFilters, 
  TemplateFilterOptions,
  CONTRACT_TYPE_LABELS,
  COMMODITY_LABELS,
  CURRENCY_LABELS,
  INCOTERM_LABELS,
  ORGANIZATION_STANDARD_LABELS
} from '../../../../types/contractTemplates';

@Component({
  selector: 'app-templates',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatTabsModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="templates-container" style="padding: 24px; background: linear-gradient(135deg, #e8f4fd 0%, #c3dafe 100%); min-height: 100vh;">
      
      <!-- Header -->
      <div class="header-section" style="margin-bottom: 24px;">
        <h1 style="display: flex; align-items: center; gap: 12px; color: #1565c0; margin: 0;">
          <mat-icon style="font-size: 32px; color: #2196f3;">content_copy</mat-icon>
          Templates de Contratos
        </h1>
        <p style="color: #666; margin: 8px 0 0 0;">Gestão de modelos reutilizáveis de contratos EIP</p>
      </div>

      <!-- KPIs -->
      <div class="kpis-section" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
        
        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #e3f2fd; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #2196f3; font-size: 24px;">library_books</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Templates Totais</div>
                <div style="font-size: 28px; font-weight: bold; color: #2196f3;">{{totalTemplates}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #e8f5e8; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #4caf50; font-size: 24px;">check_circle</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Templates Ativos</div>
                <div style="font-size: 28px; font-weight: bold; color: #4caf50;">{{activeTemplates}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #fff3e0; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #ff9800; font-size: 24px;">psychology</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Com IA Habilitada</div>
                <div style="font-size: 28px; font-weight: bold; color: #ff9800;">{{templatesComIA}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #f3e5f5; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #9c27b0; font-size: 24px;">public</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Commodities</div>
                <div style="font-size: 28px; font-weight: bold; color: #9c27b0;">{{uniqueCommodities}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- Filtros -->
      <mat-card *ngIf="filterOptions" style="margin-bottom: 24px;">
        <mat-card-header>
          <mat-card-title style="display: flex; align-items: center; gap: 8px; color: #2196f3;">
            <mat-icon>filter_list</mat-icon>
            Filtros para Templates
          </mat-card-title>
          <mat-card-subtitle>Refine sua busca nos templates de contratos</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtroForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px;">
            
            <!-- Busca geral -->
            <mat-form-field appearance="outline">
              <mat-label>Busca geral</mat-label>
              <input matInput formControlName="search" placeholder="Nome, código ou descrição">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <!-- Tipo de contrato -->
            <mat-form-field appearance="outline">
              <mat-label>Tipo de Contrato</mat-label>
              <mat-select formControlName="contract_type" multiple>
                <mat-option value="Export">Exportação</mat-option>
                <mat-option value="Import">Importação</mat-option>
                <mat-option value="Domestic">Doméstico</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Commodity -->
            <mat-form-field appearance="outline">
              <mat-label>Commodity</mat-label>
              <mat-select formControlName="commodity" multiple>
                <mat-option *ngFor="let commodity of filterOptions.commodities" [value]="commodity.value">
                  {{commodity.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Moeda -->
            <mat-form-field appearance="outline">
              <mat-label>Moeda</mat-label>
              <mat-select formControlName="currency" multiple>
                <mat-option *ngFor="let currency of filterOptions.currencies" [value]="currency.code">
                  {{currency.name}} ({{currency.symbol}})
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Status -->
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="active">
                <mat-option [value]="null">Todos</mat-option>
                <mat-option [value]="true">Ativos</mat-option>
                <mat-option [value]="false">Inativos</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Botões de filtro -->
            <div style="display: flex; gap: 8px; align-items: end;">
              <button mat-raised-button color="primary" (click)="applyFilters()" [disabled]="isLoading">
                <mat-icon>search</mat-icon>
                Filtrar
              </button>
              <button mat-button (click)="clearFilters()" [disabled]="isLoading">
                <mat-icon>clear</mat-icon>
                Limpar
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="isLoading" style="display: flex; flex-direction: column; align-items: center; padding: 40px;">
        <mat-progress-spinner mode="indeterminate" diameter="50" color="accent"></mat-progress-spinner>
        <p style="margin-top: 16px; color: #666;">Carregando templates...</p>
      </div>

      <!-- Lista de Templates -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <mat-icon style="color: #2196f3;">content_copy</mat-icon>
              <span>Templates de Contratos</span>
              <mat-chip-listbox>
                <mat-chip style="background: #2196f3; color: white;">{{totalTemplates}} templates</mat-chip>
              </mat-chip-listbox>
            </div>
            <div style="display: flex; gap: 12px;">
              <button mat-raised-button 
                      color="primary" 
                      id="btn-novo-template"
                      data-testid="novo-template-btn"
                      (click)="createTemplate()">
                <mat-icon>add</mat-icon>
                Novo Template
              </button>
              <button mat-button
                      (click)="importTemplate()"
                      matTooltip="Importar template de arquivo">
                <mat-icon>upload</mat-icon>
                Importar
              </button>
            </div>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          
          <!-- Grid de templates -->
          <div style="display: grid; gap: 20px; margin-top: 20px;">
            
            <div *ngFor="let template of templates" 
                 class="template-card"
                 style="padding: 24px; border: 2px solid #e3f2fd; border-radius: 16px; background: linear-gradient(135deg, #f8fdff 0%, #f0f8ff 100%); transition: all 0.3s ease;">
              
              <!-- Header do template -->
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; margin-bottom: 20px;">
                
                <!-- Info principal -->
                <div>
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 20px; color: #1565c0;">{{template.template_name}}</h3>
                    <mat-chip [style.background]="template.active ? '#4caf50' : '#f44336'" 
                             style="color: white; font-weight: bold;">
                      <mat-icon style="margin-right: 4px; font-size: 16px;">
                        {{template.active ? 'check_circle' : 'cancel'}}
                      </mat-icon>
                      {{template.active ? 'ATIVO' : 'INATIVO'}}
                    </mat-chip>
                    
                    <!-- Badge de IA -->
                    <mat-chip *ngIf="template.ai_config.ai_enabled" 
                             style="background: #ff9800; color: white; font-size: 12px;">
                      <mat-icon style="margin-right: 4px; font-size: 14px;">psychology</mat-icon>
                      IA Habilitada
                    </mat-chip>
                    
                    <!-- Badge de compliance -->
                    <mat-chip *ngIf="template.organization_standard" 
                             style="background: #9c27b0; color: white; font-size: 12px;">
                      <mat-icon style="margin-right: 4px; font-size: 14px;">verified</mat-icon>
                      {{getOrgStandardLabel(template.organization_standard)}}
                    </mat-chip>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; color: #555; font-size: 14px;">
                    <div><strong>Código:</strong> {{template.template_code}}</div>
                    <div><strong>Versão:</strong> {{template.version}}</div>
                    <div><strong>Commodity:</strong> {{getCommodityLabel(template.commodity)}}</div>
                    <div><strong>Tipo:</strong> {{getContractTypeLabel(template.contract_type)}}</div>
                  </div>
                  <div style="margin-top: 8px; color: #666; font-size: 13px;">
                    {{template.description}}
                  </div>
                </div>

                <!-- Menu de ações -->
                <div style="display: flex; gap: 8px;">
                  <button mat-fab 
                          color="primary" 
                          (click)="editTemplate(template)"
                          matTooltip="Editar template"
                          style="transform: scale(0.8);">
                    <mat-icon>edit</mat-icon>
                  </button>
                  
                  <button mat-icon-button 
                          [matMenuTriggerFor]="templateMenu"
                          matTooltip="Mais ações"
                          style="color: #666;">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #templateMenu="matMenu">
                    <button mat-menu-item (click)="viewTemplate(template)">
                      <mat-icon>visibility</mat-icon>
                      Ver Detalhes
                    </button>
                    <button mat-menu-item (click)="duplicateTemplate(template)">
                      <mat-icon>content_copy</mat-icon>
                      Duplicar
                    </button>
                    <button mat-menu-item (click)="createVersion(template)">
                      <mat-icon>update</mat-icon>
                      Nova Versão
                    </button>
                    <button mat-menu-item (click)="generateContract(template)">
                      <mat-icon>description</mat-icon>
                      Gerar Contrato
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="validateTemplate(template)">
                      <mat-icon>check_circle</mat-icon>
                      Validar Template
                    </button>
                    <button mat-menu-item (click)="analyzeRisk(template)">
                      <mat-icon>warning</mat-icon>
                      Analisar Riscos
                    </button>
                    <button mat-menu-item (click)="checkCompliance(template)">
                      <mat-icon>verified</mat-icon>
                      Verificar Compliance
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item [matMenuTriggerFor]="exportMenu">
                      <mat-icon>download</mat-icon>
                      Exportar
                    </button>
                    <button mat-menu-item (click)="toggleActive(template)" 
                            [style.color]="template.active ? '#f44336' : '#4caf50'">
                      <mat-icon>{{template.active ? 'toggle_off' : 'toggle_on'}}</mat-icon>
                      {{template.active ? 'Desativar' : 'Ativar'}}
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="deleteTemplate(template)" style="color: #f44336;">
                      <mat-icon>delete</mat-icon>
                      Excluir
                    </button>
                  </mat-menu>
                  
                  <!-- Submenu de exportação -->
                  <mat-menu #exportMenu="matMenu">
                    <button mat-menu-item (click)="exportTemplate(template, 'JSON')">
                      <mat-icon>code</mat-icon>
                      JSON
                    </button>
                    <button mat-menu-item (click)="exportTemplate(template, 'PDF')">
                      <mat-icon>picture_as_pdf</mat-icon>
                      PDF
                    </button>
                    <button mat-menu-item (click)="exportTemplate(template, 'DOCX')">
                      <mat-icon>description</mat-icon>
                      DOCX
                    </button>
                  </mat-menu>
                </div>
              </div>

              <!-- Detalhes comerciais -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                
                <div class="detail-item" style="background: white; padding: 16px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Incoterm</div>
                  <div style="font-weight: bold; font-size: 16px; color: #2196f3;">
                    {{getIncotermLabel(template.incoterm)}}
                  </div>
                  <div style="font-size: 11px; color: #999;">{{template.incoterm_version}}</div>
                </div>

                <div class="detail-item" style="background: white; padding: 16px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Moeda/Preço</div>
                  <div style="font-weight: bold; font-size: 16px; color: #4caf50;">
                    {{getCurrencyLabel(template.currency)}}
                  </div>
                  <div style="font-size: 11px; color: #999;">{{template.price_unit}}</div>
                </div>

                <div class="detail-item" style="background: white; padding: 16px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Quantidade</div>
                  <div style="font-weight: bold; font-size: 14px;">
                    {{formatNumber(template.quantity_min)}} - {{formatNumber(template.quantity_max)}} {{template.quantity_unit}}
                  </div>
                  <div style="font-size: 11px; color: #999;" *ngIf="template.tolerance_percent">
                    ±{{template.tolerance_percent}}%
                  </div>
                </div>

                <div class="detail-item" style="background: white; padding: 16px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Pagamento</div>
                  <div style="font-weight: bold; font-size: 14px;">{{template.payment_terms}}</div>
                  <div style="font-size: 11px; color: #999;" *ngIf="template.payment_days">
                    {{template.payment_days}} dias
                  </div>
                </div>
              </div>

              <!-- Footer com origem/destino -->
              <div style="background: white; padding: 16px; border-radius: 12px; border-left: 4px solid #2196f3;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <mat-icon style="font-size: 16px; color: #2196f3;">flight_takeoff</mat-icon>
                  <span style="font-weight: bold; color: #2196f3; font-size: 13px;">LOGÍSTICA</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; font-size: 13px;">
                  <div style="text-align: left;">
                    <div style="font-weight: bold;">{{template.port_origin}}</div>
                    <div style="color: #666;">Origem</div>
                  </div>
                  <mat-icon style="color: #2196f3;">arrow_forward</mat-icon>
                  <div style="text-align: right;">
                    <div style="font-weight: bold;">{{template.port_destination}}</div>
                    <div style="color: #666;">Destino</div>
                  </div>
                </div>
                <div style="text-align: center; margin-top: 8px; font-size: 12px; color: #666;">
                  {{template.shipment_type}} | 
                  Parciais: {{template.partial_shipment_allowed ? 'Permitido' : 'Não permitido'}} |
                  Transbordo: {{template.transshipment_allowed ? 'Permitido' : 'Não permitido'}}
                </div>
              </div>

            </div>
          </div>

          <!-- Estado vazio -->
          <div *ngIf="templates.length === 0" 
               style="text-align: center; padding: 60px 20px; color: #666;">
            <mat-icon style="font-size: 64px; color: #ccc; margin-bottom: 16px;">content_copy</mat-icon>
            <h3 style="margin: 0 0 8px 0; color: #999;">Nenhum template encontrado</h3>
            <p style="margin: 0 0 16px 0;">Crie seu primeiro template ou ajuste os filtros.</p>
            <button mat-raised-button color="primary" (click)="createTemplate()">
              <mat-icon>add</mat-icon>
              Criar Primeiro Template
            </button>
          </div>

        </mat-card-content>
      </mat-card>

      <!-- 🌟 FORMULÁRIO INLINE DAS 6 ABAS - SOLUÇÃO DEFINITIVA 🔥 -->
      <mat-card *ngIf="showTemplateForm" id="template-form-container" style="margin-top: 24px; padding: 0;">
        <mat-card-header style="background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; padding: 16px;">
          <mat-card-title style="color: white; display: flex; align-items: center; gap: 8px;">
            <mat-icon>{{ editingTemplate ? 'edit' : 'add' }}</mat-icon>
            {{ editingTemplate ? '✏️ Editar Template' : '🆕 Criar Novo Template' }}
          </mat-card-title>
          <mat-card-subtitle style="color: rgba(255,255,255,0.8);">
            Complete as 6 abas com todas as informações do template
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content style="padding: 0;">
          <form [formGroup]="templateForm" style="width: 100%;">
            <mat-tab-group [(selectedIndex)]="selectedTabIndex" style="background: white;" animationDuration="300ms">
              
              <!-- 🏷️ ABA 1: GERAL -->
              <mat-tab label="🏷️ Geral">
                <div style="padding: 24px;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Nome do Template</mat-label>
                      <input matInput formControlName="template_name" placeholder="Ex: Template Soja Exportação">
                      <mat-icon matSuffix>label</mat-icon>
                      <mat-error *ngIf="getFieldError('template_name')">{{getFieldError('template_name')}}</mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Descrição</mat-label>
                      <textarea matInput formControlName="description" placeholder="Descreva este template..." rows="3"></textarea>
                      <mat-icon matSuffix>description</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Tipo de Contrato</mat-label>
                      <mat-select formControlName="contract_type">
                        <mat-option value="export">🌍 Exportação</mat-option>
                        <mat-option value="import">📥 Importação</mat-option>
                        <mat-option value="domestic">🏠 Doméstico</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Versão</mat-label>
                      <input matInput formControlName="version" placeholder="1.0">
                      <mat-icon matSuffix>tag</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Padrão de Organização</mat-label>
                      <mat-select formControlName="organization_standard">
                        <mat-option value="GAFTA">GAFTA</mat-option>
                        <mat-option value="FOSFA">FOSFA</mat-option>
                        <mat-option value="ANEC">ANEC</mat-option>
                        <mat-option value="ICC">ICC</mat-option>
                        <mat-option value="CUSTOM">Customizado</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div style="display: flex; align-items: center; gap: 12px;">
                      <mat-slide-toggle formControlName="active" color="primary">
                        Template Ativo
                      </mat-slide-toggle>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- 💼 ABA 2: COMERCIAL -->
              <mat-tab label="💼 Comercial">
                <div style="padding: 24px;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Commodity</mat-label>
                      <mat-select formControlName="commodity">
                        <mat-option value="SOJA">🌱 Soja</mat-option>
                        <mat-option value="MILHO">🌽 Milho</mat-option>
                        <mat-option value="TRIGO">🌾 Trigo</mat-option>
                        <mat-option value="CAFE">☕ Café</mat-option>
                        <mat-option value="ACUCAR">🍯 Açúcar</mat-option>
                        <mat-option value="ALGODAO">🪴 Algodão</mat-option>
                        <mat-option value="ARROZ">🍚 Arroz</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Moeda</mat-label>
                      <mat-select formControlName="currency">
                        <mat-option value="USD">🇺🇸 USD - Dólar Americano</mat-option>
                        <mat-option value="EUR">🇪🇺 EUR - Euro</mat-option>
                        <mat-option value="BRL">🇧🇷 BRL - Real Brasileiro</mat-option>
                        <mat-option value="CNY">🇨🇳 CNY - Yuan Chinês</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Quantidade Mínima (MT)</mat-label>
                      <input matInput type="number" formControlName="quantity_min" placeholder="5000">
                      <mat-icon matSuffix>scale</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Quantidade Máxima (MT)</mat-label>
                      <input matInput type="number" formControlName="quantity_max" placeholder="10000">
                      <mat-icon matSuffix>scale</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Preço Padrão</mat-label>
                      <input matInput type="number" formControlName="default_price" placeholder="450.00" step="0.01">
                      <mat-icon matSuffix>attach_money</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Incoterm</mat-label>
                      <mat-select formControlName="incoterm">
                        <mat-option value="FOB">FOB - Free on Board</mat-option>
                        <mat-option value="CIF">CIF - Cost, Insurance & Freight</mat-option>
                        <mat-option value="CFR">CFR - Cost and Freight</mat-option>
                        <mat-option value="EXW">EXW - Ex Works</mat-option>
                        <mat-option value="FCA">FCA - Free Carrier</mat-option>
                        <mat-option value="DAF">DAF - Delivered At Frontier</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>

              <!-- 💰 ABA 3: FINANCEIRO -->
              <mat-tab label="💰 Financeiro">
                <div style="padding: 24px;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Termos de Pagamento</mat-label>
                      <mat-select formControlName="payment_terms">
                        <mat-option value="LC_SIGHT">LC à Vista</mat-option>
                        <mat-option value="LC_90_DAYS">LC 90 Dias</mat-option>
                        <mat-option value="LC_180_DAYS">LC 180 Dias</mat-option>
                        <mat-option value="CASH_AGAINST_DOCS">CAD - Cash Against Documents</mat-option>
                        <mat-option value="TT_ADVANCE">TT Antecipado</mat-option>
                        <mat-option value="TT_SHIPMENT">TT no Embarque</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Prazo de Pagamento (dias)</mat-label>
                      <input matInput type="number" formControlName="payment_days" placeholder="30">
                      <mat-icon matSuffix>calendar_today</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Tipo de Preço</mat-label>
                      <mat-select formControlName="price_type">
                        <mat-option value="FIXED">Preço Fixo</mat-option>
                        <mat-option value="TO_BE_FIXED">A Fixar</mat-option>
                        <mat-option value="FORMULA">Fórmula de Preço</mat-option>
                        <mat-option value="SPOT">Preço Spot</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
              </mat-tab>

              <!-- 🚛 ABA 4: LOGÍSTICA -->
              <mat-tab label="🚛 Logística">
                <div style="padding: 24px;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Porto de Origem</mat-label>
                      <input matInput formControlName="port_origin" placeholder="Santos, Brasil">
                      <mat-icon matSuffix>departure_board</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Porto de Destino</mat-label>
                      <input matInput formControlName="port_destination" placeholder="Xangai, China">
                      <mat-icon matSuffix>flight_land</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Período Embarque - Início (dias)</mat-label>
                      <input matInput type="number" formControlName="shipment_period_start" placeholder="30">
                      <mat-icon matSuffix>today</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Período Embarque - Fim (dias)</mat-label>
                      <input matInput type="number" formControlName="shipment_period_end" placeholder="60">
                      <mat-icon matSuffix>event</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Tipo de Embarque</mat-label>
                      <mat-select formControlName="shipment_type">
                        <mat-option value="MARITIME">🚢 Marítimo</mat-option>
                        <mat-option value="RAIL">🚂 Ferroviário</mat-option>
                        <mat-option value="TRUCK">🚛 Rodoviário</mat-option>
                        <mat-option value="MULTIMODAL">🔄 Multimodal</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div style="grid-column: span 2;">
                      <div style="display: flex; gap: 20px;">
                        <mat-slide-toggle formControlName="partial_shipment_allowed" color="primary">
                          Embarque Parcial Permitido
                        </mat-slide-toggle>
                        
                        <mat-slide-toggle formControlName="transshipment_allowed" color="primary">
                          Transbordo Permitido
                        </mat-slide-toggle>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- 📜 ABA 5: CLÁUSULAS -->
              <mat-tab label="📜 Cláusulas">
                <div style="padding: 24px;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Cláusula de Arbitragem</mat-label>
                      <mat-select formControlName="arbitration_clause">
                        <mat-option value="LONDON">🇬🇧 Londres</mat-option>
                        <mat-option value="PARIS">🇫🇷 Paris</mat-option>
                        <mat-option value="SAO_PAULO">🇧🇷 São Paulo</mat-option>
                        <mat-option value="SINGAPORE">🇸🇬 Singapura</mat-option>
                        <mat-option value="NEW_YORK">🇺🇸 Nova York</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <div style="grid-column: span 2;">
                      <h4 style="margin: 0 0 16px 0; color: #1976d2;">📋 Cláusulas Específicas</h4>
                      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                        <p style="margin: 0; color: #666;">
                          As cláusulas específicas serão definidas durante a criação/edição do contrato baseado neste template.
                          Este template define apenas os termos padrão e estrutura base.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- 🤖 ABA 6: IA -->
              <mat-tab label="🤖 IA">
                <div style="padding: 24px;">
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    
                    <div style="grid-column: span 2;">
                      <h4 style="margin: 0 0 16px 0; color: #1976d2; display: flex; align-items: center; gap: 8px;">
                        <mat-icon>smart_toy</mat-icon>
                        Configurações de IA
                      </h4>
                    </div>

                    <mat-slide-toggle formControlName="ai_enabled" color="primary">
                      <div style="margin-left: 8px;">
                        <strong>IA Habilitada</strong>
                        <br><small style="color: #666;">Ativar assistência de IA para este template</small>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="ai_auto_fill" color="primary">
                      <div style="margin-left: 8px;">
                        <strong>Preenchimento Automático</strong>
                        <br><small style="color: #666;">IA sugere preenchimento de campos</small>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="ai_risk_analysis" color="primary">
                      <div style="margin-left: 8px;">
                        <strong>Análise de Risco</strong>
                        <br><small style="color: #666;">IA analisa riscos do contrato</small>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="ai_suggest_incoterm" color="primary">
                      <div style="margin-left: 8px;">
                        <strong>Sugestão de Incoterm</strong>
                        <br><small style="color: #666;">IA sugere melhor Incoterm</small>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="ai_generate_contract_text" color="primary">
                      <div style="margin-left: 8px;">
                        <strong>Gerar Texto do Contrato</strong>
                        <br><small style="color: #666;">IA gera texto completo do contrato</small>
                      </div>
                    </mat-slide-toggle>

                    <mat-slide-toggle formControlName="ai_compliance_check" color="primary">
                      <div style="margin-left: 8px;">
                        <strong>Verificação de Compliance</strong>
                        <br><small style="color: #666;">IA verifica conformidade regulatória</small>
                      </div>
                    </mat-slide-toggle>
                  </div>
                </div>
              </mat-tab>

            </mat-tab-group>
          </form>
        </mat-card-content>

        <mat-card-actions style="padding: 16px; background: #f8f9fa; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between;">
          <button mat-stroked-button (click)="cancelTemplateForm()" [disabled]="isSaving">
            <mat-icon>close</mat-icon>
            Cancelar
          </button>

          <div style="display: flex; gap: 12px;">
            <button mat-stroked-button 
                    *ngIf="selectedTabIndex > 0" 
                    (click)="selectedTabIndex = selectedTabIndex - 1">
              <mat-icon>navigate_before</mat-icon>
              Anterior
            </button>

            <button mat-stroked-button 
                    *ngIf="selectedTabIndex < 5" 
                    (click)="selectedTabIndex = selectedTabIndex + 1">
              Próxima
              <mat-icon>navigate_next</mat-icon>
            </button>

            <button mat-raised-button 
                    color="primary" 
                    (click)="saveTemplate()" 
                    [disabled]="isSaving || !templateForm.valid">
              <mat-icon>{{ editingTemplate ? 'save' : 'add' }}</mat-icon>
              {{ isSaving ? 'Salvando...' : (editingTemplate ? 'Atualizar Template' : 'Criar Template') }}
            </button>
          </div>
        </mat-card-actions>
      </mat-card>

    </div>
  `,
  styles: [`
    .templates-container {
      background: linear-gradient(135deg, #e8f4fd 0%, #c3dafe 100%);
      min-height: 100vh;
    }
    
    .template-card:hover {
      box-shadow: 0 8px 24px rgba(33, 150, 243, 0.2);
      transform: translateY(-2px);
      border-color: #2196f3;
    }
    
    .kpi-card {
      transition: transform 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    
    .detail-item {
      transition: transform 0.2s ease;
    }
    .detail-item:hover {
      transform: scale(1.05);
    }
  `]
})
export class TemplatesComponent implements OnInit {
  private readonly contractTemplatesService = inject(ContractTemplatesMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  public templates: ContractTemplate[] = [];
  public filterOptions: TemplateFilterOptions | null = null;
  public isLoading = false;
  
  // KPIs
  public totalTemplates = 0;
  public activeTemplates = 0;
  public templatesComIA = 0;
  public uniqueCommodities = 0;

  // Formulário inline das 6 abas - SOLUÇÃO DEFINITIVA
  public showTemplateForm = false;
  public editingTemplate: ContractTemplate | null = null;
  public selectedTabIndex = 0;
  public templateForm: FormGroup;
  public isSaving = false;

  public filtroForm: FormGroup;

  constructor() {
    console.log('🚀 TemplatesComponent inicializado!');
    
    this.filtroForm = this.fb.group({
      search: [''],
      contract_type: [[]],
      commodity: [[]],
      currency: [[]],
      active: [null]
    });

    // Inicializar formulário das 6 abas
    this.templateForm = this.fb.group({
      // Aba Geral
      template_name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      contract_type: ['export', [Validators.required]],
      version: ['1.0', [Validators.required]],
      organization_standard: ['GAFTA', [Validators.required]],
      active: [true],

      // Aba Comercial
      commodity: ['SOJA', [Validators.required]],
      quantity_min: [5000, [Validators.required, Validators.min(1)]],
      quantity_max: [10000, [Validators.required, Validators.min(1)]],
      default_price: [450, [Validators.required, Validators.min(0)]],
      incoterm: ['FOB', [Validators.required]],
      commodity_grade: [''],

      // Aba Financeiro
      currency: ['USD', [Validators.required]],
      payment_terms: ['LC_SIGHT', [Validators.required]],
      payment_days: [30],
      price_type: ['FIXED'],

      // Aba Logística
      port_origin: [''],
      port_destination: [''],
      shipment_period_start: [30],
      shipment_period_end: [60],
      shipment_type: ['MARITIME'],
      partial_shipment_allowed: [true],
      transshipment_allowed: [false],

      // Aba Cláusulas
      contract_text_template: [''],
      quality_specification: [''],
      force_majeure_clause: [''],
      arbitration_clause: ['LONDON'],

      // Aba IA
      ai_enabled: [true],
      ai_auto_fill: [false],
      ai_risk_analysis: [true],
      ai_suggest_incoterm: [true],
      ai_generate_contract_text: [false],
      ai_compliance_check: [true]
    });
  }

  ngOnInit(): void {
    console.log('📊 Carregando templates de contratos...');
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Carregar opções de filtro
    this.contractTemplatesService.getFilterOptions().subscribe({
      next: (options: TemplateFilterOptions) => {
        console.log('✅ Opções de filtro carregadas:', options);
        this.filterOptions = options;
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar opções de filtro:', error);
      }
    });

    // Carregar templates
    this.loadTemplates();
  }

  private loadTemplates(additionalFilters?: Partial<TemplateFilters>): void {
    this.isLoading = true;
    
    const filters: TemplateFilters = {
      ...additionalFilters
    };
    
    this.contractTemplatesService.getTemplates().subscribe({
      next: (templates: ContractTemplate[]) => {
        console.log('✅ Templates carregados:', templates);
        this.templates = this.applyTemplateFilters(templates, filters);
        this.calculateKPIs();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar templates:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar templates', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.totalTemplates = this.templates.length;
    this.activeTemplates = this.templates.filter(t => t.active).length;
    this.templatesComIA = this.templates.filter(t => t.ai_config.ai_enabled).length;
    this.uniqueCommodities = new Set(this.templates.map(t => t.commodity)).size;
  }

  private applyTemplateFilters(templates: ContractTemplate[], filters: Partial<TemplateFilters>): ContractTemplate[] {
    let filtered = [...templates];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.template_name.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        t.commodity.toLowerCase().includes(search)
      );
    }

    if (filters.contract_type?.length) {
      filtered = filtered.filter(t => filters.contract_type!.includes(t.contract_type));
    }

    if (filters.commodity?.length) {
      filtered = filtered.filter(t => filters.commodity!.includes(t.commodity));
    }

    if (filters.currency?.length) {
      filtered = filtered.filter(t => filters.currency!.includes(t.currency));
    }

    if (filters.active !== null && filters.active !== undefined) {
      filtered = filtered.filter(t => t.active === filters.active);
    }

    return filtered;
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;
    console.log('🔍 Aplicando filtros:', formValue);
    
    const filters: TemplateFilters = {
      search: formValue.search || undefined,
      contract_type: formValue.contract_type?.length ? formValue.contract_type : undefined,
      commodity: formValue.commodity?.length ? formValue.commodity : undefined,
      currency: formValue.currency?.length ? formValue.currency : undefined,
      active: formValue.active
    };

    console.log('🔍 Aplicando filtros para templates:', filters);
    this.loadTemplates(filters);
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      search: '',
      contract_type: [],
      commodity: [],
      currency: [],
      active: null
    });
    
    this.loadTemplates();
  }

  public createTemplate(): void {
    console.log('🆕✨ CRIANDO TEMPLATE - FORMULÁRIO INLINE DAS 6 ABAS!');
    
    // Limpar formulário
    this.templateForm.reset();
    this.templateForm.patchValue({
      contract_type: 'export',
      version: '1.0',
      organization_standard: 'GAFTA',
      active: true,
      commodity: 'SOJA',
      quantity_min: 5000,
      quantity_max: 10000,
      default_price: 450,
      incoterm: 'FOB',
      currency: 'USD',
      payment_terms: 'LC_SIGHT',
      payment_days: 30,
      price_type: 'FIXED',
      shipment_period_start: 30,
      shipment_period_end: 60,
      shipment_type: 'MARITIME',
      partial_shipment_allowed: true,
      transshipment_allowed: false,
      arbitration_clause: 'LONDON',
      ai_enabled: true,
      ai_auto_fill: false,
      ai_risk_analysis: true,
      ai_suggest_incoterm: true,
      ai_generate_contract_text: false,
      ai_compliance_check: true
    });

    this.editingTemplate = null;
    this.selectedTabIndex = 0;
    this.showTemplateForm = true;

    // Scroll para o formulário
    setTimeout(() => {
      const formElement = document.getElementById('template-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  public editTemplate(template: ContractTemplate): void {
    console.log('✏️✨ EDITANDO TEMPLATE - FORMULÁRIO INLINE DAS 6 ABAS!', template.template_name);
    
    // Carregar dados do template no formulário
    this.templateForm.patchValue({
      template_name: template.template_name || '',
      description: template.description || '',
      contract_type: template.contract_type || 'export',
      version: template.version || '1.0',
      organization_standard: template.organization_standard || 'GAFTA',
      active: template.active !== false,
      commodity: template.commodity || 'SOJA',
      currency: template.currency || 'USD',
      quantity_min: template.quantity_min || 5000,
      quantity_max: template.quantity_max || 10000,
      default_price: template.default_price || 450,
      incoterm: template.incoterm || 'FOB',
      payment_terms: template.payment_terms || 'LC_SIGHT',
      payment_days: template.payment_days || 30,
      price_type: template.price_type || 'FIXED',
      port_origin: template.port_origin || '',
      port_destination: template.port_destination || '',
      shipment_period_start: template.shipment_period_start || 30,
      shipment_period_end: template.shipment_period_end || 60,
      shipment_type: template.shipment_type || 'MARITIME',
      partial_shipment_allowed: template.partial_shipment_allowed !== false,
      transshipment_allowed: template.transshipment_allowed || false,
      arbitration_clause: template.arbitration_clause || 'LONDON'
    });

    // Carregar configurações de IA se existirem
    if (template.ai_config) {
      this.templateForm.patchValue({
        ai_enabled: template.ai_config.ai_enabled,
        ai_auto_fill: template.ai_config.ai_auto_fill,
        ai_risk_analysis: template.ai_config.ai_risk_analysis,
        ai_suggest_incoterm: template.ai_config.ai_suggest_incoterm,
        ai_generate_contract_text: template.ai_config.ai_generate_contract_text,
        ai_compliance_check: template.ai_config.ai_compliance_check
      });
    }

    this.editingTemplate = template;
    this.selectedTabIndex = 0;
    this.showTemplateForm = true;

    // Scroll para o formulário
    setTimeout(() => {
      const formElement = document.getElementById('template-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  public viewTemplate(template: ContractTemplate): void {
    console.log('👁️ Visualizando template:', template.template_name);
    this.snackBar.open(`Visualizando ${template.template_name}`, 'Fechar', { duration: 3000 });
    // TODO: Implementar modal de visualização
  }

  public duplicateTemplate(template: ContractTemplate): void {
    console.log('📄 Duplicando template:', template.template_name);
    
    const newName = prompt(`Digite o nome para a cópia do template:`, `${template.template_name} - Cópia`);
    if (newName && newName.trim()) {
      // Criar uma cópia do template
      const duplicatedTemplate: ContractTemplate = {
        ...template,
        template_id: this.generateTemplateId(),
        template_name: newName.trim(),
        version: 1.0,
        created_at: new Date(),
        updated_at: new Date()
      };

      this.contractTemplatesService.createTemplate(duplicatedTemplate).subscribe({
        next: () => {
          this.snackBar.open('Template duplicado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTemplates();
        },
        error: (error: any) => {
          console.error('❌ Erro ao duplicar template:', error);
          this.snackBar.open('Erro ao duplicar template', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  public createVersion(template: ContractTemplate): void {
    console.log('🔄 Criando nova versão:', template.template_name);
    
    // Gerar nova versão baseada na atual
    const currentVersion = template.version || 1.0;
    const newVersion = currentVersion + 0.1;
    
    const newVersionTemplate: ContractTemplate = {
      ...template,
      template_id: this.generateTemplateId(),
      version: parseFloat(newVersion.toFixed(1)),
      updated_at: new Date()
    };

    this.contractTemplatesService.createTemplate(newVersionTemplate).subscribe({
      next: () => {
        this.snackBar.open(`Nova versão ${newVersion.toFixed(1)} criada!`, 'Fechar', { duration: 3000 });
        this.loadTemplates();
      },
      error: (error: any) => {
        console.error('❌ Erro ao criar versão:', error);
        this.snackBar.open('Erro ao criar nova versão', 'Fechar', { duration: 3000 });
      }
    });
  }

  public generateContract(template: ContractTemplate): void {
    console.log('📄 Gerando contrato do template:', template.template_name);
    this.snackBar.open('Funcionalidade de geração de contrato em desenvolvimento', 'Fechar', { duration: 3000 });
    // TODO: Implementar modal de geração de contrato
  }

  public validateTemplate(template: ContractTemplate): void {
    console.log('✅ Validando template:', template.template_name);
    
    // Validação básica do template
    const errors: string[] = [];

    if (!template.template_name || template.template_name.trim().length < 3) {
      errors.push('Nome do template deve ter pelo menos 3 caracteres');
    }

    if (!template.commodity) {
      errors.push('Commodity é obrigatória');
    }

    if (!template.currency) {
      errors.push('Moeda é obrigatória');
    }

    if (!template.incoterm) {
      errors.push('Incoterm é obrigatório');
    }

    if (template.quantity_min && template.quantity_max && template.quantity_min > template.quantity_max) {
      errors.push('Quantidade mínima não pode ser maior que a máxima');
    }

    if (errors.length === 0) {
      this.snackBar.open('✅ Template válido!', 'Fechar', { duration: 3000 });
    } else {
      this.snackBar.open(`⚠️ ${errors.length} erros encontrados: ${errors[0]}`, 'Fechar', { duration: 5000 });
    }
  }

  public analyzeRisk(template: ContractTemplate): void {
    console.log('⚠️ Analisando riscos do template:', template.template_name);
    
    // Análise básica de riscos
    const risks: string[] = [];
    let riskLevel = 'BAIXO';

    // Verificar riscos de localização
    if (template.port_origin && template.port_destination) {
      if (template.port_origin.toLowerCase().includes('somalia') || 
          template.port_destination.toLowerCase().includes('somalia')) {
        risks.push('Risco geopolítico alto na rota');
        riskLevel = 'ALTO';
      }
    }

    // Verificar riscos de pagamento
    if (template.payment_terms === 'TT_ADVANCE' as any) {
      riskLevel = 'MEDIO';
      risks.push('Pagamento antecipado aumenta risco');
    }

    // Verificar riscos de quantidade
    if (template.quantity_max && template.quantity_max > 50000) {
      risks.push('Quantidade elevada aumenta exposição');
      riskLevel = riskLevel === 'ALTO' ? 'ALTO' : 'MEDIO';
    }

    // Verificar configuração de IA
    if (!template.ai_config.ai_enabled) {
      risks.push('IA não habilitada para análise automática');
    }

    const message = risks.length > 0 
      ? `Risco ${riskLevel}: ${risks.length} riscos identificados` 
      : `Risco BAIXO: Nenhum risco significativo detectado`;
      
    this.snackBar.open(message, 'Fechar', { duration: 5000 });
  }

  public checkCompliance(template: ContractTemplate): void {
    console.log('📋 Verificando compliance do template:', template.template_name);
    
    // Verificação básica de compliance
    const issues: string[] = [];
    
    // Verificar padrão de organização
    if (!template.organization_standard) {
      issues.push('Padrão de organização não definido');
    }

    // Verificar se Incoterms está atualizado
    const validIncoterms = ['FOB', 'CIF', 'CFR', 'EXW', 'FCA', 'DAF'];
    if (!validIncoterms.includes(template.incoterm)) {
      issues.push('Incoterm pode estar desatualizado');
    }

    // Verificar pagamento
    if (template.payment_terms && !template.payment_days) {
      issues.push('Prazo de pagamento não especificado');
    }

    // Verificar arbitragem
    if (!template.arbitration_clause) {
      issues.push('Cláusula de arbitragem não definida');
    }

    if (issues.length === 0) {
      this.snackBar.open('✅ Template em compliance!', 'Fechar', { duration: 3000 });
    } else {
      this.snackBar.open(`⚠️ ${issues.length} questões de compliance encontradas`, 'Fechar', { duration: 5000 });
    }
  }

  public exportTemplate(template: ContractTemplate, format: 'PDF' | 'JSON' | 'DOCX'): void {
    console.log('📤 Exportando template:', template.template_name, 'formato:', format);
    
    // Simulação de exportação
    const exportData = {
      template: template,
      exported_at: new Date().toISOString(),
      format: format
    };

    // Em uma implementação real, isso faria download do arquivo
    if (format === 'JSON') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.template_name}_${format.toLowerCase()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      this.snackBar.open(`Template exportado em ${format}!`, 'Fechar', { duration: 3000 });
    } else {
      this.snackBar.open(`Exportação em ${format} em desenvolvimento`, 'Fechar', { duration: 3000 });
    }
  }

  public importTemplate(): void {
    console.log('📥 Importando template');
    this.snackBar.open('Funcionalidade de importação em desenvolvimento', 'Fechar', { duration: 3000 });
    // TODO: Implementar upload/importação
  }

  public toggleActive(template: ContractTemplate): void {
    const newStatus = !template.active;
    console.log(`🔄 ${newStatus ? 'Ativando' : 'Desativando'} template:`, template.template_name);
    
    const updatedTemplate: ContractTemplate = {
      ...template,
      active: newStatus,
      updated_at: new Date()
    };

    this.contractTemplatesService.updateTemplate(template.template_id!, updatedTemplate).subscribe({
      next: () => {
        this.snackBar.open(`Template ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 'Fechar', { duration: 3000 });
        this.loadTemplates();
      },
      error: (error: any) => {
        console.error('❌ Erro ao alterar status:', error);
        this.snackBar.open('Erro ao alterar status do template', 'Fechar', { duration: 3000 });
      }
    });
  }

  public deleteTemplate(template: ContractTemplate): void {
    if (confirm(`Tem certeza que deseja excluir o template "${template.template_name}"?`)) {
      console.log('🗑️ Excluindo template:', template.template_name);
      
      this.contractTemplatesService.deleteTemplate(template.template_id!).subscribe({
        next: () => {
          this.snackBar.open('Template excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTemplates();
        },
        error: (error: any) => {
          console.error('❌ Erro ao excluir template:', error);
          this.snackBar.open('Erro ao excluir template', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  // ✨ NOVOS MÉTODOS PARA GERENCIAR O FORMULÁRIO INLINE DAS 6 ABAS

  public saveTemplate(): void {
    if (this.templateForm.valid) {
      const templateData = this.templateForm.value;
      
      console.log('💾 SALVANDO TEMPLATE - FORMULÁRIO INLINE 6 ABAS!', templateData);

      if (this.editingTemplate) {
        // Modo edição
        const updatedTemplate: ContractTemplate = {
          ...this.editingTemplate,
          ...templateData,
          updated_at: new Date(),
          ai_config: {
            ai_enabled: templateData.ai_enabled || false,
            ai_auto_fill: templateData.ai_auto_fill || false,
            ai_risk_analysis: templateData.ai_risk_analysis || false,
            ai_suggest_incoterm: templateData.ai_suggest_incoterm || false,
            ai_generate_contract_text: templateData.ai_generate_contract_text || false,
            ai_compliance_check: templateData.ai_compliance_check || false
          }
        };

        this.contractTemplatesService.updateTemplate(this.editingTemplate.template_id!, updatedTemplate)
          .subscribe({
            next: () => {
              console.log('✅ Template atualizado via formulário inline!');
              this.snackBar.open(`✨ Template "${updatedTemplate.template_name}" atualizado com sucesso!`, 'Fechar', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.cancelTemplateForm();
              this.loadTemplates();
            },
            error: (error: any) => {
              console.error('❌ Erro ao atualizar template:', error);
              this.snackBar.open('Erro ao atualizar template!', 'Fechar', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
            }
          });
      } else {
        // Modo criação
        const newTemplate: Partial<ContractTemplate> = {
          ...templateData,
          template_id: this.generateTemplateId(),
          created_at: new Date(),
          updated_at: new Date(),
          ai_config: {
            ai_enabled: templateData.ai_enabled || false,
            ai_auto_fill: templateData.ai_auto_fill || false,
            ai_risk_analysis: templateData.ai_risk_analysis || false,
            ai_suggest_incoterm: templateData.ai_suggest_incoterm || false,
            ai_generate_contract_text: templateData.ai_generate_contract_text || false,
            ai_compliance_check: templateData.ai_compliance_check || false
          }
        };

        this.contractTemplatesService.createTemplate(newTemplate as ContractTemplate)
          .subscribe({
            next: () => {
              console.log('✅ Novo template criado via formulário inline!');
              this.snackBar.open(`🎉 Template "${newTemplate.template_name}" criado com sucesso!`, 'Fechar', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.cancelTemplateForm();
              this.loadTemplates();
            },
            error: (error: any) => {
              console.error('❌ Erro ao criar template:', error);
              this.snackBar.open('Erro ao criar template!', 'Fechar', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    } else {
      console.log('❌ Formulário inválido - Verificando campos das 6 abas...');
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios em todas as abas!', 'Fechar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      this.markFormGroupTouched(this.templateForm);
    }
  }

  public cancelTemplateForm(): void {
    this.showTemplateForm = false;
    this.editingTemplate = null;
    this.selectedTabIndex = 0;
    this.templateForm.reset();
    
    // Resetar valores padrão
    this.templateForm.patchValue({
      active: true,
      contract_type: 'export',
      version: '1.0',
      organization_standard: 'GAFTA',
      commodity: 'SOJA',
      currency: 'USD',
      incoterm: 'FOB',
      payment_terms: 'LC_SIGHT',
      price_type: 'FIXED',
      shipment_type: 'MARITIME',
      partial_shipment_allowed: true,
      transshipment_allowed: false,
      arbitration_clause: 'LONDON',
      ai_enabled: false
    });

    console.log('❌ Formulário inline das 6 abas cancelado!');
  }

  private generateTemplateId(): string {
    return 'TPL_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  public getFieldError(fieldName: string): string {
    const control = this.templateForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return 'Campo obrigatório';
      }
      if (control.errors['min']) {
        return `Valor mínimo: ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `Valor máximo: ${control.errors['max'].max}`;
      }
    }
    return '';
  }

  // ========== HELPER METHODS ==========

  public getContractTypeLabel(type: string): string {
    return CONTRACT_TYPE_LABELS[type as keyof typeof CONTRACT_TYPE_LABELS] || type;
  }

  public getCommodityLabel(commodity: string): string {
    return COMMODITY_LABELS[commodity as keyof typeof COMMODITY_LABELS] || commodity;
  }

  public getCurrencyLabel(currency: string): string {
    return CURRENCY_LABELS[currency as keyof typeof CURRENCY_LABELS] || currency;
  }

  public getIncotermLabel(incoterm: string): string {
    return INCOTERM_LABELS[incoterm as keyof typeof INCOTERM_LABELS] || incoterm;
  }

  public getOrgStandardLabel(standard: string): string {
    const label = ORGANIZATION_STANDARD_LABELS[standard as keyof typeof ORGANIZATION_STANDARD_LABELS];
    return label?.split(' (')[0] || standard; // Pegar só a sigla
  }

  public formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  }
}