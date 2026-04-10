import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  CONTRACT_STATUS_LABELS,
  INCOTERM_LABELS,
  CURRENCY_LABELS
} from '../../../types/contracts';

@Component({
  selector: 'app-novos-contratos',
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
    <div class="contratos-container" style="padding: 24px;">
      
      <!-- Header -->
      <div class="header-section" style="margin-bottom: 24px;">
        <h1 style="display: flex; align-items: center; gap: 12px; color: #1976d2; margin: 0;">
          <mat-icon style="font-size: 32px;">assignment</mat-icon>
          Novos Contratos
        </h1>
        <p style="color: #666; margin: 8px 0 0 0;">Gestão de contratos de exportação</p>
      </div>

      <!-- KPIs -->
      <div class="kpis-section" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px;">
        
        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #e3f2fd; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #1976d2; font-size: 24px;">assignment</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Total de Contratos</div>
                <div style="font-size: 28px; font-weight: bold; color: #1976d2;">{{totalContracts}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #e8f5e8; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #4caf50; font-size: 24px;">trending_up</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Valor Total</div>
                <div style="font-size: 28px; font-weight: bold; color: #4caf50;">{{formatCurrency(totalValue, 'USD')}}</div>
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
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Contratos Ativos</div>
                <div style="font-size: 28px; font-weight: bold; color: #ff9800;">{{activeContracts}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card">
          <mat-card-content style="padding: 20px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #f3e5f5; padding: 12px; border-radius: 12px;">
                <mat-icon style="color: #9c27b0; font-size: 24px;">edit_note</mat-icon>
              </div>
              <div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Rascunhos</div>
                <div style="font-size: 28px; font-weight: bold; color: #9c27b0;">{{draftContracts}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- Filtros -->
      <mat-card *ngIf="filterOptions" style="margin-bottom: 24px;">
        <mat-card-header>
          <mat-card-title style="display: flex; align-items: center; gap: 8px;">
            <mat-icon>filter_list</mat-icon>
            Filtros Avançados
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtroForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px;">
            
            <!-- Status -->
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status" multiple>
                <mat-option *ngFor="let status of filterOptions.statuses" [value]="status.value">
                  {{status.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Moeda -->
            <mat-form-field appearance="outline">
              <mat-label>Moeda</mat-label>
              <mat-select formControlName="currency" multiple>
                <mat-option *ngFor="let currency of filterOptions.currencies" [value]="currency">
                  {{getCurrencyLabel(currency)}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Incoterm -->
            <mat-form-field appearance="outline">
              <mat-label>Incoterm</mat-label>
              <mat-select formControlName="incoterm" multiple>
                <mat-option *ngFor="let incoterm of filterOptions.incoterms" [value]="incoterm.value">
                  {{incoterm.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- País de Destino -->
            <mat-form-field appearance="outline">
              <mat-label>País de Destino</mat-label>
              <mat-select formControlName="countries" multiple>
                <mat-option *ngFor="let country of filterOptions.countries" [value]="country.code">
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

            <!-- Valor Mínimo -->
            <mat-form-field appearance="outline">
              <mat-label>Valor Mínimo</mat-label>
              <input matInput type="number" formControlName="value_min" placeholder="0">
            </mat-form-field>

            <!-- Valor Máximo -->
            <mat-form-field appearance="outline">
              <mat-label>Valor Máximo</mat-label>
              <input matInput type="number" formControlName="value_max" placeholder="999999999">
            </mat-form-field>

            <!-- Botões de Filtro -->
            <div style="display: flex; gap: 8px; align-items: end;">
              <button mat-raised-button color="primary" (click)="applyFilters()" [disabled]="isLoading">
                <mat-icon>search</mat-icon>
                Buscar
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
        <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
        <p style="margin-top: 16px; color: #666;">Carregando contratos...</p>
      </div>

      <!-- Lista de Contratos -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>Contratos</span>
              <mat-chip-listbox>
                <mat-chip>{{contracts.length}} contratos</mat-chip>
              </mat-chip-listbox>
            </div>
            <button mat-raised-button color="primary" (click)="openNewContractDialog()">
              <mat-icon>add</mat-icon>
              Novo Contrato
            </button>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          
          <!-- Lista de contratos em cards -->
          <div style="display: grid; gap: 16px; margin-top: 16px;">
            
            <div *ngFor="let contract of contracts" 
                 class="contract-card"
                 style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background: #fafafa; transition: all 0.3s ease;">
              
              <!-- Header do contrato -->
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; margin-bottom: 16px;">
                
                <!-- Info principal -->
                <div>
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 18px; color: #1976d2;">{{contract.contract_number}}</h3>
                    <mat-chip [style.background-color]="getStatusColor(contract.status)" 
                             [style.color]="'white'" 
                             style="font-size: 12px;">
                      {{getStatusLabel(contract.status)}}
                    </mat-chip>
                  </div>
                  <div style="color: #666; font-size: 14px;">
                    <strong>Importador:</strong> {{contract.importer_name}} ({{contract.country_destination}})
                  </div>
                  <div style="color: #666; font-size: 14px;">
                    <strong>Exportador:</strong> {{contract.exporter_name}}
                  </div>
                </div>

                <!-- Ações -->
                <div style="display: flex; gap: 8px;">
                  <button mat-icon-button 
                          [matMenuTriggerFor]="contractMenu"
                          matTooltip="Mais ações">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  
                  <mat-menu #contractMenu="matMenu">
                    <button mat-menu-item (click)="editContract(contract)">
                      <mat-icon>edit</mat-icon>
                      Editar
                    </button>
                    <button mat-menu-item (click)="generateDocuments(contract)">
                      <mat-icon>description</mat-icon>
                      Gerar Documentos
                    </button>
                    <button mat-menu-item (click)="sendToReceita(contract)">
                      <mat-icon>send</mat-icon>
                      Enviar p/ Receita
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="deleteContract(contract)" style="color: #f44336;">
                      <mat-icon>delete</mat-icon>
                      Excluir
                    </button>
                  </mat-menu>
                </div>
              </div>

              <!-- Detalhes do contrato -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
                
                <div class="detail-item">
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Valor Total</div>
                  <div style="font-weight: bold; font-size: 16px; color: #4caf50;">
                    {{formatCurrency(contract.total_value, contract.currency)}}
                  </div>
                </div>

                <div class="detail-item">
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Incoterm</div>
                  <div style="font-weight: bold;">{{getIncotermLabel(contract.incoterm)}}</div>
                </div>

                <div class="detail-item">
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Data do Contrato</div>
                  <div style="font-weight: bold;">{{formatDate(contract.contract_date)}}</div>
                </div>

                <div class="detail-item">
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Data de Embarque</div>
                  <div style="font-weight: bold;">{{formatDate(contract.shipment_date)}}</div>
                </div>
              </div>

              <!-- Custos calculados -->
              <div *ngIf="contract.calculated_costs" 
                   style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #1976d2;">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                  <mat-icon style="font-size: 14px; vertical-align: middle; margin-right: 4px;">calculate</mat-icon>
                  Custos Calculados
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; font-size: 13px;">
                  <div>
                    <span style="color: #666;">Frete:</span> 
                    <strong>{{formatCurrency(contract.calculated_costs.freight_cost || 0, contract.currency)}}</strong>
                  </div>
                  <div>
                    <span style="color: #666;">Seguro:</span> 
                    <strong>{{formatCurrency(contract.calculated_costs.insurance_cost || 0, contract.currency)}}</strong>
                  </div>
                  <div>
                    <span style="color: #666;">Manuseio:</span> 
                    <strong>{{formatCurrency(contract.calculated_costs.handling_cost || 0, contract.currency)}}</strong>
                  </div>
                  <div>
                    <span style="color: #666;">Valor Líquido:</span> 
                    <strong style="color: #4caf50;">{{formatCurrency(contract.calculated_costs.net_value || 0, contract.currency)}}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Estado vazio -->
          <div *ngIf="contracts.length === 0" 
               style="text-align: center; padding: 60px 20px; color: #666;">
            <mat-icon style="font-size: 64px; color: #ccc; margin-bottom: 16px;">assignment</mat-icon>
            <h3 style="margin: 0 0 8px 0; color: #999;">Nenhum contrato encontrado</h3>
            <p style="margin: 0;">Não há contratos que atendam aos filtros aplicados.</p>
            <button mat-raised-button color="primary" (click)="openNewContractDialog()" style="margin-top: 16px;">
              <mat-icon>add</mat-icon>
              Criar Primeiro Contrato
            </button>
          </div>

        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .contratos-container {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }
    
    .contract-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }
    
    .kpi-card {
      transition: transform 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    
    .detail-item {
      padding: 8px 0;
    }
  `]
})
export class NovosContratosComponent implements OnInit {
  private readonly contractsService = inject(ContractsMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public contracts: Contract[] = [];
  public filterOptions: ContractFilterOptions | null = null;
  public isLoading = false;
  
  // KPIs
  public totalContracts = 0;
  public totalValue = 0;
  public activeContracts = 0;
  public draftContracts = 0;

  public filtroForm: FormGroup;
  public readonly statusLabels = CONTRACT_STATUS_LABELS;
  public readonly incotermLabels = INCOTERM_LABELS;
  public readonly currencyLabels = CURRENCY_LABELS;

  constructor() {
    console.log('🚀 NovosContratosComponent inicializado!');
    
    this.filtroForm = this.fb.group({
      status: [[]],
      currency: [[]],
      incoterm: [[]],
      countries: [[]],
      exporter_id: [[]],
      value_min: [null],
      value_max: [null]
    });
  }

  ngOnInit(): void {
    console.log('📊 Carregando dados de contratos...');
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

    // Carregar contratos
    this.loadContracts();
  }

  private loadContracts(filters?: ContractFilters): void {
    this.isLoading = true;
    
    this.contractsService.getContracts(filters).subscribe({
      next: (contracts) => {
        console.log('✅ Contratos carregados:', contracts);
        this.contracts = contracts;
        this.calculateKPIs();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar contratos:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar contratos', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.totalContracts = this.contracts.length;
    this.totalValue = this.contracts.reduce((sum, c) => sum + c.total_value, 0);
    this.activeContracts = this.contracts.filter(c => c.status === 'Active').length;
    this.draftContracts = this.contracts.filter(c => c.status === 'Draft').length;
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;
    
    const filters: ContractFilters = {
      status: formValue.status?.length ? formValue.status : undefined,
      currency: formValue.currency?.length ? formValue.currency : undefined,
      incoterm: formValue.incoterm?.length ? formValue.incoterm : undefined,
      countries: formValue.countries?.length ? formValue.countries : undefined,
      exporter_id: formValue.exporter_id?.length ? formValue.exporter_id : undefined,
      value_min: formValue.value_min || undefined,
      value_max: formValue.value_max || undefined
    };

    console.log('🔍 Aplicando filtros:', filters);
    this.loadContracts(filters);
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      status: [],
      currency: [],
      incoterm: [],
      countries: [],
      exporter_id: [],
      value_min: null,
      value_max: null
    });
    
    this.loadContracts();
  }

  public openNewContractDialog(): void {
    console.log('🆕 Abrindo modal para novo contrato...');
    
    const dialogRef = this.dialog.open(ContractEditDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        contract: null,
        filterOptions: this.filterOptions,
        isEditMode: false
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Novo contrato criado:', result);
        this.snackBar.open('Contrato criado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recarregar a lista
        this.loadContracts();
      }
    });
  }

  public editContract(contract: Contract): void {
    console.log('✏️ Editando contrato:', contract);
    
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
        this.loadContracts();
      }
    });
  }

  public deleteContract(contract: Contract): void {
    if (confirm(`Tem certeza que deseja excluir o contrato ${contract.contract_number}?`)) {
      console.log('🗑️ Excluindo contrato:', contract.contract_id);
      
      this.contractsService.deleteContract(contract.contract_id!).subscribe({
        next: () => {
          this.snackBar.open('Contrato excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadContracts();
        },
        error: (error) => {
          console.error('❌ Erro ao excluir contrato:', error);
          this.snackBar.open('Erro ao excluir contrato', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  public generateDocuments(contract: Contract): void {
    console.log('📄 Gerando documentos para:', contract.contract_id);
    
    this.snackBar.open('Gerando documentos...', '', { duration: 2000 });
    
    this.contractsService.generateDocuments(contract.contract_id!).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open('Documentos gerados com sucesso!', 'Fechar', { duration: 5000 });
          console.log('📄 Documentos gerados:', result.documentUrls);
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
          this.snackBar.open(`Enviado com sucesso! Protocolo: ${result.protocol}`, 'Fechar', { duration: 8000 });
          console.log('📤 Enviado para RF:', result);
        }
      },
      error: (error) => {
        console.error('❌ Erro ao enviar para RF:', error);
        this.snackBar.open('Erro ao enviar para Receita Federal', 'Fechar', { duration: 3000 });
      }
    });
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

  public getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }

  public getIncotermLabel(incoterm: string): string {
    return this.incotermLabels[incoterm as keyof typeof this.incotermLabels] || incoterm;
  }

  public getCurrencyLabel(currency: string): string {
    return this.currencyLabels[currency as keyof typeof this.currencyLabels] || currency;
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'Active': return '#4caf50';
      case 'Draft': return '#ff9800';
      case 'Closed': return '#2196f3';
      case 'Cancelled': return '#f44336';
      default: return '#666';
    }
  }
}