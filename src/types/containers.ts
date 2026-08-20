export type ContainerSize = '20FT' | '40FT' | '40HC' | '45HC';
export type ContainerType = 'DRY' | 'REEFER' | 'OPEN_TOP' | 'FLAT_RACK' | 'TANK';
export type ContainerStatus = 'BOOKED' | 'GATE_IN' | 'LOADED' | 'IN_TRANSIT' | 'ARRIVED' | 'GATE_OUT' | 'RETURNED' | 'DETAINED';

export interface Container {
  id: string;
  containerNumber: string;
  size: ContainerSize;
  type: ContainerType;
  status: ContainerStatus;
  currentLocation: string;
  vessel: string;
  bookingRef: string;
  blNumber: string;
  shipper: string;
  consignee: string;
  commodity: string;
  weight: number;
  sealNumber: string;
  freeDays: number;
  freeDaysRemaining: number;
  gateInDate: Date | null;
  gateOutDate: Date | null;
  loadDate: Date | null;
  dischargeDate: Date | null;
  returnDate: Date | null;
  demurrageRate: number;
  detentionRate: number;
  totalDemurrageCost: number;
  temperature: number | null;
  humidity: number | null;
  lastUpdate: Date;
  origin: string;
  destination: string;
  portOfLoading: string;
  portOfDischarge: string;
  linkedExport: string;
}

export interface ContainerKPIs {
  totalAtivos: number;
  riscoDemurrage: number;
  custoDemurrageTotal: number;
  dwellTimeMedio: number;
}

export interface ContainerFilters {
  searchText: string;
  size: ContainerSize | '';
  type: ContainerType | '';
  status: ContainerStatus | '';
  vessel: string;
}

export const CONTAINER_NUMBER_REGEX = /^[A-Z]{4}\d{7}$/;
