import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-pagamento-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="pgto-dialog">
      <div class="pgto-header">
        <mat-icon>credit_card</mat-icon>
        <h2>Alterar forma de pagamento</h2>
      </div>

      <div class="pgto-body">
        <p class="lead">Informe os dados do novo cartão. (Ambiente de demonstração — nada é armazenado.)</p>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Nome no cartão</mat-label>
          <input matInput [(ngModel)]="name" placeholder="Nome impresso no cartão">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Número do cartão</mat-label>
          <input matInput [(ngModel)]="number" maxlength="19" placeholder="0000 0000 0000 0000">
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Validade</mat-label>
            <input matInput [(ngModel)]="expiry" maxlength="5" placeholder="MM/AA">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>CVV</mat-label>
            <input matInput [(ngModel)]="cvv" maxlength="4" placeholder="123">
          </mat-form-field>
        </div>
      </div>

      <div class="pgto-actions">
        <button mat-button (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="!isValid()" (click)="confirm()">Salvar cartão</button>
      </div>
    </div>
  `,
  styleUrls: ['./pagamento-dialog.component.scss']
})
export class PagamentoDialogComponent {
  dialogRef = inject(MatDialogRef<PagamentoDialogComponent>);
  name = '';
  number = '';
  expiry = '';
  cvv = '';

  isValid(): boolean {
    const digits = this.number.replace(/\s/g, '');
    return this.name.trim().length > 2 && digits.length >= 13 && this.expiry.length === 5 && this.cvv.length >= 3;
  }

  confirm(): void {
    // Do NOT persist raw card data; return only a masked brand/last4 summary.
    const digits = this.number.replace(/\s/g, '');
    this.dialogRef.close({ brand: 'Visa', last4: digits.slice(-4) });
  }
}
