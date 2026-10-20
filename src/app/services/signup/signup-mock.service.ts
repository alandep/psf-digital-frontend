import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ISignupService } from './signup-service.interface';
import { SignupMockService } from '../../../services/signupMockService';
import { SignupAccount, SignupCompany, TrialResult } from '../../../types/signup';

/** Adapter exposing the legacy in-memory SignupMockService via ISignupService. */
@Injectable({ providedIn: 'root' })
export class SignupMockAdapter implements ISignupService {
  private readonly mock = inject(SignupMockService);
  checkCnpj(cnpj: string): Observable<{ available: boolean }> { return this.mock.checkCnpj(cnpj); }
  startTrial(a: SignupAccount, c: SignupCompany, g: string[]): Observable<TrialResult> {
    return this.mock.startTrial(a, c, g);
  }
}