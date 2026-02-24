import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../../services/notification.service';

export interface RuleCondition {
  campo: string;
  operador: string;
  valor: any;
  tipo: 'numero' | 'texto' | 'data' | 'booleano';
}

export interface RuleAction {
  tipo: 'alerta' | 'email' | 'bloqueio' | 'tarefa' | 'webhook' | 'ia';
  configuracao: any;
}

export interface AutomationRule {
  id: string;
  nome: string;
  descricao: string;
  eventoGatilho: string;
  condicoes: RuleCondition[];
  acoes: RuleAction[];
  ativo: boolean;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  linguagemNatural?: string;
  criadoEm: Date;
  ultimaExecucao?: Date;
  execucoes: number;
}

@Component({
  selector: 'app-automacao-criar-regra',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="automacao-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>auto_awesome</mat-icon>
          Criar Regra de Automação
        </h1>
        <p>Crie automações inteligentes com IA para seu negócio</p>
      </div>

      <!-- Tabs Container -->
      <mat-card class="rule-creator">
        <mat-tab-group class="rule-tabs">
          
          <!-- Aba: Configuração Básica -->
          <mat-tab label="Configuração Básica">
            <div class="tab-content">
              <form [formGroup]="ruleForm" class="rule-form">
                
                <!-- Informações da Regra -->
                <div class="form-section">
                  <h3>
                    <mat-icon>info</mat-icon>
                    Informações da Regra
                  </h3>
                  
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Nome da Regra</mat-label>
                      <mat-icon matPrefix>rule</mat-icon>
                      <input matInput formControlName="nome" 
                             placeholder="Ex: Alerta Margem Baixa">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Prioridade</mat-label>
                      <mat-icon matPrefix>priority_high</mat-icon>
                      <mat-select formControlName="prioridade">
                        <mat-option value="baixa">
                          <mat-icon>arrow_downward</mat-icon>
                          Baixa
                        </mat-option>
                        <mat-option value="media">
                          <mat-icon>remove</mat-icon>
                          Média
                        </mat-option>
                        <mat-option value="alta">
                          <mat-icon>arrow_upward</mat-icon>
                          Alta
                        </mat-option>
                        <mat-option value="critica">
                          <mat-icon>warning</mat-icon>
                          Crítica
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Descrição</mat-label>
                      <mat-icon matPrefix>description</mat-icon>
                      <textarea matInput formControlName="descricao" rows="3"
                               placeholder="Descreva o objetivo desta regra"></textarea>
                    </mat-form-field>
                  </div>
                </div>

                <!-- Evento Gatilho -->
                <div class="form-section">
                  <h3>
                    <mat-icon>play_arrow</mat-icon>
                    Evento Gatilho
                  </h3>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Quando deve ser executada?</mat-label>
                    <mat-icon matPrefix>event</mat-icon>
                    <mat-select formControlName="eventoGatilho">
                      <mat-option value="exportacao-criada">
                        <mat-icon>add_box</mat-icon>
                        Nova Exportação Criada
                      </mat-option>
                      <mat-option value="documento-gerado">
                        <mat-icon>description</mat-icon>
                        Documento Gerado
                      </mat-option>
                      <mat-option value="pagamento-recebido">
                        <mat-icon>payment</mat-icon>
                        Pagamento Recebido
                      </mat-option>
                      <mat-option value="cambio-alterado">
                        <mat-icon>currency_exchange</mat-icon>
                        Câmbio Alterado
                      </mat-option>
                      <mat-option value="margem-calculada">
                        <mat-icon>analytics</mat-icon>
                        Margem Calculada
                      </mat-option>
                      <mat-option value="embarque-realizado">
                        <mat-icon>flight_takeoff</mat-icon>
                        Embarque Realizado
                      </mat-option>
                      <mat-option value="prazo-vencendo">
                        <mat-icon>schedule</mat-icon>
                        Prazo Vencendo
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <!-- Ativação -->
                <div class="form-section">
                  <div class="toggle-section">
                    <mat-slide-toggle formControlName="ativo">
                      <span class="toggle-label">
                        <mat-icon>{{ruleForm.get('ativo')?.value ? 'toggle_on' : 'toggle_off'}}</mat-icon>
                        {{ruleForm.get('ativo')?.value ? 'Regra Ativa' : 'Regra Inativa'}}
                      </span>
                    </mat-slide-toggle>
                    <p class="toggle-help">
                      Regras ativas são executadas automaticamente quando o evento gatilho ocorrer
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </mat-tab>

          <!-- Aba: Condições -->
          <mat-tab label="Condições" [disabled]="!ruleForm.get('eventoGatilho')?.value">
            <div class="tab-content">
              
              <!-- Linguagem Natural -->
              <div class="natural-language-section">
                <h3>
                  <mat-icon>psychology</mat-icon>
                  Descreva sua Regra em Linguagem Natural (IA)
                </h3>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Descreva quando a regra deve ser executada...</mat-label>
                  <mat-icon matPrefix>chat</mat-icon>
                  <textarea matInput 
                           [(ngModel)]="linguagemNatural"
                           rows="3"
                           placeholder="Ex: Alertar quando margem de lucro for menor que 10% ou quando o valor da exportação for superior a R$ 1 milhão"></textarea>
                </mat-form-field>
                
                <div class="natural-actions">
                  <button mat-raised-button 
                          color="accent"
                          (click)="processarLinguagemNatural()"
                          [disabled]="!linguagemNatural.trim()">
                    <mat-icon>auto_fix_high</mat-icon>
                    Gerar Condições com IA
                  </button>
                  
                  <button mat-button (click)="limparCondicoes()">
                    <mat-icon>clear</mat-icon>
                    Limpar
                  </button>
                </div>

                <!-- Sugestões de IA -->
                <div class="ai-suggestions" *ngIf="aiSuggestions.length > 0">
                  <h4>Sugestões da IA:</h4>
                  <mat-chip-listbox>
                    <mat-chip-option 
                      *ngFor="let suggestion of aiSuggestions"
                      (click)="aplicarSugestao(suggestion)"
                      class="suggestion-chip">
                      {{suggestion}}
                    </mat-chip-option>
                  </mat-chip-listbox>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Condições Manuais -->
              <div class="conditions-section">
                <div class="section-header">
                  <h3>
                    <mat-icon>rule</mat-icon>
                    Condições (Configuração Manual)
                  </h3>
                  
                  <button mat-raised-button 
                          color="primary"
                          (click)="adicionarCondicao()">
                    <mat-icon>add</mat-icon>
                    Nova Condição
                  </button>
                </div>

                <!-- Lista de Condições -->
                <div class="conditions-list">
                  <mat-expansion-panel 
                    *ngFor="let condicao of condicoes; let i = index"
                    class="condition-panel">
                    
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>{{getConditionIcon(condicao)}}</mat-icon>
                        Condição {{i + 1}}: {{getConditionDescription(condicao)}}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{condicao.campo}} {{condicao.operador}} {{condicao.valor}}
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    <div class="condition-form">
                      <div class="condition-grid">
                        
                        <mat-form-field appearance="outline">
                          <mat-label>Campo</mat-label>
                          <mat-select [(ngModel)]="condicao.campo" 
                                     (selectionChange)="updateConditionType(condicao)">
                            <mat-optgroup label="Exportação">
                              <mat-option value="valor_exportacao">Valor da Exportação</mat-option>
                              <mat-option value="quantidade">Quantidade</mat-option>
                              <mat-option value="margem_lucro">Margem de Lucro (%)</mat-option>
                              <mat-option value="produto">Produto</mat-option>
                              <mat-option value="destino">País de Destino</mat-option>
                            </mat-optgroup>
                            
                            <mat-optgroup label="Financeiro">
                              <mat-option value="taxa_cambio">Taxa de Câmbio</mat-option>
                              <mat-option value="receita_brl">Receita (BRL)</mat-option>
                              <mat-option value="custo_total">Custo Total</mat-option>
                              <mat-option value="lucro_bruto">Lucro Bruto</mat-option>
                            </mat-optgroup>
                            
                            <mat-optgroup label="Operacional">
                              <mat-option value="data_embarque">Data de Embarque</mat-option>
                              <mat-option value="status_documento">Status Documento</mat-option>
                              <mat-option value="prazo_vencimento">Prazo de Vencimento</mat-option>
                            </mat-optgroup>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Operador</mat-label>
                          <mat-select [(ngModel)]="condicao.operador">
                            <mat-option *ngFor="let op of getOperatorsForType(condicao.tipo)" 
                                       [value]="op.value">
                              {{op.label}}
                            </mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Valor</mat-label>
                          <input matInput 
                                 [(ngModel)]="condicao.valor"
                                 [type]="getInputType(condicao.tipo)"
                                 [placeholder]="getPlaceholder(condicao.tipo, condicao.campo)">
                        </mat-form-field>

                        <button mat-icon-button 
                                color="warn"
                                (click)="removerCondicao(i)"
                                matTooltip="Remover condição">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </mat-expansion-panel>

                  <!-- Empty State -->
                  <div class="empty-conditions" *ngIf="condicoes.length === 0">
                    <mat-icon>rule</mat-icon>
                    <h3>Nenhuma Condição Configurada</h3>
                    <p>Use a linguagem natural acima ou adicione condições manualmente</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Aba: Ações -->
          <mat-tab label="Ações" [disabled]="condicoes.length === 0">
            <div class="tab-content">
              
              <div class="actions-section">
                <div class="section-header">
                  <h3>
                    <mat-icon>flash_on</mat-icon>
                    O que fazer quando as condições forem atendidas?
                  </h3>
                  
                  <button mat-raised-button 
                          color="primary"
                          (click)="adicionarAcao()">
                    <mat-icon>add</mat-icon>
                    Nova Ação
                  </button>
                </div>

                <!-- Lista de Ações -->
                <div class="actions-list">
                  <mat-expansion-panel 
                    *ngFor="let acao of acoes; let i = index"
                    class="action-panel">
                    
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon>{{getActionIcon(acao.tipo)}}</mat-icon>
                        {{getActionTitle(acao.tipo)}}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{getActionDescription(acao)}}
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    <div class="action-form">
                      
                      <!-- Tipo de Ação -->
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Tipo de Ação</mat-label>
                        <mat-select [(ngModel)]="acao.tipo" (selectionChange)="resetActionConfig(acao)">
                          <mat-option value="alerta">
                            <mat-icon>notification_important</mat-icon>
                            Enviar Alerta
                          </mat-option>
                          <mat-option value="email">
                            <mat-icon>email</mat-icon>
                            Enviar Email
                          </mat-option>
                          <mat-option value="bloqueio">
                            <mat-icon>block</mat-icon>
                            Bloquear Operação
                          </mat-option>
                          <mat-option value="tarefa">
                            <mat-icon>task</mat-icon>
                            Criar Tarefa
                          </mat-option>
                          <mat-option value="webhook">
                            <mat-icon>webhook</mat-icon>
                            Chamar Webhook
                          </mat-option>
                          <mat-option value="ia">
                            <mat-icon>psychology</mat-icon>
                            Executar IA
                          </mat-option>
                        </mat-select>
                      </mat-form-field>

                      <!-- Configurações específicas por tipo -->
                      <div [ngSwitch]="acao.tipo" class="action-config">
                        
                        <!-- Alerta -->
                        <div *ngSwitchCase="'alerta'">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Mensagem do Alerta</mat-label>
                            <textarea matInput 
                                     [(ngModel)]="acao.configuracao.mensagem"
                                     rows="2"
                                     placeholder="Ex: Atenção! Margem de lucro abaixo do esperado"></textarea>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Tipo de Alerta</mat-label>
                            <mat-select [(ngModel)]="acao.configuracao.tipoAlerta">
                              <mat-option value="info">Informação</mat-option>
                              <mat-option value="warning">Aviso</mat-option>
                              <mat-option value="error">Erro</mat-option>
                              <mat-option value="success">Sucesso</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                        <!-- Email -->
                        <div *ngSwitchCase="'email'">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Destinatários (separados por vírgula)</mat-label>
                            <input matInput 
                                   [(ngModel)]="acao.configuracao.destinatarios"
                                   placeholder="user1@empresa.com, user2@empresa.com">
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Assunto</mat-label>
                            <input matInput 
                                   [(ngModel)]="acao.configuracao.assunto"
                                   placeholder="Ex: Alerta de Margem Baixa - Exportação #123">
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Corpo do Email</mat-label>
                            <textarea matInput 
                                     [(ngModel)]="acao.configuracao.corpo"
                                     rows="4"
                                     placeholder="Digite o conteúdo do email..."></textarea>
                          </mat-form-field>
                        </div>

                        <!-- Bloqueio -->
                        <div *ngSwitchCase="'bloqueio'">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Motivo do Bloqueio</mat-label>
                            <textarea matInput 
                                     [(ngModel)]="acao.configuracao.motivo"
                                     rows="2"
                                     placeholder="Ex: Operação bloqueada devido à margem de lucro insuficiente"></textarea>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Tipo de Bloqueio</mat-label>
                            <mat-select [(ngModel)]="acao.configuracao.tipoBloqueio">
                              <mat-option value="temporario">Temporário</mat-option>
                              <mat-option value="permanente">Permanente</mat-option>
                              <mat-option value="aprovacao">Requer Aprovação</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                        <!-- Tarefa -->
                        <div *ngSwitchCase="'tarefa'">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Título da Tarefa</mat-label>
                            <input matInput 
                                   [(ngModel)]="acao.configuracao.titulo"
                                   placeholder="Ex: Revisar Exportação com Margem Baixa">
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Responsável</mat-label>
                            <mat-select [(ngModel)]="acao.configuracao.responsavel">
                              <mat-option value="gerente-comercial">Gerente Comercial</mat-option>
                              <mat-option value="diretor-financeiro">Diretor Financeiro</mat-option>
                              <mat-option value="analista-exportacao">Analista de Exportação</mat-option>
                            </mat-select>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Prioridade</mat-label>
                            <mat-select [(ngModel)]="acao.configuracao.prioridadeTarefa">
                              <mat-option value="baixa">Baixa</mat-option>
                              <mat-option value="media">Média</mat-option>
                              <mat-option value="alta">Alta</mat-option>
                              <mat-option value="urgente">Urgente</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                        <!-- Webhook -->
                        <div *ngSwitchCase="'webhook'">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>URL do Webhook</mat-label>
                            <input matInput 
                                   [(ngModel)]="acao.configuracao.url"
                                   placeholder="https://api.empresa.com/webhook/regra-exportacao">
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Método HTTP</mat-label>
                            <mat-select [(ngModel)]="acao.configuracao.metodo">
                              <mat-option value="POST">POST</mat-option>
                              <mat-option value="PUT">PUT</mat-option>
                              <mat-option value="PATCH">PATCH</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                        <!-- IA -->
                        <div *ngSwitchCase="'ia'">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Prompt para IA</mat-label>
                            <textarea matInput 
                                     [(ngModel)]="acao.configuracao.prompt"
                                     rows="3"
                                     placeholder="Ex: Analise esta exportação e sugira melhorias para aumentar a margem de lucro"></textarea>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Modelo de IA</mat-label>
                            <mat-select [(ngModel)]="acao.configuracao.modelo">
                              <mat-option value="gpt-4">GPT-4 (Análise Avançada)</mat-option>
                              <mat-option value="gpt-3.5">GPT-3.5 (Análise Rápida)</mat-option>
                              <mat-option value="claude">Claude (Análise Detalhada)</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                      </div>

                      <div class="action-footer">
                        <button mat-icon-button 
                                color="warn"
                                (click)="removerAcao(i)"
                                matTooltip="Remover ação">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </mat-expansion-panel>

                  <!-- Empty State -->
                  <div class="empty-actions" *ngIf="acoes.length === 0">
                    <mat-icon>flash_on</mat-icon>
                    <h3>Nenhuma Ação Configurada</h3>
                    <p>Adicione ações para definir o que deve acontecer quando as condições forem atendidas</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Aba: Revisão e Teste -->
          <mat-tab label="Revisão" [disabled]="acoes.length === 0">
            <div class="tab-content">
              
              <div class="review-section">
                <h3>
                  <mat-icon>preview</mat-icon>
                  Revisão da Regra
                </h3>

                <!-- Resumo da Regra -->
                <mat-card class="rule-summary">
                  <mat-card-header>
                    <mat-card-title>{{ruleForm.get('nome')?.value || 'Nova Regra'}}</mat-card-title>
                    <mat-card-subtitle>{{ruleForm.get('descricao')?.value}}</mat-card-subtitle>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <div class="summary-grid">
                      
                      <div class="summary-item">
                        <mat-icon>event</mat-icon>
                        <div>
                          <strong>Gatilho:</strong>
                          <span>{{getEventLabel(ruleForm.get('eventoGatilho')?.value)}}</span>
                        </div>
                      </div>

                      <div class="summary-item">
                        <mat-icon>rule</mat-icon>
                        <div>
                          <strong>Condições:</strong>
                          <span>{{condicoes.length}} condição(ões) configuradas</span>
                        </div>
                      </div>

                      <div class="summary-item">
                        <mat-icon>flash_on</mat-icon>
                        <div>
                          <strong>Ações:</strong>
                          <span>{{acoes.length}} ação(ões) configuradas</span>
                        </div>
                      </div>

                      <div class="summary-item">
                        <mat-icon>priority_high</mat-icon>
                        <div>
                          <strong>Prioridade:</strong>
                          <span>{{ruleForm.get('prioridade')?.value}}</span>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Preview em Linguagem Natural -->
                <div class="natural-preview">
                  <h4>
                    <mat-icon>chat</mat-icon>
                    Sua regra em linguagem natural:
                  </h4>
                  <div class="natural-text">
                    {{generateNaturalDescription()}}
                  </div>
                </div>

                <!-- Teste da Regra -->
                <div class="test-section">
                  <h4>
                    <mat-icon>science</mat-icon>
                    Testar Regra
                  </h4>
                  <p>Simule a execução desta regra com dados de teste</p>
                  
                  <div class="test-actions">
                    <button mat-raised-button 
                            color="accent"
                            (click)="testarRegra()">
                      <mat-icon>play_arrow</mat-icon>
                      Executar Teste
                    </button>
                    
                    <button mat-button>
                      <mat-icon>history</mat-icon>
                      Ver Testes Anteriores
                    </button>
                  </div>
                </div>

                <!-- Resultado do Teste -->
                <mat-card class="test-result" *ngIf="testResult">
                  <mat-card-header>
                    <mat-card-title>
                      <mat-icon [class]="testResult.sucesso ? 'success-icon' : 'error-icon'">
                        {{testResult.sucesso ? 'check_circle' : 'error'}}
                      </mat-icon>
                      Resultado do Teste
                    </mat-card-title>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <p><strong>Status:</strong> {{testResult.sucesso ? 'Sucesso' : 'Erro'}}</p>
                    <p><strong>Tempo de Execução:</strong> {{testResult.tempoExecucao}}ms</p>
                    <p><strong>Condições Atendidas:</strong> {{testResult.condicoesAtendidas}}/{{condicoes.length}}</p>
                    <p><strong>Ações Executadas:</strong> {{testResult.acoesExecutadas}}/{{acoes.length}}</p>
                    
                    <div class="test-details">
                      <strong>Detalhes:</strong>
                      <ul>
                        <li *ngFor="let detail of testResult.detalhes">{{detail}}</li>
                      </ul>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Ações Finais -->
                <div class="final-actions">
                  <button mat-button (click)="cancelar()">
                    <mat-icon>cancel</mat-icon>
                    Cancelar
                  </button>
                  
                  <button mat-raised-button 
                          color="accent"
                          (click)="salvarRascunho()">
                    <mat-icon>save</mat-icon>
                    Salvar Rascunho
                  </button>
                  
                  <button mat-raised-button 
                          color="primary"
                          (click)="criarRegra()"
                          [disabled]="!canCreateRule()">
                    <mat-icon>publish</mat-icon>
                    Criar e Ativar Regra
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .automacao-container {
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
      color: #ff5722;
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .page-header p {
      color: #666;
      font-size: 1.2rem;
    }

    .rule-creator {
      max-width: 1400px;
      margin: 0 auto;
      border-radius: 16px;
      overflow: hidden;
    }

    .rule-tabs {
      min-height: 600px;
    }

    .tab-content {
      padding: 24px;
    }

    .rule-form {
      max-width: 800px;
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
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .toggle-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px;
      background: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .toggle-help {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .natural-language-section {
      margin-bottom: 32px;
      padding: 24px;
      background: #fff3e0;
      border-radius: 12px;
      border-left: 4px solid #ff9800;
    }

    .natural-language-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: #e65100;
    }

    .natural-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      justify-content: flex-end;
    }

    .ai-suggestions {
      margin-top: 24px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .ai-suggestions h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 0.9rem;
    }

    .suggestion-chip {
      margin: 4px !important;
      cursor: pointer;
      background: #e3f2fd !important;
    }

    .conditions-section,
    .actions-section {
      margin-top: 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #333;
    }

    .conditions-list,
    .actions-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .condition-panel,
    .action-panel {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .condition-form,
    .action-form {
      padding: 16px;
    }

    .condition-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 16px;
      align-items: center;
    }

    .action-config {
      margin-top: 16px;
    }

    .action-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .empty-conditions,
    .empty-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      text-align: center;
      color: #666;
      border: 2px dashed #ddd;
      border-radius: 12px;
    }

    .empty-conditions mat-icon,
    .empty-actions mat-icon {
      font-size: 3rem !important;
      width: 3rem !important;
      height: 3rem !important;
      margin-bottom: 16px;
      color: #ddd;
    }

    .review-section {
      max-width: 1000px;
      margin: 0 auto;
    }

    .review-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 24px 0;
      color: #333;
    }

    .rule-summary {
      margin-bottom: 24px;
      border-radius: 12px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .summary-item mat-icon {
      color: #ff5722;
    }

    .summary-item div strong {
      display: block;
      margin-bottom: 4px;
      color: #333;
    }

    .summary-item div span {
      color: #666;
      font-size: 0.9rem;
    }

    .natural-preview {
      margin-bottom: 24px;
      padding: 20px;
      background: #e8f5e8;
      border-radius: 12px;
      border-left: 4px solid #4caf50;
    }

    .natural-preview h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      color: #2e7d32;
    }

    .natural-text {
      font-style: italic;
      color: #555;
      line-height: 1.6;
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #c8e6c9;
    }

    .test-section {
      margin-bottom: 24px;
      padding: 20px;
      background: #f3e5f5;
      border-radius: 12px;
      border-left: 4px solid #9c27b0;
    }

    .test-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px 0;
      color: #6a1b9a;
    }

    .test-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .test-result {
      margin-bottom: 24px;
      border-radius: 12px;
    }

    .success-icon {
      color: #4caf50;
    }

    .error-icon {
      color: #f44336;
    }

    .test-details {
      margin-top: 12px;
    }

    .test-details ul {
      margin: 8px 0 0 20px;
      padding: 0;
    }

    .test-details li {
      color: #666;
      margin: 4px 0;
    }

    .final-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .automacao-container {
        padding: 16px;
      }

      .page-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 8px;
      }

      .tab-content {
        padding: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .condition-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .natural-actions,
      .test-actions,
      .final-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AutomacaoCriarRegraComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  ruleForm!: FormGroup;
  linguagemNatural = '';
  condicoes: RuleCondition[] = [];
  acoes: RuleAction[] = [];
  aiSuggestions: string[] = [];
  testResult: any = null;

  // Operadores por tipo de campo
  operatorsMap = {
    numero: [
      { value: '>', label: 'Maior que' },
      { value: '>=', label: 'Maior ou igual a' },
      { value: '<', label: 'Menor que' },
      { value: '<=', label: 'Menor ou igual a' },
      { value: '=', label: 'Igual a' },
      { value: '!=', label: 'Diferente de' }
    ],
    texto: [
      { value: '=', label: 'Igual a' },
      { value: '!=', label: 'Diferente de' },
      { value: 'contains', label: 'Contém' },
      { value: 'starts_with', label: 'Começa com' },
      { value: 'ends_with', label: 'Termina com' }
    ],
    data: [
      { value: '>', label: 'Após' },
      { value: '<', label: 'Antes' },
      { value: '=', label: 'Em' },
      { value: 'between', label: 'Entre' }
    ],
    booleano: [
      { value: '=', label: 'É' }
    ]
  };

  // Tipos de campo
  fieldTypes: { [key: string]: 'numero' | 'texto' | 'data' | 'booleano' } = {
    'valor_exportacao': 'numero',
    'quantidade': 'numero',
    'margem_lucro': 'numero',
    'produto': 'texto',
    'destino': 'texto',
    'taxa_cambio': 'numero',
    'receita_brl': 'numero',
    'custo_total': 'numero',
    'lucro_bruto': 'numero',
    'data_embarque': 'data',
    'status_documento': 'texto',
    'prazo_vencimento': 'data'
  };

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.ruleForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: [''],
      eventoGatilho: ['', Validators.required],
      prioridade: ['media', Validators.required],
      ativo: [true]
    });
  }

  processarLinguagemNatural(): void {
    if (!this.linguagemNatural?.trim()) return;

    this.notificationService.showLoading({
      title: 'Processando...',
      message: 'IA analisando sua regra em linguagem natural'
    });

    // Simular processamento de IA
    setTimeout(() => {
      this.aiSuggestions = [
        'Margem de lucro menor que 10%',
        'Valor da exportação maior que R$ 1.000.000',
        'Produto igual a "Soja"',
        'Taxa de câmbio maior que 5.20'
      ];

      // Gerar condições automáticas baseadas na linguagem natural
      this.generateConditionsFromNL();
      
      this.notificationService.hideLoading();
      this.notificationService.showSuccess('Condições geradas pela IA com sucesso!');
    }, 2000);
  }

  private generateConditionsFromNL(): void {
    const text = this.linguagemNatural.toLowerCase();
    
    // Lógica simples de NLP para extrair condições
    if (text.includes('margem') && text.includes('menor') && text.includes('10')) {
      this.adicionarCondicao({
        campo: 'margem_lucro',
        operador: '<',
        valor: 10,
        tipo: 'numero'
      });
    }

    if (text.includes('valor') && text.includes('maior') && text.includes('milhão')) {
      this.adicionarCondicao({
        campo: 'valor_exportacao',
        operador: '>',
        valor: 1000000,
        tipo: 'numero'
      });
    }
  }

  aplicarSugestao(suggestion: string): void {
    this.linguagemNatural = suggestion;
    this.processarLinguagemNatural();
  }

  limparCondicoes(): void {
    this.condicoes = [];
    this.linguagemNatural = '';
    this.aiSuggestions = [];
  }

  adicionarCondicao(condicao?: Partial<RuleCondition>): void {
    const newCondition: RuleCondition = {
      campo: condicao?.campo || '',
      operador: condicao?.operador || '',
      valor: condicao?.valor || '',
      tipo: condicao?.tipo || 'numero'
    };

    this.condicoes.push(newCondition);
  }

  removerCondicao(index: number): void {
    this.condicoes.splice(index, 1);
  }

  updateConditionType(condicao: RuleCondition): void {
    condicao.tipo = this.fieldTypes[condicao.campo as keyof typeof this.fieldTypes] || 'numero';
    condicao.operador = '';
    condicao.valor = '';
  }

  getOperatorsForType(tipo: string): any[] {
    return this.operatorsMap[tipo as keyof typeof this.operatorsMap] || [];
  }

  getInputType(tipo: string): string {
    switch (tipo) {
      case 'numero': return 'number';
      case 'data': return 'date';
      default: return 'text';
    }
  }

  getPlaceholder(tipo: string, campo: string): string {
    switch (campo) {
      case 'margem_lucro': return 'Ex: 10';
      case 'valor_exportacao': return 'Ex: 1000000';
      case 'produto': return 'Ex: Soja';
      case 'destino': return 'Ex: China';
      default: return 'Digite o valor';
    }
  }

  getConditionIcon(condicao: RuleCondition): string {
    switch (condicao.tipo) {
      case 'numero': return 'calculate';
      case 'texto': return 'text_fields';
      case 'data': return 'calendar_today';
      case 'booleano': return 'toggle_on';
      default: return 'rule';
    }
  }

  getConditionDescription(condicao: RuleCondition): string {
    if (!condicao.campo) return 'Nova Condição';
    return `${condicao.campo} ${condicao.operador} ${condicao.valor}`.replace(/_/g, ' ');
  }

  adicionarAcao(): void {
    const newAction: RuleAction = {
      tipo: 'alerta',
      configuracao: {}
    };

    this.acoes.push(newAction);
  }

  removerAcao(index: number): void {
    this.acoes.splice(index, 1);
  }

  resetActionConfig(acao: RuleAction): void {
    acao.configuracao = {};
  }

  getActionIcon(tipo: string): string {
    switch (tipo) {
      case 'alerta': return 'notification_important';
      case 'email': return 'email';
      case 'bloqueio': return 'block';
      case 'tarefa': return 'task';
      case 'webhook': return 'webhook';
      case 'ia': return 'psychology';
      default: return 'flash_on';
    }
  }

  getActionTitle(tipo: string): string {
    switch (tipo) {
      case 'alerta': return 'Enviar Alerta';
      case 'email': return 'Enviar Email';
      case 'bloqueio': return 'Bloquear Operação';
      case 'tarefa': return 'Criar Tarefa';
      case 'webhook': return 'Chamar Webhook';
      case 'ia': return 'Executar IA';
      default: return 'Ação';
    }
  }

  getActionDescription(acao: RuleAction): string {
    switch (acao.tipo) {
      case 'alerta':
        return acao.configuracao?.mensagem || 'Alerta não configurado';
      case 'email':
        return `Para: ${acao.configuracao?.destinatarios || 'não configurado'}`;
      case 'bloqueio':
        return acao.configuracao?.motivo || 'Bloqueio não configurado';
      case 'tarefa':
        return acao.configuracao?.titulo || 'Tarefa não configurada';
      default:
        return 'Configuração pendente';
    }
  }

  getEventLabel(evento: string): string {
    const events: {[key: string]: string} = {
      'exportacao-criada': 'Nova Exportação Criada',
      'documento-gerado': 'Documento Gerado',
      'pagamento-recebido': 'Pagamento Recebido',
      'cambio-alterado': 'Câmbio Alterado',
      'margem-calculada': 'Margem Calculada',
      'embarque-realizado': 'Embarque Realizado',
      'prazo-vencendo': 'Prazo Vencendo'
    };
    return events[evento] || evento;
  }

  generateNaturalDescription(): string {
    const evento = this.getEventLabel(this.ruleForm.get('eventoGatilho')?.value);
    let description = `Quando "${evento}" acontecer`;

    if (this.condicoes.length > 0) {
      description += ' e ';
      const conditionDescriptions = this.condicoes.map(c => 
        `${c.campo?.replace(/_/g, ' ')} ${c.operador} ${c.valor}`
      );
      description += conditionDescriptions.join(' e ');
    }

    if (this.acoes.length > 0) {
      description += ', então ';
      const actionDescriptions = this.acoes.map(a => this.getActionTitle(a.tipo));
      description += actionDescriptions.join(' e ');
    }

    return description + '.';
  }

  testarRegra(): void {
    this.notificationService.showLoading({
      title: 'Testando...',
      message: 'Executando simulação da regra'
    });

    setTimeout(() => {
      this.testResult = {
        sucesso: true,
        tempoExecucao: Math.floor(Math.random() * 500) + 100,
        condicoesAtendidas: this.condicoes.length,
        acoesExecutadas: this.acoes.length,
        detalhes: [
          'Condições verificadas com sucesso',
          'Todas as ações foram executadas',
          'Nenhum erro detectado'
        ]
      };

      this.notificationService.hideLoading();
      this.notificationService.showSuccess('Teste executado com sucesso!');
    }, 2000);
  }

  canCreateRule(): boolean {
    return this.ruleForm.valid && 
           this.condicoes.length > 0 && 
           this.acoes.length > 0;
  }

  salvarRascunho(): void {
    const rascunho = this.buildRuleData();
    rascunho.ativo = false;
    
    this.notificationService.showSuccess('Rascunho salvo com sucesso!');
    console.log('Rascunho:', rascunho);
  }

  criarRegra(): void {
    if (!this.canCreateRule()) return;

    const rule = this.buildRuleData();
    
    this.notificationService.showLoading({
      title: 'Criando...',
      message: 'Criando e ativando regra de automação'
    });

    setTimeout(() => {
      this.notificationService.hideLoading();
      this.notificationService.showSuccess('Regra criada e ativada com sucesso!');
      console.log('Regra criada:', rule);
      
      // Reset form
      this.resetForm();
    }, 2000);
  }

  private buildRuleData(): AutomationRule {
    return {
      id: this.generateId(),
      nome: this.ruleForm.get('nome')?.value,
      descricao: this.ruleForm.get('descricao')?.value,
      eventoGatilho: this.ruleForm.get('eventoGatilho')?.value,
      condicoes: [...this.condicoes],
      acoes: [...this.acoes],
      ativo: this.ruleForm.get('ativo')?.value,
      prioridade: this.ruleForm.get('prioridade')?.value,
      linguagemNatural: this.linguagemNatural,
      criadoEm: new Date(),
      execucoes: 0
    };
  }

  private resetForm(): void {
    this.ruleForm.reset({
      prioridade: 'media',
      ativo: true
    });
    this.condicoes = [];
    this.acoes = [];
    this.linguagemNatural = '';
    this.aiSuggestions = [];
    this.testResult = null;
  }

  cancelar(): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('Existem alterações não salvas. Deseja realmente sair?');
      if (confirmed) {
        this.resetForm();
        this.notificationService.showInfo('Criação de regra cancelada');
      }
    } else {
      this.resetForm();
      this.notificationService.showInfo('Criação de regra cancelada');
    }
  }

  private hasUnsavedChanges(): boolean {
    return this.ruleForm.dirty || 
           this.condicoes.length > 0 || 
           this.acoes.length > 0 ||
           this.linguagemNatural.trim().length > 0;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}