export type UserStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'PENDENTE';
export type UserRole = 'ADMIN' | 'GERENTE' | 'ANALISTA' | 'OPERADOR' | 'VISUALIZADOR' | 'COMPLIANCE' | 'FINANCEIRO';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  empresa: string;
  departamento: string;
  ultimoAcesso: Date;
  dataCriacao: Date;
  mfaEnabled: boolean;
  loginCount: number;
  phone: string;
}

export interface UserMetrics {
  totalUsers: number;
  ativos: number;
  inativos: number;
  bloqueados: number;
  pendentes: number;
  mfaHabilitado: number;
}
