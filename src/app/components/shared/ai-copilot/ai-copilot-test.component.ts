import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-ai-copilot-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div style="padding: 24px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>smart_toy</mat-icon>
            Assistente de IA - Teste
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2>🤖 Assistente de IA Funcionando!</h2>
          <p>Este é um teste para verificar se a rota está funcionando corretamente.</p>
          <p>Se você pode ver esta mensagem, a navegação para o assistente de IA está funcionando.</p>
          
          <button mat-raised-button color="primary">
            <mat-icon>chat</mat-icon>
            Iniciar Chat
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class AiCopilotTestComponent {
  constructor() {
    console.log('🚀 AiCopilotTestComponent carregado!');
  }
}