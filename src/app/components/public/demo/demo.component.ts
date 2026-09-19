import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { AuthProfileService } from '../../../../services/authProfileService';

interface SafetyNote {
  id: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
})
export class DemoComponent {
  private authProfileService = inject(AuthProfileService);
  private router = inject(Router);

  safetyNotes: SafetyNote[] = [
    { id: 'ficticios', icon: 'blur_on', label: 'Dados fictícios' },
    { id: 'billing', icon: 'money_off', label: 'Sem billing' },
    { id: 'pessoais', icon: 'no_accounts', label: 'Sem dados pessoais reais' },
    { id: 'integracoes', icon: 'link_off', label: 'Sem integrações reais' },
  ];

  trackByNote(_: number, n: SafetyNote): string { return n.id; }

  enterDemo(): void {
    this.authProfileService.loadProfile().subscribe(() => {
      this.router.navigate(['/home-logged'], { queryParams: { demo: '1' } });
    });
  }
}
