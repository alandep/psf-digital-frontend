import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  ExportReport,
  ReportMetrics,
  CountryBreakdown,
  ProductBreakdown
} from '../types/relatorios';

@Injectable({
  providedIn: 'root'
})
export class RelatoriosMockService {

  private exports: ExportReport[] = [];
  private countryBreakdowns: CountryBreakdown[] = [];
  private productBreakdowns: ProductBreakdown[] = [];

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getExports(): Observable<ExportReport[]> {
    return of([...this.exports]).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<ReportMetrics> {
    const totalValue = this.exports.reduce((sum, e) => sum + e.totalValue, 0);
    const totalVolume = this.exports.reduce((sum, e) => sum + e.volume, 0);
    const avgMargin = this.exports.reduce((sum, e) => sum + e.margin, 0) / this.exports.length;
    const now = new Date();
    const exportsThisMonth = this.exports.filter(e =>
      e.shipDate.getMonth() === now.getMonth() && e.shipDate.getFullYear() === now.getFullYear()
    ).length;

    const metrics: ReportMetrics = {
      totalExports: this.exports.length,
      totalValue,
      avgMargin: Math.round(avgMargin * 10) / 10,
      topCountry: 'China',
      topProduct: 'Soja em Grãos',
      totalVolume,
      exportsThisMonth,
      growthPercent: 12.5
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  getCountryBreakdowns(): Observable<CountryBreakdown[]> {
    return of([...this.countryBreakdowns]).pipe(delay(this.randomDelay()));
  }

  getProductBreakdowns(): Observable<ProductBreakdown[]> {
    return of([...this.productBreakdowns]).pipe(delay(this.randomDelay()));
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  private randomDelay(): number {
    return 300 + Math.random() * 500;
  }

  // ================================
  // DATA INITIALIZATION
  // ================================

  private initializeMockData(): void {
    this.initializeExports();
    this.initializeCountryBreakdowns();
    this.initializeProductBreakdowns();
  }

  private initializeExports(): void {
    this.exports = [
      {
        id: 'EXP-001', exportNumber: 'EXP-2024/0001', client: 'China Grains Import Co.',
        country: 'China', product: 'Soja em Grãos', ncm: '1201.90.00', volume: 50000,
        unit: 'ton', totalValue: 2500000, currency: 'USD', incoterm: 'FOB',
        port: 'Santos', shipDate: new Date('2024-12-05'), status: 'Embarcado',
        margin: 18.5, dueNumber: '24BR00001234-5'
      },
      {
        id: 'EXP-002', exportNumber: 'EXP-2024/0002', client: 'Hamburg Coffee Traders GmbH',
        country: 'Alemanha', product: 'Café Arábica Cru', ncm: '0901.11.10', volume: 8000,
        unit: 'ton', totalValue: 850000, currency: 'USD', incoterm: 'CIF',
        port: 'Santos', shipDate: new Date('2024-12-10'), status: 'Em Trânsito',
        margin: 22.3, dueNumber: '24BR00001235-3'
      },
      {
        id: 'EXP-003', exportNumber: 'EXP-2024/0003', client: 'Al-Rashid Meat Imports',
        country: 'Arábia Saudita', product: 'Carne Bovina Desossada', ncm: '0202.30.00', volume: 5000,
        unit: 'ton', totalValue: 1200000, currency: 'USD', incoterm: 'CFR',
        port: 'Paranaguá', shipDate: new Date('2024-12-08'), status: 'Embarcado',
        margin: 15.8, dueNumber: '24BR00001236-1'
      },
      {
        id: 'EXP-004', exportNumber: 'EXP-2024/0004', client: 'US Citrus Corp.',
        country: 'EUA', product: 'Suco de Laranja Concentrado', ncm: '2009.11.00', volume: 10000,
        unit: 'ton', totalValue: 680000, currency: 'USD', incoterm: 'FOB',
        port: 'Santos', shipDate: new Date('2024-12-15'), status: 'Aguardando Embarque',
        margin: 12.1, dueNumber: '24BR00001237-9'
      },
      {
        id: 'EXP-005', exportNumber: 'EXP-2024/0005', client: 'Japan Paper Co. Ltd',
        country: 'Japão', product: 'Celulose de Eucalipto', ncm: '4703.21.00', volume: 25000,
        unit: 'ton', totalValue: 3200000, currency: 'USD', incoterm: 'CIF',
        port: 'Itaguaí', shipDate: new Date('2024-12-12'), status: 'Em Trânsito',
        margin: 20.7, dueNumber: '24BR00001238-7'
      },
      {
        id: 'EXP-006', exportNumber: 'EXP-2024/0006', client: 'Netherlands Feed Industries',
        country: 'Holanda', product: 'Farelo de Soja', ncm: '2304.00.10', volume: 30000,
        unit: 'ton', totalValue: 1800000, currency: 'USD', incoterm: 'FOB',
        port: 'Paranaguá', shipDate: new Date('2024-11-28'), status: 'Entregue',
        margin: 16.2, dueNumber: '24BR00001239-5'
      },
      {
        id: 'EXP-007', exportNumber: 'EXP-2024/0007', client: 'Turkish Textile Raw Materials',
        country: 'Turquia', product: 'Algodão em Pluma', ncm: '5201.00.20', volume: 12000,
        unit: 'ton', totalValue: 920000, currency: 'USD', incoterm: 'CFR',
        port: 'Santos', shipDate: new Date('2024-12-20'), status: 'Aguardando Embarque',
        margin: 14.5, dueNumber: '24BR00001240-9'
      },
      {
        id: 'EXP-008', exportNumber: 'EXP-2024/0008', client: 'India Sugar Imports Ltd',
        country: 'Índia', product: 'Açúcar Cristal', ncm: '1701.14.00', volume: 20000,
        unit: 'ton', totalValue: 1500000, currency: 'USD', incoterm: 'FOB',
        port: 'Santos', shipDate: new Date('2024-12-06'), status: 'Embarcado',
        margin: 11.3, dueNumber: '24BR00001241-7'
      },
      {
        id: 'EXP-009', exportNumber: 'EXP-2024/0009', client: 'UAE Food Distribution LLC',
        country: 'Emirados Árabes', product: 'Frango Congelado', ncm: '0207.14.00', volume: 4000,
        unit: 'ton', totalValue: 750000, currency: 'USD', incoterm: 'CIF',
        port: 'Paranaguá', shipDate: new Date('2024-12-11'), status: 'Em Trânsito',
        margin: 17.9, dueNumber: '24BR00001243-3'
      },
      {
        id: 'EXP-010', exportNumber: 'EXP-2024/0010', client: 'UK Tropical Fruits Ltd',
        country: 'Reino Unido', product: 'Manga Fresca', ncm: '0804.50.00', volume: 500,
        unit: 'ton', totalValue: 420000, currency: 'USD', incoterm: 'CIF',
        port: 'Salvador', shipDate: new Date('2024-11-20'), status: 'Entregue',
        margin: 25.4, dueNumber: '24BR00001244-1'
      },
      {
        id: 'EXP-011', exportNumber: 'EXP-2024/0011', client: 'Portugal Timber Industries',
        country: 'Portugal', product: 'Madeira Serrada de Pinus', ncm: '4407.11.00', volume: 3000,
        unit: 'm³', totalValue: 310000, currency: 'USD', incoterm: 'FOB',
        port: 'Itajaí', shipDate: new Date('2024-12-04'), status: 'Embarcado',
        margin: 13.6, dueNumber: '24BR00001247-5'
      },
      {
        id: 'EXP-012', exportNumber: 'EXP-2024/0012', client: 'China Iron & Steel Corp',
        country: 'China', product: 'Minério de Ferro', ncm: '2601.11.00', volume: 100000,
        unit: 'ton', totalValue: 8500000, currency: 'USD', incoterm: 'FOB',
        port: 'Itaguaí', shipDate: new Date('2024-11-30'), status: 'Entregue',
        margin: 19.8, dueNumber: '24BR00001248-3'
      },
      {
        id: 'EXP-013', exportNumber: 'EXP-2024/0013', client: 'US Ethanol Partners Inc',
        country: 'EUA', product: 'Etanol Anidro', ncm: '2207.10.90', volume: 25000,
        unit: 'm³', totalValue: 2100000, currency: 'USD', incoterm: 'FOB',
        port: 'Santos', shipDate: new Date('2024-12-13'), status: 'Em Trânsito',
        margin: 10.2, dueNumber: '24BR00001246-7'
      },
      {
        id: 'EXP-014', exportNumber: 'EXP-2024/0014', client: 'China Soy Processing Ltd',
        country: 'China', product: 'Soja em Grãos', ncm: '1201.90.00', volume: 65000,
        unit: 'ton', totalValue: 3250000, currency: 'USD', incoterm: 'FOB',
        port: 'Santos', shipDate: new Date('2024-12-14'), status: 'Aguardando Embarque',
        margin: 17.1, dueNumber: '24BR00001255-2'
      },
      {
        id: 'EXP-015', exportNumber: 'EXP-2024/0015', client: 'Japan Poultry Imports',
        country: 'Japão', product: 'Frango Congelado', ncm: '0207.14.00', volume: 3500,
        unit: 'ton', totalValue: 680000, currency: 'USD', incoterm: 'CIF',
        port: 'Paranaguá', shipDate: new Date('2024-12-09'), status: 'Embarcado',
        margin: 16.8, dueNumber: '24BR00001258-6'
      },
      {
        id: 'EXP-016', exportNumber: 'EXP-2024/0016', client: 'EU Grain Consortium',
        country: 'Holanda', product: 'Milho em Grãos', ncm: '1005.90.10', volume: 35000,
        unit: 'ton', totalValue: 1750000, currency: 'USD', incoterm: 'CFR',
        port: 'Paranaguá', shipDate: new Date('2024-11-25'), status: 'Entregue',
        margin: 14.9, dueNumber: '24BR00001250-2'
      },
      {
        id: 'EXP-017', exportNumber: 'EXP-2024/0017', client: 'Saudi Arabia Meat Corp',
        country: 'Arábia Saudita', product: 'Carne Bovina In Natura', ncm: '0201.20.00', volume: 3000,
        unit: 'ton', totalValue: 950000, currency: 'USD', incoterm: 'CIF',
        port: 'Santos', shipDate: new Date('2024-12-18'), status: 'Aguardando Embarque',
        margin: 21.4, dueNumber: '24BR00001251-0'
      },
      {
        id: 'EXP-018', exportNumber: 'EXP-2024/0018', client: 'Italian Coffee Roasters SpA',
        country: 'Itália', product: 'Café Arábica Cru', ncm: '0901.11.10', volume: 5000,
        unit: 'ton', totalValue: 620000, currency: 'USD', incoterm: 'FOB',
        port: 'Santos', shipDate: new Date('2024-12-02'), status: 'Embarcado',
        margin: 23.7, dueNumber: '24BR00001259-4'
      },
      {
        id: 'EXP-019', exportNumber: 'EXP-2024/0019', client: 'China Poultry Import Corp',
        country: 'China', product: 'Frango Congelado', ncm: '0207.14.00', volume: 6000,
        unit: 'ton', totalValue: 1100000, currency: 'USD', incoterm: 'FOB',
        port: 'Itajaí', shipDate: new Date('2024-12-16'), status: 'Aguardando Embarque',
        margin: 15.3, dueNumber: '24BR00001260-8'
      },
      {
        id: 'EXP-020', exportNumber: 'EXP-2024/0020', client: 'US Soy Processors LLC',
        country: 'EUA', product: 'Farelo de Soja', ncm: '2304.00.10', volume: 20000,
        unit: 'ton', totalValue: 1200000, currency: 'USD', incoterm: 'FOB',
        port: 'Paranaguá', shipDate: new Date('2024-12-07'), status: 'Embarcado',
        margin: 13.8, dueNumber: '24BR00001261-6'
      },
      {
        id: 'EXP-021', exportNumber: 'EXP-2024/0021', client: 'Belgium Tobacco Leaf NV',
        country: 'Bélgica', product: 'Tabaco Virginia', ncm: '2401.10.30', volume: 2000,
        unit: 'ton', totalValue: 620000, currency: 'USD', incoterm: 'CIF',
        port: 'Rio Grande', shipDate: new Date('2024-12-19'), status: 'Aguardando Embarque',
        margin: 19.2, dueNumber: '24BR00001249-1'
      },
      {
        id: 'EXP-022', exportNumber: 'EXP-2024/0022', client: 'Chile Meat Distributors',
        country: 'Chile', product: 'Peru Congelado', ncm: '0207.27.00', volume: 1500,
        unit: 'ton', totalValue: 580000, currency: 'USD', incoterm: 'CFR',
        port: 'Rio Grande', shipDate: new Date('2024-12-09'), status: 'Embarcado',
        margin: 11.7, dueNumber: '24BR00001245-9'
      }
    ];
  }

  private initializeCountryBreakdowns(): void {
    this.countryBreakdowns = [
      { country: 'China', value: 15350000, volume: 221000, count: 5, percentage: 35.2 },
      { country: 'EUA', value: 4980000, volume: 55000, count: 4, percentage: 17.8 },
      { country: 'Arábia Saudita', value: 2150000, volume: 8000, count: 2, percentage: 10.1 },
      { country: 'Japão', value: 3880000, volume: 28500, count: 2, percentage: 12.4 },
      { country: 'Holanda', value: 3550000, volume: 65000, count: 2, percentage: 8.9 },
      { country: 'Alemanha', value: 850000, volume: 8000, count: 1, percentage: 4.2 },
      { country: 'Emirados Árabes', value: 750000, volume: 4000, count: 1, percentage: 3.1 },
      { country: 'Reino Unido', value: 420000, volume: 500, count: 1, percentage: 2.5 },
      { country: 'Itália', value: 620000, volume: 5000, count: 1, percentage: 2.1 },
      { country: 'Outros', value: 1700000, volume: 8500, count: 3, percentage: 3.7 }
    ];
  }

  private initializeProductBreakdowns(): void {
    this.productBreakdowns = [
      { product: 'Soja em Grãos', value: 5750000, volume: 115000, count: 2, percentage: 26.8 },
      { product: 'Minério de Ferro', value: 8500000, volume: 100000, count: 1, percentage: 18.2 },
      { product: 'Celulose de Eucalipto', value: 3200000, volume: 25000, count: 1, percentage: 11.5 },
      { product: 'Frango Congelado', value: 2530000, volume: 13500, count: 3, percentage: 9.8 },
      { product: 'Farelo de Soja', value: 3000000, volume: 50000, count: 2, percentage: 8.7 },
      { product: 'Café Arábica Cru', value: 1470000, volume: 13000, count: 2, percentage: 7.2 },
      { product: 'Etanol Anidro', value: 2100000, volume: 25000, count: 1, percentage: 5.4 },
      { product: 'Carne Bovina', value: 2150000, volume: 8000, count: 2, percentage: 5.1 },
      { product: 'Milho em Grãos', value: 1750000, volume: 35000, count: 1, percentage: 4.2 },
      { product: 'Outros', value: 2550000, volume: 18000, count: 5, percentage: 3.1 }
    ];
  }
}
