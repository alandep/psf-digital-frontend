import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { catchError, forkJoin, of } from 'rxjs';
import { RecebimentosHttpService, RecebimentoItem } from '../../services/finance/recebimentos-http.service';
import { CAMBIO_SERVICE } from '../../services/finance/cambio-service.token';
import { MarketQuoteService } from '../../services/market/market-quote.service';
import { apiErrorMessage } from '../../services/finance/finance-utils';
import { RecebimentoEditDialogComponent } from './recebimento-edit-dialog/recebimento-edit-dialog.component';
import {
  ConfirmarAcaoDialogComponent,
  ConfirmDialogData
} from '../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { CURRENCY_LIST } from '../../../types/recebimentos';
import { ContratoCambio } from '../../../types/cambio';
import { PagamentoApiStatus } from '../../services/finance/pagamento-view';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

const STATUS_LABELS: Record<PagamentoApiStatus, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Recebido',
  ATRASADO: 'Atrasado',
  CANCELADO: 'Cancelado'
};

@Component({
  selector: 'app-contas-receber-fixed',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatBadgeModule,
    HasPermissionDirective
  ],
  templateUrl: './contas-receber-fixed.component.html',
  styleUrls: ['./contas-receber-fixed.component.scss']
})
export class ContasReceberFixedComponent implements OnInit {
  private readonly recebimentosService = inject(RecebimentosHttpService);
  private readonly cambioService = inject(CAMBIO_SERVICE);
  private readonly market = inject(MarketQuoteService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  /** Lista completa vinda do BFF. */
  private all: RecebimentoItem[] = [];
  /** Lista filtrada exibida na tela. */
  public recebimentos: RecebimentoItem[] = [];
  public contracts: ContratoCambio[] = [];
  public currencies: string[] = CURRENCY_LIST;
  public readonly statusOptions = (Object.keys(STATUS_LABELS) as PagamentoApiStatus[])
    .map((value) => ({ value, label: STATUS_LABELS[value] }));
  public isLoading = false;
  public loadError = false;
  public totalAmount = 0;
  public pendingAmount = 0;
  public completedAmount = 0;
  /** Moedas sem cotação real: ficam fora dos totais em R$. */
  public unconvertedCurrencies: string[] = [];

  private rates: Record<string, number | null> = {};

  public filtroForm: FormGroup;

  constructor() {
    this.filtroForm = this.fb.group({
      status: [[]],
      currency: [[]],
      contract: [[]],
      date_from: [null],
      date_to: [null],
      amount_min: [null],
      amount_max: [null]
    });
  }

  ngOnInit(): void {
    this.filtroForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
    this.cambioService.loadCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => (this.currencies = ['BRL', ...list.filter((c) => c !== 'BRL')]));
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.loadError = false;

    forkJoin({
      items: this.recebimentosService.list(),
      contracts: this.cambioService.getContracts().pipe(catchError(() => of([] as ContratoCambio[])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, contracts }) => {
          this.all = items;
          this.contracts = contracts;
          this.loadRates(items);
        },
        error: (err) => {
          this.isLoading = false;
          this.loadError = true;
          this.snackBar.open(apiErrorMessage(err, 'Erro ao carregar recebimentos'), 'Fechar', { duration: 4000 });
        }
      });
  }

  // Cotação real (MarketQuoteService.getRate) por moeda envolvida.
  private loadRates(items: RecebimentoItem[]): void {
    const cur = Array.from(new Set(items.map((i) => i.currency).filter((c) => !!c && c !== 'BRL')));
    if (cur.length === 0) {
      this.rates = {};
      this.finishLoad();
      return;
    }
    forkJoin(cur.map((c) => this.market.getRate(c)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        this.rates = {};
        cur.forEach((c, idx) => (this.rates[c] = values[idx]));
        this.finishLoad();
      });
  }

  private finishLoad(): void {
    this.isLoading = false;
    this.applyFilters();
  }

  private toBrl(item: RecebimentoItem): number {
    if (item.currency === 'BRL') {
      return item.amount;
    }
    const rate = this.rates[item.currency];
    return rate ? item.amount * rate : 0;
  }

  public applyFilters(): void {
    const f = this.filtroForm.value;
    const statuses: string[] = f.status ?? [];
    const currencies: string[] = f.currency ?? [];
    const contracts: string[] = f.contract ?? [];
    const from: Date | null = f.date_from ?? null;
    const to: Date | null = f.date_to ? new Date(new Date(f.date_to).setHours(23, 59, 59, 999)) : null;
    const min: number | null = f.amount_min ?? null;
    const max: number | null = f.amount_max ?? null;

    this.recebimentos = this.all.filter((r) =>
      (statuses.length === 0 || statuses.includes(r.status)) &&
      (currencies.length === 0 || currencies.includes(r.currency)) &&
      (contracts.length === 0 || (r.contratoCambioId !== null && contracts.includes(r.contratoCambioId))) &&
      (!from || r.dueDate >= from) &&
      (!to || r.dueDate <= to) &&
      (min === null || r.amount >= min) &&
      (max === null || r.amount <= max)
    );
    this.calculateTotals();
  }

  private calculateTotals(): void {
    const active = this.recebimentos.filter((r) => r.status !== 'CANCELADO');
    this.totalAmount = active.reduce((s, r) => s + this.toBrl(r), 0);
    this.pendingAmount = active
      .filter((r) => r.status === 'PENDENTE' || r.status === 'ATRASADO')
      .reduce((s, r) => s + this.toBrl(r), 0);
    this.completedAmount = active
      .filter((r) => r.status === 'PAGO')
      .reduce((s, r) => s + this.toBrl(r), 0);
    this.unconvertedCurrencies = Array.from(new Set(
      active.filter((r) => r.currency !== 'BRL' && !this.rates[r.currency]).map((r) => r.currency)
    ));
  }

  public formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  public formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  public getStatusLabel(status: string): string {
    return STATUS_LABELS[status as PagamentoApiStatus] ?? status;
  }

  public getStatusClass(status: string): string {
    switch (status) {
      case 'PAGO': return 'status-completed';
      case 'ATRASADO': return 'status-overdue';
      case 'PENDENTE': return 'status-pending';
      case 'CANCELADO': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  public isOpen(r: RecebimentoItem): boolean {
    return r.status === 'PENDENTE' || r.status === 'ATRASADO';
  }

  public getContractName(contractId: string | null): string {
    if (!contractId) {
      return 'Sem contrato';
    }
    const c = this.contracts.find((x) => x.id === contractId);
    return c ? `${c.contractNumber} - ${c.bank}` : 'Contrato não encontrado';
  }

  private openForm(recebimento: RecebimentoItem | null): void {
    const dialogRef = this.dialog.open(RecebimentoEditDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        recebimento,
        contracts: this.contracts.filter((c) => c.status !== 'CANCELADO'),
        currencies: this.currencies
      },
      disableClose: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved: RecebimentoItem | undefined) => {
        if (saved) {
          this.snackBar.open(
            recebimento ? 'Recebimento atualizado com sucesso!' : 'Recebimento criado com sucesso!',
            'Fechar',
            { duration: 3000 }
          );
          this.loadData();
        }
      });
  }

  public openNewRecebimentoDialog(): void {
    this.openForm(null);
  }

  public editRecebimento(recebimento: RecebimentoItem): void {
    this.openForm(recebimento);
  }

  public marcarRecebido(recebimento: RecebimentoItem): void {
    this.recebimentosService.marcarRecebido(recebimento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Recebimento marcado como recebido.', 'Fechar', { duration: 3000 });
          this.loadData();
        },
        error: (err) =>
          this.snackBar.open(apiErrorMessage(err, 'Erro ao marcar como recebido'), 'Fechar', { duration: 4000 })
      });
  }

  public cancelarRecebimento(recebimento: RecebimentoItem): void {
    const valorFormatado = this.formatCurrency(recebimento.amount, recebimento.currency);
    const data: ConfirmDialogData = {
      title: 'Cancelar recebimento',
      message: `Tem certeza que deseja cancelar o recebimento de ${valorFormatado}?`,
      icon: 'cancel',
      iconColor: 'warn',
      confirmText: 'Cancelar recebimento',
      confirmColor: 'warn'
    };

    this.dialog.open(ConfirmarAcaoDialogComponent, { width: '420px', autoFocus: false, data })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed !== true) {
          return;
        }
        this.recebimentosService.cancelar(recebimento.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open('Recebimento cancelado.', 'Fechar', { duration: 3000 });
              this.loadData();
            },
            error: (err) =>
              this.snackBar.open(apiErrorMessage(err, 'Erro ao cancelar recebimento'), 'Fechar', { duration: 4000 })
          });
      });
  }
}
