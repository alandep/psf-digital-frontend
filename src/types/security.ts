// MOCK security types for the EIP identity/security screens (§40, §73, §74).
// Dependency-free — used by SecurityMockService and the security screens.

export interface ActiveSession {
  id: string;
  device: string;
  os: string;
  location: string;
  current: boolean;
  lastSeen: string; // human pt-BR like 'Agora', 'Há 2 horas'
}

export type MfaStatus = 'ENABLED' | 'DISABLED';

export interface SecurityOverview {
  passwordChangedAt: Date;
  mfaStatus: MfaStatus;
  authenticatorConfigured: boolean;
  recoveryCodesRemaining: number;
}

export interface SecurityEvent {
  id: string;
  type: string;
  label: string;
  ip: string;
  occurredAt: Date;
}
