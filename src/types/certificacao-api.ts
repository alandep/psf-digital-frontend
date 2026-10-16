// Espelha o CertificacaoView do backend (camelCase).
export interface CertificacaoApi {
  id: string;
  name: string;
  tipo?: string | null;
  orgaoEmissor?: string | null;
  numero?: string | null;
  status?: string | null;
  emitidaEm?: string | null;
  validaAte?: string | null;
  productId?: string | null;
  productName?: string | null;
  categoria?: string | null;
  descricao?: string | null;
  paisEmissor?: string | null;
  paisDestino?: string | null;
  assinaturaDigital?: boolean;
  complianceStatus?: string | null;
  exportId?: string | null;
  dueNumber?: string | null;
  aiGenerated?: boolean;
  aiConfidenceScore?: number | null;
  aiRiskScore?: number | null;
  aiRiskLevel?: string | null;
  createdBy?: string | null;
}

// Payload de criação/atualização (sem id/createdBy — backend define createdBy pela sessão).
export type SalvarCertificacao = Omit<CertificacaoApi, 'id' | 'createdBy'>;
