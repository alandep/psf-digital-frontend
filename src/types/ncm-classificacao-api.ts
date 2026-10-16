// Espelha o NcmClassificationView do backend (camelCase).
// Retornado por GET /bff/ncm-classificacoes.
export interface NcmClassificacaoApi {
  id: string;
  productId?: string;
  productName: string;
  productCode?: string;
  productDescription?: string;
  scientificName?: string;
  commodityType?: string;
  originCountry?: string;
  ncmCode?: string;
  ncmDescription?: string;
  hsCode?: string;
  hsDescription?: string;
  exportTax?: number | null;
  exportLicenseRequired?: boolean;
  exportLicenseType?: string;
  lpcoRequired?: boolean;
  lpcoType?: string;
  requiresInspection?: boolean;
  inspectionAgency?: string;
  exportRestriction?: boolean;
  restrictionDescription?: string;
  aiSuggestedNcm?: string;
  aiConfidenceScore?: number | null;
  aiClassificationReason?: string;
  aiRequiresHumanReview?: boolean;
  aiClassificationStatus?: string;
  complianceStatus?: string;
  classificationSource?: string;
  approvalStatus?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payload de criação/atualização: mesmos campos sem auditoria.
// id ausente → cria; id presente → atualiza.
export type SalvarNcmClassificacao = Omit<
  NcmClassificacaoApi,
  'createdBy' | 'createdAt' | 'updatedAt'
> & { id?: string };

// Resultado da validação de NCM via POST /bff/ai/ncm/validar.
export interface NcmValidacaoResult {
  ncmCode: string;
  formatValid: boolean;
  notes: string;
  source: string;
}
