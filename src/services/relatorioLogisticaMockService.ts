import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LogisticsReport, LogisticsMetrics, PortPerformance, CarrierPerformance } from '../types/relatorio-logistica';

@Injectable({
  providedIn: 'root'
})
export class RelatorioLogisticaMockService {

  private shipments: LogisticsReport[] = [];
  private ports: PortPerformance[] = [];
  private carriers: CarrierPerformance[] = [];

  constructor() {
    this.initializeMockData();
  }

  getShipments(): Observable<LogisticsReport[]> {
    return of([...this.shipments]).pipe(delay(400));
  }

  getMetrics(): Observable<LogisticsMetrics> {
    const onTimeCount = this.shipments.filter(s => s.onTime).length;
    const onTimeRate = Math.round((onTimeCount / this.shipments.length) * 100);
    const avgTransitDays = Math.round(this.shipments.reduce((sum, s) => sum + s.transitDays, 0) / this.shipments.length);
    const totalContainers = this.shipments.reduce((sum, s) => sum + s.containerCount, 0);
    const totalCost = this.shipments.reduce((sum, s) => sum + s.cost, 0);
    const avgCostPerContainer = Math.round(totalCost / totalContainers);
    const delayedShipments = this.shipments.filter(s => !s.onTime).length;

    const carrierCounts: Record<string, number> = {};
    this.shipments.forEach(s => { carrierCounts[s.carrier] = (carrierCounts[s.carrier] || 0) + 1; });
    const topCarrier = Object.entries(carrierCounts).sort((a, b) => b[1] - a[1])[0][0];

    const routeCounts: Record<string, number> = {};
    this.shipments.forEach(s => {
      const route = `${s.origin} → ${s.destination}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    const topRoute = Object.entries(routeCounts).sort((a, b) => b[1] - a[1])[0][0];

    const metrics: LogisticsMetrics = {
      totalShipments: this.shipments.length,
      onTimeRate,
      avgTransitDays,
      totalContainers,
      avgCostPerContainer,
      delayedShipments,
      topCarrier,
      topRoute
    };
    return of(metrics).pipe(delay(300));
  }

  getPortPerformances(): Observable<PortPerformance[]> {
    return of([...this.ports]).pipe(delay(350));
  }

  getCarrierPerformances(): Observable<CarrierPerformance[]> {
    return of([...this.carriers]).pipe(delay(350));
  }

  private initializeMockData(): void {
    this.shipments = [
      {
        id: 'SHP-001', shipmentNumber: 'EMB-2025-0001', vessel: 'MSC Fantasia',
        origin: 'Santos', destination: 'Roterdã', containerCount: 12,
        departureDate: new Date('2025-01-02'), arrivalDate: new Date('2025-01-20'),
        transitDays: 18, status: 'Entregue', carrier: 'MSC', cost: 48000, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-002', shipmentNumber: 'EMB-2025-0002', vessel: 'Maersk Sealand',
        origin: 'Paranaguá', destination: 'Hamburgo', containerCount: 8,
        departureDate: new Date('2025-01-03'), arrivalDate: new Date('2025-01-24'),
        transitDays: 21, status: 'Entregue', carrier: 'Maersk', cost: 36800, currency: 'USD',
        onTime: false, delayDays: 3
      },
      {
        id: 'SHP-003', shipmentNumber: 'EMB-2025-0003', vessel: 'CMA CGM Marco Polo',
        origin: 'Santos', destination: 'Xangai', containerCount: 20,
        departureDate: new Date('2025-01-04'), arrivalDate: new Date('2025-02-08'),
        transitDays: 35, status: 'Em trânsito', carrier: 'CMA CGM', cost: 92000, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-004', shipmentNumber: 'EMB-2025-0004', vessel: 'Hapag-Lloyd Express',
        origin: 'Itaguaí', destination: 'Antuérpia', containerCount: 6,
        departureDate: new Date('2025-01-05'), arrivalDate: new Date('2025-01-22'),
        transitDays: 17, status: 'Entregue', carrier: 'Hapag-Lloyd', cost: 27600, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-005', shipmentNumber: 'EMB-2025-0005', vessel: 'MSC Geneva',
        origin: 'Santos', destination: 'Jebel Ali', containerCount: 15,
        departureDate: new Date('2025-01-06'), arrivalDate: new Date('2025-01-30'),
        transitDays: 24, status: 'Entregue', carrier: 'MSC', cost: 67500, currency: 'USD',
        onTime: false, delayDays: 2
      },
      {
        id: 'SHP-006', shipmentNumber: 'EMB-2025-0006', vessel: 'Evergreen Fortune',
        origin: 'Rio Grande', destination: 'Tóquio', containerCount: 10,
        departureDate: new Date('2025-01-07'), arrivalDate: new Date('2025-02-14'),
        transitDays: 38, status: 'Em trânsito', carrier: 'Evergreen', cost: 52000, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-007', shipmentNumber: 'EMB-2025-0007', vessel: 'Maersk Denver',
        origin: 'Paranaguá', destination: 'Roterdã', containerCount: 14,
        departureDate: new Date('2025-01-08'), arrivalDate: new Date('2025-01-27'),
        transitDays: 19, status: 'Entregue', carrier: 'Maersk', cost: 60200, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-008', shipmentNumber: 'EMB-2025-0008', vessel: 'MSC Lorena',
        origin: 'Itajaí', destination: 'Liverpool', containerCount: 5,
        departureDate: new Date('2024-12-28'), arrivalDate: new Date('2025-01-18'),
        transitDays: 21, status: 'Entregue', carrier: 'MSC', cost: 23500, currency: 'USD',
        onTime: false, delayDays: 4
      },
      {
        id: 'SHP-009', shipmentNumber: 'EMB-2025-0009', vessel: 'CMA CGM Titan',
        origin: 'Santos', destination: 'Le Havre', containerCount: 18,
        departureDate: new Date('2025-01-09'), arrivalDate: new Date('2025-01-27'),
        transitDays: 18, status: 'Em trânsito', carrier: 'CMA CGM', cost: 79200, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-010', shipmentNumber: 'EMB-2025-0010', vessel: 'Hapag-Lloyd Berlin',
        origin: 'Salvador', destination: 'Barcelona', containerCount: 7,
        departureDate: new Date('2025-01-02'), arrivalDate: new Date('2025-01-16'),
        transitDays: 14, status: 'Entregue', carrier: 'Hapag-Lloyd', cost: 31500, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-011', shipmentNumber: 'EMB-2025-0011', vessel: 'MSC Rosaria',
        origin: 'Santos', destination: 'Nova York', containerCount: 9,
        departureDate: new Date('2024-12-30'), arrivalDate: new Date('2025-01-14'),
        transitDays: 15, status: 'Entregue', carrier: 'MSC', cost: 40500, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-012', shipmentNumber: 'EMB-2025-0012', vessel: 'Evergreen Glory',
        origin: 'Paranaguá', destination: 'Busan', containerCount: 22,
        departureDate: new Date('2025-01-05'), arrivalDate: new Date('2025-02-12'),
        transitDays: 38, status: 'Em trânsito', carrier: 'Evergreen', cost: 110000, currency: 'USD',
        onTime: false, delayDays: 5
      },
      {
        id: 'SHP-013', shipmentNumber: 'EMB-2025-0013', vessel: 'Maersk Atlantic',
        origin: 'Itaguaí', destination: 'Hamburgo', containerCount: 11,
        departureDate: new Date('2025-01-06'), arrivalDate: new Date('2025-01-25'),
        transitDays: 19, status: 'Entregue', carrier: 'Maersk', cost: 49500, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-014', shipmentNumber: 'EMB-2025-0014', vessel: 'CMA CGM Liberty',
        origin: 'Santos', destination: 'Singapura', containerCount: 16,
        departureDate: new Date('2025-01-08'), arrivalDate: new Date('2025-02-04'),
        transitDays: 27, status: 'Em trânsito', carrier: 'CMA CGM', cost: 76800, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-015', shipmentNumber: 'EMB-2025-0015', vessel: 'MSC Bella',
        origin: 'Rio Grande', destination: 'Roterdã', containerCount: 13,
        departureDate: new Date('2024-12-27'), arrivalDate: new Date('2025-01-16'),
        transitDays: 20, status: 'Entregue', carrier: 'MSC', cost: 58500, currency: 'USD',
        onTime: false, delayDays: 2
      },
      {
        id: 'SHP-016', shipmentNumber: 'EMB-2025-0016', vessel: 'Hapag-Lloyd Pacific',
        origin: 'Itajaí', destination: 'Valência', containerCount: 4,
        departureDate: new Date('2025-01-09'), arrivalDate: new Date('2025-01-26'),
        transitDays: 17, status: 'Em trânsito', carrier: 'Hapag-Lloyd', cost: 18400, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-017', shipmentNumber: 'EMB-2025-0017', vessel: 'Maersk Kotka',
        origin: 'Salvador', destination: 'Casablanca', containerCount: 6,
        departureDate: new Date('2025-01-04'), arrivalDate: new Date('2025-01-15'),
        transitDays: 11, status: 'Entregue', carrier: 'Maersk', cost: 25200, currency: 'USD',
        onTime: true, delayDays: 0
      },
      {
        id: 'SHP-018', shipmentNumber: 'EMB-2025-0018', vessel: 'Evergreen Champion',
        origin: 'Santos', destination: 'Hong Kong', containerCount: 25,
        departureDate: new Date('2025-01-10'), arrivalDate: new Date('2025-02-15'),
        transitDays: 36, status: 'Em trânsito', carrier: 'Evergreen', cost: 125000, currency: 'USD',
        onTime: true, delayDays: 0
      }
    ];

    this.ports = [
      { port: 'Santos', shipments: 8, avgDwell: 3.2, onTimeRate: 87, totalVolume: 128 },
      { port: 'Paranaguá', shipments: 4, avgDwell: 2.8, onTimeRate: 75, totalVolume: 56 },
      { port: 'Itaguaí', shipments: 2, avgDwell: 2.5, onTimeRate: 100, totalVolume: 17 },
      { port: 'Rio Grande', shipments: 2, avgDwell: 3.5, onTimeRate: 50, totalVolume: 23 },
      { port: 'Itajaí', shipments: 2, avgDwell: 2.2, onTimeRate: 50, totalVolume: 9 },
      { port: 'Salvador', shipments: 2, avgDwell: 1.8, onTimeRate: 100, totalVolume: 13 }
    ];

    this.carriers = [
      { carrier: 'MSC', shipments: 6, onTimeRate: 67, avgTransit: 21, avgCost: 4500 },
      { carrier: 'Maersk', shipments: 5, onTimeRate: 80, avgTransit: 18, avgCost: 4300 },
      { carrier: 'CMA CGM', shipments: 3, onTimeRate: 100, avgTransit: 27, avgCost: 4600 },
      { carrier: 'Hapag-Lloyd', shipments: 3, onTimeRate: 100, avgTransit: 16, avgCost: 4400 },
      { carrier: 'Evergreen', shipments: 3, onTimeRate: 67, avgTransit: 37, avgCost: 5000 }
    ];
  }
}
