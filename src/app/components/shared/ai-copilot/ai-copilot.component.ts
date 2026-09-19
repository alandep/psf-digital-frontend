import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { trigger, transition, style, animate, state } from '@angular/animations';

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  loading?: boolean;
}

interface QuickAction {
  label: string;
  command: string;
  icon: string;
  category: 'export' | 'financial' | 'analysis' | 'report';
}

@Component({
  selector: 'app-ai-copilot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="copilot-container" [@slideAnimation]="isExpanded ? 'expanded' : 'collapsed'">
      <!-- Toggle Button -->
      <button mat-fab 
              color="primary"
              class="copilot-toggle"
              (click)="toggleCopilot()"
              [matTooltip]="isExpanded ? 'Fechar Assistente IA' : 'Abrir Assistente IA'">
        <mat-icon>{{isExpanded ? 'close' : 'smart_toy'}}</mat-icon>
      </button>

      <!-- Chat Interface -->
      <mat-card class="copilot-chat" *ngIf="isExpanded">
        <mat-card-header class="chat-header">
          <div class="header-content">
            <mat-icon class="ai-icon">smart_toy</mat-icon>
            <div class="header-text">
              <h3>Export AI Assistant</h3>
              <span class="status" [class.online]="aiStatus === 'online'">
                {{aiStatus === 'online' ? 'Online' : 'Conectando...'}}
              </span>
            </div>
          </div>
          <button mat-icon-button (click)="clearChat()">
            <mat-icon>refresh</mat-icon>
          </button>
        </mat-card-header>

        <mat-card-content class="chat-content">
          <!-- Quick Actions -->
          <div class="quick-actions" *ngIf="messages.length === 0">
            <h4>Perguntas Populares:</h4>
            <div class="action-grid">
              <mat-chip-listbox class="chip-list">
                <mat-chip-option 
                  *ngFor="let action of quickActions" 
                  (click)="executeQuickAction(action)"
                  class="quick-chip">
                  <mat-icon matChipAvatar>{{action.icon}}</mat-icon>
                  {{action.label}}
                </mat-chip-option>
              </mat-chip-listbox>
            </div>
          </div>

          <!-- Messages -->
          <div class="messages-container" #messagesContainer>
            <div class="message" 
                 *ngFor="let message of messages; trackBy: trackByMessage"
                 [class]="message.type">
              
              <div class="message-avatar">
                <mat-icon *ngIf="message.type === 'ai'">smart_toy</mat-icon>
                <mat-icon *ngIf="message.type === 'user'">person</mat-icon>
              </div>
              
              <div class="message-content">
                <div class="message-text">
                  {{message.content}}
                </div>
                <div class="message-time">
                  {{message.timestamp | date:'HH:mm'}}
                </div>
              </div>
            </div>

            <!-- Loading Message -->
            <div class="message ai" *ngIf="isProcessing">
              <div class="message-avatar">
                <mat-icon>smart_toy</mat-icon>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <mat-progress-bar mode="indeterminate" class="progress-bar"></mat-progress-bar>
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions class="chat-input">
          <mat-form-field appearance="outline" class="input-field">
            <mat-label>Digite sua pergunta...</mat-label>
            <input matInput 
                   [(ngModel)]="currentMessage"
                   (keydown.enter)="sendMessage()"
                   [disabled]="isProcessing"
                   placeholder="Ex: Qual exportação tem maior lucro?"
                   #messageInput>
            <mat-icon matPrefix>chat</mat-icon>
          </mat-form-field>
          
          <button mat-fab 
                  color="primary"
                  mini
                  (click)="sendMessage()"
                  [disabled]="!currentMessage.trim() || isProcessing"
                  matTooltip="Enviar mensagem">
            <mat-icon>send</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .copilot-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 16px;
    }

    .copilot-toggle {
      box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
      transition: all 0.3s ease;
    }

    .copilot-toggle:hover {
      transform: scale(1.1);
    }

    .copilot-chat {
      width: 400px;
      height: 600px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border-radius: 16px;
      overflow: hidden;
    }

    .chat-header {
      background: linear-gradient(135deg, #1976d2, #42a5f5);
      color: white;
      padding: 16px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .ai-icon {
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
    }

    .header-text h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .status {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .status.online {
      color: #4caf50;
    }

    .chat-content {
      flex: 1;
      padding: 16px !important;
      overflow-y: auto;
      background: #fafafa;
    }

    .quick-actions h4 {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .chip-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .quick-chip {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .quick-chip:hover {
      transform: translateY(-2px);
    }

    .messages-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 200px;
    }

    .message {
      display: flex;
      gap: 12px;
      animation: fadeIn 0.3s ease;
    }

    .message.user {
      flex-direction: row-reverse;
    }

    .message.user .message-content {
      background: #1976d2;
      color: white;
      border-radius: 18px 18px 4px 18px;
    }

    .message.ai .message-content {
      background: white;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid #e0e0e0;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .message-avatar mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #1976d2;
    }

    .message-content {
      padding: 12px 16px;
      max-width: 280px;
      word-wrap: break-word;
    }

    .message-text {
      line-height: 1.4;
    }

    .message-time {
      font-size: 0.75rem;
      opacity: 0.7;
      margin-top: 4px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
    }

    .typing-indicator span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #1976d2;
      animation: typing 1.5s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    .progress-bar {
      height: 2px;
    }

    .chat-input {
      padding: 16px !important;
      background: white;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .input-field {
      flex: 1;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: scale(1);
        opacity: 0.5;
      }
      30% {
        transform: scale(1.2);
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .copilot-container {
        bottom: 16px;
        right: 16px;
      }

      .copilot-chat {
        width: 340px;
        height: 500px;
      }

      .message-content {
        max-width: 220px;
      }
    }
  `],
  animations: [
    trigger('slideAnimation', [
      state('collapsed', style({
        opacity: 0,
        transform: 'translateY(20px) scale(0.9)'
      })),
      state('expanded', style({
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      })),
      transition('collapsed => expanded', [
        animate('300ms ease-out')
      ]),
      transition('expanded => collapsed', [
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class AiCopilotComponent implements OnInit, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  isExpanded = false;
  currentMessage = '';
  isProcessing = false;
  aiStatus: 'online' | 'connecting' = 'online';

  messages: ChatMessage[] = [];

  quickActions: QuickAction[] = [
    {
      label: 'Minha exportação é rentável?',
      command: 'analise_rentabilidade',
      icon: 'analytics',
      category: 'analysis'
    },
    {
      label: 'Qual exportação tem maior lucro?',
      command: 'ranking_lucro',
      icon: 'trending_up',
      category: 'analysis'
    },
    {
      label: 'Status do dólar hoje',
      command: 'cotacao_dolar',
      icon: 'currency_exchange',
      category: 'financial'
    },
    {
      label: 'Criar nova exportação',
      command: 'criar_exportacao',
      icon: 'add_box',
      category: 'export'
    },
    {
      label: 'Relatório de rentabilidade',
      command: 'relatorio_rentabilidade',
      icon: 'assessment',
      category: 'report'
    },
    {
      label: 'Simular cenário cambial',
      command: 'simular_cambio',
      icon: 'calculate',
      category: 'analysis'
    }
  ];

  ngOnInit(): void {
    this.initializeWelcomeMessage();
  }

  ngAfterViewInit(): void {
    if (this.isExpanded) {
      this.scrollToBottom();
    }
  }

  private initializeWelcomeMessage(): void {
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      content: 'Olá! Sou seu assistente de IA especializado em exportações. Como posso ajudá-lo hoje?',
      type: 'ai',
      timestamp: new Date()
    };
    this.messages = [welcomeMessage];
  }

  toggleCopilot(): void {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      setTimeout(() => {
        this.messageInput?.nativeElement?.focus();
        this.scrollToBottom();
      }, 300);
    }
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isProcessing) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: this.currentMessage,
      type: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const messageToProcess = this.currentMessage;
    this.currentMessage = '';
    this.isProcessing = true;

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

    // Simulate AI response
    this.processAiResponse(messageToProcess);
  }

  executeQuickAction(action: QuickAction): void {
    this.currentMessage = action.label;
    this.sendMessage();
  }

  private processAiResponse(userMessage: string): void {
    // Simulate AI processing time
    setTimeout(() => {
      const response = this.generateAiResponse(userMessage);
      
      const aiMessage: ChatMessage = {
        id: this.generateId(),
        content: response,
        type: 'ai',
        timestamp: new Date()
      };

      this.messages.push(aiMessage);
      this.isProcessing = false;
      
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }, 1500 + Math.random() * 2000); // 1.5-3.5 seconds
  }

  private generateAiResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();

    // Análise de rentabilidade
    if (message.includes('rentável') || message.includes('lucro') || message.includes('rentabilidade')) {
      return `📊 Análise de Rentabilidade Concluída

Sua exportação atual tem:
• Score de Rentabilidade: 87%
• Margem de Lucro: 18.4%
• Confiabilidade: 92%

✅ Pontos Positivos:
• Preço internacional favorável: +12%
• Taxa cambial positiva: +4%
• Baixo custo logístico: +6%

⚠️ Pontos de Atenção:
• Volatilidade cambial: -5%
• Custo portuário elevado: -3%

Deseja simular cenários alternativos?`;
    }

    // Cotação do dólar
    if (message.includes('dólar') || message.includes('câmbio') || message.includes('cotação')) {
      return `💰 Status do Câmbio

Dólar hoje: R$ 5.18
• Variação: +0.8% ↗️
• Máxima: R$ 5.22
• Mínima: R$ 5.14

📈 Tendência IA:
• Próximos 7 dias: Estável
• Próximos 30 dias: Leve alta
• Confiança: 78%

Momento favorável para novos contratos!`;
    }

    // Criar exportação
    if (message.includes('criar') || message.includes('nova exportação')) {
      return `🚀 Assistente de Nova Exportação

Vou te ajudar! Preciso de algumas informações:

1. Produto: Soja, Milho, Café, Açúcar?
2. Destino: Qual país/região?
3. Quantidade: Quantas toneladas?
4. Prazo: Data prevista de embarque?

Digite as informações ou clique em "Exportações → Novos Pedidos" no menu.`;
    }

    // Relatórios
    if (message.includes('relatório') || message.includes('report')) {
      return `📋 Relatórios Disponíveis

Posso gerar:
• Rentabilidade por Produto
• Análise Cambial
• Performance Logística
• Compliance Status

Qual relatório você gostaria? Ou acesse "Relatórios" no menu principal.`;
    }

    // Simulação
    if (message.includes('simular') || message.includes('cenário')) {
      return `🔮 Simulador de Cenários

Cenários disponíveis:
• Cambial: E se o dólar subir/descer?
• Logístico: E se o frete aumentar?
• Commodity: Variação de preços
• Temporal: Impacto de atrasos

Acesse "Rentabilidade → Simulador" para análise detalhada.`;
    }

    // Resposta genérica inteligente
    return `🤖 Entendi sua questão sobre "${userMessage}".

Como assistente especializado em exportações, posso ajudar com:

• Análises de Rentabilidade
• Simulações de Cenários
• Status de Documentos
• Cotações em Tempo Real
• Geração de Relatórios

Seja mais específico ou use uma das sugestões acima!`;
  }

  clearChat(): void {
    this.messages = [];
    this.initializeWelcomeMessage();
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch {
      /* ignore scroll errors */
    }
  }

  trackByMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}