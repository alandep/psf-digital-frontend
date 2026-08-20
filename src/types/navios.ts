export type VesselType = 'BULK_CARRIER' | 'CONTAINER_SHIP' | 'TANKER' | 'REEFER' | 'RORO' | 'GENERAL_CARGO';
export type VesselStatus = 'EM_TRANSITO' | 'NO_PORTO' | 'FUNDEADO' | 'EM_MANUTENCAO' | 'ATRASADO' | 'CARREGANDO' | 'DESCARREGANDO';

export interface Navio {
  id: string;
  vesselName: string;
  imoNumber: string;
  flag: string;
  vesselType: VesselType;
  capacity: number;
  capacityUnit: string;
  currentPort: string;
  nextPort: string;
  eta: Date;
  originalEta: Date;
  etd: Date;
  status: VesselStatus;
  owner: string;
  operator: string;
  yearBuilt: number;
  length: number;
  beam: number;
  draft: number;
  grossTonnage: number;
  deadweight: number;
  linkedShipments: string[];
  lastUpdate: Date;
  route: string;
  speed: number;
  voyageNumber: string;
  portCalls: PortCall[];
}

export interface PortCall {
  port: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  purpose: string;
  cargoOps: string;
}

export interface NavioKPIs {
  totalRastreados: number;
  emTransito: number;
  noPorto: number;
  comAlertaAtraso: number;
}

export interface NavioFilters {
  searchText: string;
  vesselType: VesselType | '';
  status: VesselStatus | '';
  flag: string;
  port: string;
}
