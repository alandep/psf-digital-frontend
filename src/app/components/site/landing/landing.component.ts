import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SaasBillingMockService } from '../../../../services/saasBillingMockService';
import { SaasPlan } from '../../../../types/saas-billing';

@Component({
  selector: 'app-site-demo-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Agendar demonstração</h2>
    <mat-dialog-content>
      <p>Deixe seus dados e nossa equipe comercial entrará em contato para agendar uma demonstração do EIP.</p>
      <p class="muted">Este é um fluxo de demonstração (mock).</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="ref.close()">Fechar</button>
      <button mat-flat-button color="primary" (click)="ref.close()">Solicitar contato</button>
    </mat-dialog-actions>
  `,
  styles: ['.muted{color:#6b7280;font-size:.85rem;}'],
})
export class SiteDemoDialogComponent {
  ref = inject(MatDialogRef<SiteDemoDialogComponent>);
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  private dialog = inject(MatDialog);
  private billing = inject(SaasBillingMockService);

  plans: SaasPlan[] = this.billing.getPlans().filter((p) => p.code !== 'ENTERPRISE');

  modules = ['Contratos', 'Exportações', 'Documentos', 'Logística', 'Financeiro', 'Compliance', 'IA', 'BI'];

  nowYear = new Date().getFullYear();

  openDemo(): void {
    this.dialog.open(SiteDemoDialogComponent, { width: '440px' });
  }
}
