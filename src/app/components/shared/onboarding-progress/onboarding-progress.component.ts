import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import { OnboardingProgress, OnboardingStep } from '../../../../types/saas-billing';

// Onboarding progress strip (MOCK). Shows the setup checklist and completion
// percentage. Renders nothing once fully completed.
@Component({
  selector: 'app-onboarding-progress',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div *ngIf="progress && !progress.completed" class="onboarding-card">
      <div class="ob-header">
        <span class="ob-title">Configuração da sua empresa</span>
        <span class="ob-percent">{{ progress.percent }}%</span>
      </div>

      <mat-progress-bar
        class="ob-bar"
        mode="determinate"
        [value]="progress.percent">
      </mat-progress-bar>

      <div class="ob-steps">
        <div class="ob-step"
             *ngFor="let step of progress.steps; trackBy: trackByStep"
             [class.pending]="!step.done">
          <mat-icon class="ob-step-icon" [class.done]="step.done">
            {{ step.done ? 'check_circle' : 'radio_button_unchecked' }}
          </mat-icon>
          <span class="ob-step-label">{{ step.label }}</span>
        </div>
      </div>

      <div class="ob-hint">
        <mat-icon class="ob-hint-icon">auto_awesome</mat-icon>
        <span>A IA do EIP pode ajudar a criar sua primeira operação de exportação.</span>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-card {
      margin: 16px;
      padding: 18px 20px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      border-top: 3px solid #1976d2;
    }
    .ob-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .ob-title { font-size: 1rem; font-weight: 600; color: #1565c0; }
    .ob-percent { font-size: 0.95rem; font-weight: 700; color: #1976d2; }
    .ob-bar {
      border-radius: 6px;
      overflow: hidden;
      --mdc-linear-progress-active-indicator-color: #1976d2;
    }
    .ob-steps {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 24px;
      margin: 14px 0 10px;
    }
    .ob-step { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; }
    .ob-step-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #bdbdbd;
      flex-shrink: 0;
    }
    .ob-step-icon.done { color: #43a047; }
    .ob-step-label { color: #555; }
    .ob-step.pending .ob-step-label { color: #333; font-weight: 600; }
    .ob-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding-top: 10px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      font-size: 0.85rem;
      color: #1565c0;
    }
    .ob-hint-icon { color: #1976d2; font-size: 20px; width: 20px; height: 20px; }
    @media (max-width: 768px) {
      .ob-steps { flex-direction: column; gap: 8px; }
    }
  `],
})
export class OnboardingProgressComponent implements OnInit {
  private billing = inject(SaasBillingMockService);

  progress: OnboardingProgress | null = null;

  ngOnInit(): void {
    this.billing.getOnboardingProgress().subscribe((p) => (this.progress = p));
  }

  trackByStep(_index: number, step: OnboardingStep): string {
    return step.key;
  }
}
