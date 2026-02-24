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
import { RecebimentosMockService } from '../../../services/recebimentosMockService';
import { 
  Recebimento, 
  FiltroOptions,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../types/recebimentos';

@Component({
  selector: 'app-contas-receber-inline',
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
    MatBadgeModule
  ],
  template: `
    <div style="padding: 24px;">
      <h1>
        <mat-icon>trending_up</mat-icon>
        Contas a Receber (Inline Template Test)
      </h1>
      
      <!-- KPIs simplificados -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0;">
        <mat-card>
          <mat-card-content>
            <mat-icon>account_balance</mat-icon>
            <div>Total: {{formatCurrency(totalAmount, 'BRL')}}</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <mat-icon>schedule</mat-icon>
            <div>Pendente: {{formatCurrency(pendingAmount, 'BRL')}}</div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content>
            <mat-icon>check_circle</mat-icon>
            <div>Recebido: {{formatCurrency(completedAmount, 'BRL')}}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading">
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>Carregando...</p>
      </div>

      <!-- Lista simplificada -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title>Recebimentos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let recebimento of recebimentos">
            {{formatCurrency(recebimento.amount, recebimento.currency)}} - 
            {{recebimento.contract}} - 
            {{getStatusLabel(recebimento.status)}}
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class ContasReceberInlineComponent implements OnInit {
  private readonly recebimentosService = inject(RecebimentosMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

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
    console.log('🚀 ContasReceberInlineComponent inicializado!');
    
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
    console.log('📊 Carregando dados (inline)...');
    this.loadRecebimentos();
  }

  private loadRecebimentos(): void {
    this.isLoading = true;
    
    this.recebimentosService.getRecebimentos().subscribe({
      next: (recebimentos) => {
        console.log('✅ Recebimentos carregados (inline):', recebimentos);
        this.recebimentos = recebimentos;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar recebimentos (inline):', error);
        this.isLoading = false;
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

  public getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }
}