import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ProductValidationDialogData {
  productName: string;
  isValid: boolean;
  errors: { field: string; message: string; severity?: string }[];
  warnings: { field: string; message: string; suggestion?: string }[];
}

@Component({
  selector: 'app-product-validation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="validation-dialog">
      <!-- ===== Portos gradient hero header ===== -->
      <div class="dialog-header">
        <div class="dialog-header__left">
          <div class="dialog-header__badge">
            <mat-icon>{{ headerIcon }}</mat-icon>
          </div>
          <h2 class="dialog-header__title">{{ headerTitle }}</h2>
        </div>
        <button
          mat-icon-button
          class="dialog-header__close"
          mat-dialog-close
          matTooltip="Fechar"
          aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- ===== Body ===== -->
      <mat-dialog-content class="dialog-content">
        <p class="summary">
          <strong>{{ data.productName }}</strong>
          <span class="summary__counts">{{ summaryText }}</span>
        </p>

        <!-- Errors -->
        <section class="issue-section" *ngIf="data.errors.length">
          <h3 class="issue-section__title">Erros</h3>
          <ul class="issue-list">
            <li class="issue-item issue-item--error" *ngFor="let error of data.errors">
              <mat-icon class="issue-item__icon issue-item__icon--error">error</mat-icon>
              <div class="issue-item__body">
                <span class="issue-item__field">{{ fieldLabel(error.field) }}</span>
                <span class="issue-item__message">{{ error.message }}</span>
              </div>
            </li>
          </ul>
        </section>

        <mat-divider
          *ngIf="data.errors.length && data.warnings.length"
          class="section-divider"></mat-divider>

        <!-- Warnings -->
        <section class="issue-section" *ngIf="data.warnings.length">
          <h3 class="issue-section__title">Avisos</h3>
          <ul class="issue-list">
            <li class="issue-item issue-item--warning" *ngFor="let warning of data.warnings">
              <mat-icon class="issue-item__icon issue-item__icon--warning">warning</mat-icon>
              <div class="issue-item__body">
                <span class="issue-item__field">{{ fieldLabel(warning.field) }}</span>
                <span class="issue-item__message">{{ warning.message }}</span>
                <span class="issue-item__suggestion" *ngIf="warning.suggestion">
                  Sugestão: {{ warning.suggestion }}
                </span>
              </div>
            </li>
          </ul>
        </section>

        <!-- Success empty state -->
        <div class="success-state" *ngIf="!data.errors.length && !data.warnings.length">
          <mat-icon class="success-state__icon">check_circle</mat-icon>
          <p class="success-state__text">Produto válido! Nenhum problema encontrado.</p>
        </div>
      </mat-dialog-content>

      <!-- ===== Footer ===== -->
      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-raised-button color="primary" mat-dialog-close>Fechar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .validation-dialog {
      display: flex;
      flex-direction: column;
      width: 560px;
      max-width: 92vw;
      border-radius: 16px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      margin: 0;
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: white;
      flex-shrink: 0;
    }

    .dialog-header__left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .dialog-header__badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dialog-header__badge mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
      line-height: 24px;
    }

    .dialog-header__title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: white;
    }

    .dialog-header__close {
      color: white;
    }

    .dialog-content {
      padding: 20px 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .summary {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 0 0 16px;
      font-size: 0.95rem;
      color: #333;
    }

    .summary__counts {
      color: #666;
      font-size: 0.9rem;
    }

    .issue-section {
      margin-bottom: 16px;
    }

    .issue-section__title {
      margin: 0 0 10px;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
    }

    .issue-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .issue-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      background: #fafafa;
    }

    .issue-item--error {
      border-left: 4px solid #f44336;
      background: rgba(244, 67, 54, 0.06);
    }

    .issue-item--warning {
      border-left: 4px solid #ff9800;
      background: rgba(255, 152, 0, 0.06);
    }

    .issue-item__icon {
      flex-shrink: 0;
      font-size: 22px;
      width: 22px;
      height: 22px;
      margin-top: 2px;
    }

    .issue-item__icon--error {
      color: #f44336;
    }

    .issue-item__icon--warning {
      color: #ff9800;
    }

    .issue-item__body {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .issue-item__field {
      font-weight: 600;
      color: #333;
      font-size: 0.92rem;
    }

    .issue-item__message {
      color: #555;
      font-size: 0.9rem;
      line-height: 1.45;
    }

    .issue-item__suggestion {
      color: #888;
      font-size: 0.85rem;
      font-style: italic;
      line-height: 1.4;
    }

    .section-divider {
      margin: 4px 0 16px;
    }

    .success-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px 12px;
    }

    .success-state__icon {
      color: #4caf50;
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 12px;
    }

    .success-state__text {
      margin: 0;
      color: #333;
      font-size: 1rem;
      font-weight: 500;
    }

    .dialog-actions {
      padding: 12px 24px 18px;
      margin: 0;
    }

    @media (max-width: 600px) {
      .validation-dialog {
        width: 100%;
      }
    }
  `]
})
export class ProductValidationDialogComponent {
  public readonly dialogRef = inject(MatDialogRef<ProductValidationDialogComponent>);

  private readonly fieldLabels: Record<string, string> = {
    name: 'Nome',
    product_code: 'Código',
    ncm_code: 'Código NCM',
    hs_code: 'Código HS',
    standard_price: 'Preço Padrão',
    commodity_type: 'Tipo de Commodity',
    unit: 'Unidade'
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductValidationDialogData) {}

  public get headerIcon(): string {
    if (this.data.errors?.length) {
      return 'error';
    }
    if (this.data.warnings?.length) {
      return 'warning';
    }
    return 'check_circle';
  }

  public get headerTitle(): string {
    if (this.data.errors?.length) {
      return 'Produto inválido';
    }
    if (this.data.warnings?.length) {
      return 'Produto válido com avisos';
    }
    return 'Produto válido';
  }

  public get summaryText(): string {
    const errorCount = this.data.errors?.length ?? 0;
    const warningCount = this.data.warnings?.length ?? 0;

    if (errorCount === 0 && warningCount === 0) {
      return 'Nenhum problema encontrado';
    }

    return `${errorCount} erro(s) e ${warningCount} aviso(s) encontrados`;
  }

  public fieldLabel(field: string): string {
    return this.fieldLabels[field] ?? field;
  }
}
