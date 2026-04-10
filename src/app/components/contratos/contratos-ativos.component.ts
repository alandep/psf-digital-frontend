import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { ContractsMockService } from '../../../services/contractsMockService';
import { ContractEditDialogComponent } from './contract-edit-dialog/contract-edit-dialog.component';
import { 
  Contract, 
  ContractFilters, 
  ContractFilterOptions,
  INCOTERM_LABELS,
  CURRENCY_LABELS
} from '../../../types/contracts';

@Component({
  selector: 'app-contratos-ativos',
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
    MatDividerModule
  ],
  template: `
    <div class="contratos-ativos-container" style="padding: 24px; background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); min-height: 100vh;">
      
      <!-- Header -->
      <div class="header-section" style="margin-bottom: 24px;">
        <h1 style="display: flex; align-items: center; gap: 12px; color: #2e7d32; margin: 0;">
          <mat-icon style="font-size: 32px; color: #4caf50;">assignment_turned_in</mat-icon>
          Contratos Ativos
        </h1>
        <p style="color: #666; margin: 8px 0 0 0;">Gestão de contratos ativados e em andamento</p>
      </div>

      <!-- KPIs -->
      <div class="kpis-section" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
        
        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #e8f5e8; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #4caf50; font-size: 24px;">trending_up</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Contratos Ativos</div>
                <div style="font-size: 28px; font-weight: bold; color: #4caf50;">{{activeContracts}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #e3f2fd; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #1976d2; font-size: 24px;">attach_money</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Valor Total Ativo</div>
                <div style="font-size: 28px; font-weight: bold; color: #1976d2;">{{formatCurrency(totalActiveValue, 'USD')}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #fff3e0; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #ff9800; font-size: 24px;">schedule</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Embarques Próximos</div>
                <div style="font-size: 28px; font-weight: bold; color: #ff9800;">{{upcomingShipments}}</div>
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
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Países Atendidos</div>
                <div style="font-size: 28px; font-weight: bold; color: #9c27b0;">{{uniqueCountries}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- Filtros Específicos para Contratos Ativos -->
      <mat-card *ngIf="filterOptions" style="margin-bottom: 24px;">
        <mat-card-header>
          <mat-card-title style="display: flex; align-items: center; gap: 8px; color: #4caf50;">
            <mat-icon>filter_list</mat-icon>
            Filtros para Contratos Ativos
          </mat-card-title>
          <mat-card-subtitle>Refine sua busca nos contratos em andamento</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtroForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px;">
            
            <!-- Moeda -->
            <mat-form-field appearance="outline">
              <mat-label>Moeda</mat-label>
              <mat-select formControlName="currency" multiple>
                <mat-option *ngFor="let currency of activeCurrencies" [value]="currency">
                  {{getCurrencyLabel(currency)}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Incoterm -->
            <mat-form-field appearance="outline">
              <mat-label>Incoterm</mat-label>
              <mat-select formControlName="incoterm" multiple>
                <mat-option *ngFor="let incoterm of activeIncoterms" [value]="incoterm.value">
                  {{incoterm.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- País de Destino -->
            <mat-form-field appearance="outline">
              <mat-label>País de Destino</mat-label>
              <mat-select formControlName="countries" multiple>
                <mat-option *ngFor="let country of activeCountries" [value]="country.code">
                  {{country.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Exportador -->
            <mat-form-field appearance="outline">
              <mat-label>Exportador</mat-label>
              <mat-select formControlName="exporter_id" multiple>
                <mat-option *ngFor="let exporter of filterOptions.exporters" [value]="exporter.id">
                  {{exporter.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Faixa de Valor -->
            <mat-form-field appearance="outline">
              <mat-label>Valor Mínimo (USD)</mat-label>
              <input matInput type="number" formControlName="value_min" placeholder="0">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Valor Máximo (USD)</mat-label>  
              <input matInput type="number" formControlName="value_max" placeholder="999999999">
            </mat-form-field>

            <!-- Data de Embarque -->
            <mat-form-field appearance="outline">
              <mat-label>Embarque a partir de</mat-label>
              <input matInput [matDatepicker]="dateFromPicker" formControlName="date_from">
              <mat-datepicker-toggle matSuffix [for]="dateFromPicker"></mat-datepicker-toggle>
              <mat-datepicker #dateFromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Embarque até</mat-label>
              <input matInput [matDatepicker]="dateToPicker" formControlName="date_to">
              <mat-datepicker-toggle matSuffix [for]="dateToPicker"></mat-datepicker-toggle>
              <mat-datepicker #dateToPicker></mat-datepicker>
            </mat-form-field>

            <!-- Botões de Filtro -->
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
        <p style="margin-top: 16px; color: #666;">Carregando contratos ativos...</p>
      </div>

      <!-- Lista de Contratos Ativos -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <mat-icon style="color: #4caf50;">assignment_turned_in</mat-icon>
              <span>Contratos Ativos</span>
              <mat-chip-listbox>
                <mat-chip style="background: #4caf50; color: white;">{{activeContracts}} ativos</mat-chip>
              </mat-chip-listbox>
            </div>
            <button mat-raised-button 
                    color="accent" 
                    (click)="goToNewContracts()">
              <mat-icon>add</mat-icon>
              Novo Contrato
            </button>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          
          <!-- Grid de contratos ativos -->
          <div style="display: grid; gap: 16px; margin-top: 16px;">
            
            <div *ngFor="let contract of contracts" 
                 class="active-contract-card"
                 style="padding: 24px; border: 2px solid #e8f5e8; border-radius: 16px; background: linear-gradient(135deg, #f8fff8 0%, #f0f8f0 100%); transition: all 0.3s ease;">
              
              <!-- Header do contrato com status ativo -->
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; margin-bottom: 20px;">
                
                <!-- Info principal -->
                <div>
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 20px; color: #2e7d32;">{{contract.contract_number}}</h3>
                    <mat-chip style="background: #4caf50; color: white; font-weight: bold;">
                      <mat-icon style="margin-right: 4px; font-size: 16px;">check_circle</mat-icon>
                      ATIVO
                    </mat-chip>
                    <!-- Badge de embarque próximo -->
                    <mat-chip *ngIf="isShipmentSoon(contract.shipment_date)" 
                             style="background: #ff9800; color: white; font-size: 12px;">
                      <mat-icon style="margin-right: 4px; font-size: 14px;">schedule</mat-icon>
                      Embarque próximo
                    </mat-chip>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; color: #555; font-size: 14px;">
                    <div><strong>Importador:</strong> {{contract.importer_name}}</div>
                    <div><strong>País:</strong> {{contract.country_destination}}</div>
                    <div><strong>Exportador:</strong> {{contract.exporter_name}}</div>
                    <div><strong>Embarque:</strong> {{formatDate(contract.shipment_date)}}</div>
                  </div>
                </div>

                <!-- Menu de ações -->
                <div style="display: flex; gap: 8px;">
                  <button mat-fab 
                          color="primary" 
                          (click)="editContract(contract)"
                          matTooltip="Editar contrato"
                          style="transform: scale(0.8);">
                    <mat-icon>edit</mat-icon>
                  </button>
                  
                  <button mat-icon-button 
                          [matMenuTriggerFor]="contractMenu"
                          matTooltip="Mais ações"
                          style="color: #666;">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #contractMenu="matMenu">
                    <button mat-menu-item (click)="viewContractDetails(contract)">
                      <mat-icon>visibility</mat-icon>
                      Ver Detalhes
                    </button>
                    <button mat-menu-item (click)="generateDocuments(contract)">
                      <mat-icon>description</mat-icon>
                      Documentos
                    </button>
                    <button mat-menu-item (click)="trackShipment(contract)">
                      <mat-icon>local_shipping</mat-icon>
                      Rastrear Embarque
                    </button>
                    <button mat-menu-item (click)="sendToReceita(contract)">
                      <mat-icon>send</mat-icon>
                      Enviar p/ Receita
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="closeContract(contract)" style="color: #f44336;">
                      <mat-icon>close</mat-icon>
                      Fechar Contrato
                    </button>
                  </mat-menu>
                </div>
              </div>

              <!-- Detalhes comerciais -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                
                <div class="detail-item" style="background: white; padding: 16px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Valor do Contrato</div>
                  <div style="font-weight: bold; font-size: 18px; color: #4caf50;">
                    {{formatCurrency(contract.total_value, contract.currency)}}
                  </div>
                </div>

                <div class="detail-item" style="background: white; padding: 16px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Incoterm</div>
                  <div style="font-weight: bold; font-size: 16px;">{{getIncotermLabel(contract.incoterm)}}</div>
                </div>

                <div class="detail-item" style="background: white; padding: 16px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Data do Contrato</div>
                  <div style="font-weight: bold; font-size: 14px;">{{formatDate(contract.contract_date)}}</div>
                </div>

                <div class="detail-item" style="background: white; padding: 16px; border-radius: 12px; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Dias até Embarque</div>
                  <div style="font-weight: bold; font-size: 16px;" [style.color]="getDaysColor(contract.shipment_date)">
                    {{getDaysUntilShipment(contract.shipment_date)}} dias
                  </div>
                </div>
              </div>

              <!-- Custos e margens (se disponível) -->
              <div *ngIf="contract.calculated_costs" 
                   style="background: white; padding: 16px; border-radius: 12px; border-left: 4px solid #4caf50;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                  <mat-icon style="font-size: 16px; color: #4caf50;">calculate</mat-icon>
                  <span style="font-weight: bold; color: #4caf50;">Análise Financeira</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; font-size: 13px;">
                  <div>
                    <span style="color: #666;">Custos Totais:</span> 
                    <strong style="color: #ff9800;">{{formatCurrency(contract.calculated_costs.total_costs || 0, contract.currency)}}</strong>
                  </div>
                  <div>
                    <span style="color: #666;">Valor Líquido:</span> 
                    <strong style="color: #4caf50;">{{formatCurrency(contract.calculated_costs.net_value || 0, contract.currency)}}</strong>
                  </div>
                  <div>
                    <span style="color: #666;">Margem:</span> 
                    <strong style="color: #2196f3;">{{contract.calculated_costs.margin}}%</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Estado vazio -->
          <div *ngIf="contracts.length === 0" 
               style="text-align: center; padding: 60px 20px; color: #666;">
            <mat-icon style="font-size: 64px; color: #ccc; margin-bottom: 16px;">assignment_turned_in</mat-icon>
            <h3 style="margin: 0 0 8px 0; color: #999;">Nenhum contrato ativo encontrado</h3>
            <p style="margin: 0;">Não há contratos ativos que atendam aos filtros aplicados.</p>
            <button mat-raised-button color="primary" (click)="clearFilters()" style="margin-top: 16px;">
              <mat-icon>clear</mat-icon>
              Limpar Filtros
            </button>
          </div>

        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .contratos-ativos-container {
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
      min-height: 100vh;
    }
    
    .active-contract-card:hover {
      box-shadow: 0 8px 24px rgba(76, 175, 80, 0.2);
      transform: translateY(-2px);
      border-color: #4caf50;
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
export class ContratosAtivosComponent implements OnInit {
  private readonly contractsService = inject(ContractsMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  public contracts: Contract[] = [];
  public filterOptions: ContractFilterOptions | null = null;
  public isLoading = false;
  
  // KPIs específicos para contratos ativos
  public activeContracts = 0;
  public totalActiveValue = 0;
  public upcomingShipments = 0;
  public uniqueCountries = 0;

  // Filtros específicos baseados em contratos ativos
  public activeCurrencies: string[] = [];
  public activeIncoterms: { value: string; label: string }[] = [];
  public activeCountries: { code: string; name: string }[] = [];

  public filtroForm: FormGroup;
  public readonly incotermLabels = INCOTERM_LABELS;
  public readonly currencyLabels = CURRENCY_LABELS;

  constructor() {
    console.log('🚀 ContratosAtivosComponent inicializado!');
    
    this.filtroForm = this.fb.group({
      currency: [[]],
      incoterm: [[]],
      countries: [[]],
      exporter_id: [[]],
      value_min: [null],
      value_max: [null],
      date_from: [null],
      date_to: [null]
    });
  }

  ngOnInit(): void {
    console.log('📊 Carregando contratos ativos...');
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Carregar opções de filtro
    this.contractsService.getFilterOptions().subscribe({
      next: (options) => {
        console.log('✅ Opções de filtro carregadas:', options);
        this.filterOptions = options;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar opções de filtro:', error);
      }
    });

    // Carregar apenas contratos ativos
    this.loadActiveContracts();
  }

  private loadActiveContracts(additionalFilters?: Partial<ContractFilters>): void {
    this.isLoading = true;
    
    // Sempre filtrar por status "Active"
    const filters: ContractFilters = {
      status: ['Active'],
      ...additionalFilters
    };
    
    this.contractsService.getContracts(filters).subscribe({
      next: (contracts) => {
        console.log('✅ Contratos ativos carregados:', contracts);
        this.contracts = contracts;
        this.calculateKPIs();
        this.updateFilterOptions();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar contratos ativos:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar contratos ativos', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.activeContracts = this.contracts.length;
    this.totalActiveValue = this.contracts.reduce((sum, c) => sum + c.total_value, 0);
    
    // Embarques nos próximos 30 dias
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    this.upcomingShipments = this.contracts.filter(c => 
      new Date(c.shipment_date!) <= thirtyDaysFromNow
    ).length;

    this.uniqueCountries = new Set(this.contracts.map(c => c.country_destination)).size;
  }

  private updateFilterOptions(): void {
    // Atualizar opções de filtro baseadas nos contratos ativos
    this.activeCurrencies = [...new Set(this.contracts.map(c => c.currency))];
    
    const activeIncotermValues = [...new Set(this.contracts.map(c => c.incoterm))];
    this.activeIncoterms = Object.entries(this.incotermLabels)
      .filter(([value]) => activeIncotermValues.includes(value as any))
      .map(([value, label]) => ({ value, label }));
      
    const activeCountryCodes = [...new Set(this.contracts.map(c => c.country_destination))];
    this.activeCountries = this.filterOptions?.countries.filter(c => 
      activeCountryCodes.includes(c.code)
    ) || [];
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;
    
    const additionalFilters: Partial<ContractFilters> = {
      currency: formValue.currency?.length ? formValue.currency : undefined,
      incoterm: formValue.incoterm?.length ? formValue.incoterm : undefined,
      countries: formValue.countries?.length ? formValue.countries : undefined,
      exporter_id: formValue.exporter_id?.length ? formValue.exporter_id : undefined,
      value_min: formValue.value_min || undefined,
      value_max: formValue.value_max || undefined,
      date_from: formValue.date_from || undefined,
      date_to: formValue.date_to || undefined
    };

    console.log('🔍 Aplicando filtros para contratos ativos:', additionalFilters);
    this.loadActiveContracts(additionalFilters);
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      currency: [],
      incoterm: [],
      countries: [],
      exporter_id: [],
      value_min: null,
      value_max: null,
      date_from: null,
      date_to: null
    });
    
    this.loadActiveContracts();
  }

  public editContract(contract: Contract): void {
    console.log('✏️ Redirecionando para edição do contrato:', contract.contract_number);
    
    const dialogRef = this.dialog.open(ContractEditDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        contract: { ...contract },
        filterOptions: this.filterOptions,
        isEditMode: true
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Contrato atualizado:', result);
        this.snackBar.open('Contrato atualizado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recarregar a lista
        this.loadActiveContracts();
      }
    });
  }

  public goToNewContracts(): void {
    console.log('🔗 Redirecionando para criar novo contrato...');
    this.router.navigate(['/home-logged/contratos/novo']);
  }

  public viewContractDetails(contract: Contract): void {
    console.log('👁️ Visualizando detalhes do contrato:', contract.contract_number);
    this.snackBar.open(`Visualizando detalhes de ${contract.contract_number}`, 'Fechar', { duration: 3000 });
    // TODO: Implementar modal de detalhes
  }

  public trackShipment(contract: Contract): void {
    console.log('🚛 Rastreando embarque do contrato:', contract.contract_number);
    this.snackBar.open(`Rastreamento de embarque para ${contract.contract_number}`, 'Fechar', { duration: 3000 });
    // TODO: Implementar rastreamento
  }

  public generateDocuments(contract: Contract): void {
    console.log('📄 Gerando documentos para:', contract.contract_id);
    
    this.snackBar.open('Gerando documentos...', '', { duration: 2000 });
    
    this.contractsService.generateDocuments(contract.contract_id!).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open('Documentos gerados com sucesso!', 'Fechar', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('❌ Erro ao gerar documentos:', error);
        this.snackBar.open('Erro ao gerar documentos', 'Fechar', { duration: 3000 });
      }
    });
  }

  public sendToReceita(contract: Contract): void {
    console.log('📤 Enviando para Receita Federal:', contract.contract_id);
    
    this.snackBar.open('Enviando para Receita Federal...', '', { duration: 3000 });
    
    this.contractsService.sendToReceita(contract.contract_id!).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open(`Enviado com sucesso! Protocolo: ${result.protocol}`, 'Fechar', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('❌ Erro ao enviar para RF:', error);
        this.snackBar.open('Erro ao enviar para Receita Federal', 'Fechar', { duration: 3000 });
      }
    });
  }

  public closeContract(contract: Contract): void {
    if (confirm(`Tem certeza que deseja fechar o contrato ${contract.contract_number}?`)) {
      console.log('🔒 Fechando contrato:', contract.contract_id);
      
      const updatedContract = { ...contract, status: 'Closed' as const };
      
      this.contractsService.updateContract(contract.contract_id!, updatedContract).subscribe({
        next: () => {
          this.snackBar.open('Contrato fechado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadActiveContracts();
        },
        error: (error) => {
          console.error('❌ Erro ao fechar contrato:', error);
          this.snackBar.open('Erro ao fechar contrato', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  public isShipmentSoon(shipmentDate: string | Date | undefined): boolean {
    if (!shipmentDate) return false;
    
    const shipment = new Date(shipmentDate);
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);
    
    return shipment <= fourteenDaysFromNow;
  }

  public getDaysUntilShipment(shipmentDate: string | Date | undefined): number {
    if (!shipmentDate) return 0;
    
    const shipment = new Date(shipmentDate);
    const today = new Date();
    const diffTime = shipment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  public getDaysColor(shipmentDate: string | Date | undefined): string {
    const days = this.getDaysUntilShipment(shipmentDate);
    
    if (days <= 7) return '#f44336'; // Vermelho - urgente
    if (days <= 14) return '#ff9800'; // Laranja - atenção
    if (days <= 30) return '#ffc107'; // Amarelo - em breve
    return '#4caf50'; // Verde - tranquilo
  }

  public formatCurrency(value: number, currency: string): string {
    const symbolMap: Record<string, string> = {
      'USD': 'USD',
      'EUR': 'EUR', 
      'BRL': 'BRL',
      'CNY': 'CNY'
    };
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: symbolMap[currency] || 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  public formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  public getIncotermLabel(incoterm: string): string {
    return this.incotermLabels[incoterm as keyof typeof this.incotermLabels] || incoterm;
  }

  public getCurrencyLabel(currency: string): string {
    return this.currencyLabels[currency as keyof typeof this.currencyLabels] || currency;
  }
}