import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule, MatIconModule],
  template: `
    <div class="loading-overlay" *ngIf="notificationService.isLoading$ | async">
      <mat-card class="loading-card">
        <mat-card-content>
          <div class="loading-container">
            <!-- Progress Spinner Principal -->
            <mat-spinner 
              [diameter]="diameter"
              [strokeWidth]="strokeWidth"
              [color]="color">
            </mat-spinner>
            
            <!-- Texto de carregamento -->
            <div class="loading-text-container">
              <h3 class="loading-title">
                <mat-icon class="loading-icon">{{loadingIcon}}</mat-icon>
                {{loadingTitle}}
              </h3>
              <p class="loading-message">{{loadingMessage}}</p>
            </div>
            
            <!-- Progress Spinner Secundário (determinado) -->
            <div class="progress-info" *ngIf="showProgress">
              <mat-spinner 
                mode="determinate" 
                [value]="progressValue"
                [diameter]="32"
                [strokeWidth]="3">
              </mat-spinner>
              <span class="progress-text">{{progressValue}}%</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        backdrop-filter: blur(0px);
      }
      to {
        opacity: 1;
        backdrop-filter: blur(4px);
      }
    }

    .loading-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      animation: slideUp 0.4s ease-out;
      min-width: 280px;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      text-align: center;
    }

    .loading-text-container {
      margin: 24px 0 16px 0;
      font-family: 'Inter', sans-serif;
    }

    .loading-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .loading-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      color: #1976d2;
    }

    .loading-message {
      margin: 0;
      font-size: 14px;
      font-weight: 400;
      color: #666;
      line-height: 1.4;
    }

    .progress-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
      padding: 12px 16px;
      background: rgba(25, 118, 210, 0.08);
      border-radius: 8px;
      border: 1px solid rgba(25, 118, 210, 0.2);
    }

    .progress-text {
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 14px;
      color: #1976d2;
      min-width: 40px;
    }

    /* Customização do Material Spinner */
    mat-spinner {
      --mdc-circular-progress-active-indicator-color: #1976d2;
      --mdc-circular-progress-four-color-active-indicator-one-color: #1976d2;
      --mdc-circular-progress-four-color-active-indicator-two-color: #42a5f5;
      --mdc-circular-progress-four-color-active-indicator-three-color: #64b5f6;
      --mdc-circular-progress-four-color-active-indicator-four-color: #90caf9;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .loading-card {
        margin: 20px;
        min-width: auto;
        max-width: 90vw;
      }
      
      .loading-container {
        padding: 20px;
      }
      
      .loading-title {
        font-size: 16px;
      }
      
      .loading-message {
        font-size: 13px;
      }
    }

    /* Acessibilidade */
    @media (prefers-reduced-motion: reduce) {
      .loading-overlay,
      .loading-card {
        animation: none;
      }
    }
  `]
})
export class LoadingComponent {
  protected notificationService = inject(NotificationService);

  // Configurações do spinner (seguindo a documentação do Material)
  @Input() diameter: number = 60;
  @Input() strokeWidth: number = 6;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  
  // Textos e ícone customizáveis
  @Input() loadingTitle: string = 'Carregando...';
  @Input() loadingMessage: string = 'Por favor, aguarde enquanto processamos sua solicitação.';
  @Input() loadingIcon: string = 'refresh';
  
  // Progress determinado (opcional)
  @Input() showProgress: boolean = false;
  @Input() progressValue: number = 0;

  constructor() {
    // Simula progresso para demonstração
    if (this.showProgress) {
      this.simulateProgress();
    }
  }

  private simulateProgress(): void {
    const interval = setInterval(() => {
      this.progressValue += Math.random() * 10;
      if (this.progressValue >= 100) {
        this.progressValue = 100;
        clearInterval(interval);
      }
    }, 200);
  }
}
