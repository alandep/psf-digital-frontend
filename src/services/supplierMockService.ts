import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Supplier, SupplierMetrics,
  SupplierCategory, QualificationStatus
} from '../types/supplier';

@Injectable({
  providedIn: 'root'
})
export class SupplierMockService {

  private suppliers: Supplier[] = [];

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getSuppliers(): Observable<Supplier[]> {
    return of([...this.suppliers]).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<SupplierMetrics> {
    const metrics: SupplierMetrics = {
      totalSuppliers: this.suppliers.length,
      qualified: this.suppliers.filter(s => s.qualificationStatus === 'QUALIFIED').length,
      pending: this.suppliers.filter(s => s.qualificationStatus === 'PENDING').length,
      highRisk: this.suppliers.filter(s => s.riskScore > 70).length,
      avgRiskScore: Math.round(this.suppliers.reduce((sum, s) => sum + s.riskScore, 0) / this.suppliers.length),
      avgDeliveryPerformance: Math.round(this.suppliers.reduce((sum, s) => sum + s.deliveryPerformance, 0) / this.suppliers.length)
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  createSupplier(data: Partial<Supplier>): Observable<Supplier> {
    const newSupplier: Supplier = {
      id: `SUP-${Date.now()}`,
      companyName: data.companyName || '',
      taxId: data.taxId || '',
      country: data.country || 'Brasil',
      category: data.category || 'RAW_MATERIAL',
      contactName: data.contactName || '',
      email: data.email || '',
      phone: data.phone || '',
      riskScore: 50,
      qualificationStatus: 'PENDING',
      lastAuditDate: new Date(),
      activeContracts: 0,
      deliveryPerformance: 80,
      qualityMetrics: 80,
      financialStability: 75,
      complianceHistory: 85,
      geographicRisk: 30,
      createdAt: new Date()
    };
    this.suppliers.push(newSupplier);
    return of(newSupplier).pipe(delay(this.randomDelay()));
  }

  getCategories(): SupplierCategory[] {
    return ['RAW_MATERIAL', 'PACKAGING', 'LOGISTICS', 'SERVICES', 'EQUIPMENT'];
  }

  getStatuses(): QualificationStatus[] {
    return ['QUALIFIED', 'PENDING', 'CONDITIONAL', 'DISQUALIFIED'];
  }

  getCountries(): string[] {
    return [...new Set(this.suppliers.map(s => s.country))].sort();
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  private randomDelay(): number {
    return 300 + Math.random() * 400;
  }

  private calculateRiskScore(s: { deliveryPerformance: number; qualityMetrics: number; financialStability: number; complianceHistory: number; geographicRisk: number }): number {
    // Risk is inverted: higher = riskier. Components are performance scores (0-100, higher = better)
    // So we invert: risk = 100 - weighted average of good scores + geographic risk contribution
    const weightedGood = s.deliveryPerformance * 0.30 + s.qualityMetrics * 0.25 + s.financialStability * 0.20 + s.complianceHistory * 0.15;
    const risk = Math.round(100 - weightedGood + s.geographicRisk * 0.10);
    return Math.max(0, Math.min(100, risk));
  }

  private initializeMockData(): void {
    const rawData = [
      { companyName: 'AgroInsumos Brasil S.A.', taxId: '11.222.333/0001-01', country: 'Brasil', category: 'RAW_MATERIAL' as SupplierCategory, contactName: 'Fernando Ribeiro', email: 'fernando@agroinsumos.com.br', phone: '+55 11 3333-4444', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-10-15'), activeContracts: 5, deliveryPerformance: 92, qualityMetrics: 88, financialStability: 85, complianceHistory: 90, geographicRisk: 15 },
      { companyName: 'PackTech Embalagens Ltda', taxId: '22.333.444/0001-02', country: 'Brasil', category: 'PACKAGING' as SupplierCategory, contactName: 'Carla Mendes', email: 'carla@packtech.com.br', phone: '+55 11 4444-5555', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-09-20'), activeContracts: 3, deliveryPerformance: 87, qualityMetrics: 91, financialStability: 78, complianceHistory: 85, geographicRisk: 10 },
      { companyName: 'TransGlobal Logistics', taxId: '33.444.555/0001-03', country: 'Brasil', category: 'LOGISTICS' as SupplierCategory, contactName: 'André Lopes', email: 'andre@transglobal.com.br', phone: '+55 21 5555-6666', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-11-01'), activeContracts: 7, deliveryPerformance: 94, qualityMetrics: 85, financialStability: 90, complianceHistory: 92, geographicRisk: 20 },
      { companyName: 'Shanghai Materials Co.', taxId: 'CN-91310000', country: 'China', category: 'RAW_MATERIAL' as SupplierCategory, contactName: 'Liu Wei', email: 'liu.wei@shmaterials.cn', phone: '+86 21 6888-7777', qualificationStatus: 'CONDITIONAL' as QualificationStatus, lastAuditDate: new Date('2024-06-15'), activeContracts: 2, deliveryPerformance: 68, qualityMetrics: 72, financialStability: 65, complianceHistory: 60, geographicRisk: 75 },
      { companyName: 'EuroPack GmbH', taxId: 'DE-123456789', country: 'Alemanha', category: 'PACKAGING' as SupplierCategory, contactName: 'Klaus Fischer', email: 'klaus@europack.de', phone: '+49 89 1234-5678', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-08-20'), activeContracts: 4, deliveryPerformance: 96, qualityMetrics: 95, financialStability: 92, complianceHistory: 98, geographicRisk: 30 },
      { companyName: 'Manutenção Industrial SA', taxId: '44.555.666/0001-04', country: 'Brasil', category: 'EQUIPMENT' as SupplierCategory, contactName: 'Roberto Nunes', email: 'roberto@manutind.com.br', phone: '+55 19 6666-7777', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-07-10'), activeContracts: 2, deliveryPerformance: 82, qualityMetrics: 80, financialStability: 75, complianceHistory: 88, geographicRisk: 10 },
      { companyName: 'IndoChemicals Pvt Ltd', taxId: 'IN-AAACI1234', country: 'Índia', category: 'RAW_MATERIAL' as SupplierCategory, contactName: 'Raj Patel', email: 'raj.patel@indochem.in', phone: '+91 22 4567-8901', qualificationStatus: 'PENDING' as QualificationStatus, lastAuditDate: new Date('2024-04-25'), activeContracts: 1, deliveryPerformance: 55, qualityMetrics: 60, financialStability: 50, complianceHistory: 45, geographicRisk: 80 },
      { companyName: 'Serviços Especializados MG', taxId: '55.666.777/0001-05', country: 'Brasil', category: 'SERVICES' as SupplierCategory, contactName: 'Paula Gomes', email: 'paula@servmg.com.br', phone: '+55 31 7777-8888', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-10-05'), activeContracts: 3, deliveryPerformance: 89, qualityMetrics: 86, financialStability: 82, complianceHistory: 90, geographicRisk: 12 },
      { companyName: 'NigeriaOil Supplies', taxId: 'NG-RC123456', country: 'Nigéria', category: 'RAW_MATERIAL' as SupplierCategory, contactName: 'Emeka Okafor', email: 'emeka@nigeriaoil.ng', phone: '+234 1 234-5678', qualificationStatus: 'DISQUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-02-10'), activeContracts: 0, deliveryPerformance: 40, qualityMetrics: 35, financialStability: 30, complianceHistory: 25, geographicRisk: 95 },
      { companyName: 'LogiExpress Argentina', taxId: 'AR-30-71234567-8', country: 'Argentina', category: 'LOGISTICS' as SupplierCategory, contactName: 'Martín Rodríguez', email: 'martin@logiexpress.ar', phone: '+54 11 8888-9999', qualificationStatus: 'CONDITIONAL' as QualificationStatus, lastAuditDate: new Date('2024-08-30'), activeContracts: 2, deliveryPerformance: 72, qualityMetrics: 70, financialStability: 55, complianceHistory: 68, geographicRisk: 45 },
      { companyName: 'TechServ Solutions', taxId: '66.777.888/0001-06', country: 'Brasil', category: 'SERVICES' as SupplierCategory, contactName: 'Diego Martins', email: 'diego@techserv.com.br', phone: '+55 11 9999-0000', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-11-20'), activeContracts: 4, deliveryPerformance: 91, qualityMetrics: 93, financialStability: 88, complianceHistory: 95, geographicRisk: 8 },
      { companyName: 'Vietnam Packaging Corp', taxId: 'VN-0100123456', country: 'Vietnã', category: 'PACKAGING' as SupplierCategory, contactName: 'Nguyen Van Tran', email: 'nguyen@vnpack.vn', phone: '+84 28 3456-7890', qualificationStatus: 'PENDING' as QualificationStatus, lastAuditDate: new Date('2024-05-12'), activeContracts: 1, deliveryPerformance: 65, qualityMetrics: 68, financialStability: 60, complianceHistory: 55, geographicRisk: 70 },
      { companyName: 'MaquinasPro SA', taxId: '77.888.999/0001-07', country: 'Brasil', category: 'EQUIPMENT' as SupplierCategory, contactName: 'Sérgio Alves', email: 'sergio@maquinaspro.com.br', phone: '+55 47 1111-2222', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-09-10'), activeContracts: 3, deliveryPerformance: 85, qualityMetrics: 82, financialStability: 79, complianceHistory: 86, geographicRisk: 10 },
      { companyName: 'Turkey Raw Exports', taxId: 'TR-1234567890', country: 'Turquia', category: 'RAW_MATERIAL' as SupplierCategory, contactName: 'Mehmet Yılmaz', email: 'mehmet@turkeyraw.tr', phone: '+90 212 345-6789', qualificationStatus: 'CONDITIONAL' as QualificationStatus, lastAuditDate: new Date('2024-07-22'), activeContracts: 1, deliveryPerformance: 70, qualityMetrics: 74, financialStability: 68, complianceHistory: 72, geographicRisk: 55 },
      { companyName: 'ChilePack Ltda', taxId: 'CL-76.123.456-7', country: 'Chile', category: 'PACKAGING' as SupplierCategory, contactName: 'Camila Vargas', email: 'camila@chilepack.cl', phone: '+56 2 2345-6789', qualificationStatus: 'QUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-10-28'), activeContracts: 2, deliveryPerformance: 88, qualityMetrics: 84, financialStability: 80, complianceHistory: 87, geographicRisk: 25 },
      { companyName: 'RussoMetais LLC', taxId: 'RU-7701234567', country: 'Rússia', category: 'RAW_MATERIAL' as SupplierCategory, contactName: 'Ivan Petrov', email: 'ivan@russometais.ru', phone: '+7 495 123-4567', qualificationStatus: 'DISQUALIFIED' as QualificationStatus, lastAuditDate: new Date('2024-01-15'), activeContracts: 0, deliveryPerformance: 45, qualityMetrics: 50, financialStability: 40, complianceHistory: 30, geographicRisk: 90 }
    ];

    this.suppliers = rawData.map((item, index) => ({
      id: `SUP-${String(index + 1).padStart(3, '0')}`,
      ...item,
      riskScore: this.calculateRiskScore(item),
      createdAt: new Date(2020 + Math.floor(index / 4), index % 12, 1 + index)
    }));
  }
}
