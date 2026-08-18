import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { RentabilidadeReport, RentabilidadeMetrics, MarginByProduct, MarginByClient } from '../types/relatorio-rentabilidade';

@Injectable({
  providedIn: 'root'
})
export class RelatorioRentabilidadeMockService {

  private reports: RentabilidadeReport[] = [];
  private productMargins: MarginByProduct[] = [];
  private clientMargins: MarginByClient[] = [];

  constructor() {
    this.initializeMockData();
  }

  getReports(): Observable<RentabilidadeReport[]> {
    return of([...this.reports]).pipe(delay(400));
  }

  getMetrics(): Observable<RentabilidadeMetrics> {
    const totalRevenue = this.reports.reduce((sum, r) => sum + r.revenue, 0);
    const totalCost = this.reports.reduce((sum, r) => sum + r.totalCost, 0);
    const avgMargin = Math.round((this.reports.reduce((sum, r) => sum + r.marginPercent, 0) / this.reports.length) * 10) / 10;

    const productRevenue: Record<string, number> = {};
    this.reports.forEach(r => { productRevenue[r.product] = (productRevenue[r.product] || 0) + r.grossMargin; });
    const bestProduct = Object.entries(productRevenue).sort((a, b) => b[1] - a[1])[0][0];

    const clientRevenue: Record<string, number> = {};
    this.reports.forEach(r => { clientRevenue[r.client] = (clientRevenue[r.client] || 0) + r.grossMargin; });
    const bestClient = Object.entries(clientRevenue).sort((a, b) => b[1] - a[1])[0][0];

    const worstMarginOp = this.reports.reduce((worst, r) => r.marginPercent < worst.marginPercent ? r : worst).operation;

    const operationsAboveTarget = this.reports.filter(r => r.marginPercent >= 25).length;
    const operationsBelowTarget = this.reports.filter(r => r.marginPercent < 25).length;

    const metrics: RentabilidadeMetrics = {
      totalRevenue,
      totalCost,
      avgMargin,
      bestProduct,
      bestClient,
      worstMarginOp,
      operationsAboveTarget,
      operationsBelowTarget
    };
    return of(metrics).pipe(delay(300));
  }

  getMarginByProduct(): Observable<MarginByProduct[]> {
    return of([...this.productMargins]).pipe(delay(350));
  }

  getMarginByClient(): Observable<MarginByClient[]> {
    return of([...this.clientMargins]).pipe(delay(350));
  }

  private initializeMockData(): void {
    this.reports = [
      { id: 'RNT-001', operation: 'OP-2025-001', client: 'Cargill Trading', product: 'Soja em Grãos', country: 'China', volume: 5000, revenue: 2250000, totalCost: 1687500, grossMargin: 562500, marginPercent: 25.0, logisticsCost: 125000, financialCost: 45000, period: '2025-Q1', incoterm: 'FOB' },
      { id: 'RNT-002', operation: 'OP-2025-002', client: 'ADM International', product: 'Milho', country: 'Japão', volume: 8000, revenue: 2400000, totalCost: 1920000, grossMargin: 480000, marginPercent: 20.0, logisticsCost: 192000, financialCost: 48000, period: '2025-Q1', incoterm: 'CIF' },
      { id: 'RNT-003', operation: 'OP-2025-003', client: 'Bunge Alimentos', product: 'Farelo de Soja', country: 'Alemanha', volume: 3000, revenue: 1350000, totalCost: 945000, grossMargin: 405000, marginPercent: 30.0, logisticsCost: 94500, financialCost: 27000, period: '2025-Q1', incoterm: 'CFR' },
      { id: 'RNT-004', operation: 'OP-2025-004', client: 'Louis Dreyfus', product: 'Açúcar VHP', country: 'Índia', volume: 12000, revenue: 4800000, totalCost: 3360000, grossMargin: 1440000, marginPercent: 30.0, logisticsCost: 336000, financialCost: 96000, period: '2025-Q1', incoterm: 'FOB' },
      { id: 'RNT-005', operation: 'OP-2025-005', client: 'COFCO International', product: 'Café Arábica', country: 'EUA', volume: 500, revenue: 1750000, totalCost: 1137500, grossMargin: 612500, marginPercent: 35.0, logisticsCost: 87500, financialCost: 35000, period: '2025-Q1', incoterm: 'FOB' },
      { id: 'RNT-006', operation: 'OP-2025-006', client: 'Glencore Agriculture', product: 'Soja em Grãos', country: 'Holanda', volume: 6000, revenue: 2700000, totalCost: 2160000, grossMargin: 540000, marginPercent: 20.0, logisticsCost: 162000, financialCost: 54000, period: '2025-Q1', incoterm: 'CIF' },
      { id: 'RNT-007', operation: 'OP-2025-007', client: 'Cargill Trading', product: 'Algodão', country: 'Bangladesh', volume: 2000, revenue: 3200000, totalCost: 2560000, grossMargin: 640000, marginPercent: 20.0, logisticsCost: 160000, financialCost: 64000, period: '2025-Q1', incoterm: 'CFR' },
      { id: 'RNT-008', operation: 'OP-2025-008', client: 'Viterra', product: 'Milho', country: 'Egito', volume: 10000, revenue: 3000000, totalCost: 2550000, grossMargin: 450000, marginPercent: 15.0, logisticsCost: 210000, financialCost: 60000, period: '2025-Q1', incoterm: 'FOB' },
      { id: 'RNT-009', operation: 'OP-2025-009', client: 'ADM International', product: 'Óleo de Soja', country: 'China', volume: 4000, revenue: 4400000, totalCost: 3300000, grossMargin: 1100000, marginPercent: 25.0, logisticsCost: 220000, financialCost: 88000, period: '2025-Q1', incoterm: 'CIF' },
      { id: 'RNT-010', operation: 'OP-2025-010', client: 'Bunge Alimentos', product: 'Café Arábica', country: 'Itália', volume: 300, revenue: 1050000, totalCost: 735000, grossMargin: 315000, marginPercent: 30.0, logisticsCost: 52500, financialCost: 21000, period: '2025-Q1', incoterm: 'FOB' },
      { id: 'RNT-011', operation: 'OP-2025-011', client: 'Louis Dreyfus', product: 'Celulose', country: 'EUA', volume: 7000, revenue: 4900000, totalCost: 3430000, grossMargin: 1470000, marginPercent: 30.0, logisticsCost: 343000, financialCost: 98000, period: '2025-Q2', incoterm: 'CFR' },
      { id: 'RNT-012', operation: 'OP-2025-012', client: 'COFCO International', product: 'Soja em Grãos', country: 'China', volume: 9000, revenue: 4050000, totalCost: 3442500, grossMargin: 607500, marginPercent: 15.0, logisticsCost: 243000, financialCost: 81000, period: '2025-Q2', incoterm: 'FOB' },
      { id: 'RNT-013', operation: 'OP-2025-013', client: 'Glencore Agriculture', product: 'Açúcar VHP', country: 'Rússia', volume: 8000, revenue: 3200000, totalCost: 2720000, grossMargin: 480000, marginPercent: 15.0, logisticsCost: 224000, financialCost: 64000, period: '2025-Q2', incoterm: 'CIF' },
      { id: 'RNT-014', operation: 'OP-2025-014', client: 'Viterra', product: 'Farelo de Soja', country: 'Tailândia', volume: 4500, revenue: 2025000, totalCost: 1518750, grossMargin: 506250, marginPercent: 25.0, logisticsCost: 121500, financialCost: 40500, period: '2025-Q2', incoterm: 'FOB' },
      { id: 'RNT-015', operation: 'OP-2025-015', client: 'Cargill Trading', product: 'Café Arábica', country: 'Alemanha', volume: 400, revenue: 1400000, totalCost: 980000, grossMargin: 420000, marginPercent: 30.0, logisticsCost: 70000, financialCost: 28000, period: '2025-Q2', incoterm: 'CIF' },
      { id: 'RNT-016', operation: 'OP-2025-016', client: 'ADM International', product: 'Celulose', country: 'Japão', volume: 5000, revenue: 3500000, totalCost: 2625000, grossMargin: 875000, marginPercent: 25.0, logisticsCost: 175000, financialCost: 70000, period: '2025-Q2', incoterm: 'CFR' },
      { id: 'RNT-017', operation: 'OP-2025-017', client: 'Bunge Alimentos', product: 'Algodão', country: 'Turquia', volume: 1500, revenue: 2400000, totalCost: 2040000, grossMargin: 360000, marginPercent: 15.0, logisticsCost: 120000, financialCost: 48000, period: '2025-Q2', incoterm: 'FOB' },
      { id: 'RNT-018', operation: 'OP-2025-018', client: 'Louis Dreyfus', product: 'Óleo de Soja', country: 'Índia', volume: 3500, revenue: 3850000, totalCost: 2695000, grossMargin: 1155000, marginPercent: 30.0, logisticsCost: 192500, financialCost: 77000, period: '2025-Q2', incoterm: 'CIF' },
      { id: 'RNT-019', operation: 'OP-2025-019', client: 'COFCO International', product: 'Milho', country: 'Coreia do Sul', volume: 7000, revenue: 2100000, totalCost: 1785000, grossMargin: 315000, marginPercent: 15.0, logisticsCost: 147000, financialCost: 42000, period: '2025-Q2', incoterm: 'FOB' },
      { id: 'RNT-020', operation: 'OP-2025-020', client: 'Glencore Agriculture', product: 'Café Arábica', country: 'EUA', volume: 600, revenue: 2100000, totalCost: 1365000, grossMargin: 735000, marginPercent: 35.0, logisticsCost: 105000, financialCost: 42000, period: '2025-Q2', incoterm: 'FOB' },
      { id: 'RNT-021', operation: 'OP-2025-021', client: 'Viterra', product: 'Soja em Grãos', country: 'China', volume: 11000, revenue: 4950000, totalCost: 3960000, grossMargin: 990000, marginPercent: 20.0, logisticsCost: 297000, financialCost: 99000, period: '2025-Q2', incoterm: 'CFR' },
      { id: 'RNT-022', operation: 'OP-2025-022', client: 'Cargill Trading', product: 'Açúcar VHP', country: 'Nigéria', volume: 6000, revenue: 2400000, totalCost: 1680000, grossMargin: 720000, marginPercent: 30.0, logisticsCost: 168000, financialCost: 48000, period: '2025-Q2', incoterm: 'FOB' }
    ];

    this.productMargins = [
      { product: 'Café Arábica', revenue: 6300000, cost: 4217500, margin: 2082500, marginPercent: 33.1, volume: 1800 },
      { product: 'Açúcar VHP', revenue: 10400000, cost: 7760000, margin: 2640000, marginPercent: 25.4, volume: 26000 },
      { product: 'Celulose', revenue: 8400000, cost: 6055000, margin: 2345000, marginPercent: 27.9, volume: 12000 },
      { product: 'Soja em Grãos', revenue: 13950000, cost: 11250000, margin: 2700000, marginPercent: 19.4, volume: 31000 },
      { product: 'Farelo de Soja', revenue: 3375000, cost: 2463750, margin: 911250, marginPercent: 27.0, volume: 7500 },
      { product: 'Milho', revenue: 7500000, cost: 6255000, margin: 1245000, marginPercent: 16.6, volume: 25000 },
      { product: 'Óleo de Soja', revenue: 8250000, cost: 5995000, margin: 2255000, marginPercent: 27.3, volume: 7500 },
      { product: 'Algodão', revenue: 5600000, cost: 4600000, margin: 1000000, marginPercent: 17.9, volume: 3500 }
    ];

    this.clientMargins = [
      { client: 'Cargill Trading', revenue: 8250000, margin: 2342500, marginPercent: 28.4, operations: 4 },
      { client: 'ADM International', revenue: 8300000, margin: 2455000, marginPercent: 29.6, operations: 3 },
      { client: 'Bunge Alimentos', revenue: 4825000, margin: 1080000, marginPercent: 22.4, operations: 3 },
      { client: 'Louis Dreyfus', revenue: 13550000, margin: 4065000, marginPercent: 30.0, operations: 3 },
      { client: 'COFCO International', revenue: 7900000, margin: 1655000, marginPercent: 20.9, operations: 3 },
      { client: 'Glencore Agriculture', revenue: 8000000, margin: 1755000, marginPercent: 21.9, operations: 3 },
      { client: 'Viterra', revenue: 9975000, margin: 1946250, marginPercent: 19.5, operations: 3 }
    ];
  }
}
