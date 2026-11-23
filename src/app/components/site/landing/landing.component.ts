import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PublicBillingService } from '../../../services/public-billing/public-billing.service';
import { ApiPlan } from '../../../../types/billing-api';
import { DemoDialogComponent } from '../demo-dialog/demo-dialog.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  private dialog = inject(MatDialog);
  private billing = inject(PublicBillingService);

  /** Planos self-service (sem Enterprise), vindos da API pública. */
  plans: ApiPlan[] = [];

  modules = ['Contratos', 'Exportações', 'Documentos', 'Logística', 'Financeiro', 'Compliance', 'IA', 'BI'];

  nowYear = new Date().getFullYear();

  constructor() {
    this.billing
      .getPlans()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (plans) => (this.plans = plans.filter((p) => p.code !== 'ENTERPRISE')),
        error: () => (this.plans = []),
      });
  }

  openDemo(): void {
    this.dialog.open(DemoDialogComponent, { width: '520px', maxWidth: '95vw', data: { origem: 'SITE' } });
  }
}
