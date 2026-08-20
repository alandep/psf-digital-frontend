export type PackingListStatus = 'RASCUNHO' | 'PENDENTE_VALIDACAO' | 'VALIDADO' | 'APROVADO' | 'VINCULADO_EMBARQUE' | 'FINALIZADO';

export interface PackingListItem {
  id: string;
  packingListId: string;
  productName: string;
  description: string;
  ncm: string;
  quantity: number;
  unit: string;
  netWeight: number;
  grossWeight: number;
  packageType: string;
  packageCount: number;
  dimensions: string;
  marks: string;
}

export interface PackingList {
  id: string;
  packingListNumber: string;
  linkedInvoice: string;
  linkedInvoiceId: string;
  exporter: string;
  exporterCnpj: string;
  buyer: string;
  buyerCountry: string;
  portOrigin: string;
  portDestination: string;
  totalPackages: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  totalVolume: number;
  status: PackingListStatus;
  completenessScore: number;
  linkedEmbarqueId: string;
  linkedEmbarqueNumber: string;
  invoiceGrossWeight: number;
  invoiceNetWeight: number;
  weightDiscrepancyPercent: number;
  issueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  observations: string;
}

export interface PackingListMetrics {
  totalPackingLists: number;
  pendentesValidacao: number;
  scoreCompletudeMedia: number;
  vinculadosEmbarques: number;
}

export interface PackingListFilters {
  searchText: string;
  status: PackingListStatus | '';
  buyer: string;
  dateStart: Date | null;
  dateEnd: Date | null;
}
