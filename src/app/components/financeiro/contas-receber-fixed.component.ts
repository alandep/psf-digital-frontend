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
import { RecebimentoEditDialogComponent } from './recebimento-edit-dialog/recebimento-edit-dialog.component';
import { 
  Recebimento, 
  FiltroOptions,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../types/recebimentos';

@Component({
  selector: 'app-contas-receber-fixed',
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
      <!-- Header -->
      <div>
        <h1 style="display: flex; align-items: center; gap: 12px; color: #1976d2;">
          <mat-icon>trending_up</mat-icon>
          Contas a Receber (Fixed Template)
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

      <!-- Filtros (só renderiza quando filtroOptions estiver carregado) -->
      <mat-card *ngIf="filtroOptions" style="margin: 24px 0;">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>filter_list</mat-icon>
            Filtros Avançados
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filtroForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px;">
            
            <!-- Status -->
            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select formControlName="status" multiple>
                <mat-option *ngFor="let status of filtroOptions.statuses" [value]="status.value">
                  {{status.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Moeda -->
            <mat-form-field>
              <mat-label>Moeda</mat-label>
              <mat-select formControlName="currency" multiple>
                <mat-option *ngFor="let currency of filtroOptions.currencies" [value]="currency">
                  {{currency}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Método de Pagamento -->
            <mat-form-field>
              <mat-label>Método de Pagamento</mat-label>
              <mat-select formControlName="payment_method" multiple>
                <mat-option *ngFor="let method of filtroOptions.paymentMethods" [value]="method.value">
                  {{method.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Contrato -->
            <mat-form-field>
              <mat-label>Contrato</mat-label>
              <mat-select formControlName="contract" multiple>
                <mat-option *ngFor="let contract of filtroOptions.contracts" [value]="contract.id">
                  {{contract.number}} - {{contract.client_name}}
                </mat-option>
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

      <!-- Tabela de Recebimentos -->
      <mat-card *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title>
            Recebimentos 
            <mat-chip-listbox>
              <mat-chip>{{recebimentos.length}} total</mat-chip>
            </mat-chip-listbox>
          </mat-card-title>
          <div>
            <button mat-raised-button color="primary" (click)="openNewRecebimentoDialog()">
              <mat-icon>add</mat-icon>
              Novo Recebimento
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          
          <!-- Lista detalhada -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div *ngFor="let recebimento of recebimentos" 
                 style="padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa;">
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; align-items: center;">
                
                <!-- Valor -->
                <div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Valor</div>
                  <div style="font-weight: bold; font-size: 16px;">
                    {{formatCurrency(recebimento.amount, recebimento.currency)}}
                  </div>
                </div>

                <!-- Contrato -->
                <div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Contrato</div>
                  <div>{{getContractName(recebimento.contract)}}</div>
                </div>

                <!-- Data -->
                <div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Data de Pagamento</div>
                  <div>{{formatDate(recebimento.payment_date)}}</div>
                </div>

                <!-- Status -->
                <div>
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Status</div>
                  <mat-chip [style.background-color]="getStatusColor(recebimento.status)" 
                           [style.color]="'white'">
                    {{getStatusLabel(recebimento.status)}}
                  </mat-chip>
                </div>

              </div>

              <!-- Informações extras -->
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0; display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 16px; font-size: 14px; align-items: center;">
                <div><strong>Banco:</strong> {{recebimento.bank_name || 'N/A'}}</div>
                <div><strong>Método:</strong> {{getMethodLabel(recebimento.payment_method)}}</div>
                <div><strong>Taxa de Câmbio:</strong> {{recebimento.exchange_rate || 1 | number:'1.4-4'}}</div>
                
                <!-- Botões de Ação -->
                <div style="display: flex; gap: 8px;">
                  <button mat-icon-button 
                          color="primary" 
                          (click)="editRecebimento(recebimento)"
                          matTooltip="Editar recebimento">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button 
                          color="warn" 
                          (click)="deleteRecebimento(recebimento)"
                          matTooltip="Excluir recebimento">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Estado vazio -->
          <div *ngIf="recebimentos.length === 0" style="text-align: center; padding: 40px;">
            <mat-icon style="font-size: 48px; color: #ccc;">inbox</mat-icon>
            <h3>Nenhum recebimento encontrado</h3>
            <p>Não há recebimentos que atendam aos filtros aplicados.</p>
          </div>

        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: []
})
export class ContasReceberFixedComponent implements OnInit {
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
    console.log('🚀 ContasReceberFixedComponent inicializado!');
    
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
    console.log('📊 Carregando dados (fixed)...');
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Primeiro carregar opções de filtro
    this.recebimentosService.getFiltroOptions().subscribe({
      next: (options) => {
        console.log('✅ Opções de filtro carregadas (fixed):', options);
        this.filtroOptions = options;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar opções de filtro (fixed):', error);
      }
    });

    // Carregar recebimentos
    this.recebimentosService.getRecebimentos().subscribe({
      next: (recebimentos) => {
        console.log('✅ Recebimentos carregados (fixed):', recebimentos);
        this.recebimentos = recebimentos;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar recebimentos (fixed):', error);
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

  public formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  public getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }

  public getMethodLabel(method: string): string {
    return this.paymentMethodLabels[method as keyof typeof this.paymentMethodLabels] || method;
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

  public getContractName(contractId: string): string {
    if (!this.filtroOptions) return contractId;
    const contract = this.filtroOptions.contracts.find(c => c.id === contractId);
    return contract ? `${contract.number} - ${contract.client_name}` : contractId;
  }

  public openNewRecebimentoDialog(): void {
    console.log('🎯 Abrindo modal para novo recebimento...');
    
    const dialogRef = this.dialog.open(RecebimentoEditDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        recebimento: null, // null = novo recebimento
        filtroOptions: this.filtroOptions,
        isEditMode: false
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Novo recebimento criado:', result);
        this.snackBar.open('Recebimento criado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recarregar a lista
        this.loadData();
      }
    });
  }

  public editRecebimento(recebimento: Recebimento): void {
    console.log('✏️ Editando recebimento:', recebimento);
    
    const dialogRef = this.dialog.open(RecebimentoEditDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        recebimento: { ...recebimento }, // cópia para edição
        filtroOptions: this.filtroOptions,
        isEditMode: true
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Recebimento atualizado:', result);
        this.snackBar.open('Recebimento atualizado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Recarregar a lista
        this.loadData();
      }
    });
  }

  public deleteRecebimento(recebimento: Recebimento): void {
    if (confirm(`Tem certeza que deseja excluir o recebimento de ${this.formatCurrency(recebimento.amount, recebimento.currency)}?`)) {
      console.log('🗑️ Excluindo recebimento:', recebimento.id);
      
      // Implementar exclusão via service quando necessário
      this.snackBar.open('Funcionalidade de exclusão será implementada em breve', 'Fechar', {
        duration: 3000
      });
    }
  }
}