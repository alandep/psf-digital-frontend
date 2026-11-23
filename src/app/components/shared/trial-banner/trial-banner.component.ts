import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DemoDialogComponent } from '../../site/demo-dialog/demo-dialog.component';
import { ONBOARDING_SERVICE } from '../../../services/onboarding/onboarding-service.token';
import { IOnboardingService } from '../../../services/onboarding/onboarding-service.interface';
import { TrialState } from '../../../../types/saas-billing';

// Banner fixo da avaliação. Mostra os dias restantes, "Assinar agora" e
// "Agendar demonstração". Não renderiza nada sem avaliação ativa.
@Component({
  selector: 'app-trial-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div *ngIf="visible && trial" class="trial-banner" role="status">
      <mat-icon class="tb-icon">schedule</mat-icon>
      <span class="tb-text">
        Seu período de avaliação do {{ trial.planName }} termina em
        {{ trial.daysRemaining }} dia(s).
      </span>
      <span class="tb-actions">
        <a class="tb-btn primary"
           routerLink="/home-logged/admin/assinatura"
           [queryParams]="{ ativar: '1' }">Assinar agora</a>
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
  private billing = inject<IOnboardingService>(ONBOARDING_SERVICE);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  trial: TrialState | null = null;

  /** Visível apenas com avaliação ativa e ao menos 1 dia restante. */
  get visible(): boolean {
    return !!this.trial && this.trial.active && this.trial.daysRemaining > 0;
  }

  ngOnInit(): void {
    this.billing
      .getTrialState()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => (this.trial = state),
        error: () => (this.trial = null)
      });
  }

  requestDemo(): void {
    this.dialog.open(DemoDialogComponent, { width: '520px', data: { origem: 'TRIAL_BANNER' } });
  }
}
