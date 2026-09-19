import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { AUTH_FLOW_SERVICE } from '../../../services/auth-flow/auth-flow.token';
import { AuthProfileService } from '../../../../services/authProfileService';
import { AuthOrganization } from '../../../../types/auth-flow';

@Component({
  selector: 'app-select-company',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './select-company.component.html',
  styleUrls: ['./select-company.component.scss']
})
export class SelectCompanyComponent {
  private router = inject(Router);
  private authFlow = inject(AUTH_FLOW_SERVICE);
  private authProfileService = inject(AuthProfileService);

  // Stable list bound in the template (never a getter) to avoid *ngFor churn.
  organizations: AuthOrganization[] = [];
  isLoading = false;
  selectedId: string | null = null;
  errorMessage = '';

  constructor() {
    const fromChallenge = this.authFlow.lastChallenge?.organizations;
    this.organizations = (fromChallenge && fromChallenge.length > 0)
      ? fromChallenge
      : this.authFlow.defaultOrganizations;
  }

  trackByOrgId(_index: number, org: AuthOrganization): string {
    return org.id;
  }

  selectOrganization(org: AuthOrganization): void {
    if (this.isLoading) {
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    this.selectedId = org.id;
    this.authFlow.selectOrganization(org.id).subscribe({
      next: (challenge) => {
        if (challenge.state === 'AUTHENTICATED') {
          this.enterApp();
        } else {
          this.isLoading = false;
          this.selectedId = null;
          this.errorMessage = challenge.message ?? 'Não foi possível selecionar a empresa.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.selectedId = null;
        this.errorMessage = 'Não foi possível selecionar a empresa.';
      }
    });
  }

  // Reuse the login demo pattern: load the mock access profile, then navigate.
  private enterApp(): void {
    this.authProfileService.loadProfile().subscribe({
      next: () => this.router.navigate(['/home-logged']),
      error: () => this.router.navigate(['/home-logged'])
    });
  }
}
