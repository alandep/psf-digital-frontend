export type BLType = 'OBL' | 'SWB' | 'TBL';
export type BLStatus = 'DRAFT' | 'ISSUED' | 'SURRENDERED' | 'RELEASED';

export interface BillOfLading {
  id: string;
  blNumber: string;
  type: BLType;
  shipper: string;
  consignee: string;
  notifyParty: string;
  vessel: string;
  voyage: string;
  portLoading: string;
  portDischarge: string;
  placeDelivery: string;
  containers: string[];
  description: string;
  grossWeight: number;
  measurement: number;
  freightTerms: string;
  status: BLStatus;
  issueDate: Date;
  shippedOnBoard: Date | null;
  linkedExportId: string;
  linkedInvoiceId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  observations: string;
}

export interface BLMetrics {
  totalBLs: number;
  emitidos: number;
  pendentes: number;
  surrendered: number;
}

export interface BLFilters {
  searchText: string;
  type: BLType | '';
  status: BLStatus | '';
  dateStart: Date | null;
  dateEnd: Date | null;
}
