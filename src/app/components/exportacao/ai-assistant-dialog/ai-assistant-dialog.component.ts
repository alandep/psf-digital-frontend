import {
  Component,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable } from 'rxjs';

import { AIAssistantMessage } from '../../../../types/exportacao';

/**
 * Contrato de dados fornecido pelo host ao abrir o assistente de IA.
 */
export interface AiAssistantDialogData {
  /** Título exibido no cabeçalho. Padrão: "Assistente IA". */
  title?: string;
  /** Subtítulo exibido no cabeçalho. */
  subtitle?: string;
  /** Referência compartilhada do array de mensagens (mutada no lugar). */
  messages: AIAssistantMessage[];
  /** Callback que processa a consulta e retorna as mensagens a serem anexadas. */
  onSend: (query: string) => Observable<AIAssistantMessage[]>;
  /** Rótulo opcional de ação secundária (ex.: "Preencher com IA"). */
  secondaryActionLabel?: string;
  /** Handler da ação secundária. */
  onSecondaryAction?: () => void;
}

@Component({
  selector: 'app-ai-assistant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './ai-assistant-dialog.component.html',
  styleUrls: ['./ai-assistant-dialog.component.scss']
})
export class AiAssistantDialogComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  /** Texto digitado pelo usuário. */
  query = '';
  /** Indica se uma consulta está sendo processada. */
  processing = false;

  private shouldScroll = false;

  readonly title: string;
  readonly subtitle: string;

  constructor(
    public dialogRef: MatDialogRef<AiAssistantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AiAssistantDialogData
  ) {
    this.title = data.title || 'Assistente IA';
    this.subtitle = data.subtitle || 'Seu consultor inteligente de exportação';
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  get messages(): AIAssistantMessage[] {
    return this.data.messages;
  }

  /** Envia a consulta atual ao host e anexa as mensagens de resposta. */
  send(): void {
    const text = this.query.trim();
    if (!text || this.processing) {
      return;
    }

    // Mostra imediatamente a mensagem do usuário.
    this.data.messages.push({
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      type: 'user',
      message: text,
      timestamp: new Date()
    });

    this.processing = true;
    this.query = '';
    this.shouldScroll = true;

    this.data.onSend(text).subscribe({
      next: (messages: AIAssistantMessage[]) => {
        if (messages && messages.length) {
          this.data.messages.push(...messages);
        }
        this.processing = false;
        this.shouldScroll = true;
      },
      error: (error: any) => {
        console.error('Erro na consulta IA:', error);
        this.data.messages.push({
          id: 'err_' + Math.random().toString(36).substring(2, 11),
          type: 'assistant',
          message:
            'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
          timestamp: new Date()
        });
        this.processing = false;
        this.shouldScroll = true;
      }
    });
  }

  /** Trata o Enter para enviar (sem inserir nova linha). */
  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      return;
    }
    keyboardEvent.preventDefault();
    this.send();
  }

  /** Dispara a ação secundária fornecida pelo host. */
  triggerSecondaryAction(): void {
    if (this.data.onSecondaryAction) {
      this.data.onSecondaryAction();
    }
  }

  /** Formata o timestamp da mensagem no formato HH:mm. */
  formatTime(timestamp: Date | string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch {
      // ignora falhas de scroll
    }
  }
}
