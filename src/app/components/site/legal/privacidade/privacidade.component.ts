import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SaasBillingMockService } from '../../../../../services/saasBillingMockService';
import { LegalDocument } from '../../../../../types/saas-billing';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './privacidade.component.html',
  styleUrls: ['./privacidade.component.scss'],
})
export class PrivacidadeComponent {
  private billing = inject(SaasBillingMockService);
  private location = inject(Location);

  doc: LegalDocument = this.billing
    .getLegalDocuments()
    .find((d) => d.type === 'PRIVACY')!;

  voltar(): void {
    this.location.back();
  }
}
