import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecebimentosMockService } from '../../../services/recebimentosMockService';
import { 
  Recebimento, 
  FiltroOptions,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../types/recebimentos';

@Component({
  selector: 'app-contas-receber-simple',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div style="padding: 24px;">
      <!-- Header -->
      <div>
        <h1 style="display: flex; align-items: center; gap: 12px; color: #1976d2;">
          <mat-icon>trending_up</mat-icon>
          Contas a Receber
        </h1>
        <p>Gestão completa de recebimentos e controle cambial</p>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" style="display: flex; flex-direction: column; align-items: center; padding: 40px;">
        <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
        <p>Carregando recebimentos...</p>
      </div>

      <!-- KPIs Simples -->
      <mat-card *ngIf="!isLoading" style="margin: 24px 0;">
        <mat-card-header>
          <mat-card-title>Resumo</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div>
              <strong>Total Geral:</strong> 
              {{formatCurrency(totalAmount, 'BRL')}}
            </div>
            <div>
              <strong>Total Recebimentos:</strong> 
              {{recebimentos.length}}
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Lista Simples -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title>Recebimentos ({{recebimentos.length}})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let recebimento of recebimentos" style="padding: 8px; border-bottom: 1px solid #eee;">
            <strong>{{formatCurrency(recebimento.amount, recebimento.currency)}}</strong> 
            - {{recebimento.contract}}
            - {{formatDate(recebimento.payment_date)}}
            - <span [style.color]="getStatusColor(recebimento.status)">{{getStatusLabel(recebimento.status)}}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Estado vazio -->
      <div *ngIf="!isLoading && recebimentos.length === 0" style="text-align: center; padding: 40px;">
        <mat-icon style="font-size: 48px; color: #ccc;">inbox</mat-icon>
        <h3>Nenhum recebimento encontrado</h3>
        <p>Não há recebimentos cadastrados.</p>
      </div>
    </div>
  `,
  styles: []
})
export class ContasReceberSimpleComponent implements OnInit {
  private readonly recebimentosService = inject(RecebimentosMockService);

  public recebimentos: Recebimento[] = [];
  public isLoading = false;
  public totalAmount = 0;
  public readonly statusLabels = STATUS_LABELS;
  
  constructor() {
    console.log('🚀 ContasReceberSimpleComponent inicializado!');
  }

  ngOnInit(): void {
    console.log('📊 Carregando dados...');
    this.loadRecebimentos();
  }

  private loadRecebimentos(): void {
    this.isLoading = true;
    
    this.recebimentosService.getRecebimentos().subscribe({
      next: (recebimentos) => {
        console.log('✅ Recebimentos carregados:', recebimentos);
        this.recebimentos = recebimentos;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar recebimentos:', error);
        this.isLoading = false;
      }
    });
  }

  private calculateTotals(): void {
    this.totalAmount = this.recebimentos.reduce((sum, r) => {
      // Converter para BRL usando taxa de câmbio
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