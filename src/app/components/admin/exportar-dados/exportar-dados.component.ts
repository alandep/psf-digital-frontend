import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { SUBSCRIPTION_SERVICE } from '../../../services/subscription/subscription-service.token';
import { extractErrorMessage } from '../../../shared/payment/payment-errors';
import { saveBlob } from '../../../shared/utils/file-download';

@Component({
  selector: 'app-exportar-dados',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressBarModule, MatSnackBarModule
  ],
  templateUrl: './exportar-dados.component.html',
  styleUrls: ['./exportar-dados.component.scss']
})
export class ExportarDadosComponent {
  private readonly subscriptionService = inject(SUBSCRIPTION_SERVICE);
  private readonly snackBar = inject(MatSnackBar);

  loading = false;
  errorMessage = '';
  lastFilename = '';

  gerarEBaixar(): void {
    if (this.loading) { return; }
    this.loading = true;
    this.errorMessage = '';
    this.subscriptionService
      .dataExport()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ blob, filename }) => {
          saveBlob(blob, filename);
          this.lastFilename = filename;
          this.snackBar.open('Exportação gerada. O download foi iniciado.', 'Fechar', { duration: 4000 });
        },
        error: (err: unknown) => {
          this.errorMessage = extractErrorMessage(err, 'Não foi possível gerar a exportação. Tente novamente.');
          this.snackBar.open(this.errorMessage, 'Fechar', { duration: 5000 });
        }
      });
  }
}
