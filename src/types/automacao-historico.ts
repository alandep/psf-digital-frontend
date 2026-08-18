export type ExecucaoStatus = 'SUCESSO' | 'FALHA' | 'PARCIAL' | 'TIMEOUT' | 'CANCELADA';

export interface ExecucaoRegra {
  id: string;
  ruleId: string;
  ruleName: string;
  categoria: string;
  trigger: string;
  status: ExecucaoStatus;
  startTime: Date;
  endTime: Date;
  duration: number; // ms
  input: string;
  output: string;
  error: string;
  affectedEntities: number;
}

export interface HistoricoMetrics {
  totalExecucoes: number;
  execucoesHoje: number;
  sucessos: number;
  falhas: number;
  tempoMedio: number;
  taxaSucesso: number;
}
