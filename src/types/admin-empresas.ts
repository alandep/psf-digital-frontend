export type EmpresaStatus = 'ATIVA' | 'SUSPENSA' | 'BLOQUEADA' | 'EM_ONBOARDING';
export type EmpresaTipo = 'EXPORTADOR' | 'TRADING' | 'COOPERATIVA' | 'INDÚSTRIA' | 'OPERADOR_LOGÍSTICO';

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  tipo: EmpresaTipo;
  status: EmpresaStatus;
  pais: string;
  estado: string;
  cidade: string;
  responsavel: string;
  email: string;
  telefone: string;
  plano: string;
  dataAdesao: Date;
  ultimoAcesso: Date;
  usuarios: number;
  exportacoes: number;
  modulosAtivos: string[];
}

export interface EmpresaMetrics {
  totalEmpresas: number;
  ativas: number;
  emOnboarding: number;
  suspensas: number;
  totalUsuarios: number;
  totalExportacoes: number;
}
