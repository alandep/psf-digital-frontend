import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-test-contratos-ativos',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="padding: 20px;">
      <h1>🎯 Teste - Contratos Ativos</h1>
      <p>Se você está vendo esta mensagem, a rota está funcionando!</p>
      <p>Agora podemos verificar o que está impedindo o componente principal de funcionar.</p>
    </div>
  `
})
export class TestContratosAtivosComponent {
  constructor() {
    console.log('🎯 TestContratosAtivosComponent carregado com sucesso!');
  }
}