import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';

import { SUBSCRIPTION_SERVICE } from '../../../../services/subscription/subscription-service.token';
import { extractErrorMessage } from '../../../../shared/payment/payment-errors';
import { UsageEntry } from '../../../../../types/billing-api';

type StatementFeature = 'AI' | 'OCR';

@Component({
  selector: 'app-extrato-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTabsModule, MatTableModule, MatProgressBarModule],
  template: `
    <h2 mat-dialog-title>Extrato de uso do ciclo</h2>
    <mat-dialog-content class="extrato-content">
      <mat-tab-group (selectedIndexChange)="onTab($event)" animationDuration="0ms">
        <mat-tab label="IA"></mat-tab>
        <mat-tab label="OCR"></mat-tab>
      </mat-tab-group>

      <mat-progress-bar *ngIf="loading" mode="indeterminate" aria-label="Carregando extrato"></mat-progress-bar>
      <p class="error" *ngIf="error" role="alert">{{ error }}</p>

      <table mat-table [dataSource]="entries" class="extrato-table" *ngIf="!loading && !error && entries.length">
        <ng-container matColumnDef="occurredAt">
          <th mat-header-cell *matHeaderCellDef>Data/hora</th>
          <td mat-cell *matCellDef="let e">{{ e.occurredAt | date: 'dd/MM/yyyy HH:mm' }}</td>
        </ng-container>
        <ng-container matColumnDef="operation">
          <th mat-header-cell *matHeaderCellDef>Operação</th>
          <td mat-cell *matCellDef="let e">{{ e.operationLabel || e.operation }}</td>
        </ng-container>
        <ng-container matColumnDef="user">
          <th mat-header-cell *matHeaderCellDef>Usuário</th>
          <td mat-cell *matCellDef="let e">{{ e.userName || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="amount">
          <th mat-header-cell *matHeaderCellDef>Quantidade</th>
          <td mat-cell *matCellDef="let e">{{ e.amount | number: '1.0-2':'pt-BR' }} {{ e.unit }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols;"></tr>
      </table>

      <p class="empty" *ngIf="!loading && !error && !entries.length">
        Nenhum consumo registrado neste ciclo.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .extrato-content { min-width: min(720px, 80vw); min-height: 240px; }
    .extrato-table { width: 100%; }
    .empty { color: #607d8b; text-align: center; padding: 32px 0; }
    .error { color: #b71c1c; padding: 16px 0; }
  `]
})
export class ExtratoDialogComponent implements OnInit {
  private readonly service = inject(SUBSCRIPTION_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  readonly cols = ['occurredAt', 'operation', 'user', 'amount'];
  entries: UsageEntry[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load('AI');
  }

  onTab(index: number): void {
    this.load(index === 1 ? 'OCR' : 'AI');
  }

  private load(feature: StatementFeature): void {
    this.loading = true;
    this.error = '';
    this.entries = [];
    this.service
      .statement(feature, 200)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => (this.entries = rows),
        error: (err: unknown) => (this.error = extractErrorMessage(err, 'Não foi possível carregar o extrato.'))
      });
  }
}
