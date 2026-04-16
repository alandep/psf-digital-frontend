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
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-novo-pedido',
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
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTableModule,
    MatExpansionModule
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <mat-icon class="header-icon">add_shopping_cart</mat-icon>
          <div class="header-text">
            <h1>Novo Pedido de Exportação</h1>
            <p class="subtitle">Sistema completo para criação de pedidos de exportação</p>
          </div>
        </div>
      </div>

      <!-- Stepper Principal -->
      <mat-card class="stepper-card">
        <mat-vertical-stepper #stepper [linear]="true">
          
          <!-- STEP 1: Informações Básicas -->
          <mat-step [stepControl]="informacoesBasicasForm" label="Informações Básicas" icon="info">
            <form [formGroup]="informacoesBasicasForm" class="step-form">
              <div class="step-content">
                <h3 class="step-title">
                  <mat-icon>business</mat-icon>
                  Dados Gerais da Exportação
                </h3>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Nome da Operação</mat-label>
                    <input matInput formControlName="nomeOperacao" 
                           placeholder="Ex: Exportação Soja - Safra 2025">
                    <mat-icon matSuffix>business</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Cliente/Importador</mat-label>
                    <mat-select formControlName="cliente">
                      <mat-option *ngFor="let cliente of clientes" [value]="cliente.id">
                        {{cliente.nome}} - {{cliente.pais}}
                      </mat-option>
                    </mat-select>
                    <mat-icon matSuffix>person</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Data Esperada de Embarque</mat-label>
                    <input matInput type="date" formControlName="dataEsperada">
                    <mat-icon matSuffix>event</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Prioridade</mat-label>
                    <mat-select formControlName="prioridade">
                      <mat-option value="baixa">Baixa</mat-option>
                      <mat-option value="media">Média</mat-option>
                      <mat-option value="alta">Alta</mat-option>
                      <mat-option value="urgente">Urgente</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>priority_high</mat-icon>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observações Gerais</mat-label>
                  <textarea matInput formControlName="observacoesGerais" rows="3"
                            placeholder="Informações adicionais sobre a operação..."></textarea>
                  <mat-icon matSuffix>notes</mat-icon>
                </mat-form-field>
              </div>
              
              <div class="step-actions">
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!informacoesBasicasForm.valid">
                  Próximo: Produtos
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- STEP 2: Produtos -->
          <mat-step [stepControl]="produtosForm" label="Produtos" icon="inventory">
            <form [formGroup]="produtosForm" class="step-form">
              <div class="step-content">
                <h3 class="step-title">
                  <mat-icon>inventory</mat-icon>
                  Especificação dos Produtos
                </h3>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Descrição do Produto</mat-label>
                    <input matInput formControlName="produtoDescricao" 
                           placeholder="Ex: Soja em grão para exportação">
                    <mat-icon matSuffix>agriculture</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>NCM</mat-label>
                    <input matInput formControlName="ncm" 
                           placeholder="1201.90.00">
                    <mat-icon matSuffix>qr_code</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Quantidade</mat-label>
                    <input matInput type="number" formControlName="quantidade" 
                           placeholder="1000">
                    <mat-icon matSuffix>straighten</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Unidade</mat-label>
                    <mat-select formControlName="unidade">
                      <mat-option value="MT">MT - Toneladas Métricas</mat-option>
                      <mat-option value="KG">KG - Quilogramas</mat-option>
                      <mat-option value="TON">TON - Toneladas</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>scale</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Valor Unitário (USD)</mat-label>
                    <input matInput type="number" formControlName="valorUnitario" 
                           placeholder="450.00">
                    <mat-icon matSuffix>attach_money</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Origem/Estado</mat-label>
                    <mat-select formControlName="origem">
                      <mat-option value="MT">Mato Grosso</mat-option>
                      <mat-option value="RS">Rio Grande do Sul</mat-option>
                      <mat-option value="PR">Paraná</mat-option>
                      <mat-option value="GO">Goiás</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>place</mat-icon>
                  </mat-form-field>
                </div>

                <!-- Resumo do Produto -->
                <mat-card class="produto-summary" *ngIf="produtosForm.valid">
                  <mat-card-header>
                    <mat-card-title>Resumo do Produto</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="summary-info">
                      <div class="info-item">
                        <strong>Total:</strong> {{ getTotalValue() | currency:'USD':'symbol':'1.2-2' }}
                      </div>
                      <div class="info-item">
                        <strong>Peso Total:</strong> {{ produtosForm.get('quantidade')?.value || 0 }} {{ produtosForm.get('unidade')?.value }}
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Anterior
                </button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!produtosForm.valid">
                  Próximo: Logística
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- STEP 3: Logística -->
          <mat-step [stepControl]="logisticaForm" label="Logística" icon="local_shipping">
            <form [formGroup]="logisticaForm" class="step-form">
              <div class="step-content">
                <h3 class="step-title">
                  <mat-icon>local_shipping</mat-icon>
                  Logística e Transporte
                </h3>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Incoterm</mat-label>
                    <mat-select formControlName="incoterm">
                      <mat-option value="FOB">FOB - Free On Board</mat-option>
                      <mat-option value="CIF">CIF - Cost, Insurance & Freight</mat-option>
                      <mat-option value="CFR">CFR - Cost & Freight</mat-option>
                      <mat-option value="EXW">EXW - Ex Works</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>local_shipping</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Porto de Embarque</mat-label>
                    <mat-select formControlName="portoEmbarque">
                      <mat-option value="santos">Porto de Santos - SP</mat-option>
                      <mat-option value="paranagua">Porto de Paranaguá - PR</mat-option>
                      <mat-option value="rio-grande">Porto do Rio Grande - RS</mat-option>
                      <mat-option value="vitoria">Porto de Vitória - ES</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>directions_boat</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Porto de Destino</mat-label>
                    <input matInput formControlName="portoDestino" 
                           placeholder="Ex: Port of Hamburg">
                    <mat-icon matSuffix>flight_land</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Tipo de Transporte</mat-label>
                    <mat-select formControlName="tipoTransporte">
                      <mat-option value="maritimo">Marítimo</mat-option>
                      <mat-option value="aereo">Aéreo</mat-option>
                      <mat-option value="rodoviario">Rodoviário</mat-option>
                      <mat-option value="ferroviario">Ferroviário</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>commute</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Empresa Transportadora</mat-label>
                    <input matInput formControlName="transportadora" 
                           placeholder="Nome da transportadora">
                    <mat-icon matSuffix>business</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Estimativa de Frete (USD)</mat-label>
                    <input matInput type="number" formControlName="estimativaFrete" 
                           placeholder="5000.00">
                    <mat-icon matSuffix>attach_money</mat-icon>
                  </mat-form-field>
                </div>
              </div>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Anterior
                </button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!logisticaForm.valid">
                  Próximo: Documentação
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- STEP 4: Documentação -->
          <mat-step [stepControl]="documentacaoForm" label="Documentação" icon="description">
            <form [formGroup]="documentacaoForm" class="step-form">
              <div class="step-content">
                <h3 class="step-title">
                  <mat-icon>description</mat-icon>
                  Documentos Necessários
                </h3>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Moeda de Negociação</mat-label>
                    <mat-select formControlName="moeda">
                      <mat-option value="USD">USD - Dólar Americano</mat-option>
                      <mat-option value="EUR">EUR - Euro</mat-option>
                      <mat-option value="BRL">BRL - Real Brasileiro</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>currency_exchange</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Forma de Pagamento</mat-label>
                    <mat-select formControlName="formaPagamento">
                      <mat-option value="carta-credito">Carta de Crédito</mat-option>
                      <mat-option value="cobranca-documentaria">Cobrança Documentária</mat-option>
                      <mat-option value="pagamento-direto">Pagamento Direto</mat-option>
                      <mat-option value="antecipado">Pagamento Antecipado</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>payment</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Prazo de Pagamento (dias)</mat-label>
                    <input matInput type="number" formControlName="prazoPagamento" 
                           placeholder="30">
                    <mat-icon matSuffix>schedule</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Banco do Importador</mat-label>
                    <input matInput formControlName="bancoImportador" 
                           placeholder="Nome do banco">
                    <mat-icon matSuffix>account_balance</mat-icon>
                  </mat-form-field>
                </div>

                <!-- Checklist de Documentos -->
                <div class="documents-checklist">
                  <h4>Documentos Necessários</h4>
                  <div class="checklist-grid">
                    <mat-checkbox formControlName="faturaComercial">
                      Fatura Comercial (Commercial Invoice)
                    </mat-checkbox>
                    <mat-checkbox formControlName="conhecimentoEmbarque">
                      Conhecimento de Embarque (B/L)
                    </mat-checkbox>
                    <mat-checkbox formControlName="certificadoOrigem">
                      Certificado de Origem
                    </mat-checkbox>
                    <mat-checkbox formControlName="licencaExportacao">
                      Licença de Exportação
                    </mat-checkbox>
                    <mat-checkbox formControlName="certificadoFitossanitario">
                      Certificado Fitossanitário
                    </mat-checkbox>
                    <mat-checkbox formControlName="apoliceSeguro">
                      Apólice de Seguro
                    </mat-checkbox>
                  </div>
                </div>
              </div>
              
              <div class="step-actions">
                <button mat-button matStepperPrevious>
                  <mat-icon>arrow_back</mat-icon>
                  Anterior
                </button>
                <button mat-raised-button color="primary" matStepperNext 
                        [disabled]="!documentacaoForm.valid">
                  Próximo: Revisão
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- STEP 5: Revisão e Confirmação -->
          <mat-step label="Revisão" icon="check_circle">
            <div class="step-content">
              <h3 class="step-title">
                <mat-icon>check_circle</mat-icon>
                Revisão Final do Pedido
              </h3>

              <div class="review-sections">
                <!-- Resumo Informações Básicas -->
                <mat-expansion-panel class="review-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>info</mat-icon>
                      Informações Básicas
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  <div class="review-content">
                    <div class="info-grid">
                      <div class="info-item">
                        <strong>Operação:</strong> {{ informacoesBasicasForm.get('nomeOperacao')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Cliente:</strong> {{ getClienteNome() }}
                      </div>
                      <div class="info-item">
                        <strong>Data Esperada:</strong> {{ informacoesBasicasForm.get('dataEsperada')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Prioridade:</strong> {{ informacoesBasicasForm.get('prioridade')?.value }}
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>

                <!-- Resumo Produtos -->
                <mat-expansion-panel class="review-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>inventory</mat-icon>
                      Produtos
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  <div class="review-content">
                    <div class="info-grid">
                      <div class="info-item">
                        <strong>Produto:</strong> {{ produtosForm.get('produtoDescricao')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>NCM:</strong> {{ produtosForm.get('ncm')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Quantidade:</strong> {{ produtosForm.get('quantidade')?.value }} {{ produtosForm.get('unidade')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Valor Total:</strong> {{ getTotalValue() | currency:'USD':'symbol':'1.2-2' }}
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>

                <!-- Resumo Logística -->
                <mat-expansion-panel class="review-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>local_shipping</mat-icon>
                      Logística
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  <div class="review-content">
                    <div class="info-grid">
                      <div class="info-item">
                        <strong>Incoterm:</strong> {{ logisticaForm.get('incoterm')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Porto Embarque:</strong> {{ logisticaForm.get('portoEmbarque')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Porto Destino:</strong> {{ logisticaForm.get('portoDestino')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Transporte:</strong> {{ logisticaForm.get('tipoTransporte')?.value }}
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>

                <!-- Resumo Documentação -->
                <mat-expansion-panel class="review-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon>description</mat-icon>
                      Documentação
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  <div class="review-content">
                    <div class="info-grid">
                      <div class="info-item">
                        <strong>Moeda:</strong> {{ documentacaoForm.get('moeda')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Forma Pagamento:</strong> {{ documentacaoForm.get('formaPagamento')?.value }}
                      </div>
                      <div class="info-item">
                        <strong>Prazo:</strong> {{ documentacaoForm.get('prazoPagamento')?.value }} dias
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>
              </div>

              <!-- Status Validation -->
              <mat-card class="validation-card" [ngClass]="{
                'valid': getAllFormsValid(),
                'invalid': !getAllFormsValid()
              }">
                <mat-card-content>
                  <div class="validation-status">
                    <mat-icon [ngClass]="getAllFormsValid() ? 'valid-icon' : 'invalid-icon'">
                      {{ getAllFormsValid() ? 'check_circle' : 'error' }}
                    </mat-icon>
                    <span class="status-text">
                      {{ getAllFormsValid() ? 'Pedido válido e pronto para submissão' : 'Por favor, complete todos os campos obrigatórios' }}
                    </span>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            
            <div class="step-actions final-actions">
              <button mat-button matStepperPrevious>
                <mat-icon>arrow_back</mat-icon>
                Anterior
              </button>
              
              <button mat-raised-button color="accent" 
                      (click)="onSalvarRascunho()" [disabled]="salvando">
                <mat-progress-spinner *ngIf="salvando" diameter="16" class="spinner"></mat-progress-spinner>
                <mat-icon *ngIf="!salvando">save</mat-icon>
                Salvar Rascunho
              </button>
              
              <button mat-raised-button color="primary" 
                      (click)="onSubmit()" [disabled]="!getAllFormsValid() || criando">
                <mat-progress-spinner *ngIf="criando" diameter="16" class="spinner"></mat-progress-spinner>
                <mat-icon *ngIf="!criando">send</mat-icon>
                Criar Pedido de Exportação
              </button>
            </div>
          </mat-step>

        </mat-vertical-stepper>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f7fa;
      min-height: 100vh;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 32px;
      color: white;
      margin-bottom: 32px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.9;
    }

    .header-text h1 {
      margin: 0 0 8px 0;
      font-size: 36px;
      font-weight: 600;
    }

    .subtitle {
      margin: 0;
      font-size: 18px;
      opacity: 0.9;
    }

    .stepper-card {
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .step-form {
      width: 100%;
    }

    .step-content {
      padding: 24px;
      min-height: 400px;
    }

    .step-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 32px 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .step-title mat-icon {
      color: #667eea;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding: 24px;
      border-top: 1px solid #e0e0e0;
      background-color: #fafafa;
    }

    .final-actions {
      justify-content: space-between;
    }

    .spinner {
      margin-right: 8px;
    }

    .produto-summary {
      margin-top: 24px;
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%);
      border: 1px solid #4caf50;
    }

    .summary-info {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .documents-checklist {
      margin-top: 32px;
    }

    .documents-checklist h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 18px;
    }

    .checklist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
    }

    .review-sections {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .review-panel {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .review-content {
      padding: 16px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .validation-card {
      margin-top: 24px;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .validation-card.valid {
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%);
      border: 2px solid #4caf50;
    }

    .validation-card.invalid {
      background: linear-gradient(135deg, #ffeaea 0%, #fff5f5 100%);
      border: 2px solid #f44336;
    }

    .validation-status {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .valid-icon {
      color: #4caf50;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .invalid-icon {
      color: #f44336;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .status-text {
      font-size: 18px;
      font-weight: 500;
    }

    /* Stepper customization */
    ::ng-deep .mat-stepper-vertical {
      background: transparent;
    }

    ::ng-deep .mat-step-header {
      cursor: pointer;
      padding: 16px 24px;
    }

    ::ng-deep .mat-step-header:hover {
      background-color: rgba(102, 126, 234, 0.05);
    }

    ::ng-deep .mat-step-icon {
      background-color: #667eea !important;
      color: white !important;
    }

    ::ng-deep .mat-step-icon-selected {
      background-color: #4caf50 !important;
    }

    ::ng-deep .mat-step-label {
      font-size: 16px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .page-header {
        padding: 24px;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .step-content {
        padding: 16px;
      }
      
      .step-actions {
        flex-direction: column;
        align-items: stretch;
      }
      
      .final-actions {
        flex-direction: column;
      }

      .summary-info {
        flex-direction: column;
        gap: 16px;
      }
    }

    /* Material overrides */
    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-expansion-panel-header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    ::ng-deep .mat-expansion-panel-header-title mat-icon {
      color: #667eea;
    }
  `]
})
export class NovoPedidoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Formulários para cada step
  informacoesBasicasForm: FormGroup;
  produtosForm: FormGroup;
  logisticaForm: FormGroup;
  documentacaoForm: FormGroup;

  salvando = false;
  criando = false;

  clientes = [
    { id: '1', nome: 'Agro Import Corporation', pais: 'Estados Unidos' },
    { id: '2', nome: 'Euro Commodities GmbH', pais: 'Alemanha' },
    { id: '3', nome: 'Asia Trade Limited', pais: 'China' },
    { id: '4', nome: 'Brasil Export Partners', pais: 'Reino Unido' },
    { id: '5', nome: 'Mediterranean Grains SA', pais: 'Espanha' },
    { id: '6', nome: 'Nordic Food Industries AS', pais: 'Noruega' }
  ];

  constructor() {
    this.initializeForms();
  }

  ngOnInit() {
    console.log('Novo Pedido (Stepper) - Componente inicializado');
    
    // Auto-preenchimento para demonstração
    setTimeout(() => {
      this.informacoesBasicasForm.patchValue({
        nomeOperacao: 'Exportação Soja Premium - Safra 2025',
        prioridade: 'alta'
      });

      this.produtosForm.patchValue({
        produtoDescricao: 'Soja em grão, qualidade premium para exportação',
        ncm: '1201.90.00',
        unidade: 'MT',
        valorUnitario: 450,
        origem: 'MT'
      });

      this.logisticaForm.patchValue({
        incoterm: 'FOB',
        portoEmbarque: 'santos',
        tipoTransporte: 'maritimo'
      });

      this.documentacaoForm.patchValue({
        moeda: 'USD',
        formaPagamento: 'carta-credito',
        prazoPagamento: 30
      });
    }, 1500);
  }

  private initializeForms(): void {
    // Form 1: Informações Básicas
    this.informacoesBasicasForm = this.fb.group({
      nomeOperacao: ['', [Validators.required, Validators.minLength(5)]],
      cliente: ['', [Validators.required]],
      dataEsperada: ['', [Validators.required]],
      prioridade: ['', [Validators.required]],
      observacoesGerais: ['']
    });

    // Form 2: Produtos
    this.produtosForm = this.fb.group({
      produtoDescricao: ['', [Validators.required, Validators.minLength(10)]],
      ncm: ['', [Validators.required, Validators.pattern(/^\d{4}\.\d{2}\.\d{2}$/)]],
      quantidade: ['', [Validators.required, Validators.min(1)]],
      unidade: ['', [Validators.required]],
      valorUnitario: ['', [Validators.required, Validators.min(0.01)]],
      origem: ['', [Validators.required]]
    });

    // Form 3: Logística
    this.logisticaForm = this.fb.group({
      incoterm: ['', [Validators.required]],
      portoEmbarque: ['', [Validators.required]],
      portoDestino: ['', [Validators.required]],
      tipoTransporte: ['', [Validators.required]],
      transportadora: [''],
      estimativaFrete: ['', [Validators.min(0)]]
    });

    // Form 4: Documentação
    this.documentacaoForm = this.fb.group({
      moeda: ['', [Validators.required]],
      formaPagamento: ['', [Validators.required]],
      prazoPagamento: ['', [Validators.required, Validators.min(1)]],
      bancoImportador: [''],
      // Checkboxes para documentos
      faturaComercial: [true],
      conhecimentoEmbarque: [true],
      certificadoOrigem: [false],
      licencaExportacao: [true],
      certificadoFitossanitario: [false],
      apoliceSeguro: [false]
    });
  }

  // Funções auxiliares
  getTotalValue(): number {
    const quantidade = this.produtosForm.get('quantidade')?.value || 0;
    const valorUnitario = this.produtosForm.get('valorUnitario')?.value || 0;
    return quantidade * valorUnitario;
  }

  getClienteNome(): string {
    const clienteId = this.informacoesBasicasForm.get('cliente')?.value;
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nome} - ${cliente.pais}` : '';
  }

  getAllFormsValid(): boolean {
    return this.informacoesBasicasForm.valid &&
           this.produtosForm.valid &&
           this.logisticaForm.valid &&
           this.documentacaoForm.valid;
  }

  // Função para compilar todos os dados
  getAllFormData(): any {
    return {
      informacoesBasicas: this.informacoesBasicasForm.value,
      produtos: this.produtosForm.value,
      logistica: this.logisticaForm.value,
      documentacao: this.documentacaoForm.value,
      valorTotal: this.getTotalValue(),
      timestamp: new Date().toISOString()
    };
  }

  onSalvarRascunho() {
    this.salvando = true;
    const dadosCompletos = this.getAllFormData();
    console.log('Salvando rascunho (stepper):', dadosCompletos);
    
    setTimeout(() => {
      this.salvando = false;
      this.snackBar.open('Rascunho salvo com sucesso! Todas as informações foram preservadas.', 'Fechar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
    }, 1500);
  }

  onSubmit() {
    if (this.getAllFormsValid()) {
      this.criando = true;
      const dadosCompletos = this.getAllFormData();
      console.log('Criando pedido de exportação completo:', dadosCompletos);
      
      setTimeout(() => {
        this.criando = false;
        this.snackBar.open('🎉 Pedido de exportação criado com sucesso! Todas as etapas foram concluídas.', 'Fechar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => {
          this.router.navigate(['/home-logged']);
        }, 2500);
      }, 3000);
    } else {
      // Identificar quais forms estão inválidos
      const formsStatus = {
        'Informações Básicas': this.informacoesBasicasForm.valid,
        'Produtos': this.produtosForm.valid,
        'Logística': this.logisticaForm.valid,
        'Documentação': this.documentacaoForm.valid
      };
      
      const invalidForms = Object.entries(formsStatus)
        .filter(([_, valid]) => !valid)
        .map(([name, _]) => name);
      
      this.snackBar.open(`Por favor, complete as seções: ${invalidForms.join(', ')}`, 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onCancel() {
    this.router.navigate(['/home-logged']);
  }
}