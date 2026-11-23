import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PixView } from '../../../../../types/billing-api';

export interface PixDialogData {
  pix: PixView;
  /** Valor da cobrança, quando conhecido. */
  amount?: number | null;
}

@Component({
  selector: 'app-pix-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>Pagar com Pix</h2>
    <mat-dialog-content class="pix-content">
      <p *ngIf="data.amount != null">Valor: <strong>{{ data.amount | currency: 'BRL' }}</strong></p>
      <img *ngIf="data.pix.encodedImage"
           class="qr"
           [src]="'data:image/png;base64,' + data.pix.encodedImage"
           alt="QR Code Pix para pagamento" />
      <p class="hint">Abra o app do seu banco, escolha Pix e leia o QR Code, ou use o código copia e cola abaixo.</p>
      <label class="code-label" for="pix-payload">Pix copia e cola</label>
      <textarea id="pix-payload" class="code" readonly rows="4" [value]="data.pix.payload"></textarea>
      <p class="hint" *ngIf="data.pix.expirationDate">
        Válido até {{ data.pix.expirationDate | date: 'dd/MM/yyyy HH:mm' }}.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
      <button mat-raised-button color="primary" (click)="copy()">
        <mat-icon aria-hidden="true">content_copy</mat-icon> Copiar código
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .pix-content { display: flex; flex-direction: column; align-items: stretch; min-width: 280px; }
    .qr { width: 220px; height: 220px; align-self: center; margin: 8px 0 12px; }
    .hint { color: #546e7a; font-size: 0.85rem; margin: 4px 0; }
    .code-label { font-weight: 600; font-size: 0.85rem; margin-top: 8px; }
    .code { width: 100%; box-sizing: border-box; font-family: monospace; font-size: 0.78rem; padding: 8px; resize: none; }
  `]
})
export class PixDialogComponent {
  readonly data = inject<PixDialogData>(MAT_DIALOG_DATA);
  private readonly snackBar = inject(MatSnackBar);

  copy(): void {
    navigator.clipboard.writeText(this.data.pix.payload).then(
      () => this.snackBar.open('Código Pix copiado.', 'Fechar', { duration: 3000 }),
      () => this.snackBar.open('Não foi possível copiar. Selecione o código e copie manualmente.', 'Fechar', { duration: 4000 })
    );
  }
}
