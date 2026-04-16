import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-novos-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <mat-icon class="header-icon">add_shopping_cart</mat-icon>
          <div class="header-text">
            <h1>Novos Pedidos de Exportação</h1>
            <p class="subtitle">Sistema inteligente para criação de pedidos de exportação</p>
          </div>
        </div>
      </div>

      <!-- Main Form -->
      <div class="form-container">
        <mat-card class="export-form-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>description</mat-icon>
              Novo Pedido de Exportação
            </mat-card-title>
            <mat-card-subtitle>
              Preencha os dados para criar um novo pedido de exportação
            </mat-card-subtitle>
          </mat-card-header>

          <form [formGroup]="exportForm" (ngSubmit)="onSubmit()" class="export-form">
            <mat-card-content>
              
              <!-- Seção: Informações Gerais -->
              <div class="form-section">
                <h3 class="section-title">
                  <mat-icon>info</mat-icon>
                  Informações Gerais
                </h3>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nome da Operação</mat-label>
                    <input matInput formControlName="operationName" 
                           placeholder="Ex: Exportação Soja - Safra 2024">
                    <mat-icon matSuffix>business</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Cliente/Importador</mat-label>
                    <mat-select formControlName="client">
                      <mat-option *ngFor="let client of clients" [value]="client.id">
                        {{client.name}} - {{client.country}}
                      </mat-option>
                    </mat-select>
                    <mat-icon matSuffix>person</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Data Prevista</mat-label>
                    <input matInput type="date" formControlName="expectedDate">
                    <mat-icon matSuffix>event</mat-icon>
                  </mat-form-field>
                </div>
              </div>

              <!-- Seção: Produto -->
              <div class="form-section">
                <h3 class="section-title">
                  <mat-icon>inventory_2</mat-icon>
                  Informações do Produto
                </h3>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Descrição do Produto</mat-label>
                    <input matInput formControlName="productDescription" 
                           placeholder="Ex: Soja em grão, tipo exportação">
                    <mat-icon matSuffix>agriculture</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Código NCM</mat-label>
                    <input matInput formControlName="ncmCode" 
                           placeholder="1201.90.00">
                    <mat-icon matSuffix>qr_code</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Quantidade</mat-label>
                    <input matInput type="number" formControlName="quantity" 
                           placeholder="1000">
                    <mat-icon matSuffix>straighten</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Unidade</mat-label>
                    <mat-select formControlName="unit">
                      <mat-option value="MT">MT (Toneladas Métricas)</mat-option>
                      <mat-option value="KG">KG (Quilogramas)</mat-option>
                      <mat-option value="TON">TON (Toneladas)</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>scale</mat-icon>
                  </mat-form-field>
                </div>
              </div>

              <!-- Seção: Termos Comerciais -->
              <div class="form-section">
                <h3 class="section-title">
                  <mat-icon>account_balance</mat-icon>
                  Termos Comerciais
                </h3>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Incoterm</mat-label>
                    <mat-select formControlName="incoterm">
                      <mat-option value="FOB">FOB - Free On Board</mat-option>
                      <mat-option value="CIF">CIF - Cost, Insurance & Freight</mat-option>
                      <mat-option value="CFR">CFR - Cost & Freight</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>local_shipping</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Moeda</mat-label>
                    <mat-select formControlName="currency">
                      <mat-option value="USD">USD - Dólar Americano</mat-option>
                      <mat-option value="EUR">EUR - Euro</mat-option>
                      <mat-option value="BRL">BRL - Real Brasileiro</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>attach_money</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Observações</mat-label>
                    <textarea matInput formControlName="observations" rows="3"
                              placeholder="Observações adicionais sobre o pedido..."></textarea>
                    <mat-icon matSuffix>notes</mat-icon>
                  </mat-form-field>
                </div>
              </div>

            </mat-card-content>

            <!-- Actions -->
            <mat-card-actions class="card-actions">
              <button type="button" mat-button (click)="onCancel()">
                <mat-icon>cancel</mat-icon>
                Cancelar
              </button>
              
              <button type="button" mat-raised-button color="accent" 
                      (click)="onSaveDraft()" [disabled]="saving">
                <mat-progress-spinner *ngIf="saving" diameter="16" class="button-spinner"></mat-progress-spinner>
                <mat-icon *ngIf="!saving">save</mat-icon>
                Salvar Rascunho
              </button>
              
              <button type="submit" mat-raised-button color="primary" 
                      [disabled]="!exportForm.valid || saving">
                <mat-progress-spinner *ngIf="submitting" diameter="16" class="button-spinner"></mat-progress-spinner>
                <mat-icon *ngIf="!submitting">send</mat-icon>
                Criar Pedido
              </button>
            </mat-card-actions>
          </form>
        </mat-card>

        <!-- Info Card -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>lightbulb</mat-icon>
              Sistema Inteligente
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="features-list">
              <div class="feature-item">
                <mat-icon color="primary">smart_toy</mat-icon>
                <span>IA para preenchimento automático</span>
              </div>
              <div class="feature-item">
                <mat-icon color="primary">verified_user</mat-icon>
                <span>Validação de compliance automática</span>
              </div>
              <div class="feature-item">
                <mat-icon color="primary">integration_instructions</mat-icon>
                <span>Integração com SISCOMEX</span>
              </div>
              <div class="feature-item">
                <mat-icon color="primary">analytics</mat-icon>
                <span>Análise de risco em tempo real</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f7fa;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 30px;
      color: white;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      opacity: 0.9;
    }

    .header-text h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 600;
    }

    .subtitle {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .form-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }

    .export-form-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      overflow: visible;
    }

    .export-form {
      width: 100%;
    }

    .form-section {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .form-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
      font-weight: 500;
    }

    .section-title mat-icon {
      color: #667eea;
    }

    .form-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(12, 1fr);
    }

    .full-width {
      grid-column: span 12;
    }

    .half-width {
      grid-column: span 6;
    }

    .third-width {
      grid-column: span 4;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .button-spinner {
      margin-right: 8px;
    }

    .info-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      height: fit-content;
    }

    .info-card mat-card-title {
      color: white;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }

    .feature-item mat-icon {
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      padding: 8px;
      color: white !important;
    }

    @media (max-width: 768px) {
      .form-container {
        grid-template-columns: 1fr;
      }
      
      .half-width,
      .third-width {
        grid-column: span 12;
      }
      
      .page-header {
        padding: 20px;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }
    }

    /* Angular Material Overrides */
    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-card {
      --mdc-elevated-card-container-elevation: 0 4px 20px rgba(0,0,0,0.08);
    }
    
    ::ng-deep .mat-mdc-raised-button:disabled {
      background-color: rgba(0,0,0,0.12);
    }
  `]
})
export class NovosPedidosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  exportForm: FormGroup;
  saving = false;
  submitting = false;

  clients = [
    { id: '1', name: 'Agro Import USA', country: 'Estados Unidos' },
    { id: '2', name: 'Euro Commodities', country: 'Alemanha' },
    { id: '3', name: 'Asia Trade Corp', country: 'China' },
    { id: '4', name: 'Brazilian Exports', country: 'Reino Unido' }
  ];

  constructor() {
    this.exportForm = this.fb.group({
      operationName: ['', [Validators.required]],
      client: ['', [Validators.required]],
      expectedDate: ['', [Validators.required]],
      productDescription: ['', [Validators.required]],
      ncmCode: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', [Validators.required]],
      incoterm: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      observations: ['']
    });
  }

  ngOnInit() {
    // Mock data initialization
    console.log('Novos Pedidos - Componente inicializado');
    
    // Auto-fill some demo data
    setTimeout(() => {
      this.exportForm.patchValue({
        operationName: 'Exportação Soja - Março 2024',
        productDescription: 'Soja em grão, tipo exportação',
        ncmCode: '1201.90.00',
        unit: 'MT',
        incoterm: 'FOB',
        currency: 'USD'
      });
    }, 1000);
  }

  onSaveDraft() {
    if (this.exportForm.valid) {
      this.saving = true;
      console.log('Salvando rascunho:', this.exportForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.saving = false;
        this.snackBar.open('Rascunho salvo com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snack']
        });
      }, 1500);
    }
  }

  onSubmit() {
    if (this.exportForm.valid) {
      this.submitting = true;
      console.log('Criando pedido:', this.exportForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.submitting = false;
        this.snackBar.open('Pedido de exportação criado com sucesso!', 'Fechar', {
          duration: 4000,
          panelClass: ['success-snack']
        });
        
        // Navigate back after success
        setTimeout(() => {
          this.router.navigate(['/home-logged']);
        }, 2000);
      }, 2000);
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snack']
      });
    }
  }

  onCancel() {
    this.router.navigate(['/home-logged']);
  }
}