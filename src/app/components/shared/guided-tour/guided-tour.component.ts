import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductTourService, TourStep } from '../../../../services/productTourService';

@Component({
  selector: 'app-guided-tour',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="tour-backdrop" *ngIf="tour.active$ | async">
      <div class="tour-card" *ngIf="(tour.current$ | async) as _i">
        <ng-container>
          <div class="tour-head">
            <span class="tour-wave">👋 Bem-vindo ao EIP</span>
            <button mat-icon-button (click)="tour.skip()" aria-label="Pular tour">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <h2 class="tour-title">{{ step().title }}</h2>
          <p class="tour-content">{{ step().content }}</p>

          <span class="tour-step-label">Passo {{ tour.currentIndex + 1 }}/{{ tour.total }}</span>

          <div class="tour-dots">
            <span class="dot"
                  *ngFor="let s of tour.steps; trackBy: trackStep"
                  [class.active]="s.sequence === tour.currentIndex + 1"></span>
          </div>

          <p class="tour-final" *ngIf="tour.currentIndex === tour.total - 1">
            Agora vamos criar sua primeira operação.
          </p>

          <div class="tour-actions">
            <button mat-button (click)="tour.prev()" [disabled]="tour.currentIndex === 0">Voltar</button>
            <button mat-button (click)="tour.skip()">Pular</button>
            <button mat-flat-button color="primary" (click)="tour.next()">
              {{ tour.currentIndex === tour.total - 1 ? 'Concluir' : 'Próximo' }}
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .tour-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(13, 40, 71, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 16px;
    }
    .tour-card {
      width: 100%;
      max-width: 440px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(25, 118, 210, 0.3);
      padding: 24px;
    }
    .tour-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tour-wave {
      font-weight: 700;
      color: #1565c0;
    }
    .tour-title {
      margin: 12px 0 6px;
      font-size: 1.3rem;
      font-weight: 800;
      color: #263238;
    }
    .tour-content {
      margin: 0 0 16px;
      color: #5a6b7b;
      line-height: 1.5;
    }
    .tour-step-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #1976d2;
    }
    .tour-dots {
      display: flex;
      gap: 8px;
      margin: 10px 0 4px;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #cfe3f7;
      transition: background 0.2s ease;
    }
    .dot.active {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    }
    .tour-final {
      margin: 12px 0 0;
      color: #2e7d32;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .tour-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
    }
  `],
})
export class GuidedTourComponent {
  tour = inject(ProductTourService);

  step(): TourStep {
    return this.tour.getStep(this.tour.currentIndex);
  }

  trackStep(_index: number, s: TourStep): number {
    return s.sequence;
  }
}
