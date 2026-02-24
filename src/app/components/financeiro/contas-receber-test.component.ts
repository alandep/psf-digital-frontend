import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contas-receber-test',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div style="padding: 24px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>trending_up</mat-icon>
            Contas a Receber - Teste
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h2>🎉 Tela de Contas a Receber carregada com sucesso!</h2>
          <p>Esta é uma versão de teste da tela de Contas a Receber.</p>
          <p>Se você está vendo esta mensagem, significa que o roteamento está funcionando corretamente.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class ContasReceberTestComponent {
  constructor() {
    console.log('ContasReceberTestComponent carregado com sucesso!');
  }
}