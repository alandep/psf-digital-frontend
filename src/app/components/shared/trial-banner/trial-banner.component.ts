import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import { TrialState } from '../../../../types/saas-billing';

// Sticky in-app trial banner (MOCK). Shows the remaining trial days and two
// actions: subscribe now, and request a demo (mock snackbar). Renders nothing
// when there is no active trial.
@Component({
  selector: 'app-trial-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div *ngIf="trial && trial.active" class="trial-banner" role="status">
      <mat-icon class="tb-icon">schedule</mat-icon>
      <span class="tb-text">
        Seu período de avaliação do {{ trial.planName }} termina em
        {{ trial.daysRemaining }} dia(s).
      </span>
      <span class="tb-actions">
        <a class="tb-btn primary"
           routerLink="/home-logged/admin/assinatura">Assinar agora</a>
        <button type="button" class="tb-btn ghost" (click)="requestDemo()">
          Agendar demonstração
        </button>
      </span>
    </div>
  `,
  styles: [`
    .trial-banner {
      position: sticky;
      top: 0;
      z-index: 890;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      font-size: 0.9rem;
      font-weight: 500;
      color: #fff;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }
    .tb-icon { flex-shrink: 0; color: #fff; }
    .tb-text { flex: 1; line-height: 1.35; }
    .tb-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .tb-btn {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 18px;
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    .tb-btn.primary { background: #fff; color: #1565c0; }
    .tb-btn.primary:hover { background: #e3f2fd; }
    .tb-btn.ghost {
      background: transparent;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.85);
    }
    .tb-btn.ghost:hover { background: rgba(255, 255, 255, 0.15); }
    @media (max-width: 768px) {
      .trial-banner { flex-wrap: wrap; }
      .tb-actions { width: 100%; }
    }
  `],
})
export class TrialBannerComponent implements OnInit {
  private billing = inject(SaasBillingMockService);
  private snackBar = inject(MatSnackBar);

  trial: TrialState | null = null;

  ngOnInit(): void {
    this.billing.getTrialState().subscribe((state) => (this.trial = state));
  }

  requestDemo(): void {
    this.snackBar.open('Solicitação de demonstração enviada (mock)', 'Fechar', {
      duration: 4000,
    });
  }
}
