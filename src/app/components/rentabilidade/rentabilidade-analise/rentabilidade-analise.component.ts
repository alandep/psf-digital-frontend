import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService } from '../../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

export interface AnaliseRentabilidade {
  id: string;
  exportacaoId: string;
  produto: string;
  quantidade: number;
  precoVendaUsd: number;
  precoCompraBrl: number;
  freteInternacionalUsd: number;
  freteNacionalBrl: number;
  taxasPortuarias: number;
  taxasGovernamentais: number;
  custoArmazenagem: number;
  taxaCambioAtual: number;
  taxaCambioPrevista: number;
  
  // Campos calculados
  receitaTotalBrl: number;
  custoTotalBrl: number;
  lucroBrutoBrl: number;
  margemLucro: number;
  scoreRentabilidade: number;
  scoreRisco: number;
  confiabilidadePrevisao: number;
  
  // Análise qualitativa
  pontosPositivos: string[];
  pontosNegativos: string[];
  recomendacao: string;
  
  dataAnalise: Date;
}

export interface ScenarioSimulation {
  id: string;
  nome: string;
  parametros: {
    variationCambio?: number;
    variationFrete?: number;
    variationCommodity?: number;
    atrasoEmbarque?: number;
  };
  resultado: {
    novaRentabilidade: number;
    impactoLucro: number;
    novoScore: number;
  };
}

@Component({
  selector: 'app-rentabilidade-analise',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="rentabilidade-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>analytics</mat-icon>
          Análise de Rentabilidade
        </h1>
        <p>Motor de IA para análise inteligente de exportações</p>
      </div>

      <!-- Cards Container -->
      <div class="main-content">
        
        <!-- Card Principal -->
        <mat-card class="analysis-card">
          <mat-tab-group class="analysis-tabs">
            
            <!-- Aba Nova Análise -->
            <mat-tab label="Nova Análise">
              <div class="tab-content">
                <form [formGroup]="analysisForm" class="analysis-form">
                  
                  <!-- Dados Base -->
                  <div class="form-section">
                    <h3>
                      <mat-icon>inventory</mat-icon>
                      Dados da Exportação
                    </h3>
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Exportação ID</mat-label>
                        <mat-icon matPrefix>tag</mat-icon>
                        <input matInput formControlName="exportacaoId">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Produto</mat-label>
                        <mat-icon matPrefix>category</mat-icon>
                        <mat-select formControlName="produto">
                          <mat-option value="soja">Soja</mat-option>
                          <mat-option value="milho">Milho</mat-option>
                          <mat-option value="cafe">Café</mat-option>
                          <mat-option value="acucar">Açúcar</mat-option>
                          <mat-option value="carne">Carne</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Quantidade (Ton)</mat-label>
                        <mat-icon matPrefix>scale</mat-icon>
                        <input matInput type="number" step="0.001" formControlName="quantidade">
                      </mat-form-field>
                    </div>
                  </div>

                  <!-- Preços -->
                  <div class="form-section">
                    <h3>
                      <mat-icon>attach_money</mat-icon>
                      Preços e Valores
                    </h3>
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Preço Venda (USD/Ton)</mat-label>
                        <mat-icon matPrefix>trending_up</mat-icon>
                        <input matInput type="number" step="0.01" formControlName="precoVendaUsd">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Preço Compra (BRL/Ton)</mat-label>
                        <mat-icon matPrefix>trending_down</mat-icon>
                        <input matInput type="number" step="0.01" formControlName="precoCompraBrl">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Taxa Câmbio Atual</mat-label>
                        <mat-icon matPrefix>currency_exchange</mat-icon>
                        <input matInput type="number" step="0.0001" formControlName="taxaCambioAtual">
                      </mat-form-field>
                    </div>
                  </div>

                  <!-- Custos -->
                  <div class="form-section">
                    <h3>
                      <mat-icon>local_shipping</mat-icon>
                      Custos Operacionais
                    </h3>
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Frete Internacional (USD)</mat-label>
                        <mat-icon matPrefix>flight</mat-icon>
                        <input matInput type="number" step="0.01" formControlName="freteInternacionalUsd">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Frete Nacional (BRL)</mat-label>
                        <mat-icon matPrefix>local_shipping</mat-icon>
                        <input matInput type="number" step="0.01" formControlName="freteNacionalBrl">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Taxas Portuárias (BRL)</mat-label>
                        <mat-icon matPrefix>anchor</mat-icon>
                        <input matInput type="number" step="0.01" formControlName="taxasPortuarias">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Taxas Governamentais (BRL)</mat-label>
                        <mat-icon matPrefix>gavel</mat-icon>
                        <input matInput type="number" step="0.01" formControlName="taxasGovernamentais">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Custo Armazenagem (BRL)</mat-label>
                        <mat-icon matPrefix>warehouse</mat-icon>
                        <input matInput type="number" step="0.01" formControlName="custoArmazenagem">
                      </mat-form-field>
                    </div>
                  </div>

                  <!-- Botões de Ação -->
                  <div class="form-actions">
                    <button mat-raised-button 
                            color="primary"
                            (click)="executarAnalise()"
                            [disabled]="analysisForm.invalid || isAnalyzing"
                            class="analyze-btn">
                      <mat-icon>psychology</mat-icon>
                      {{isAnalyzing ? 'Analisando...' : 'Analisar com IA'}}
                    </button>
                    
                    <button mat-button 
                            (click)="limparFormulario()">
                      <mat-icon>refresh</mat-icon>
                      Limpar
                    </button>
                  </div>

                  <!-- Progress Bar -->
                  <mat-progress-bar 
                    *ngIf="isAnalyzing"
                    mode="indeterminate"
                    class="analysis-progress">
                  </mat-progress-bar>
                </form>
              </div>
            </mat-tab>

            <!-- Aba Resultado -->
            <mat-tab label="Resultado da Análise" [disabled]="!currentAnalysis">
              <div class="tab-content" *ngIf="currentAnalysis">
                
                <!-- Score Principal -->
                <div class="score-section">
                  <div class="main-score">
                    <div class="score-circle" [class]="getScoreClass(currentAnalysis.scoreRentabilidade)">
                      <span class="score-value">{{currentAnalysis.scoreRentabilidade}}%</span>
                      <span class="score-label">Rentabilidade</span>
                    </div>
                    
                    <div class="score-details">
                      <div class="detail-item">
                        <mat-icon>trending_up</mat-icon>
                        <span>Margem: <strong>{{currentAnalysis.margemLucro | number:'1.1-1'}}%</strong></span>
                      </div>
                      <div class="detail-item">
                        <mat-icon>psychology</mat-icon>
                        <span>Confiança: <strong>{{currentAnalysis.confiabilidadePrevisao}}%</strong></span>
                      </div>
                      <div class="detail-item">
                        <mat-icon>warning</mat-icon>
                        <span>Risco: <strong>{{currentAnalysis.scoreRisco}}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div class="financial-summary">
                    <div class="summary-card positive">
                      <mat-icon>attach_money</mat-icon>
                      <div class="summary-content">
                        <span class="label">Receita Total</span>
                        <span class="value">R$ {{currentAnalysis.receitaTotalBrl | number:'1.2-2'}}</span>
                      </div>
                    </div>
                    
                    <div class="summary-card negative">
                      <mat-icon>remove_circle</mat-icon>
                      <div class="summary-content">
                        <span class="label">Custo Total</span>
                        <span class="value">R$ {{currentAnalysis.custoTotalBrl | number:'1.2-2'}}</span>
                      </div>
                    </div>
                    
                    <div class="summary-card profit" [class]="currentAnalysis.lucroBrutoBrl > 0 ? 'positive' : 'negative'">
                      <mat-icon>{{currentAnalysis.lucroBrutoBrl > 0 ? 'trending_up' : 'trending_down'}}</mat-icon>
                      <div class="summary-content">
                        <span class="label">Lucro Bruto</span>
                        <span class="value">R$ {{currentAnalysis.lucroBrutoBrl | number:'1.2-2'}}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Análise Qualitativa -->
                <div class="analysis-section">
                  <div class="points-section">
                    <div class="positive-points">
                      <h4>
                        <mat-icon>thumb_up</mat-icon>
                        Pontos Positivos
                      </h4>
                      <mat-chip-listbox>
                        <mat-chip-option 
                          *ngFor="let point of currentAnalysis.pontosPositivos"
                          class="positive-chip">
                          {{point}}
                        </mat-chip-option>
                      </mat-chip-listbox>
                    </div>

                    <div class="negative-points">
                      <h4>
                        <mat-icon>thumb_down</mat-icon>
                        Pontos de Atenção
                      </h4>
                      <mat-chip-listbox>
                        <mat-chip-option 
                          *ngFor="let point of currentAnalysis.pontosNegativos"
                          class="negative-chip">
                          {{point}}
                        </mat-chip-option>
                      </mat-chip-listbox>
                    </div>
                  </div>

                  <div class="recommendation-section">
                    <h4>
                      <mat-icon>lightbulb</mat-icon>
                      Recomendação IA
                    </h4>
                    <div class="recommendation-content">
                      {{currentAnalysis.recomendacao}}
                    </div>
                  </div>
                </div>

                <!-- Ações -->
                <div class="result-actions">
                  <button mat-raised-button 
                          color="accent"
                          (click)="abrirSimulador()">
                    <mat-icon>calculate</mat-icon>
                    Simular Cenários
                  </button>
                  
                  <button mat-raised-button 
                          (click)="exportarRelatorio()">
                    <mat-icon>file_download</mat-icon>
                    Exportar PDF
                  </button>
                  
                  <button mat-button 
                          (click)="novaAnalise()">
                    <mat-icon>refresh</mat-icon>
                    Nova Análise
                  </button>
                </div>
              </div>
            </mat-tab>

            <!-- Aba Histórico -->
            <mat-tab label="Histórico">
              <div class="tab-content">
                <div class="table-container">
                  <table mat-table 
                         [dataSource]="historicoDataSource" 
                         matSort
                         class="historico-table">

                    <ng-container matColumnDef="produto">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>
                        <mat-icon>category</mat-icon>
                        Produto
                      </th>
                      <td mat-cell *matCellDef="let analise">
                        {{analise.produto | titlecase}}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="scoreRentabilidade">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>
                        <mat-icon>analytics</mat-icon>
                        Score
                      </th>
                      <td mat-cell *matCellDef="let analise">
                        <div class="score-badge" [class]="getScoreClass(analise.scoreRentabilidade)">
                          {{analise.scoreRentabilidade}}%
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="margemLucro">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>
                        <mat-icon>trending_up</mat-icon>
                        Margem
                      </th>
                      <td mat-cell *matCellDef="let analise">
                        {{analise.margemLucro | number:'1.1-1'}}%
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="lucroBrutoBrl">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>
                        <mat-icon>attach_money</mat-icon>
                        Lucro (BRL)
                      </th>
                      <td mat-cell *matCellDef="let analise">
                        <span [class]="analise.lucroBrutoBrl > 0 ? 'positive-value' : 'negative-value'">
                          R$ {{analise.lucroBrutoBrl | number:'1.2-2'}}
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="dataAnalise">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>
                        <mat-icon>schedule</mat-icon>
                        Data
                      </th>
                      <td mat-cell *matCellDef="let analise">
                        {{analise.dataAnalise | date:'dd/MM/yyyy HH:mm'}}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="acoes">
                      <th mat-header-cell *matHeaderCellDef>Ações</th>
                      <td mat-cell *matCellDef="let analise">
                        <button mat-icon-button 
                                matTooltip="Ver detalhes"
                                (click)="visualizarAnalise(analise)">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button 
                                matTooltip="Replicar análise"
                                (click)="replicarAnalise(analise)">
                          <mat-icon>content_copy</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>

                  <mat-paginator #paginator
                                 [pageSizeOptions]="[5, 10, 25, 50]"
                                 [pageSize]="10"
                                 [showFirstLastButtons]="true">
                  </mat-paginator>
                </div>
              </div>
            </mat-tab>
            
          </mat-tab-group>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .rentabilidade-container {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .page-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #4caf50;
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .page-header p {
      color: #666;
      font-size: 1.2rem;
      font-weight: 400;
    }

    .main-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .analysis-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .analysis-tabs {
      min-height: 600px;
    }

    .tab-content {
      padding: 24px;
    }

    .analysis-form {
      max-width: 1000px;
      margin: 0 auto;
    }

    .form-section {
      margin-bottom: 32px;
      padding: 24px;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      background: #fafafa;
    }

    .form-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 24px 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 32px;
    }

    .analyze-btn {
      min-width: 200px;
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
    }

    .analysis-progress {
      margin-top: 20px;
    }

    .score-section {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 32px;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
      border-radius: 16px;
    }

    .main-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .score-circle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      position: relative;
      overflow: hidden;
    }

    .score-circle.excellent {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
    }

    .score-circle.good {
      background: linear-gradient(135deg, #ff9800, #ffb74d);
    }

    .score-circle.poor {
      background: linear-gradient(135deg, #f44336, #e57373);
    }

    .score-value {
      font-size: 2rem;
      font-weight: 700;
    }

    .score-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .score-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #555;
    }

    .financial-summary {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    .summary-card {
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    .summary-card.positive {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
    }

    .summary-card.negative {
      background: linear-gradient(135deg, #f44336, #e57373);
    }

    .summary-card mat-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
    }

    .summary-content {
      display: flex;
      flex-direction: column;
    }

    .summary-content .label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .summary-content .value {
      font-size: 1.3rem;
      font-weight: 600;
    }

    .analysis-section {
      margin-bottom: 32px;
    }

    .points-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .positive-points,
    .negative-points {
      padding: 20px;
      border-radius: 12px;
    }

    .positive-points {
      background: #e8f5e8;
      border-left: 4px solid #4caf50;
    }

    .negative-points {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
    }

    .positive-points h4,
    .negative-points h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-weight: 600;
    }

    .positive-chip {
      background: #c8e6c9 !important;
      color: #2e7d32 !important;
    }

    .negative-chip {
      background: #ffe0b2 !important;
      color: #ef6c00 !important;
    }

    .recommendation-section {
      padding: 20px;
      background: #e3f2fd;
      border-radius: 12px;
      border-left: 4px solid #2196f3;
    }

    .recommendation-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      color: #1976d2;
    }

    .recommendation-content {
      line-height: 1.6;
      color: #555;
    }

    .result-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 24px;
    }

    .table-container {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      background: white;
    }

    .historico-table {
      width: 100%;
    }

    .historico-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    .score-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      display: inline-block;
      color: white;
    }

    .score-badge.excellent {
      background: #4caf50;
    }

    .score-badge.good {
      background: #ff9800;
    }

    .score-badge.poor {
      background: #f44336;
    }

    .positive-value {
      color: #4caf50;
      font-weight: 600;
    }

    .negative-value {
      color: #f44336;
      font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .rentabilidade-container {
        padding: 16px;
      }

      .score-section {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .financial-summary {
        grid-template-columns: 1fr;
      }

      .points-section {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
        align-items: center;
      }

      .result-actions {
        flex-direction: column;
        align-items: center;
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class RentabilidadeAnaliseComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  analysisForm!: FormGroup;
  isAnalyzing = false;
  currentAnalysis: AnaliseRentabilidade | null = null;

  displayedColumns: string[] = ['produto', 'scoreRentabilidade', 'margemLucro', 'lucroBrutoBrl', 'dataAnalise', 'acoes'];
  historicoDataSource = new MatTableDataSource<AnaliseRentabilidade>([]);

  // Mock data para histórico
  historicoAnalises: AnaliseRentabilidade[] = [
    {
      id: '1',
      exportacaoId: 'EXP-2024-001',
      produto: 'soja',
      quantidade: 1000,
      precoVendaUsd: 450,
      precoCompraBrl: 120,
      freteInternacionalUsd: 25,
      freteNacionalBrl: 15,
      taxasPortuarias: 5000,
      taxasGovernamentais: 3000,
      custoArmazenagem: 2000,
      taxaCambioAtual: 5.18,
      taxaCambioPrevista: 5.25,
      receitaTotalBrl: 2331000,
      custoTotalBrl: 1967500,
      lucroBrutoBrl: 363500,
      margemLucro: 18.4,
      scoreRentabilidade: 87,
      scoreRisco: 23,
      confiabilidadePrevisao: 92,
      pontosPositivos: ['Preço internacional favorável: +12%', 'Taxa cambial positiva: +4%', 'Baixo custo logístico: +6%'],
      pontosNegativos: ['Volatilidade cambial: -5%', 'Custo portuário elevado: -3%'],
      recomendacao: 'Exportação altamente recomendada. Score excelente com baixo risco. Considere aumentar volume.',
      dataAnalise: new Date('2024-03-15T10:30:00')
    }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.historicoDataSource.data = this.historicoAnalises;
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.historicoDataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.historicoDataSource.sort = this.sort;
    }
  }

  private initializeForm(): void {
    this.analysisForm = this.fb.group({
      exportacaoId: ['', Validators.required],
      produto: ['', Validators.required],
      quantidade: [0, [Validators.required, Validators.min(0.001)]],
      precoVendaUsd: [0, [Validators.required, Validators.min(0)]],
      precoCompraBrl: [0, [Validators.required, Validators.min(0)]],
      freteInternacionalUsd: [0, [Validators.required, Validators.min(0)]],
      freteNacionalBrl: [0, [Validators.required, Validators.min(0)]],
      taxasPortuarias: [0, Validators.min(0)],
      taxasGovernamentais: [0, Validators.min(0)],
      custoArmazenagem: [0, Validators.min(0)],
      taxaCambioAtual: [5.18, [Validators.required, Validators.min(0)]]
    });
  }

  executarAnalise(): void {
    if (this.analysisForm.invalid) return;

    this.isAnalyzing = true;
    this.notificationService.showInfo('Iniciando análise com IA...');

    // Simular processamento IA
    setTimeout(() => {
      this.currentAnalysis = this.processAnaliseIA(this.analysisForm.value);
      this.isAnalyzing = false;
      this.notificationService.showSuccess('Análise concluída com sucesso!');
    }, 3000);
  }

  private processAnaliseIA(formData: any): AnaliseRentabilidade {
    // Cálculos base
    const receitaTotalBrl = formData.quantidade * formData.precoVendaUsd * formData.taxaCambioAtual;
    const custoProdutoBrl = formData.quantidade * formData.precoCompraBrl;
    const custoFreteInternacionalBrl = formData.freteInternacionalUsd * formData.taxaCambioAtual;
    const custoTotalBrl = custoProdutoBrl + custoFreteInternacionalBrl + formData.freteNacionalBrl + 
                         formData.taxasPortuarias + formData.taxasGovernamentais + formData.custoArmazenagem;
    
    const lucroBrutoBrl = receitaTotalBrl - custoTotalBrl;
    const margemLucro = (lucroBrutoBrl / receitaTotalBrl) * 100;

    // IA Scoring
    let scoreRentabilidade = 50;
    let scoreRisco = 50;
    
    // Lógica de scoring baseada em regras
    if (margemLucro > 15) scoreRentabilidade += 30;
    else if (margemLucro > 10) scoreRentabilidade += 20;
    else if (margemLucro > 5) scoreRentabilidade += 10;
    
    if (formData.taxaCambioAtual > 5.0) scoreRentabilidade += 10;
    if (lucroBrutoBrl > 300000) scoreRentabilidade += 7;

    scoreRisco = Math.max(10, 100 - scoreRentabilidade);

    // Análise qualitativa
    const pontosPositivos: string[] = [];
    const pontosNegativos: string[] = [];

    if (margemLucro > 15) pontosPositivos.push('Margem de lucro excelente: +15%');
    if (formData.taxaCambioAtual > 5.0) pontosPositivos.push('Taxa cambial favorável: +8%');
    if (formData.precoVendaUsd > 400) pontosPositivos.push('Preço internacional alto: +10%');
    
    if (formData.taxasPortuarias > 4000) pontosNegativos.push('Taxas portuárias elevadas: -5%');
    if (formData.freteInternacionalUsd > 30) pontosNegativos.push('Frete internacional alto: -3%');

    let recomendacao = '';
    if (scoreRentabilidade > 80) {
      recomendacao = 'Exportação ALTAMENTE RECOMENDADA! Excelente rentabilidade com risco controlado.';
    } else if (scoreRentabilidade > 60) {
      recomendacao = 'Exportação RECOMENDADA com bom potencial de lucro.';
    } else {
      recomendacao = 'Exportação apresenta riscos. Revisar custos e condições.';
    }

    return {
      id: this.generateId(),
      exportacaoId: formData.exportacaoId,
      produto: formData.produto,
      quantidade: formData.quantidade,
      precoVendaUsd: formData.precoVendaUsd,
      precoCompraBrl: formData.precoCompraBrl,
      freteInternacionalUsd: formData.freteInternacionalUsd,
      freteNacionalBrl: formData.freteNacionalBrl,
      taxasPortuarias: formData.taxasPortuarias,
      taxasGovernamentais: formData.taxasGovernamentais,
      custoArmazenagem: formData.custoArmazenagem,
      taxaCambioAtual: formData.taxaCambioAtual,
      taxaCambioPrevista: formData.taxaCambioAtual * 1.02,
      receitaTotalBrl,
      custoTotalBrl,
      lucroBrutoBrl,
      margemLucro,
      scoreRentabilidade,
      scoreRisco,
      confiabilidadePrevisao: 88 + Math.random() * 10,
      pontosPositivos,
      pontosNegativos,
      recomendacao,
      dataAnalise: new Date()
    };
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  }

  limparFormulario(): void {
    this.analysisForm.reset();
    this.currentAnalysis = null;
  }

  novaAnalise(): void {
    this.currentAnalysis = null;
    this.limparFormulario();
  }

  abrirSimulador(): void {
    this.notificationService.showInfo('Abrindo simulador de cenários...');
    // Implementar navegação para simulador
  }

  exportarRelatorio(): void {
    this.notificationService.showSuccess('Relatório exportado com sucesso!');
    // Implementar exportação PDF
  }

  visualizarAnalise(analise: AnaliseRentabilidade): void {
    this.currentAnalysis = analise;
  }

  replicarAnalise(analise: AnaliseRentabilidade): void {
    this.analysisForm.patchValue({
      exportacaoId: analise.exportacaoId + '-REPLICA',
      produto: analise.produto,
      quantidade: analise.quantidade,
      precoVendaUsd: analise.precoVendaUsd,
      precoCompraBrl: analise.precoCompraBrl,
      freteInternacionalUsd: analise.freteInternacionalUsd,
      freteNacionalBrl: analise.freteNacionalBrl,
      taxasPortuarias: analise.taxasPortuarias,
      taxasGovernamentais: analise.taxasGovernamentais,
      custoArmazenagem: analise.custoArmazenagem,
      taxaCambioAtual: analise.taxaCambioAtual
    });
    this.notificationService.showInfo('Dados replicados para nova análise');
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}