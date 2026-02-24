import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../auth/login-dialog/login-dialog.component';
import { NotificationBellComponent } from '../shared/notification-bell/notification-bell.component';
import { LoadingComponent } from '../shared/loading/loading.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    NotificationBellComponent,
    LoadingComponent
  ],
  template: `
    <!-- Loading Global -->
    <app-loading></app-loading>

    <!-- Header -->
    <mat-toolbar color="primary" class="header-toolbar">
      <span class="logo">PSF Digital</span>
      <span class="spacer"></span>
      
      <div class="header-actions">
        <app-notification-bell></app-notification-bell>
        
        <!-- Botão com ícone seguindo a documentação -->
        <button mat-raised-button color="accent" (click)="openLoginDialog()" class="login-button">
          <mat-icon>login</mat-icon>
          Login
        </button>
      </div>
    </mat-toolbar>

    <!-- Content -->
    <main class="main-content">
      <div class="hero-section">
        <div class="hero-header">
          <h1 class="hero-title">Bem-vindo ao PSF Digital</h1>
          <p class="hero-subtitle">Plataforma de Saúde da Família</p>
          <p class="hero-description">Acesse sua conta para gerenciar informações de saúde, agendar consultas e muito mais.</p>
        </div>

        <!-- Quick Access Cards -->
        <div class="cards-container">
          
          <!-- Card Gestão de Saúde -->
          <mat-card class="action-card" (click)="openLoginDialog()">
            <mat-card-header>
              <div mat-card-avatar class="card-icon saude">
                <mat-icon>health_and_safety</mat-icon>
              </div>
              <mat-card-title>Gestão de Saúde</mat-card-title>
              <mat-card-subtitle>Controle completo da saúde</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Gerencie informações de saúde dos pacientes, histórico médico e acompanhamento de tratamentos de forma integrada.</p>
              <div class="card-stats">
                <span class="stat-item">
                  <mat-icon>medical_services</mat-icon>
                  Prontuários digitais
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

          <!-- Card Agendamentos -->
          <mat-card class="action-card" (click)="openLoginDialog()">
            <mat-card-header>
              <div mat-card-avatar class="card-icon agendamento">
                <mat-icon>event</mat-icon>
              </div>
              <mat-card-title>Agendamentos</mat-card-title>
              <mat-card-subtitle>Organize consultas e visitas</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Sistema completo de agendamento de consultas, visitas domiciliares e controle de agenda dos profissionais de saúde.</p>
              <div class="card-stats">
                <span class="stat-item">
                  <mat-icon>calendar_month</mat-icon>
                  Agenda integrada
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

          <!-- Card Prontuários -->
          <mat-card class="action-card" (click)="openLoginDialog()">
            <mat-card-header>
              <div mat-card-avatar class="card-icon prontuario">
                <mat-icon>description</mat-icon>
              </div>
              <mat-card-title>Prontuários</mat-card-title>
              <mat-card-subtitle>Registros médicos digitais</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Acesse e gerencie prontuários eletrônicos com histórico completo, prescrições e evolução dos pacientes.</p>
              <div class="card-stats">
                <span class="stat-item">
                  <mat-icon>folder_shared</mat-icon>
                  Histórico completo
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
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>PSF Digital</h4>
          <p>Plataforma de Saúde da Família</p>
        </div>
        <div class="footer-section">
          <h4>Contato</h4>
          <p>Telefone: (11) 1234-5678</p>
          <p>Email: contato@psfdigital.gov.br</p>
        </div>
        <div class="footer-section">
          <h4>Suporte</h4>
          <p>Segunda a Sexta: 8h às 18h</p>
          <p>Sábado: 8h às 12h</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 PSF Digital. Todos os direitos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .header-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      font-family: 'Inter', sans-serif;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.5px;
    }

    .login-button {
      font-family: 'Inter', sans-serif !important;
      font-weight: 500;
      border-radius: 8px;
      padding: 0 16px;
      height: 40px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .login-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .main-content {
      margin-top: 64px;
      min-height: calc(100vh - 64px - 200px);
      padding: 40px 20px;
      font-family: 'Inter', sans-serif;
    }

    .hero-section {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-header {
      text-align: center;
      margin-bottom: 50px;
    }

    .hero-title {
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 2.5rem;
      color: #1976d2;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    .hero-subtitle {
      font-family: 'Inter', sans-serif;
      font-weight: 400;
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 16px;
    }

    .hero-description {
      font-family: 'Inter', sans-serif;
      font-weight: 400;
      font-size: 1.1rem;
      line-height: 1.6;
      color: #555;
      max-width: 600px;
      margin: 0 auto;
    }

    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 32px;
      margin-top: 40px;
    }

    .action-card {
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      position: relative;
      background: white;
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

    .card-icon.saude {
      background: linear-gradient(135deg, #4caf50, #66bb6a);
    }

    .card-icon.agendamento {
      background: linear-gradient(135deg, #ff9800, #ffb74d);
    }

    .card-icon.prontuario {
      background: linear-gradient(135deg, #e91e63, #f06292);
    }

    .action-card mat-card-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      font-family: 'Inter', sans-serif;
    }

    .action-card mat-card-subtitle {
      color: #666;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
    }

    .action-card mat-card-content {
      padding-top: 16px;
    }

    .action-card mat-card-content p {
      color: #555;
      line-height: 1.6;
      margin-bottom: 16px;
      font-family: 'Inter', sans-serif;
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
      font-family: 'Inter', sans-serif;
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
      font-family: 'Inter', sans-serif !important;
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

    .footer {
      background-color: #f8f9fa;
      padding: 40px 20px 0;
      margin-top: auto;
      font-family: 'Inter', sans-serif;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .footer-section h4 {
      color: #1976d2;
      margin-bottom: 15px;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .footer-section p {
      margin: 5px 0;
      color: #666;
      font-family: 'Inter', sans-serif;
      font-weight: 400;
      line-height: 1.5;
    }

    .footer-bottom {
      text-align: center;
      padding: 20px 0;
      margin-top: 30px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-family: 'Inter', sans-serif;
      font-weight: 400;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }
      
      .cards-container {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      
      .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .login-button {
        padding: 0 12px;
        height: 36px;
      }

      .action-card {
        margin-bottom: 16px;
      }

      .hero-header {
        margin-bottom: 32px;
      }
    }
  `]
})
export class HomeComponent {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  openLoginDialog(): void {
    this.dialog.open(LoginDialogComponent, {
      width: '400px',
      disableClose: false
    });
  }
}
