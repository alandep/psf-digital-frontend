import { Observable } from 'rxjs';
import { SignupAccount, SignupCompany, TrialResult } from '../../../types/signup';

/** Public self-service signup ("Experimentar Gratis") integration. */
export interface ISignupService {
  /** Checks if a company (by CNPJ) can still be registered. */
  checkCnpj(cnpj: string): Observable<{ available: boolean }>;
  /** Provisions a new tenant + admin user and starts a 14-day trial. */
  startTrial(account: SignupAccount, company: SignupCompany, goals: string[]): Observable<TrialResult>;
}