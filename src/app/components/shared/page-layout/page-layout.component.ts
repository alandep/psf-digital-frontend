import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NotificationBellComponent
  ],
  template: `
    <div class="page-layout">
      <!-- Header Toolbar -->
      <mat-toolbar color="primary" class="page-toolbar">
        <!-- Back Button -->
        <button mat-icon-button 
                (click)="goBack()"
                class="back-button"
                matTooltip="Voltar para Home">
          <mat-icon>arrow_back</mat-icon>
        </button>

        <!-- Page Title -->
        <span class="page-title">{{pageTitle}}</span>
        <span class="spacer"></span>

        <!-- User Info -->
        <div class="user-info">
          <span class="user-name">{{userName}}</span>
          <span class="user-location">{{userLocation}}</span>
        </div>

        <!-- Notifications -->
        <app-notification-bell></app-notification-bell>
      </mat-toolbar>

      <!-- Page Content -->
      <div class="page-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .page-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .back-button {
      margin-right: 16px;
      color: white;
      transition: all 0.3s ease;
    }

    .back-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }

    .back-button mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-right: 16px;
      font-family: 'Inter', sans-serif;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }

    .user-location {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      margin-top: 2px;
    }

    .page-content {
      flex: 1;
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .user-info {
        display: none;
      }

      .page-title {
        font-size: 1.1rem;
      }

      .back-button {
        margin-right: 8px;
      }
    }
  `]
})
export class PageLayoutComponent implements OnInit {
  @Input() pageTitle: string = 'PSF Digital';
  
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  userName = 'João Silva';
  userLocation = 'Belo Horizonte - PSF Central';

  ngOnInit(): void {
    // Aqui você pode buscar informações do usuário logado de um service
    // this.loadUserInfo();
  }

  goBack(): void {
    this.notificationService.showInfo('Voltando para a Home');
    this.router.navigate(['/home-logged']);
  }
}
