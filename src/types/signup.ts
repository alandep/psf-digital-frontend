export interface SignupAccount {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignupCompany {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  segmento: string;
}

export interface SignupGoals {
  goals: string[];
}

export interface TrialResult {
  organizationId: string;
  trialStatus: 'ACTIVE';
  expiresAt: Date;
  nextAction: 'START_ONBOARDING';
}
