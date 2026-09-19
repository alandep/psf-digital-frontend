import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SaasBillingMockService } from '../../../../../services/saasBillingMockService';
import { LegalDocument } from '../../../../../types/saas-billing';

@Component({
  selector: 'app-termos',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './termos.component.html',
  styleUrls: ['./termos.component.scss'],
})
export class TermosComponent {
  private billing = inject(SaasBillingMockService);
  private location = inject(Location);

  doc: LegalDocument = this.billing
    .getLegalDocuments()
    .find((d) => d.type === 'TERMS')!;

  voltar(): void {
    this.location.back();
  }
}
