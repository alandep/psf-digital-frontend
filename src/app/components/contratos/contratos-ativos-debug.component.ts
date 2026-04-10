import { Component } from '@angular/core';

@Component({
  selector: 'app-contratos-ativos-debug',
  standalone: true,
  template: `
    <div style="padding: 50px; text-align: center; background: #f0f8f0;">
      <h1 style="color: #4caf50;">🚀 CONTRATOS ATIVOS - DEBUG</h1>
      <h2>Se você está vendo esta tela, a rota está funcionando!</h2>
      <p>Timestamp: {{ timestamp }}</p>
      <div style="background: white; padding: 20px; margin: 20px; border-radius: 8px;">
        <p><strong>Rota:</strong> /home-logged/contratos/ativos</p>
        <p><strong>Componente:</strong> ContratosAtivosDebugComponent</p>
        <p><strong>Status:</strong> ✅ FUNCIONANDO</p>
      </div>
    </div>
  `
})
export class ContratosAtivosDebugComponent {
  timestamp = new Date().toLocaleString();
  
  constructor() {
    console.log('🎯 ContratosAtivosDebugComponent CARREGADO!', this.timestamp);
  }
}