import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecebimentosMockService } from '../../../services/recebimentosMockService';
import { 
  Recebimento, 
  FiltroOptions,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../types/recebimentos';

@Component({
  selector: 'app-contas-receber-progressive',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div style="padding: 24px;">
      <!-- Header -->
      <div>
        <h1 style="display: flex; align-items: center; gap: 12px; color: #1976d2;">
          <mat-icon>trending_up</mat-icon>
          Contas a Receber (Progressive Test)
        </h1>
        <p>Gestão completa de recebimentos e controle cambial</p>
      </div>

      <!-- KPIs -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 24px 0;">
        <mat-card>
          <mat-card-content>
            <div style="display: flex; align-items: center; gap: 12px;">
              <mat-icon style="color: #1976d2; font-size: 32px;">account_balance</mat-icon>
              <div>
                <div>Total Geral</div>
                <div style="font-size: 24px; font-weight: bold;">{{formatCurrency(totalAmount, 'BRL')}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div style="display: flex; align-items: center; gap: 12px;">
              <mat-icon style="color: #ff9800; font-size: 32px;">schedule</mat-icon>
              <div>
                <div>Pendente</div>
                <div style="font-size: 24px; font-weight: bold;">{{formatCurrency(pendingAmount, 'BRL')}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div style="display: flex; align-items: center; gap: 12px;">
              <mat-icon style="color: #4caf50; font-size: 32px;">check_circle</mat-icon>
              <div>
                <div>Recebido</div>
                <div style="font-size: 24px; font-weight: bold;">{{formatCurrency(completedAmount, 'BRL')}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Filtros básicos -->
      <mat-card style="margin: 24px 0;">
        <mat-card-header>
          <mat-card-title>Filtros</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtroForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select formControlName="status" multiple>
                <mat-option *ngFor="let status of ['pending', 'processing', 'completed', 'cancelled']" [value]="status">
                  {{getStatusLabel(status)}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Moeda</mat-label>
              <mat-select formControlName="currency" multiple>
                <mat-option value="BRL">Real (BRL)</mat-option>
                <mat-option value="USD">Dólar (USD)</mat-option>
                <mat-option value="EUR">Euro (EUR)</mat-option>
              </mat-select>
            </mat-form-field>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="isLoading" style="display: flex; flex-direction: column; align-items: center; padding: 40px;">
        <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
        <p>Carregando recebimentos...</p>
      </div>

      <!-- Lista -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title>Recebimentos ({{recebimentos.length}})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let recebimento of recebimentos" style="padding: 12px; border-bottom: 1px solid #eee; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px;">
            <div>
              <strong>{{formatCurrency(recebimento.amount, recebimento.currency)}}</strong>
            </div>
            <div>{{recebimento.contract}}</div>
            <div>{{formatDate(recebimento.payment_date)}}</div>
            <div>
              <span [style.color]="getStatusColor(recebimento.status)">{{getStatusLabel(recebimento.status)}}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: []
})
export class ContasReceberProgressiveComponent implements OnInit {
  private readonly recebimentosService = inject(RecebimentosMockService);
  private readonly fb = inject(FormBuilder);

  public recebimentos: Recebimento[] = [];
  public filtroOptions: FiltroOptions | null = null;
  public isLoading = false;
  public totalAmount = 0;
  public pendingAmount = 0;
  public completedAmount = 0;

  public filtroForm: FormGroup;
  public readonly statusLabels = STATUS_LABELS;
  public readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;
  
  constructor() {
    console.log('🚀 ContasReceberProgressiveComponent inicializado!');
    
    this.filtroForm = this.fb.group({
      status: [[]],
      currency: [[]],
      payment_method: [[]],
      contract: [[]],
      date_from: [null],
      date_to: [null],
      amount_min: [null],
      amount_max: [null],
      bank_account: [[]]
    });
  }

  ngOnInit(): void {
    console.log('📊 Carregando dados (progressive)...');
    this.loadRecebimentos();
    this.loadFiltroOptions();
  }

  private loadRecebimentos(): void {
    this.isLoading = true;
    
    this.recebimentosService.getRecebimentos().subscribe({
      next: (recebimentos) => {
        console.log('✅ Recebimentos carregados (progressive):', recebimentos);
        this.recebimentos = recebimentos;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar recebimentos (progressive):', error);
        this.isLoading = false;
      }
    });
  }

  private loadFiltroOptions(): void {
    this.recebimentosService.getFiltroOptions().subscribe({
      next: (options) => {
        console.log('✅ Opções de filtro carregadas (progressive):', options);
        this.filtroOptions = options;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar opções de filtro (progressive):', error);
      }
    });
  }

  private calculateTotals(): void {
    this.totalAmount = this.recebimentos.reduce((sum, r) => {
      const exchangeRate = r.exchange_rate || 1;
      return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
    }, 0);

    this.pendingAmount = this.recebimentos
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => {
        const exchangeRate = r.exchange_rate || 1;
        return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
      }, 0);

    this.completedAmount = this.recebimentos
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => {
        const exchangeRate = r.exchange_rate || 1;
        return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
      }, 0);
  }

  public formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  public formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  public getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'processing': return '#ff9800';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  }
}