export type AuthState =
  | 'IDENTIFICATION_REQUIRED' | 'PASSWORD_REQUIRED' | 'MFA_REQUIRED'
  | 'ORGANIZATION_SELECTION_REQUIRED' | 'AUTHENTICATED'
  | 'ACCOUNT_LOCKED' | 'ACCOUNT_DISABLED';

export type MfaMethod = 'TOTP' | 'EMAIL' | 'RECOVERY';

export interface AuthOrganization {
  id: string;
  razaoSocial: string;
  cnpjMasked: string;
  role: string;
}

export interface AuthChallenge {
  state: AuthState;
  cpfMasked?: string;
  userName?: string;
  organizations?: AuthOrganization[];
  challengeId?: string;
  message?: string;
  mfaMethods?: MfaMethod[];
  emailMasked?: string;
  resendAvailableInSeconds?: number;
}
