import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, MatButtonModule],
  template: `
    <div class="coming-soon-container">
      <mat-card class="coming-soon-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="construction-icon">construction</mat-icon>
          <mat-card-title>{{ moduleName }}</mat-card-title>
          <mat-card-subtitle>Em desenvolvimento</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p class="description">{{ description }}</p>
          
          <div class="features-section" *ngIf="features.length > 0">
            <h4>Funcionalidades planejadas:</h4>
            <mat-list>
              <mat-list-item *ngFor="let feature of features">
                <mat-icon matListItemIcon color="primary">check_circle_outline</mat-icon>
                <span matListItemTitle>{{ feature }}</span>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Voltar
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 48px 24px;
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
    }

    .coming-soon-card {
      max-width: 600px;
      width: 100%;
    }

    .construction-icon {
      font-size: 40px !important;
      width: 40px !important;
      height: 40px !important;
      color: #ff9800;
    }

    .description {
      margin: 16px 0;
      color: #666;
      font-size: 1rem;
      line-height: 1.6;
    }

    .features-section h4 {
      margin: 24px 0 8px;
      color: #333;
      font-weight: 500;
    }

    mat-list-item {
      height: auto !important;
      min-height: 40px;
    }
  `]
})
export class ComingSoonComponent {
  @Input() moduleName = 'Modulo';
  @Input() description = 'Este modulo esta em desenvolvimento e estara disponivel em breve.';
  @Input() features: string[] = [];

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home-logged/dashboards/principal']);
  }
}
