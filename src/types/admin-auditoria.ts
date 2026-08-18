export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'IMPORT' | 'SIGN';
export type AuditModule = 'EXPORTAÇÕES' | 'CONTRATOS' | 'DOCUMENTOS' | 'FINANCEIRO' | 'COMPLIANCE' | 'LOGÍSTICA' | 'USUÁRIOS' | 'CONFIGURAÇÕES' | 'PRODUTOS' | 'LOTES';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  userEmail: string;
  action: AuditAction;
  module: AuditModule;
  entity: string;
  entityId: string;
  description: string;
  ipAddress: string;
  details: string;
  oldValue: string;
  newValue: string;
}

export interface AuditMetrics {
  totalEvents: number;
  eventsToday: number;
  uniqueUsers: number;
  criticalActions: number;
  mostActiveModule: string;
  lastEvent: Date;
}

export interface AuditFilters {
  searchText: string;
  action: AuditAction | '';
  module: AuditModule | '';
  user: string;
  dateStart: Date | null;
  dateEnd: Date | null;
}
