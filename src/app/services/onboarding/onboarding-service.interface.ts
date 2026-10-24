import { Observable } from 'rxjs';
import { TrialState, OnboardingProgress } from '../../../types/saas-billing';

/** Trial banner + onboarding checklist for the CURRENT org (logged home). */
export interface IOnboardingService {
  getTrialState(): Observable<TrialState>;
  getOnboardingProgress(): Observable<OnboardingProgress>;
}