export type RegraStatus = 'ATIVA' | 'PAUSADA' | 'DESATIVADA' | 'ERRO';
export type RegraTrigger = 'EVENTO' | 'AGENDAMENTO' | 'CONDIÇÃO' | 'MANUAL' | 'WEBHOOK';
export type RegraCategoria = 'DOCUMENTOS' | 'NOTIFICAÇÕES' | 'COMPLIANCE' | 'FINANCEIRO' | 'LOGÍSTICA' | 'EXPORTAÇÕES' | 'QUALIDADE';

export interface RegraAutomacao {
  id: string;
  name: string;
  description: string;
  categoria: RegraCategoria;
  trigger: RegraTrigger;
  status: RegraStatus;
  condition: string;
  action: string;
  createdBy: string;
  createdAt: Date;
  lastExecution: Date | null;
  executionCount: number;
  successRate: number;
  priority: number;
}

export interface RegrasMetrics {
  totalRegras: number;
  ativas: number;
  pausadas: number;
  comErro: number;
  execucoesHoje: number;
  taxaSucessoMedia: number;
}
