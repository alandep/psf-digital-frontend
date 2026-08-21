import { Component, OnInit, inject } from '@angular/core';
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
import { RecebimentosMockService } from '../../../services/recebimentosMockService';
import { RecebimentoEditDialogComponent } from './recebimento-edit-dialog/recebimento-edit-dialog.component';
import {
  ConfirmarAcaoDialogComponent,
  ConfirmDialogData
} from '../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import {
  Recebimento,
  FiltroOptions,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../types/recebimentos';

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
    MatBadgeModule
  ],
  templateUrl: './contas-receber-fixed.component.html',
  styleUrls: ['./contas-receber-fixed.component.scss']
})
export class ContasReceberFixedComponent implements OnInit {
  private readonly recebimentosService = inject(RecebimentosMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public recebimentos: Recebimento[] = [];
  public filtroOptions: FiltroOptions | null = null;
  public isLoading = false;
  public totalAmount = 0;
  public pendingAmount = 0;
  public completedAmount = 0;

  public filtroForm: FormGroup;
  public readonly statusLabels = STATUS_LABELS;
  public readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;

  constructor() {
    this.filtroForm = this.fb.group({
      status: [[]],
      currency: [[]],
      payment_method: [[]],
      contract: [[]],
      date_from: [null],
      date_to: [null],
      amount_min: [null],
      amount_max: [null],
      bank_account: [[]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    this.recebimentosService.getFiltroOptions().subscribe({
      next: (options) => {
        this.filtroOptions = options;
      }
    });

    this.recebimentosService.getRecebimentos().subscribe({
      next: (recebimentos) => {
        this.recebimentos = recebimentos;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private calculateTotals(): void {
    this.totalAmount = this.recebimentos.reduce((sum, r) => {
      const exchangeRate = r.exchange_rate || 1;
      return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
    }, 0);

    this.pendingAmount = this.recebimentos
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => {
        const exchangeRate = r.exchange_rate || 1;
        return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
      }, 0);

    this.completedAmount = this.recebimentos
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => {
        const exchangeRate = r.exchange_rate || 1;
        return sum + (r.currency === 'BRL' ? r.amount : r.amount * exchangeRate);
      }, 0);
  }

  public formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  public formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  public getStatusLabel(status: string): string {
    return this.statusLabels[status as keyof typeof this.statusLabels] || status;
  }

  public getMethodLabel(method: string): string {
    return this.paymentMethodLabels[method as keyof typeof this.paymentMethodLabels] || method;
  }

  public getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  public getContractName(contractId: string): string {
    if (!this.filtroOptions) return contractId;
    const contract = this.filtroOptions.contracts.find(c => c.id === contractId);
    return contract ? `${contract.number} - ${contract.client_name}` : contractId;
  }

  public openNewRecebimentoDialog(): void {
    const dialogRef = this.dialog.open(RecebimentoEditDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        recebimento: null,
        filtroOptions: this.filtroOptions,
        isEditMode: false
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Recebimento criado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadData();
      }
    });
  }

  public editRecebimento(recebimento: Recebimento): void {
    const dialogRef = this.dialog.open(RecebimentoEditDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        recebimento: { ...recebimento },
        filtroOptions: this.filtroOptions,
        isEditMode: true
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Recebimento atualizado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadData();
      }
    });
  }

  public deleteRecebimento(recebimento: Recebimento): void {
    const valorFormatado = this.formatCurrency(recebimento.amount, recebimento.currency);
    const data: ConfirmDialogData = {
      title: 'Excluir recebimento',
      message: `Tem certeza que deseja excluir o recebimento de ${valorFormatado}? Esta ação não pode ser desfeita.`,
      icon: 'delete',
      iconColor: 'warn',
      confirmText: 'Excluir',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '420px',
      autoFocus: false,
      data
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed === true && recebimento.id) {
        this.recebimentosService.deleteRecebimento(recebimento.id).subscribe({
          next: (success) => {
            if (success) {
              this.snackBar.open('Recebimento excluído com sucesso!', 'Fechar', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this.loadData();
            } else {
              this.snackBar.open('Erro ao excluir recebimento.', 'Fechar', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
            }
          },
          error: () => {
            this.snackBar.open('Erro ao excluir recebimento.', 'Fechar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
}
