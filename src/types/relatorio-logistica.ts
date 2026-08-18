export interface LogisticsReport {
  id: string;
  shipmentNumber: string;
  vessel: string;
  origin: string;
  destination: string;
  containerCount: number;
  departureDate: Date;
  arrivalDate: Date;
  transitDays: number;
  status: string;
  carrier: string;
  cost: number;
  currency: string;
  onTime: boolean;
  delayDays: number;
}

export interface LogisticsMetrics {
  totalShipments: number;
  onTimeRate: number;
  avgTransitDays: number;
  totalContainers: number;
  avgCostPerContainer: number;
  delayedShipments: number;
  topCarrier: string;
  topRoute: string;
}

export interface PortPerformance {
  port: string;
  shipments: number;
  avgDwell: number; // days
  onTimeRate: number;
  totalVolume: number;
}

export interface CarrierPerformance {
  carrier: string;
  shipments: number;
  onTimeRate: number;
  avgTransit: number;
  avgCost: number;
}
