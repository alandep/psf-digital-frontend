import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOnboardingService } from './onboarding-service.interface';
import { environment } from '../../../environments/environment';
import { TrialState, OnboardingProgress } from '../../../types/saas-billing';

/**
 * Real HTTP gateway for the trial banner + onboarding checklist. Hits the
 * tenant-scoped BFF (GET /bff/onboarding/trial and /status); the backend
 * computes everything in real time for the current org under RLS. Session
 * cookie + CSRF are attached by the global interceptors. The backend records
 * match TrialState / OnboardingProgress exactly, so no mapping is needed.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingHttpService implements IOnboardingService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffBaseUrl}/bff/onboarding`;

  getTrialState(): Observable<TrialState> {
    return this.http.get<TrialState>(`${this.base}/trial`);
  }

  getOnboardingProgress(): Observable<OnboardingProgress> {
    return this.http.get<OnboardingProgress>(`${this.base}/status`);
  }
}