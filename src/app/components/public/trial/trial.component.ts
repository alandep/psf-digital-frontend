import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthProfileService } from '../../../../services/authProfileService';

@Component({
  selector: 'app-trial',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './trial.component.html',
  styleUrls: ['./trial.component.scss'],
})
export class TrialComponent {
  private router = inject(Router);
  private authProfileService = inject(AuthProfileService);

  entering = false;

  // §9 feature checklist.
  readonly features: string[] = [
    'Usuários ilimitados',
    'AI Hub',
    'Operação de exportação',
    'Documentos',
    'Logística',
    'Compliance',
  ];

  startTrial(): void {
    if (this.entering) {
      return;
    }
    this.entering = true;
    // Load the access profile before entering the app, then trigger the tour.
    this.authProfileService.loadProfile().subscribe({
      next: () => {
        this.router.navigate(['/home-logged'], { queryParams: { tour: 'start' } });
      },
      error: () => {
        this.router.navigate(['/home-logged'], { queryParams: { tour: 'start' } });
      },
    });
  }
}
