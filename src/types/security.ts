// Security types for the EIP identity/security screens (§40, §73, §74).
// Dependency-free — used by the security services and screens.

export interface ActiveSession {
  id: string;
  device: string;
  os: string;
  location: string; // client IP reported by the backend, or 'IP desconhecido'
  current: boolean;
  lastSeen: string; // human pt-BR like 'Agora', 'Há 2 h', 'Ontem'
}

export type MfaStatus = 'ENABLED' | 'DISABLED';

export interface SecurityOverview {
  passwordChangedAt: Date | null;
  mfaStatus: MfaStatus;
  authenticatorConfigured: boolean;
  recoveryCodesRemaining: number;
  emailMfa?: boolean;
  emailMasked?: string;
}

export interface SecurityEvent {
  id: string;
  type: string;
  label: string;
  ip: string;
  occurredAt: Date;
}
