import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-revisao-confirmacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatCheckboxModule,
    CurrencyPipe
  ],
  template: `
    <div class="revisao-container">
      <mat-card class="revisao-card">
        <mat-card-header>
          <div mat-card-avatar class="revisao-avatar">
            <mat-icon>check_circle</mat-icon>
          </div>
          <mat-card-title>Revisão Final</mat-card-title>
          <mat-card-subtitle>Revise todas as informações antes de submeter o pedido</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="form" class="revisao-form">
            
            <!-- Resumo Executivo -->
            <mat-card class="summary-executive">
              <mat-card-header>
                <mat-card-title>Resumo Executivo</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="executive-grid">
                  <div class="exec-item">
                    <mat-icon>inventory_2</mat-icon>
                    <div class="exec-content">
                      <span class="exec-label">Produto</span>
                      <span class="exec-value">{{ getProductName() }}</span>
                    </div>
                  </div>
                  
                  <div class="exec-item">
                    <mat-icon>public</mat-icon>
                    <div class="exec-content">
                      <span class="exec-label">Destino</span>
                      <span class="exec-value">{{ getDestination() }}</span>
                    </div>
                  </div>
                  
                  <div class="exec-item">
                    <mat-icon>monetization_on</mat-icon>
                    <div class="exec-content">
                      <span class="exec-label">Valor Total</span>
                      <span class="exec-value">{{ getTotalValue() | currency:'USD':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>
                  
                  <div class="exec-item">
                    <mat-icon>local_shipping</mat-icon>
                    <div class="exec-content">
                      <span class="exec-label">Transporte</span>
                      <span class="exec-value">{{ getTransportMode() }}</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
            
            <!-- Detalhes por Seção -->
            <mat-accordion class="details-accordion">
              <!-- Informações Básicas -->
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>info</mat-icon>
                    Informações Básicas
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ getSectionStatus(0) ? 'Completo' : 'Incompleto' }}
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="section-content">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <strong>Número:</strong> {{ data[0]?.exportNumber || 'N/A' }}
                    </div>
                    <div class="detail-item">
                      <strong>Tipo:</strong> {{ data[0]?.exportType || 'N/A' }}
                    </div>
                    <div class="detail-item">
                      <strong>Prioridade:</strong> {{ data[0]?.priority || 'N/A' }}
                    </div>
                    <div class="detail-item">
                      <strong>Responsável:</strong> {{ data[0]?.responsible || 'N/A' }}
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
              
              <!-- Produtos -->
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>inventory_2</mat-icon>
                    Produtos
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ getSectionStatus(1) ? 'Completo' : 'Incompleto' }}
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="section-content">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <strong>Produto:</strong> {{ data[1]?.productId || 'N/A' }}
                    </div>
                    <div class="detail-item">
                      <strong>Quantidade:</strong> {{ data[1]?.quantity || 0 }} {{ data[1]?.unit || '' }}
                    </div>
                    <div class="detail-item">
                      <strong>Preço Unit.:</strong> {{ data[1]?.unitPrice | currency:'USD':'symbol':'1.2-2' }}
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
              
              <!-- Logística -->
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>local_shipping</mat-icon>
                    Logística
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ getSectionStatus(2) ? 'Completo' : 'Incompleto' }}
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="section-content">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <strong>Origem:</strong> {{ data[2]?.portOrigin || 'N/A' }}
                    </div>
                    <div class="detail-item">
                      <strong>Destino:</strong> {{ data[2]?.portDestination || 'N/A' }}
                    </div>
                    <div class="detail-item">
                      <strong>Modo:</strong> {{ data[2]?.transportMode || 'N/A' }}
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
              
              <!-- Documentação -->
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>description</mat-icon>
                    Documentação
                  </mat-panel-title>
                  <mat-panel-description>
                    {{ getSectionStatus(3) ? 'Completo' : 'Incompleto' }}
                  </mat-panel-description>
                </mat-expansion-panel-header>
                
                <div class="section-content">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <strong>DUE:</strong> {{ data[3]?.dueNumber || 'N/A' }}
                    </div>
                    <div class="detail-item">
                      <strong>Invoice:</strong> {{ data[3]?.invoiceNumber || 'N/A' }}
                    </div>
                    <div class="detail-item">
                      <strong>Packing List:</strong> {{ data[3]?.packingList || 'N/A' }}
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </mat-accordion>
            
            <!-- Confirmações -->
            <mat-card class="confirmations-card">
              <mat-card-header>
                <mat-card-title>Confirmações</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="confirmations-list">
                  <mat-checkbox formControlName="dataAccuracy" required>
                    Confirmo que todas as informações estão corretas e precisas
                  </mat-checkbox>
                  
                  <mat-checkbox formControlName="termsAccepted" required>
                    Aceito os termos e condições para exportação
                  </mat-checkbox>
                  
                  <mat-checkbox formControlName="complianceConfirmed" required>
                    Confirmo conformidade com regulamentações de comércio exterior
                  </mat-checkbox>
                </div>
              </mat-card-content>
            </mat-card>
            
            <!-- Status Final -->
            <div class="final-status">
              <mat-card [class]="getStatusCardClass()">
                <mat-card-content>
                  <div class="status-content">
                    <mat-icon>{{ getStatusIcon() }}</mat-icon>
                    <div class="status-text">
                      <h3>{{ getStatusTitle() }}</h3>
                      <p>{{ getStatusDescription() }}</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .revisao-container {
      padding: 0;
    }
    
    .revisao-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .revisao-avatar {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
      color: white;
    }
    
    .summary-executive {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      margin-bottom: 24px;
    }
    
    .executive-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .exec-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      
      mat-icon {
        color: #1976d2;
        font-size: 24px;
      }
      
      .exec-content {
        display: flex;
        flex-direction: column;
        
        .exec-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        
        .exec-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }
    }
    
    .details-accordion {
      margin-bottom: 24px;
    }
    
    .section-content {
      padding: 16px 0;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    
    .detail-item {
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 14px;
    }
    
    .confirmations-card {
      background: #fff3e0;
      margin-bottom: 24px;
    }
    
    .confirmations-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .final-status {
      .status-ready {
        background: #e8f5e8;
        border: 2px solid #4caf50;
      }
      
      .status-pending {
        background: #fff3e0;
        border: 2px solid #ff9800;
      }
    }
    
    .status-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      mat-icon {
        font-size: 32px;
        
        &.ready { color: #4caf50; }
        &.pending { color: #ff9800; }
      }
    }
  `]
})
export class RevisaoConfirmacaoComponent implements OnInit {
  @Input() data: any = {};
  @Output() dataChanged = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  
  form!: FormGroup;
  
  ngOnInit(): void {
    this.initializeForm();
    this.setupFormObservers();
  }
  
  private initializeForm(): void {
    this.form = this.fb.group({
      dataAccuracy: [false, Validators.requiredTrue],
      termsAccepted: [false, Validators.requiredTrue],
      complianceConfirmed: [false, Validators.requiredTrue]
    });
    
    if (this.data[4]) {
      this.form.patchValue(this.data[4]);
    }
  }
  
  private setupFormObservers(): void {
    this.form.valueChanges.subscribe(() => {
      this.emitFormData();
    });
  }
  
  private emitFormData(): void {
    const formData = {
      ...this.form.value,
      isValid: this.form.valid && this.allSectionsComplete()
    };
    
    this.dataChanged.emit(formData);
  }
  
  // Utilitários para exibição
  getProductName(): string {
    return this.data[1]?.productId || 'Produto não selecionado';
  }
  
  getDestination(): string {
    return this.data[0]?.destinationCountry || 'Destino não definido';
  }
  
  getTotalValue(): number {
    const quantity = this.data[1]?.quantity || 0;
    const unitPrice = this.data[1]?.unitPrice || 0;
    return quantity * unitPrice;
  }
  
  getTransportMode(): string {
    return this.data[2]?.transportMode || 'Não definido';
  }
  
  getSectionStatus(sectionIndex: number): boolean {
    return this.data[sectionIndex]?.isValid || false;
  }
  
  allSectionsComplete(): boolean {
    for (let i = 0; i < 4; i++) {
      if (!this.getSectionStatus(i)) return false;
    }
    return true;
  }
  
  getStatusCardClass(): string {
    return this.form.valid && this.allSectionsComplete() ? 'status-ready' : 'status-pending';
  }
  
  getStatusIcon(): string {
    return this.form.valid && this.allSectionsComplete() ? 'check_circle' : 'warning';
  }
  
  getStatusTitle(): string {
    return this.form.valid && this.allSectionsComplete() 
      ? 'Pronto para Submeter' 
      : 'Aguardando Confirmação';
  }
  
  getStatusDescription(): string {
    if (this.form.valid && this.allSectionsComplete()) {
      return 'Todos os dados foram preenchidos e confirmados. O pedido está pronto para ser submetido.';
    }
    return 'Complete todas as etapas e marque as confirmações para prosseguir.';
  }
}