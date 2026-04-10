import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-templates-simple',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div style="padding: 24px; background: linear-gradient(135deg, #e8f4fd 0%, #c3dafe 100%); min-height: 100vh;">
      
      <!-- Header -->
      <div style="margin-bottom: 24px;">
        <h1 style="display: flex; align-items: center; gap: 12px; color: #1565c0; margin: 0;">
          <mat-icon style="font-size: 32px; color: #2196f3;">content_copy</mat-icon>
          Templates de Contratos
        </h1>
        <p style="color: #666; margin: 8px 0 0 0;">Gestão de modelos reutilizáveis de contratos EIP</p>
      </div>

      <!-- Cards de exemplo -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
        
        <!-- Template 1 -->
        <mat-card style="padding: 20px;">
          <mat-card-header>
            <mat-card-title style="color: #2196f3;">
              <mat-icon style="margin-right: 8px;">content_copy</mat-icon>
              Exportação Soja China CIF
            </mat-card-title>
            <mat-card-subtitle>Código: SOJA_CN_CIF_001 | Versão: 3</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div style="margin: 16px 0;">
              <p><strong>Commodity:</strong> Soja</p>
              <p><strong>Incoterm:</strong> CIF - Cost, Insurance and Freight</p>
              <p><strong>Moeda:</strong> USD</p>
              <p><strong>Origem:</strong> Santos, Brazil</p>
              <p><strong>Destino:</strong> Qingdao, China</p>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <button mat-raised-button color="primary">
                <mat-icon>edit</mat-icon>
                Editar
              </button>
              <button mat-button>
                <mat-icon>description</mat-icon>
                Gerar Contrato
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Template 2 -->
        <mat-card style="padding: 20px;">
          <mat-card-header>
            <mat-card-title style="color: #2196f3;">
              <mat-icon style="margin-right: 8px;">content_copy</mat-icon>
              Exportação Milho Europa FOB
            </mat-card-title>
            <mat-card-subtitle>Código: MILHO_EU_FOB_001 | Versão: 2</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div style="margin: 16px 0;">
              <p><strong>Commodity:</strong> Milho</p>
              <p><strong>Incoterm:</strong> FOB - Free on Board</p>
              <p><strong>Moeda:</strong> USD</p>
              <p><strong>Origem:</strong> Santos, Brazil</p>
              <p><strong>Destino:</strong> Rotterdam, Netherlands</p>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <button mat-raised-button color="primary">
                <mat-icon>edit</mat-icon>
                Editar
              </button>
              <button mat-button>
                <mat-icon>description</mat-icon>
                Gerar Contrato
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Template 3 -->
        <mat-card style="padding: 20px;">
          <mat-card-header>
            <mat-card-title style="color: #2196f3;">
              <mat-icon style="margin-right: 8px;">content_copy</mat-icon>
              Farelo Soja Sudeste Asiático 
            </mat-card-title>
            <mat-card-subtitle>Código: FARELO_ASIA_CIF_001 | Versão: 1</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div style="margin: 16px 0;">
              <p><strong>Commodity:</strong> Farelo de Soja</p>
              <p><strong>Incoterm:</strong> CIF - Cost, Insurance and Freight</p>
              <p><strong>Moeda:</strong> USD</p>
              <p><strong>Origem:</strong> Paranaguá, Brazil</p>
              <p><strong>Destino:</strong> Ho Chi Minh, Vietnam</p>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <button mat-raised-button color="primary">
                <mat-icon>edit</mat-icon>
                Editar
              </button>
              <button mat-button>
                <mat-icon>description</mat-icon>
                Gerar Contrato
              </button>
            </div>
          </mat-card-content>
        </mat-card>

      </div>

      <!-- Botão para criar novo template -->
      <div style="position: fixed; bottom: 24px; right: 24px;">
        <button mat-fab color="primary" style="width: 64px; height: 64px;">
          <mat-icon style="font-size: 24px;">add</mat-icon>
        </button>
      </div>

    </div>
  `
})
export class TemplatesSimpleComponent {
  constructor() {
    console.log('🚀 TemplatesSimpleComponent inicializado!');
  }
}