import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ContractsMockService } from '../../../services/contractsMockService';
import { 
  Contract, 
  ContractFilters, 
  ContractFilterOptions,
  INCOTERM_LABELS,
  CURRENCY_LABELS
} from '../../../types/contracts';

@Component({
  selector: 'app-contratos-ativos-simple',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
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

      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" style="display: flex; flex-direction: column; align-items: center; padding: 40px;">
        <mat-progress-spinner mode="indeterminate" diameter="50" color="accent"></mat-progress-spinner>
        <p style="margin-top: 16px; color: #666;">Carregando contratos ativos...</p>
      </div>

      <!-- Lista Simples -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title style="color: #4caf50;">
            <mat-icon>assignment_turned_in</mat-icon>
            Contratos Ativos ({{activeContracts}})
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          
          <div *ngFor="let contract of contracts" 
               style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 16px;">
            <h3>{{contract.contract_number}}</h3>
            <p><strong>Importador:</strong> {{contract.importer_name}}</p>
            <p><strong>País:</strong> {{contract.country_destination}}</p>
            <p><strong>Valor:</strong> {{formatCurrency(contract.total_value, contract.currency)}}</p>
            <p><strong>Status:</strong> {{contract.status}}</p>
          </div>

          <div *ngIf="contracts.length === 0" style="text-align: center; padding: 40px; color: #666;">
            <mat-icon style="font-size: 48px; color: #ccc;">assignment_turned_in</mat-icon>
            <h3>Nenhum contrato ativo encontrado</h3>
          </div>

        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
  `]
})
export class ContratosAtivosSimpleComponent implements OnInit {
  private readonly contractsService = inject(ContractsMockService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  public contracts: Contract[] = [];
  public isLoading = false;
  public activeContracts = 0;
  public totalActiveValue = 0;

  constructor() {
    console.log('🚀 ContratosAtivosSimpleComponent inicializado!');
  }

  ngOnInit(): void {
    console.log('📊 Carregando contratos ativos de forma simplificada...');
    this.loadActiveContracts();
  }

  private loadActiveContracts(): void {
    this.isLoading = true;
    
    // Filtrar apenas contratos ativos
    const filters: ContractFilters = {
      status: ['Active']
    };
    
    this.contractsService.getContracts(filters).subscribe({
      next: (contracts) => {
        console.log('✅ Contratos ativos carregados (modo simples):', contracts);
        this.contracts = contracts;
        this.calculateKPIs();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar contratos ativos (modo simples):', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar contratos ativos', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.activeContracts = this.contracts.length;
    this.totalActiveValue = this.contracts.reduce((sum, c) => sum + c.total_value, 0);
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
}