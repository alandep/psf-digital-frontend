import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acesso-negado',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="acesso-negado-wrapper">
      <mat-card class="acesso-negado-card">
        <mat-icon class="lock-icon">lock</mat-icon>
        <h1 class="titulo">Acesso Negado</h1>
        <p class="mensagem">
          Seu perfil não tem permissão para acessar esta tela.
        </p>
        <button mat-flat-button color="primary" (click)="voltarAoInicio()">
          <mat-icon>home</mat-icon>
          Voltar ao início
        </button>
      </mat-card>
    </div>
  `,
  styles: [`
    .acesso-negado-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 64px);
      padding: 24px;
      background: #f5f7fa;
    }
    .acesso-negado-card {
      max-width: 440px;
      width: 100%;
      text-align: center;
      padding: 40px 32px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
  `,
  `
    .lock-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #1976d2;
      margin-bottom: 16px;
    }
    .titulo {
      margin: 0 0 12px;
      font-size: 1.6rem;
      font-weight: 700;
      color: #263238;
    }
    .mensagem {
      margin: 0 0 28px;
      color: #607d8b;
      font-size: 1rem;
      line-height: 1.5;
    }
    button mat-icon { margin-right: 6px; }
  `]
})
export class AcessoNegadoComponent {
  private router = inject(Router);

  voltarAoInicio(): void {
    this.router.navigate(['/home-logged/dashboards/principal']);
  }
}
