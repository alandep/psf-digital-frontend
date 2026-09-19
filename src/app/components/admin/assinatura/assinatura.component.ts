import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import { AuthProfileService } from '../../../../services/authProfileService';
import {
  Subscription, UsageMetric, Invoice, SubscriptionStatus
} from '../../../../types/saas-billing';
import { PlanoDialogComponent } from './plano-dialog/plano-dialog.component';
import { PagamentoDialogComponent } from './pagamento-dialog/pagamento-dialog.component';
import { CancelarDialogComponent } from './cancelar-dialog/cancelar-dialog.component';
import { CreditosDialogComponent } from './creditos-dialog/creditos-dialog.component';

interface StatusView {
  label: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatTooltipModule, MatTableModule, MatProgressBarModule, MatDividerModule,
    MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './assinatura.component.html',
  styleUrls: ['./assinatura.component.scss']
})
export class AssinaturaComponent implements OnInit {
  private saasBilling = inject(SaasBillingMockService);
  private auth = inject(AuthProfileService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  subscription: Subscription | null = null;
  usage: UsageMetric[] = [];
  invoices: Invoice[] = [];
  isLoading = false;

  paymentBrand = '';
  paymentLast4 = '';
  nearLimit = false;

  invoiceCols = ['date', 'period', 'plan', 'amount', 'status', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  get isReadOnly(): boolean {
    return this.auth.isReadOnly();
  }

  load(): void {
    this.isLoading = true;
    this.saasBilling.getCurrentSubscription().subscribe((s) => {
      this.subscription = s;
      this.paymentBrand = s.paymentBrand;
      this.paymentLast4 = s.paymentLast4;
      this.isLoading = false;
    });
    this.saasBilling.getUsage().subscribe((u) => {
      this.usage = u;
      this.nearLimit = u.some((m) => this.usagePercent(m) >= 80);
    });
    this.saasBilling.getInvoices().subscribe((i) => (this.invoices = i));
  }

  statusView(status: SubscriptionStatus): StatusView {
    switch (status) {
      case 'ACTIVE': return { label: 'Ativo', color: '#2e7d32', bg: '#e8f5e9' };
      case 'PAST_DUE': return { label: 'Pagamento pendente', color: '#ef6c00', bg: '#fff3e0' };
      case 'GRACE_PERIOD': return { label: 'Período de carência', color: '#ef6c00', bg: '#fff3e0' };
      case 'SUSPENDED': return { label: 'Suspenso', color: '#c62828', bg: '#ffebee' };
      case 'TRIALING': return { label: 'Em avaliação', color: '#1565c0', bg: '#e3f2fd' };
      case 'CANCELED': return { label: 'Cancelado', color: '#616161', bg: '#f5f5f5' };
      case 'TERMINATED': return { label: 'Encerrado', color: '#616161', bg: '#f5f5f5' };
      default: return { label: status, color: '#616161', bg: '#f5f5f5' };
    }
  }

  invoiceStatusView(status: Invoice['status']): StatusView {
    switch (status) {
      case 'PAID': return { label: 'Paga', color: '#2e7d32', bg: '#e8f5e9' };
      case 'OPEN': return { label: 'Em aberto', color: '#1565c0', bg: '#e3f2fd' };
      case 'FAILED': return { label: 'Falhou', color: '#c62828', bg: '#ffebee' };
      default: return { label: status, color: '#616161', bg: '#f5f5f5' };
    }
  }

  usagePercent(m: UsageMetric): number {
    if (!m.included) { return 0; }
    return Math.min(100, Math.round((m.used / m.included) * 100));
  }

  usageWarning(m: UsageMetric): boolean {
    return this.usagePercent(m) >= 80;
  }

  changePaymentMethod(): void {
    const ref = this.dialog.open(PagamentoDialogComponent, {
      width: '460px',
      panelClass: 'assinatura-dialog-panel'
    });
    ref.afterClosed().subscribe((res: { brand: string; last4: string } | undefined) => {
      if (res) {
        this.paymentBrand = res.brand;
        this.paymentLast4 = res.last4;
        this.snackBar.open('Forma de pagamento atualizada (mock)', 'Fechar', { duration: 3000 });
      }
    });
  }

  changePlan(): void {
    if (!this.subscription) { return; }
    const ref = this.dialog.open(PlanoDialogComponent, {
      width: '640px',
      panelClass: 'assinatura-dialog-panel',
      data: { plans: this.saasBilling.getPlans(), currentCode: this.subscription.planCode }
    });
    ref.afterClosed().subscribe((code) => {
      if (code) {
        this.saasBilling.changePlan(code).subscribe(() => {
          this.snackBar.open('Plano alterado com sucesso', 'Fechar', { duration: 3000 });
          this.load();
        });
      }
    });
  }

  comprarCreditos(): void {
    const ref = this.dialog.open(CreditosDialogComponent, {
      width: '520px',
      panelClass: 'assinatura-dialog-panel',
      data: {
        addons: this.saasBilling
          .getAddons()
          .filter((a) => a.code === 'AI_PACK' || a.code === 'AI_PACK_PLUS')
      }
    });
    ref.afterClosed().subscribe((code: 'AI_PACK' | 'AI_PACK_PLUS' | undefined) => {
      if (code) {
        this.saasBilling.purchaseAddon(code).subscribe((a) => {
          this.snackBar.open(`${a.name} adicionado à sua assinatura (mock)`, 'Fechar', { duration: 3500 });
        });
      }
    });
  }

  cancelSubscription(): void {
    if (!this.subscription) { return; }
    const ref = this.dialog.open(CancelarDialogComponent, {
      width: '520px',
      panelClass: 'assinatura-dialog-panel',
      data: { currentPeriodEnd: this.subscription.currentPeriodEnd }
    });
    ref.afterClosed().subscribe((reason: string | undefined) => {
      if (reason) {
        this.saasBilling.cancelSubscription(reason).subscribe(() => {
          this.snackBar.open('Assinatura cancelada', 'Fechar', { duration: 3000 });
          this.load();
        });
      }
    });
  }

  downloadInvoice(inv: Invoice): void {
    this.snackBar.open('Fatura baixada (mock)', 'Fechar', { duration: 3000 });
  }

  reactivate(): void {
    this.saasBilling.reactivate().subscribe(() => {
      this.auth.setLicenseMode('FULL');
      this.snackBar.open('Assinatura reativada. Acesso completo restaurado.', 'Fechar', { duration: 3500 });
      this.load();
    });
  }
}
