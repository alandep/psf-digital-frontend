import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicBillingService } from '../../../services/public-billing/public-billing.service';
import { ApiPlan, BillingIntervalCode, CouponValidation } from '../../../../types/billing-api';
import { PLAN_CATALOG, PLAN_FEATURES, PlanFeature } from '../../../../types/saas-billing';
import { DemoDialogComponent } from '../demo-dialog/demo-dialog.component';

/** Plano da API combinado com os textos comerciais estáticos (bullets e CTA). */
interface PlanView extends ApiPlan {
  bullets: string[];
  ctaLabel: string;
  limitBullets: string[];
}

@Component({
  selector: 'app-precos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './precos.component.html',
  styleUrls: ['./precos.component.scss'],
})
export class PrecosComponent implements OnInit {
  private billing = inject(PublicBillingService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  interval: BillingIntervalCode = 'MONTHLY';

  loading = true;
  error = false;

  mainPlans: PlanView[] = [];
  enterprise: PlanView | null = null;
  features: PlanFeature[] = PLAN_FEATURES;

  /** Preenchido apenas quando o cupom FOUNDERS2026 é válido para BUSINESS mensal. */
  founders: CouponValidation | null = null;

  ngOnInit(): void {
    this.load();
    this.billing
      .validateCoupon('FOUNDERS2026', 'BUSINESS', 'MONTHLY')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => (this.founders = c.valid ? c : null),
        error: () => (this.founders = null),
      });
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.billing
      .getPlans()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (plans) => {
          const views = plans.map((p) => this.toView(p));
          this.mainPlans = views.filter((p) => p.code !== 'ENTERPRISE');
          this.enterprise = views.find((p) => p.code === 'ENTERPRISE') ?? null;
          this.features = this.buildFeatures(plans);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        },
      });
  }

  setInterval(value: BillingIntervalCode): void {
    this.interval = value;
  }

  price(plan: ApiPlan): number {
    return this.interval === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
  }

  isBool(v: string | boolean): boolean {
    return typeof v === 'boolean';
  }

  openEnterpriseDemo(): void {
    this.dialog.open(DemoDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { origem: 'PRECOS_ENTERPRISE' },
    });
  }

  // ---------- helpers ----------

  private toView(p: ApiPlan): PlanView {
    const staticPlan = PLAN_CATALOG.find((c) => c.code === p.code);
    return {
      ...p,
      bullets: staticPlan?.bullets ?? [],
      ctaLabel: staticPlan?.ctaLabel ?? 'Começar agora',
      limitBullets: [
        `${this.fmtCredits(p.limits.aiCredits)} créditos de IA por ciclo`,
        `${this.fmtCredits(p.limits.ocrPages)} páginas de OCR por ciclo`,
        `${this.fmtStorage(p.limits.storageGb)} de armazenamento`,
      ],
    };
  }

  /** Matriz estática + linhas de IA/OCR/armazenamento vindas da API. */
  private buildFeatures(plans: ApiPlan[]): PlanFeature[] {
    const by = (code: string): ApiPlan | undefined => plans.find((p) => p.code === code);
    const row = (
      code: string,
      label: string,
      pick: (p: ApiPlan) => string
    ): PlanFeature => ({
      code,
      label,
      startValue: this.safe(by('START'), pick),
      businessValue: this.safe(by('BUSINESS'), pick),
      proValue: this.safe(by('PRO'), pick),
    });
    return [
      ...PLAN_FEATURES,
      row('AI_CREDITS', 'Créditos de IA por ciclo', (p) => this.fmtCredits(p.limits.aiCredits)),
      row('OCR_PAGES', 'Páginas de OCR por ciclo', (p) => this.fmtCredits(p.limits.ocrPages)),
      row('STORAGE', 'Armazenamento', (p) => this.fmtStorage(p.limits.storageGb)),
    ];
  }

  private safe(plan: ApiPlan | undefined, pick: (p: ApiPlan) => string): string {
    return plan ? pick(plan) : '—';
  }

  private fmtCredits(n: number | null): string {
    return n === null ? 'Ilimitado' : n.toLocaleString('pt-BR');
  }

  private fmtStorage(gb: number | null): string {
    return gb === null ? 'Ilimitado' : `${gb.toLocaleString('pt-BR')} GB`;
  }
}
