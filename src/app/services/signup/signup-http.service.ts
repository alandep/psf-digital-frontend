import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ISignupService } from './signup-service.interface';
import { environment } from '../../../environments/environment';
import { SignupAccount, SignupCompany, TrialResult } from '../../../types/signup';

/** Backend signup response (POST /bff/public/signup). */
interface SignupResponseDto {
  organizationId: string;
  userId: string;
  gcpTenantId: string;
  trialEnd: string;
  trialStatus: string;
  nextAction: string;
}

/**
 * Real HTTP gateway for the public signup flow. Hits the pre-auth BFF endpoints
 * under /bff/public/signup. On success the backend binds the HTTP session, so
 * the SPA is already authenticated when it lands on the trial. Session cookie +
 * CSRF are handled by the global interceptors (signup is CSRF-exempt pre-auth).
 */
@Injectable({ providedIn: 'root' })
export class SignupHttpService implements ISignupService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffBaseUrl}/bff/public/signup`;

  checkCnpj(cnpj: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(`${this.base}/check-cnpj`, { cnpj });
  }

  startTrial(account: SignupAccount, company: SignupCompany, goals: string[]): Observable<TrialResult> {
    const body = {
      name: account.name,
      cpf: account.cpf,
      email: account.email,
      phone: account.phone,
      password: account.password,
      cnpj: company.cnpj,
      razaoSocial: company.razaoSocial,
      nomeFantasia: company.nomeFantasia,
      segmento: company.segmento,
      goals
    };
    return this.http.post<SignupResponseDto>(this.base, body).pipe(
      map((d) => ({
        organizationId: d.organizationId,
        trialStatus: 'ACTIVE' as const,
        expiresAt: d.trialEnd ? new Date(d.trialEnd) : new Date(),
        nextAction: 'START_ONBOARDING' as const
      }))
    );
  }
}