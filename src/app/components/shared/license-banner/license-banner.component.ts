import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest, map } from 'rxjs';
import { AuthProfileService } from '../../../../services/authProfileService';
import { LicenseAccessMode } from '../../../../types/saas-billing';

interface BannerView {
  mode: LicenseAccessMode;
  message: string;
  actionLabel: string;
  actionQuery: Record<string, string> | null;
}

// Banner fixo com o estado da licença. Não exibe nada em FULL.
// A mensagem depende da causa (status da assinatura vindo de /bff/acesso/me).
@Component({
  selector: 'app-license-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <ng-container *ngIf="view$ | async as v">
      <div
        *ngIf="v.mode !== 'FULL'"
        class="license-banner"
        [class.warning]="v.mode === 'READ_ONLY'"
        [class.blocked]="v.mode === 'BILLING_ONLY' || v.mode === 'NONE'"
        role="alert">
        <mat-icon class="lb-icon" aria-hidden="true">{{ v.mode === 'READ_ONLY' ? 'lock_clock' : 'gpp_maybe' }}</mat-icon>
        <span class="lb-text">{{ v.message }}</span>
        <span class="lb-actions">
          <a class="lb-btn primary"
             routerLink="/home-logged/admin/assinatura"
             [queryParams]="v.actionQuery">{{ v.actionLabel }}</a>
          <a class="lb-btn ghost"
             routerLink="/home-logged/admin/exportar-dados">Exportar dados</a>
        </span>
      </div>
    </ng-container>
  `,
  styles: [`
    .license-banner {
      position: sticky;
      top: 0;
      z-index: 900;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      font-size: 0.9rem;
      font-weight: 500;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    }
    .license-banner.warning {
      background: #fff8e1;
      color: #8a5a00;
      border-bottom-color: #ffe0a3;
    }
    .license-banner.blocked {
      background: #fde8e6;
      color: #9a2b1e;
      border-bottom-color: #f6c3bd;
    }
    .lb-icon { flex-shrink: 0; }
    .warning .lb-icon { color: #b8860b; }
    .blocked .lb-icon { color: #c0392b; }
    .lb-text { flex: 1; line-height: 1.35; }
    .lb-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    .lb-btn {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      border-radius: 18px;
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .lb-btn.primary {
      background: #1976d2;
      color: #fff;
    }
    .lb-btn.primary:hover { background: #1565c0; }
    .lb-btn.ghost {
      background: rgba(0, 0, 0, 0.04);
      color: inherit;
      border: 1px solid currentColor;
    }
    .lb-btn.ghost:hover { background: rgba(0, 0, 0, 0.08); }
    @media (max-width: 768px) {
      .license-banner { flex-wrap: wrap; }
      .lb-actions { width: 100%; }
    }
  `],
})
export class LicenseBannerComponent {
  private authProfileService = inject(AuthProfileService);
  readonly mode$ = this.authProfileService.licenseMode$;

  readonly view$ = combineLatest([this.authProfileService.licenseMode$, this.authProfileService.profile$]).pipe(
    map(([mode]) => this.buildView(mode))
  );

  private buildView(mode: LicenseAccessMode): BannerView {
    const status = (this.authProfileService.currentSubscription?.status ?? '').toUpperCase();
    if (status === 'TRIALING') {
      return {
        mode,
        message: 'Seu período de avaliação terminou. Escolha um plano para continuar usando o EIP.',
        actionLabel: 'Assinar agora',
        actionQuery: { ativar: '1' }
      };
    }
    if (status === 'PAST_DUE' || status === 'GRACE_PERIOD') {
      return {
        mode,
        message: 'Pagamento pendente — regularize para voltar a editar seus dados.',
        actionLabel: 'Regularizar pagamento',
        actionQuery: null
      };
    }
    if (status === 'CANCELED') {
      return {
        mode,
        message: 'Assinatura cancelada — acesso somente leitura. Seus dados continuam disponíveis para exportação.',
        actionLabel: 'Reativar',
        actionQuery: null
      };
    }
    return {
      mode,
      message: 'Assinatura pendente — para proteger seus dados, nada foi excluído. Regularize para restaurar todas as funcionalidades.',
      actionLabel: 'Regularizar pagamento',
      actionQuery: null
    };
  }
}
