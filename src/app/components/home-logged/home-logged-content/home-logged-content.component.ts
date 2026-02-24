import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';

interface LoggedUser {
  cpf: string;
  city: string;
  psf: string;
  name: string;
}

@Component({
  selector: 'app-home-logged-content',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <main class="main-content">
      <div class="content-wrapper">
        <div class="welcome-section">
          <h1>Bem-vindo, {{loggedUser.name}}!</h1>
          <p>Sistema PSF Digital - {{loggedUser.city}}</p>
          <p>PSF: {{loggedUser.psf}}</p>
        </div>

        <!-- Quick Access Cards -->
        <div class="quick-access-section">
          <h2 class="section-title">
            <mat-icon>quick_contacts_dialer</mat-icon>
            Acesso Rápido
          </h2>
          <div class="cards-container">
            
            <!-- Card Cadastro Individual -->
            <mat-card class="action-card" (click)="navigateTo('fichas/cadastro-individual')">
              <mat-card-header>
                <div mat-card-avatar class="card-icon individual">
                  <mat-icon>person_add</mat-icon>
                </div>
                <mat-card-title>Cadastro Individual</mat-card-title>
                <mat-card-subtitle>Gerencie cadastros de cidadãos</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>Acesse o sistema de cadastro individual para registrar e gerenciar informações dos cidadãos atendidos pelo PSF.</p>
                <div class="card-stats">
                  <span class="stat-item">
                    <mat-icon>people</mat-icon>
                    1.247 cadastros
                  </span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" class="action-button">
                  <mat-icon>launch</mat-icon>
                  Acessar Sistema
                </button>
              </mat-card-actions>
            </mat-card>

            <!-- Card Cadastro Domiciliar -->
            <mat-card class="action-card" (click)="navigateTo('fichas/cadastro-domiciliar')">
              <mat-card-header>
                <div mat-card-avatar class="card-icon domiciliar">
                  <mat-icon>home_work</mat-icon>
                </div>
                <mat-card-title>Cadastro Domiciliar</mat-card-title>
                <mat-card-subtitle>Registros familiares e domiciliares</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>Sistema para cadastro e acompanhamento de famílias e suas condições domiciliares na área de cobertura.</p>
                <div class="card-stats">
                  <span class="stat-item">
                    <mat-icon>home</mat-icon>
                    892 domicílios
                  </span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" class="action-button">
                  <mat-icon>launch</mat-icon>
                  Acessar Sistema
                </button>
              </mat-card-actions>
            </mat-card>

            <!-- Card Visita Domiciliar -->
            <mat-card class="action-card" (click)="navigateTo('fichas/visita-domiciliar')">
              <mat-card-header>
                <div mat-card-avatar class="card-icon visita">
                  <mat-icon>medical_services</mat-icon>
                </div>
                <mat-card-title>Visita Domiciliar</mat-card-title>
                <mat-card-subtitle>Acompanhamento e visitas</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>Registre e acompanhe as visitas domiciliares realizadas pelos agentes de saúde da família.</p>
                <div class="card-stats">
                  <span class="stat-item">
                    <mat-icon>assignment</mat-icon>
                    156 visitas mês
                  </span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" class="action-button">
                  <mat-icon>launch</mat-icon>
                  Acessar Sistema
                </button>
              </mat-card-actions>
            </mat-card>

          </div>
        </div>

        <!-- Additional Info Section -->
        <div class="info-section">
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>info</mat-icon>
                Informações do Sistema
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-grid">
                <div class="info-item">
                  <mat-icon class="info-icon">location_city</mat-icon>
                  <span class="info-label">Cidade:</span>
                  <span class="info-value">{{loggedUser.city}}</span>
                </div>
                <div class="info-item">
                  <mat-icon class="info-icon">business</mat-icon>
                  <span class="info-label">PSF:</span>
                  <span class="info-value">{{loggedUser.psf}}</span>
                </div>
                <div class="info-item">
                  <mat-icon class="info-icon">person</mat-icon>
                  <span class="info-label">Usuário:</span>
                  <span class="info-value">{{loggedUser.name}}</span>
                </div>
                <div class="info-item">
                  <mat-icon class="info-icon">schedule</mat-icon>
                  <span class="info-label">Último acesso:</span>
                  <span class="info-value">{{getCurrentDate()}}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .main-content {
      flex: 1;
      background: #f8f9fa;
      min-height: calc(100vh - 64px - 200px);
    }

    .content-wrapper {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 32px;
      text-align: center;
    }

    .welcome-section h1 {
      color: #1976d2;
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    .welcome-section p {
      color: #666;
      font-size: 1.1rem;
      margin: 8px 0;
    }

    .quick-access-section {
      margin-bottom: 32px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 24px;
      padding-left: 4px;
    }

    .section-title mat-icon {
      color: #1976d2;
      font-size: 1.8rem;
      width: 1.8rem;
      height: 1.8rem;
    }

    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .action-card {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      position: relative;
    }

    .action-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .action-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #1976d2, #42a5f5);
    }

    .card-icon {
      width: 56px !important;
      height: 56px !important;
      border-radius: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .card-icon mat-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
      color: white !important;
    }

    .card-icon.individual {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
    }

    .card-icon.domiciliar {
      background: linear-gradient(135deg, #ff9800, #ffb74d);
    }

    .card-icon.visita {
      background: linear-gradient(135deg, #e91e63, #f06292);
    }

    .action-card mat-card-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .action-card mat-card-subtitle {
      color: #666;
      font-size: 0.95rem;
    }

    .action-card mat-card-content {
      padding-top: 16px;
    }

    .action-card mat-card-content p {
      color: #555;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .card-stats {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .stat-item mat-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #1976d2;
    }

    .action-button {
      width: 100%;
      height: 48px;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(25, 118, 210, 0.3);
    }

    .action-button mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    .info-section {
      margin-top: 32px;
    }

    .info-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
      font-weight: 600;
    }

    .info-card mat-card-title mat-icon {
      color: #1976d2;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .info-icon {
      color: #1976d2 !important;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
    }

    .info-label {
      font-weight: 500;
      color: #666;
      min-width: 80px;
    }

    .info-value {
      font-weight: 600;
      color: #333;
    }

    @media (max-width: 768px) {
      .cards-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-card {
        margin-bottom: 16px;
      }

      .content-wrapper {
        padding: 16px;
      }

      .welcome-section {
        padding: 24px 16px;
      }

      .welcome-section h1 {
        font-size: 1.5rem;
      }

      .section-title {
        font-size: 1.3rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class HomeLoggedContentComponent {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  loggedUser: LoggedUser = {
    cpf: '123.456.789-00',
    city: 'Belo Horizonte',
    psf: 'PSF Central',
    name: 'João Silva'
  };

  navigateTo(route: string): void {
    console.log('📍 Navegando do content para:', route);
    this.notificationService.showInfo(`Acessando: ${route.split('/').pop()?.replace('-', ' ')}`);
    
    // Evitar navegação se já estamos na rota
    const currentUrl = this.router.url;
    const targetUrl = `/home-logged/${route}`;
    
    if (currentUrl === targetUrl) {
      console.log('🔄 Já estamos na rota:', targetUrl);
      return;
    }
    
    // Navegar usando navigateByUrl para maior controle
    console.log('🎯 Navegando de:', currentUrl, 'para:', targetUrl);
    
    this.router.navigateByUrl(targetUrl).then(success => {
      if (success) {
        console.log('✅ Navegação do content bem-sucedida para:', targetUrl);
      } else {
        console.error('❌ Falha na navegação do content para:', targetUrl);
        this.notificationService.showError('Erro ao navegar para a página solicitada');
      }
    }).catch(error => {
      console.error('❌ Erro durante navegação do content:', error);
      this.notificationService.showError('Erro ao navegar para a página solicitada');
    });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
