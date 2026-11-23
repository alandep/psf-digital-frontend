import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { SUBSCRIPTION_SERVICE } from '../../../../services/subscription/subscription-service.token';
import { AuthProfileService } from '../../../../../services/authProfileService';
import { PaymentMethodFormComponent } from '../../../../shared/payment/payment-method-form.component';
import { extractErrorMessage } from '../../../../shared/payment/payment-errors';
import { CARD_BRAND_LABELS, CardBrand } from '../../../../shared/payment/card-utils';
import { ApiAddon, PackPurchaseResponse, SubscriptionView } from '../../../../../types/billing-api';
import { holderDefaultsFrom } from '../holder-defaults';

export interface CreditosDialogData {
  subscription: SubscriptionView | null;
}

/** Fecha com a PackPurchaseResponse após a compra, ou sem valor ao cancelar. */
@Component({
  selector: 'app-creditos-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule, PaymentMethodFormComponent
  ],
  templateUrl: './creditos-dialog.component.html',
  styleUrls: ['./creditos-dialog.component.scss']
})
export class CreditosDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<CreditosDialogComponent, PackPurchaseResponse>);
  readonly data = inject<CreditosDialogData>(MAT_DIALOG_DATA);
  private readonly service = inject(SUBSCRIPTION_SERVICE);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  readonly holder = holderDefaultsFrom(inject(AuthProfileService));

  @ViewChild('pay') private pay?: PaymentMethodFormComponent;

  packs: ApiAddon[] = [];
  selected: string | null = null;
  loading = true;
  saving = false;

  /** Há cartão salvo na assinatura (permite pagar sem digitar o cartão). */
  get hasSavedCard(): boolean {
    const s = this.data.subscription;
    return !!s && s.paymentMethod === 'CREDIT_CARD' && !!s.paymentLast4;
  }

  get savedCardLabel(): string {
    const s = this.data.subscription;
    if (!s || !s.paymentLast4) { return 'cartão salvo'; }
    const brand = s.paymentBrand ? (CARD_BRAND_LABELS[s.paymentBrand.toUpperCase() as CardBrand] ?? s.paymentBrand) : 'Cartão';
    return `${brand} final ${s.paymentLast4}`;
  }

  get selectedPack(): ApiAddon | null {
    return this.packs.find((p) => p.code === this.selected) ?? null;
  }

  ngOnInit(): void {
    this.service
      .addons()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loading = false)))
      .subscribe({
        next: (addons) => {
          this.packs = addons;
          this.selected = (addons.find((a) => a.highlighted) ?? addons[0])?.code ?? null;
        },
        error: (err: unknown) => this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 })
      });
  }

  trackByCode(_i: number, p: ApiAddon): string {
    return p.code;
  }

  confirm(): void {
    if (!this.selected || !this.pay) { return; }
    const pagamento = this.pay.value();
    if (!pagamento) {
      this.pay.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.service
      .purchasePack({
        addonCode: this.selected,
        metodo: pagamento.metodo,
        usarCartaoSalvo: pagamento.metodo === 'CREDIT_CARD' && this.pay.usarCartaoSalvo,
        ...(pagamento.cartao ? { cartao: pagamento.cartao } : {}),
        ...(pagamento.titular ? { titular: pagamento.titular } : {})
      })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err: unknown) => this.snackBar.open(extractErrorMessage(err), 'Fechar', { duration: 5000 })
      });
  }
}
