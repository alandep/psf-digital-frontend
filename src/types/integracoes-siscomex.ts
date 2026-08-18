export type SiscomexServiceStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE';
export type DueStatus = 'RASCUNHO' | 'REGISTRADA' | 'DESEMBARACADA' | 'AVERBADA' | 'CANCELADA' | 'COM_EXIGENCIA';
export type LpcoStatus = 'SOLICITADA' | 'EM_ANALISE' | 'DEFERIDA' | 'INDEFERIDA' | 'CANCELADA';

export interface SiscomexService {
  id: string;
  name: string;
  description: string;
  status: SiscomexServiceStatus;
  lastCheck: Date;
  uptime: number; // percentage
  avgResponseTime: number; // ms
  lastIncident: Date | null;
}

export interface DueRegistration {
  id: string;
  dueNumber: string;
  exporterName: string;
  exporterCnpj: string;
  status: DueStatus;
  registrationDate: Date;
  country: string;
  totalValue: number;
  currency: string;
  ncm: string;
  product: string;
  port: string;
  channel: string; // Verde, Amarelo, Vermelho, Cinza
  lastUpdate: Date;
  linkedInvoice: string;
}

export interface LpcoRecord {
  id: string;
  lpcoNumber: string;
  type: string; // CSI, LPCO, LI etc
  organ: string; // MAPA, ANVISA, IBAMA etc
  product: string;
  ncm: string;
  status: LpcoStatus;
  requestDate: Date;
  approvalDate: Date | null;
  expirationDate: Date | null;
  volume: number;
  unit: string;
  usedVolume: number;
  linkedDue: string;
}

export interface SiscomexMetrics {
  totalDues: number;
  duesThisMonth: number;
  avgClearanceTime: number; // hours
  successRate: number;
  pendingLpcos: number;
  activeLpcos: number;
  servicesOnline: number;
  servicesTotal: number;
}

export interface SiscomexEvent {
  id: string;
  type: 'DUE_REGISTERED' | 'DUE_CLEARED' | 'LPCO_APPROVED' | 'SERVICE_DOWN' | 'SERVICE_RESTORED' | 'EXIGENCIA';
  description: string;
  date: Date;
  reference: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

export interface SiscomexFilters {
  searchText: string;
  status: DueStatus | '';
  channel: string;
  dateStart: Date | null;
  dateEnd: Date | null;
}
