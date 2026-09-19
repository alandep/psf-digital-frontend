import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import { DataExportJob } from '../../../../types/saas-billing';
import { MfaDialogComponent } from './mfa-dialog/mfa-dialog.component';

interface ExportStep {
  key: DataExportJob['status'];
  label: string;
  icon: string;
}

@Component({
  selector: 'app-exportar-dados',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressBarModule, MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './exportar-dados.component.html',
  styleUrls: ['./exportar-dados.component.scss']
})
export class ExportarDadosComponent {
  private saasBilling = inject(SaasBillingMockService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  job: DataExportJob | null = null;
  processing = false;

  readonly packageItems = [
    'Empresa', 'Produtos', 'Clientes', 'Fornecedores', 'Exportações', 'Lotes',
    'Documentos', 'Invoices', 'Logística', 'Financeiro', 'Compliance',
    'Auditoria', 'manifest.json'
  ];

  readonly steps: ExportStep[] = [
    { key: 'REQUESTED', label: 'Solicitado', icon: 'assignment' },
    { key: 'PROCESSING', label: 'Processando', icon: 'sync' },
    { key: 'READY', label: 'Pronto para download', icon: 'check_circle' }
  ];

  gerarPacote(): void {
    const ref = this.dialog.open(MfaDialogComponent, {
      width: '440px',
      panelClass: 'assinatura-dialog-panel'
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) { this.startExport(); }
    });
  }

  private startExport(): void {
    this.processing = true;
    this.saasBilling.requestDataExport().subscribe((job) => {
      this.job = job;
      // Advance the state machine: REQUESTED -> PROCESSING -> READY.
      this.advance(job.id);
    });
  }

  private advance(id: string): void {
    setTimeout(() => {
      this.saasBilling.getDataExportJob(id).subscribe((j) => {
        this.job = j;
        if (j.status === 'READY') {
          this.processing = false;
        } else {
          this.advance(id);
        }
      });
    }, 1400);
  }

  isStepDone(step: ExportStep): boolean {
    if (!this.job) { return false; }
    const order = this.steps.map((s) => s.key);
    return order.indexOf(this.job.status) >= order.indexOf(step.key);
  }

  isStepActive(step: ExportStep): boolean {
    return !!this.job && this.job.status === step.key;
  }

  baixarPacote(): void {
    this.snackBar.open('Download iniciado: eip-export.zip (mock)', 'Fechar', { duration: 3500 });
  }
}
