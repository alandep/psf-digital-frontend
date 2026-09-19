import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import { SaasPlan, PlanFeature, BillingInterval } from '../../../../types/saas-billing';

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
  ],
  templateUrl: './precos.component.html',
  styleUrls: ['./precos.component.scss'],
})
export class PrecosComponent {
  private billing = inject(SaasBillingMockService);

  interval: BillingInterval = 'MONTHLY';

  allPlans: SaasPlan[] = this.billing.getPlans();
  mainPlans: SaasPlan[] = this.allPlans.filter((p) => p.code !== 'ENTERPRISE');
  enterprise = this.allPlans.find((p) => p.code === 'ENTERPRISE')!;
  features: PlanFeature[] = this.billing.getPlanFeatures();

  setInterval(value: BillingInterval): void {
    this.interval = value;
  }

  price(plan: SaasPlan): number {
    return this.interval === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;
  }

  isBool(v: string | boolean): boolean {
    return typeof v === 'boolean';
  }
}
