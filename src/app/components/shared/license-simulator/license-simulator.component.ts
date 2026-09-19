import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthProfileService } from '../../../../services/authProfileService';
import { LicenseAccessMode } from '../../../../types/saas-billing';

// DEV-ONLY tool: lets the user switch the mocked SaaS license state at runtime
// so the read-only enforcement and the in-app banner can be seen working.
@Component({
  selector: 'app-license-simulator',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="sim-wrap">
      <mat-card class="sim-card">
        <h2 class="sim-title">
          <mat-icon>science</mat-icon>
          Simulador de Licença (SaaS)
        </h2>
        <p class="sim-note">
          Ferramenta de teste (mock) — remover ao integrar o backend real.
        </p>

        <div class="sim-current">
          Estado atual:
          <strong [class]="'mode-' + (mode$ | async)">{{ modeLabel(mode$ | async) }}</strong>
        </div>

        <div class="sim-actions">
          <button mat-raised-button color="primary" (click)="set('FULL')">
            Simular ATIVO (FULL)
          </button>
          <button mat-raised-button color="accent" (click)="set('READ_ONLY')">
            Simular SUSPENSO (READ_ONLY)
          </button>
          <button mat-raised-button color="warn" (click)="set('BILLING_ONLY')">
            Simular BILLING_ONLY
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .sim-wrap { padding: 24px; display: flex; justify-content: center; }
    .sim-card { max-width: 640px; width: 100%; padding: 24px; }
    .sim-title {
      display: flex; align-items: center; gap: 8px;
      margin: 0 0 4px; font-size: 1.3rem; color: #1976d2;
    }
    .sim-note {
      margin: 0 0 20px; font-size: 0.85rem; color: #b8860b;
      background: #fff8e1; padding: 8px 12px; border-radius: 6px;
    }
    .sim-current { margin-bottom: 20px; font-size: 1rem; color: #444; }
    .sim-current strong { margin-left: 6px; }
    .mode-FULL { color: #2e7d32; }
    .mode-READ_ONLY { color: #b8860b; }
    .mode-BILLING_ONLY, .mode-NONE { color: #c0392b; }
    .sim-actions { display: flex; flex-wrap: wrap; gap: 12px; }
  `],
})
export class LicenseSimulatorComponent {
  private authProfileService = inject(AuthProfileService);
  readonly mode$ = this.authProfileService.licenseMode$;

  set(mode: LicenseAccessMode): void {
    this.authProfileService.setLicenseMode(mode);
  }

  modeLabel(mode: LicenseAccessMode | null): string {
    switch (mode) {
      case 'FULL': return 'ATIVO (acesso total)';
      case 'READ_ONLY': return 'SUSPENSO (somente leitura)';
      case 'BILLING_ONLY': return 'BILLING_ONLY (apenas assinatura)';
      case 'NONE': return 'NONE (bloqueado)';
      default: return '—';
    }
  }
}
