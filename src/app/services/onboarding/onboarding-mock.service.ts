import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IOnboardingService } from './onboarding-service.interface';
import { SaasBillingMockService } from '../../../services/saasBillingMockService';
import { TrialState, OnboardingProgress } from '../../../types/saas-billing';

/** Adapter exposing the legacy SaaS billing mock via IOnboardingService. */
@Injectable({ providedIn: 'root' })
export class OnboardingMockAdapter implements IOnboardingService {
  private readonly mock = inject(SaasBillingMockService);
  getTrialState(): Observable<TrialState> { return this.mock.getTrialState(); }
  getOnboardingProgress(): Observable<OnboardingProgress> { return this.mock.getOnboardingProgress(); }
}