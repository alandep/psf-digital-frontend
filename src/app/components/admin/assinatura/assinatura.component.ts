import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { SUBSCRIPTION_SERVICE } from '../../../services/subscription/subscription-service.token';
import { AuthProfileService } from '../../../../services/authProfileService';
import { extractErrorMessage } from '../../../shared/payment/payment-errors';
import { CARD_BRAND_LABELS, CardBrand } from '../../../shared/payment/card-utils';
import { saveBlob } from '../../../shared/utils/file-download';
import {
  ApiInvoiceStatus,
  ApiSubscriptionStatus,
  InvoiceApi,
  PackPurchaseResponse,
  SubscriptionView,
  UsageMeter,
  UsageResponse
} from '../../../../types/billing-api';
import { PlanoDialogComponent } from './plano-dialog/plano-dialog.component';
import { PagamentoDialogComponent } from './pagamento-dialog/pagamento-dialog.component';
import { CancelarDialogComponent } from './cancelar-dialog/cancelar-dialog.component';
import { CreditosDialogComponent } from './creditos-dialog/creditos-dialog.component';
import { AtivarDialogComponent } from './ativar-dialog/ativar-dialog.component';
import { ExtratoDialogComponent } from './extrato-dialog/extrato-dialog.component';
import { PixDialogComponent } from './pix-dialog/pix-dialog.component';

interface StatusView {
  label: string;
  color: string;
  bg: string;
}

const NEUTRAL = { color: '#616161', bg: '#f5f5f5' };
const LOCALE = 'pt-BR';

@Component({
  selector: 'app-assinatura',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatTableModule, MatProgressBarModule, MatDividerModule,
    MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './assinatura.component.html',
  styleUrls: ['./assinatura.component.scss']
})
export class AssinaturaComponent implements OnInit {
  private readonly service = inject(SUBSCRIPTION_SERVICE);
  private readonly auth = inject(AuthProfileService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  subscription: SubscriptionView | null = null;
  usage: UsageResponse | null = null;
  invoices: InvoiceApi[] = [];

  loadingSubscription = false;
  loadingUsage = false;
  loadingInvoices = false;
  busyInvoiceId: string | null = null;
  actionBusy = false;

  readonly invoiceCols = ['issuedAt', 'dueDate', 'description', 'amount', 'status', 'actions'];

  private autoOpenRequested = false;

  get isLoading(): boolean {
    return this.loadingSubscription || this.loadingUsage || this.loadingInvoices;
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.autoOpenRequested = params.get('ativar') === '1';
      this.tryAutoOpenActivate();
    });
    this.loadAll();
  }

  // ---------- Carregamento ----------

  loadAll(): void {
    this.loadSubscription();
    this.loadUsage();
    this.loadInvoices();
  }

  private loadSubscription(): void {
    this.loadingSubscription = true;
    this.service
      .current()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loadingSubscription = false)))
      .subscribe({
        next: (s) => {
          this.subscription = s;
          this.tryAutoOpenActivate();
        },
        error: (err: unknown) => this.showError(err)
      });
  }

  private loadUsage(): void {
    this.loadingUsage = true;
    this.service
      .usage()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loadingUsage = false)))
      .subscribe({
        next: (u) => (this.usage = u),
        error: (err: unknown) => this.showError(err)
      });
  }

  private loadInvoices(): void {
    this.loadingInvoices = true;
    this.service
      .invoices()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loadingInvoices = false)))
      .subscribe({
        next: (i) => (this.invoices = i),
        error: (err: unknown) => this.showError(err)
      });
  }

  private applySubscription(view: SubscriptionView): void {
    this.subscription = view;
    // Atualiza o modo de licença / permissões a partir de /bff/acesso/me.
    this.auth.loadProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.loadUsage();
    this.loadInvoices();
  }

  private showError(err: unknown): void {
    this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 4000 });
  }

  // ---------- Regras de exibição ----------

  private get endedStatus(): boolean {
    const st = this.subscription?.status;
    return st === 'CANCELED' || st === 'TERMINATED';
  }

  get showActivate(): boolean {
    return !!this.subscription && !this.subscription.gatewayLinked && !this.endedStatus;
  }

  get showChangeButtons(): boolean {
    return !!this.subscription && !this.showActivate;
  }

  get showCancel(): boolean {
    const s = this.subscription;
    return !!s && s.gatewayLinked && !this.endedStatus && !s.cancelAtPeriodEnd;
  }

  get showReactivate(): boolean {
    const s = this.subscription;
    return (
      !!s &&
      s.status === 'CANCELED' &&
      s.cancelAtPeriodEnd &&
      !!s.currentPeriodEnd &&
      new Date(s.currentPeriodEnd).getTime() > Date.now()
    );
  }

  private fmt(value: string | null, format: string): string {
    return value ? formatDate(value, format, LOCALE) : '';
  }

  statusView(s: SubscriptionView): StatusView {
    const status: ApiSubscriptionStatus = s.status;
    switch (status) {
      case 'TRIALING': {
        const end = this.fmt(s.trialEnd ?? s.currentPeriodEnd, 'dd/MM');
        return { label: end ? `Em avaliação até ${end}` : 'Em avaliação', color: '#1565c0', bg: '#e3f2fd' };
      }
      case 'ACTIVE': return { label: 'Ativa', color: '#2e7d32', bg: '#e8f5e9' };
      case 'PAST_DUE': return { label: 'Pagamento pendente', color: '#ef6c00', bg: '#fff3e0' };
      case 'GRACE_PERIOD': return { label: 'Em carência', color: '#ef6c00', bg: '#fff3e0' };
      case 'SUSPENDED': return { label: 'Suspensa', color: '#c62828', bg: '#ffebee' };
      case 'CANCELED': {
        const end = this.fmt(s.currentPeriodEnd, 'dd/MM');
        return { label: end ? `Cancelada — acesso até ${end}` : 'Cancelada', ...NEUTRAL };
      }
      case 'TERMINATED': return { label: 'Encerrada', ...NEUTRAL };
      default: return { label: status, ...NEUTRAL };
    }
  }

  invoiceStatusView(status: ApiInvoiceStatus): StatusView {
    switch (status) {
      case 'OPEN': return { label: 'Em aberto', color: '#1565c0', bg: '#e3f2fd' };
      case 'PAID': return { label: 'Paga', color: '#2e7d32', bg: '#e8f5e9' };
      case 'OVERDUE': return { label: 'Vencida', color: '#c62828', bg: '#ffebee' };
      case 'REFUNDED': return { label: 'Estornada', ...NEUTRAL };
      case 'CANCELED': return { label: 'Cancelada', ...NEUTRAL };
      case 'FAILED': return { label: 'Falhou', color: '#c62828', bg: '#ffebee' };
      default: return { label: status, ...NEUTRAL };
    }
  }

  get paymentLine(): string {
    const s = this.subscription;
    switch (s?.paymentMethod) {
      case 'CREDIT_CARD': {
        const brand = s.paymentBrand
          ? (CARD_BRAND_LABELS[s.paymentBrand.toUpperCase() as CardBrand] ?? s.paymentBrand)
          : 'Cartão';
        return s.paymentLast4 ? `${brand} final ${s.paymentLast4}` : brand;
      }
      case 'PIX': return 'Pix';
      case 'BOLETO': return 'Boleto bancário';
      default: return 'Nenhuma forma de pagamento cadastrada';
    }
  }

  get emptyInvoicesMessage(): string {
    const s = this.subscription;
    const date = this.fmt(s?.nextDueDate ?? s?.trialEnd ?? null, 'dd/MM/yyyy');
    return date
      ? `Nenhuma fatura ainda. Sua primeira cobrança acontece em ${date}.`
      : 'Nenhuma fatura ainda.';
  }

  cyclesLabel(n: number): string {
    return n === 1 ? '1 cobrança restante' : `${n} cobranças restantes`;
  }

  // ---------- Medidores ----------

  meterPercent(m: UsageMeter): number {
    return Math.max(0, Math.min(100, Math.round(m.percent)));
  }

  meterLevel(m: UsageMeter): 'ok' | 'warn' | 'danger' {
    if (m.included === null) { return 'ok'; }
    if (m.percent >= 100) { return 'danger'; }
    return m.percent >= 80 ? 'warn' : 'ok';
  }

  get nearLimit(): boolean {
    return !!this.usage?.meters.some((m) => m.feature !== 'STORAGE' && this.meterLevel(m) !== 'ok');
  }

  // ---------- Ações da assinatura ----------

  private tryAutoOpenActivate(): void {
    if (this.autoOpenRequested && this.subscription && this.showActivate) {
      this.autoOpenRequested = false;
      this.openActivate();
    }
  }

  openActivate(): void {
    const s = this.subscription;
    if (!s) { return; }
    this.dialog
      .open(AtivarDialogComponent, {
        width: '680px',
        maxWidth: '95vw',
        panelClass: 'assinatura-dialog-panel',
        data: { currentCode: s.planCode, currentInterval: s.billingInterval, trialEnd: s.trialEnd }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((view: SubscriptionView | undefined) => {
        if (view) {
          this.applySubscription(view);
          this.showInfo('Assinatura ativada com sucesso.');
        }
      });
  }

  changePaymentMethod(): void {
    this.dialog
      .open(PagamentoDialogComponent, { width: '560px', maxWidth: '95vw', panelClass: 'assinatura-dialog-panel' })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((view: SubscriptionView | undefined) => {
        if (view) {
          this.applySubscription(view);
          this.showInfo('Forma de pagamento atualizada.');
        }
      });
  }

  changePlan(): void {
    const s = this.subscription;
    if (!s) { return; }
    this.dialog
      .open(PlanoDialogComponent, {
        width: '680px',
        maxWidth: '95vw',
        panelClass: 'assinatura-dialog-panel',
        data: { currentCode: s.planCode, currentInterval: s.billingInterval }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((view: SubscriptionView | undefined) => {
        if (view) {
          this.applySubscription(view);
          this.showInfo('Plano alterado. O novo valor vale a partir da próxima cobrança.');
        }
      });
  }

  cancelSubscription(): void {
    const s = this.subscription;
    if (!s) { return; }
    this.dialog
      .open(CancelarDialogComponent, {
        width: '520px',
        maxWidth: '95vw',
        panelClass: 'assinatura-dialog-panel',
        data: { currentPeriodEnd: s.currentPeriodEnd }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((view: SubscriptionView | undefined) => {
        if (view) {
          this.applySubscription(view);
          this.showInfo('Assinatura cancelada. Seu acesso continua até o fim do período.');
        }
      });
  }

  reactivate(): void {
    if (this.actionBusy) { return; }
    this.actionBusy = true;
    this.service
      .reactivate()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.actionBusy = false)))
      .subscribe({
        next: (view) => {
          this.applySubscription(view);
          this.showInfo('Assinatura reativada.');
        },
        error: (err: unknown) => this.showError(err)
      });
  }

  // ---------- Uso e créditos ----------

  openStatement(): void {
    this.dialog.open(ExtratoDialogComponent, { width: '820px', maxWidth: '95vw', panelClass: 'assinatura-dialog-panel' });
  }

  buyCredits(): void {
    this.dialog
      .open(CreditosDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        panelClass: 'assinatura-dialog-panel',
        data: { subscription: this.subscription }
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: PackPurchaseResponse | undefined) => {
        if (res) { this.onPackPurchased(res); }
      });
  }

  private onPackPurchased(res: PackPurchaseResponse): void {
    if (res.status === 'PAID') {
      this.showInfo('Pacote ativado: créditos já disponíveis.');
    } else if (res.pix) {
      this.dialog.open(PixDialogComponent, { width: '420px', maxWidth: '95vw', data: { pix: res.pix } });
    } else if (res.bankSlipUrl) {
      window.open(res.bankSlipUrl, '_blank', 'noopener');
      this.showInfo('Boleto gerado. Os créditos são liberados após a compensação.');
    } else {
      this.showInfo('Compra registrada. Os créditos são liberados após a confirmação do pagamento.');
    }
    this.loadUsage();
    this.loadInvoices();
  }

  // ---------- Faturas ----------

  isPayable(inv: InvoiceApi): boolean {
    return inv.status === 'OPEN' || inv.status === 'OVERDUE';
  }

  canShowPix(inv: InvoiceApi): boolean {
    return this.isPayable(inv) && inv.billingType === 'PIX';
  }

  invoiceDescription(inv: InvoiceApi): string {
    return inv.description || [inv.planName, inv.period].filter((p): p is string => !!p).join(' — ') || '—';
  }

  payInvoice(inv: InvoiceApi): void {
    if (inv.invoiceUrl) {
      window.open(inv.invoiceUrl, '_blank', 'noopener');
    }
  }

  openBoleto(inv: InvoiceApi): void {
    if (inv.bankSlipUrl) {
      window.open(inv.bankSlipUrl, '_blank', 'noopener');
    }
  }

  showPix(inv: InvoiceApi): void {
    this.busyInvoiceId = inv.id;
    this.service
      .invoicePix(inv.id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.busyInvoiceId = null)))
      .subscribe({
        next: (pix) =>
          this.dialog.open(PixDialogComponent, { width: '420px', maxWidth: '95vw', data: { pix, amount: inv.amount } }),
        error: (err: unknown) => this.showError(err)
      });
  }

  downloadInvoice(inv: InvoiceApi): void {
    this.busyInvoiceId = inv.id;
    this.service
      .invoicePdf(inv.id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.busyInvoiceId = null)))
      .subscribe({
        next: (blob) => saveBlob(blob, `fatura-${inv.number ?? inv.id}.pdf`),
        error: (err: unknown) => this.showError(err)
      });
  }
}
