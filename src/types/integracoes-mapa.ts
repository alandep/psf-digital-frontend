export type MapaServiceStatus = 'ATIVO' | 'DEGRADADO' | 'INDISPONÍVEL';
export type CertificateStatus = 'VIGENTE' | 'VENCIDO' | 'EM_EMISSÃO' | 'SUSPENSO' | 'CANCELADO';
export type InspectionStatus = 'AGENDADA' | 'EM_ANDAMENTO' | 'APROVADA' | 'REPROVADA' | 'CANCELADA';
export type HabilitacaoStatus = 'ATIVA' | 'SUSPENSA' | 'VENCIDA' | 'EM_RENOVAÇÃO';

export interface MapaCertificate {
  id: string;
  number: string;
  type: string; // CFE, CSI, CZI, CIVT
  product: string;
  ncm: string;
  destination: string;
  establishment: string;
  issueDate: Date;
  expirationDate: Date;
  status: CertificateStatus;
  inspector: string;
  linkedDue: string;
  volume: number;
  unit: string;
}

export interface MapaInspection {
  id: string;
  type: string; // Fitossanitária, Sanitária, Qualidade
  product: string;
  establishment: string;
  scheduledDate: Date;
  inspector: string;
  status: InspectionStatus;
  result: string;
  observations: string;
  linkedCertificate: string;
}

export interface MapaHabilitacao {
  id: string;
  establishment: string;
  cnpj: string;
  sifNumber: string;
  products: string[];
  markets: string[];
  status: HabilitacaoStatus;
  issueDate: Date;
  expirationDate: Date;
  lastAudit: Date;
}

export interface MapaMetrics {
  activeCertificates: number;
  expiringCertificates: number;
  pendingInspections: number;
  activeHabilitacoes: number;
  certificatesThisMonth: number;
  approvalRate: number;
}
