import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ActiveOperation, CommandCenterMetrics, OperationMilestone, OperationStatus } from '../types/command-center';

@Injectable({ providedIn: 'root' })
export class CommandCenterMockService {

  private mockOperations: ActiveOperation[] = [
    {
      id: 'OP-001', exportId: 'EXP-2024-001', customer: 'Shanghai Trading Co.', product: 'Soja em Grãos',
      origin: 'Santos, BR', destination: 'Shanghai, CN', currentStatus: 'ON_TIME', eta: new Date('2025-02-15'),
      riskLevel: 'LOW', value: 2450000, currency: 'USD', lat: 31.23, lng: 121.47,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT', 'TRANSIT'], 'TRANSIT')
    },
    {
      id: 'OP-002', exportId: 'EXP-2024-002', customer: 'Hamburg Kaffee GmbH', product: 'Café Arábica',
      origin: 'Santos, BR', destination: 'Hamburg, DE', currentStatus: 'ON_TIME', eta: new Date('2025-02-20'),
      riskLevel: 'LOW', value: 1890000, currency: 'USD', lat: 53.55, lng: 9.99,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT'], 'SHIPMENT')
    },
    {
      id: 'OP-003', exportId: 'EXP-2024-003', customer: 'Al Rashid Foods', product: 'Carne Bovina',
      origin: 'Itajaí, BR', destination: 'Jeddah, SA', currentStatus: 'AT_RISK', eta: new Date('2025-02-10'),
      riskLevel: 'MEDIUM', value: 3200000, currency: 'USD', lat: 21.54, lng: 39.17,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT', 'TRANSIT'], 'TRANSIT')
    },
    {
      id: 'OP-004', exportId: 'EXP-2024-004', customer: 'US Sugar Imports LLC', product: 'Açúcar Cristal',
      origin: 'Santos, BR', destination: 'New York, US', currentStatus: 'ON_TIME', eta: new Date('2025-03-01'),
      riskLevel: 'LOW', value: 1100000, currency: 'USD', lat: 40.71, lng: -74.01,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION'], 'DOCUMENTATION')
    },
    {
      id: 'OP-005', exportId: 'EXP-2024-005', customer: 'Tokyo Grain Corp.', product: 'Milho',
      origin: 'Paranaguá, BR', destination: 'Tokyo, JP', currentStatus: 'DELAYED', eta: new Date('2025-02-05'),
      riskLevel: 'HIGH', value: 1750000, currency: 'USD', lat: 35.68, lng: 139.69,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT', 'TRANSIT'], 'TRANSIT')
    },
    {
      id: 'OP-006', exportId: 'EXP-2024-006', customer: 'Rotterdam Commodities BV', product: 'Soja em Grãos',
      origin: 'Santos, BR', destination: 'Rotterdam, NL', currentStatus: 'ON_TIME', eta: new Date('2025-02-25'),
      riskLevel: 'LOW', value: 2100000, currency: 'USD', lat: 51.92, lng: 4.48,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT'], 'SHIPMENT')
    },
    {
      id: 'OP-007', exportId: 'EXP-2024-007', customer: 'Dhaka Textiles Ltd.', product: 'Algodão',
      origin: 'Santos, BR', destination: 'Dhaka, BD', currentStatus: 'AT_RISK', eta: new Date('2025-02-18'),
      riskLevel: 'MEDIUM', value: 980000, currency: 'USD', lat: 23.81, lng: 90.41,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT', 'TRANSIT'], 'TRANSIT')
    },
    {
      id: 'OP-008', exportId: 'EXP-2024-008', customer: 'Caffè Italia SpA', product: 'Café Robusta',
      origin: 'Santos, BR', destination: 'Genova, IT', currentStatus: 'ON_TIME', eta: new Date('2025-02-28'),
      riskLevel: 'LOW', value: 1450000, currency: 'USD', lat: 44.41, lng: 8.93,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION'], 'DOCUMENTATION')
    },
    {
      id: 'OP-009', exportId: 'EXP-2024-009', customer: 'Cape Town Foods Pty', product: 'Frango Congelado',
      origin: 'Itajaí, BR', destination: 'Cape Town, ZA', currentStatus: 'DELAYED', eta: new Date('2025-02-08'),
      riskLevel: 'HIGH', value: 890000, currency: 'USD', lat: -33.92, lng: 18.42,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT'], 'SHIPMENT')
    },
    {
      id: 'OP-010', exportId: 'EXP-2024-010', customer: 'Seoul Energy Corp.', product: 'Etanol',
      origin: 'Santos, BR', destination: 'Busan, KR', currentStatus: 'ON_TIME', eta: new Date('2025-03-05'),
      riskLevel: 'LOW', value: 3100000, currency: 'USD', lat: 35.18, lng: 129.08,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION'], 'PRODUCTION')
    },
    {
      id: 'OP-011', exportId: 'EXP-2024-011', customer: 'Florida Juice Inc.', product: 'Suco de Laranja',
      origin: 'Santos, BR', destination: 'Miami, US', currentStatus: 'ON_TIME', eta: new Date('2025-02-22'),
      riskLevel: 'LOW', value: 760000, currency: 'USD', lat: 25.76, lng: -80.19,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT', 'TRANSIT'], 'TRANSIT')
    },
    {
      id: 'OP-012', exportId: 'EXP-2024-012', customer: 'Belgian Tobacco SA', product: 'Tabaco',
      origin: 'Paranaguá, BR', destination: 'Antwerp, BE', currentStatus: 'AT_RISK', eta: new Date('2025-02-12'),
      riskLevel: 'MEDIUM', value: 1320000, currency: 'USD', lat: 51.22, lng: 4.4,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT', 'TRANSIT'], 'TRANSIT')
    },
    {
      id: 'OP-013', exportId: 'EXP-2024-013', customer: 'Guangzhou Paper Co.', product: 'Celulose',
      origin: 'Santos, BR', destination: 'Guangzhou, CN', currentStatus: 'ON_TIME', eta: new Date('2025-03-10'),
      riskLevel: 'LOW', value: 4200000, currency: 'USD', lat: 23.13, lng: 113.26,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION'], 'DOCUMENTATION')
    },
    {
      id: 'OP-014', exportId: 'EXP-2024-014', customer: 'Swiss Chocolate AG', product: 'Cacau',
      origin: 'Salvador, BR', destination: 'Zurich, CH', currentStatus: 'ON_TIME', eta: new Date('2025-03-08'),
      riskLevel: 'LOW', value: 920000, currency: 'USD', lat: 47.38, lng: 8.54,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION'], 'PRODUCTION')
    },
    {
      id: 'OP-015', exportId: 'EXP-2024-015', customer: 'China Steel Corp.', product: 'Minério de Ferro',
      origin: 'Vitória, BR', destination: 'Qingdao, CN', currentStatus: 'DELAYED', eta: new Date('2025-02-03'),
      riskLevel: 'HIGH', value: 8500000, currency: 'USD', lat: 36.07, lng: 120.38,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT', 'TRANSIT'], 'TRANSIT')
    },
    {
      id: 'OP-016', exportId: 'EXP-2024-016', customer: 'Lisbon Fruits Lda.', product: 'Manga',
      origin: 'Salvador, BR', destination: 'Lisboa, PT', currentStatus: 'ON_TIME', eta: new Date('2025-02-18'),
      riskLevel: 'LOW', value: 420000, currency: 'USD', lat: 38.72, lng: -9.14,
      milestones: this.buildMilestones(['CONTRACT_SIGNED', 'PRODUCTION', 'DOCUMENTATION', 'SHIPMENT'], 'SHIPMENT')
    }
  ];

  private buildMilestones(completedTypes: string[], currentType: string): OperationMilestone[] {
    const allTypes: { type: string; label: string }[] = [
      { type: 'CONTRACT_SIGNED', label: 'Contrato Assinado' },
      { type: 'PRODUCTION', label: 'Produção' },
      { type: 'DOCUMENTATION', label: 'Documentação' },
      { type: 'SHIPMENT', label: 'Embarque' },
      { type: 'TRANSIT', label: 'Trânsito' },
      { type: 'ARRIVAL', label: 'Chegada' },
      { type: 'FINANCIAL_SETTLEMENT', label: 'Liquidação Financeira' }
    ];

    return allTypes.map(m => ({
      type: m.type as any,
      label: m.label,
      date: completedTypes.includes(m.type) ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      completed: completedTypes.includes(m.type)
    }));
  }

  getActiveOperations(): Observable<ActiveOperation[]> {
    return of(this.mockOperations).pipe(delay(300));
  }

  getMetrics(): Observable<CommandCenterMetrics> {
    const onTime = this.mockOperations.filter(o => o.currentStatus === 'ON_TIME').length;
    const totalValue = this.mockOperations.reduce((sum, o) => sum + o.value, 0);

    const metrics: CommandCenterMetrics = {
      activeOperations: this.mockOperations.length,
      onTimeDeliveryRate: Math.round((onTime / this.mockOperations.length) * 100),
      revenueInTransit: totalValue,
      pendingDocuments: 7,
      complianceAlerts: 3,
      averageCycleTime: 42
    };
    return of(metrics).pipe(delay(200));
  }

  getOperationById(id: string): Observable<ActiveOperation | undefined> {
    return of(this.mockOperations.find(o => o.id === id)).pipe(delay(200));
  }
}
