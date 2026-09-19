import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  selector: 'app-ai-copilot-simple',
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
    MatTooltipModule
  ],
  templateUrl: './ai-copilot-simple.component.html',
  styleUrls: ['./ai-copilot-simple.component.scss']
})
export class AiCopilotSimpleComponent implements OnInit, AfterViewInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  public messages: ChatMessage[] = [];
  public userInput = '';
  public isProcessing = false;

  public quickActions: QuickAction[] = [
    { label: 'Relatório Recebimentos', command: 'Gere um relatório de recebimentos do mês atual', icon: 'trending_up', category: 'financial' },
    { label: 'Análise de Moedas', command: 'Analise a distribuição de recebimentos por moeda', icon: 'pie_chart', category: 'analysis' },
    { label: 'Exportar Dados', command: 'Como posso exportar os dados de recebimentos?', icon: 'download', category: 'export' },
    { label: 'Dashboard Personalizado', command: 'Crie um dashboard com KPIs financeiros', icon: 'dashboard', category: 'report' },
    { label: 'Previsões', command: 'Gere uma previsão de recebimentos para o próximo trimestre', icon: 'prediction', category: 'analysis' },
  ];

  ngOnInit(): void {
    // Adicionar mensagem de boas-vindas
    setTimeout(() => {
      this.addAiMessage('Olá! 👋 Sou seu assistente de IA para o Export Intelligence Platform. Como posso ajudá-lo hoje?');
    }, 500);
  }

  ngAfterViewInit(): void {
    // Scrollar para o final se houver mensagens
    setTimeout(() => this.scrollToBottom(), 100);
  }

  public sendMessage(): void {
    if (!this.userInput.trim() || this.isProcessing) return;

    const userMessage = this.userInput.trim();
    this.userInput = '';

    // Adicionar mensagem do usuário
    this.addUserMessage(userMessage);

    // Simular resposta da IA
    this.processAiResponse(userMessage);
  }

  public executeQuickAction(action: QuickAction): void {
    if (this.isProcessing) return;

    // Adicionar como mensagem do usuário
    this.addUserMessage(action.command);

    // Processar resposta específica para a ação
    this.processAiResponse(action.command);
  }

  private addUserMessage(content: string): void {
    const message: ChatMessage = {
      id: this.generateId(),
      content: content,
      type: 'user',
      timestamp: new Date()
    };

    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private addAiMessage(content: string): void {
    const message: ChatMessage = {
      id: this.generateId(),
      content: content,
      type: 'ai',
      timestamp: new Date()
    };

    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private processAiResponse(userMessage: string): void {
    this.isProcessing = true;

    // Adicionar mensagem temporária com loading
    const loadingMessage: ChatMessage = {
      id: this.generateId(),
      content: '',
      type: 'ai',
      timestamp: new Date(),
      loading: true
    };

    this.messages.push(loadingMessage);
    setTimeout(() => this.scrollToBottom(), 100);

    // Simular tempo de processamento
    setTimeout(() => {
      // Remover loading message
      const loadingIndex = this.messages.findIndex(m => m.loading);
      if (loadingIndex !== -1) {
        this.messages.splice(loadingIndex, 1);
      }

      // Gerar resposta baseada na entrada
      const response = this.generateAiResponse(userMessage);
      this.addAiMessage(response);

      this.isProcessing = false;
    }, 1500 + Math.random() * 1000); // 1.5-2.5 segundos
  }

  private generateAiResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('relatório') && lowerMessage.includes('recebimento')) {
      return `📊 <strong>Relatório de Recebimentos</strong><br><br>
              Baseado nos dados atuais:<br>
              • Total de recebimentos este mês: R$ 2.847.500,00<br>
              • Recebimentos em USD: $425.000 (convertidos: R$ 2.125.000)<br>
              • Status: 3 pendentes, 12 processando, 8 concluídos<br>
              • Maior contrato: CONT-2024-015 (R$ 850.000)<br><br>
              💡 <em>Deseja que eu gere um dashboard visual com esses dados?</em>`;
    }

    if (lowerMessage.includes('moeda') || lowerMessage.includes('análise')) {
      return `💰 <strong>Análise de Distribuição por Moeda</strong><br><br>
              Distribuição atual dos recebimentos:<br>
              • Real (BRL): 65% - R$ 1.850.375,00<br>
              • Dólar (USD): 30% - $425.000 (≈ R$ 2.125.000)<br>
              • Euro (EUR): 5% - €15.000 (≈ R$ 82.500)<br><br>
              📈 <em>A exposição cambial está dentro dos limites recomendados.</em>`;
    }

    if (lowerMessage.includes('export') || lowerMessage.includes('dados')) {
      return `📋 <strong>Opções de Exportação</strong><br><br>
              Você pode exportar dados em vários formatos:<br>
              • <strong>Excel:</strong> Relatórios detalhados com gráficos<br>
              • <strong>PDF:</strong> Relatórios executivos<br>
              • <strong>CSV:</strong> Dados brutos para análise<br>
              • <strong>API:</strong> Integração em tempo real<br><br>
              🔗 <em>Qual formato você prefere? Posso preparar a exportação.</em>`;
    }

    if (lowerMessage.includes('dashboard') || lowerMessage.includes('kpi')) {
      return `📊 <strong>Dashboard Personalizado</strong><br><br>
              Vou criar um dashboard com os KPIs essenciais:<br>
              • Receita total e por período<br>
              • Distribuição por moeda e status<br>
              • Tendências de câmbio<br>
              • Alertas de vencimento<br>
              • Gráficos de performance<br><br>
              ⚡ <em>Dashboard sendo preparado... Onde deseja visualizá-lo?</em>`;
    }

    if (lowerMessage.includes('previsão') || lowerMessage.includes('trimestre')) {
      return `🔮 <strong>Previsão de Recebimentos</strong><br><br>
              Com base no histórico e contratos vigentes:<br><br>
              <strong>Próximo Trimestre:</strong><br>
              • Estimativa conservadora: R$ 3.2M - R$ 3.8M<br>
              • Novos contratos esperados: 4-6 contratos<br>
              • Risco cambial: Baixo (hedge em 70%)<br><br>
              📊 <em>Fatores considerados: sazonalidade, pipeline, economia.</em>`;
    }

    // Resposta genérica
    return `🤖 <strong>Entendi sua solicitação!</strong><br><br>
            Como assistente de IA do Export Intelligence Platform, posso ajudar com:<br>
            • Análises financeiras e relatórios<br>
            • Exportação de dados<br>
            • Criação de dashboards<br>
            • Previsões e tendências<br>
            • Orientações sobre o sistema<br><br>
            💡 <em>Pode ser mais específico sobre o que precisa?</em>`;
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    } catch {
      /* ignore scroll errors */
    }
  }

  public trackByMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
