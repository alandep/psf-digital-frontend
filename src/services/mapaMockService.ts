import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  MapaCertificate,
  CertificateStatus,
  MapaInspection,
  InspectionStatus,
  MapaHabilitacao,
  HabilitacaoStatus,
  MapaMetrics
} from '../types/integracoes-mapa';

@Injectable({
  providedIn: 'root'
})
export class MapaMockService {

  private certificates: MapaCertificate[] = [];
  private inspections: MapaInspection[] = [];
  private habilitacoes: MapaHabilitacao[] = [];

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getCertificates(): Observable<MapaCertificate[]> {
    return of([...this.certificates]).pipe(delay(this.randomDelay()));
  }

  getInspections(): Observable<MapaInspection[]> {
    return of([...this.inspections]).pipe(delay(this.randomDelay()));
  }

  getHabilitacoes(): Observable<MapaHabilitacao[]> {
    return of([...this.habilitacoes]).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<MapaMetrics> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const metrics: MapaMetrics = {
      activeCertificates: this.certificates.filter(c => c.status === 'VIGENTE').length,
      expiringCertificates: this.certificates.filter(c =>
        c.status === 'VIGENTE' && c.expirationDate <= thirtyDaysFromNow
      ).length,
      pendingInspections: this.inspections.filter(i =>
        i.status === 'AGENDADA' || i.status === 'EM_ANDAMENTO'
      ).length,
      activeHabilitacoes: this.habilitacoes.filter(h => h.status === 'ATIVA').length,
      certificatesThisMonth: this.certificates.filter(c => {
        return c.issueDate.getMonth() === now.getMonth() &&
               c.issueDate.getFullYear() === now.getFullYear();
      }).length,
      approvalRate: 91.7
    };
    return of(metrics).pipe(delay(this.randomDelay()));
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
    this.initializeCertificates();
    this.initializeInspections();
    this.initializeHabilitacoes();
  }

  private initializeCertificates(): void {
    this.certificates = [
      {
        id: 'CERT-001', number: 'CFE-2024/001234', type: 'CFE', product: 'Soja em Grãos',
        ncm: '1201.90.00', destination: 'China', establishment: 'AgroBrasil Exportações Ltda',
        issueDate: new Date('2024-11-15'), expirationDate: new Date('2025-02-15'),
        status: 'VIGENTE', inspector: 'Dr. Carlos Mendes', linkedDue: '24BR00001234-5',
        volume: 50000, unit: 'ton'
      },
      {
        id: 'CERT-002', number: 'CSI-2024/005678', type: 'CSI', product: 'Carne Bovina Desossada',
        ncm: '0202.30.00', destination: 'Arábia Saudita', establishment: 'MeatPack International',
        issueDate: new Date('2024-12-01'), expirationDate: new Date('2025-03-01'),
        status: 'VIGENTE', inspector: 'Dra. Ana Ribeiro', linkedDue: '24BR00001236-1',
        volume: 5000, unit: 'ton'
      },
      {
        id: 'CERT-003', number: 'CFE-2024/001890', type: 'CFE', product: 'Café Arábica Cru',
        ncm: '0901.11.10', destination: 'EU', establishment: 'Café Premium Export S.A.',
        issueDate: new Date('2024-10-20'), expirationDate: new Date('2025-01-20'),
        status: 'VIGENTE', inspector: 'Dr. Roberto Alves', linkedDue: '24BR00001235-3',
        volume: 8000, unit: 'ton'
      },
      {
        id: 'CERT-004', number: 'CZI-2024/003456', type: 'CZI', product: 'Frango Congelado',
        ncm: '0207.14.00', destination: 'Japão', establishment: 'Poultry Global Trade',
        issueDate: new Date('2024-11-28'), expirationDate: new Date('2025-02-28'),
        status: 'VIGENTE', inspector: 'Dr. Fernando Lima', linkedDue: '24BR00001243-3',
        volume: 4000, unit: 'ton'
      },
      {
        id: 'CERT-005', number: 'CFE-2024/002345', type: 'CFE', product: 'Milho em Grãos',
        ncm: '1005.90.10', destination: 'EUA', establishment: 'AgroBrasil Exportações Ltda',
        issueDate: new Date('2024-09-10'), expirationDate: new Date('2024-12-10'),
        status: 'VENCIDO', inspector: 'Dr. Carlos Mendes', linkedDue: '24BR00001250-2',
        volume: 30000, unit: 'ton'
      },
      {
        id: 'CERT-006', number: 'CSI-2024/006789', type: 'CSI', product: 'Carne Bovina In Natura',
        ncm: '0201.20.00', destination: 'China', establishment: 'MeatPack International',
        issueDate: new Date('2024-12-10'), expirationDate: new Date('2025-03-10'),
        status: 'EM_EMISSÃO', inspector: 'Dra. Ana Ribeiro', linkedDue: '24BR00001251-0',
        volume: 3000, unit: 'ton'
      },
      {
        id: 'CERT-007', number: 'CFE-2024/003210', type: 'CFE', product: 'Manga Fresca',
        ncm: '0804.50.00', destination: 'EU', establishment: 'Tropical Fruits Co.',
        issueDate: new Date('2024-11-05'), expirationDate: new Date('2025-01-05'),
        status: 'VIGENTE', inspector: 'Dr. Paulo Santos', linkedDue: '24BR00001244-1',
        volume: 500, unit: 'ton'
      },
      {
        id: 'CERT-008', number: 'CZI-2024/004567', type: 'CZI', product: 'Frango Congelado',
        ncm: '0207.14.00', destination: 'Arábia Saudita', establishment: 'Poultry Global Trade',
        issueDate: new Date('2024-08-15'), expirationDate: new Date('2024-11-15'),
        status: 'VENCIDO', inspector: 'Dr. Fernando Lima', linkedDue: '24BR00001252-8',
        volume: 2500, unit: 'ton'
      },
      {
        id: 'CERT-009', number: 'CFE-2024/004890', type: 'CFE', product: 'Laranja in Natura',
        ncm: '0805.10.00', destination: 'EUA', establishment: 'Citrus Valley Ltda',
        issueDate: new Date('2024-12-05'), expirationDate: new Date('2025-03-05'),
        status: 'VIGENTE', inspector: 'Dr. Roberto Alves', linkedDue: '24BR00001253-6',
        volume: 1200, unit: 'ton'
      },
      {
        id: 'CERT-010', number: 'CSI-2024/007890', type: 'CSI', product: 'Carne Bovina Desossada',
        ncm: '0202.30.00', destination: 'EUA', establishment: 'MeatPack International',
        issueDate: new Date('2024-11-20'), expirationDate: new Date('2025-02-20'),
        status: 'SUSPENSO', inspector: 'Dra. Ana Ribeiro', linkedDue: '24BR00001254-4',
        volume: 2000, unit: 'ton'
      },
      {
        id: 'CERT-011', number: 'CFE-2024/005678', type: 'CFE', product: 'Soja em Grãos',
        ncm: '1201.90.00', destination: 'Japão', establishment: 'AgroBrasil Exportações Ltda',
        issueDate: new Date('2024-12-12'), expirationDate: new Date('2025-03-12'),
        status: 'VIGENTE', inspector: 'Dr. Carlos Mendes', linkedDue: '24BR00001255-2',
        volume: 40000, unit: 'ton'
      },
      {
        id: 'CERT-012', number: 'CZI-2024/005890', type: 'CZI', product: 'Carne Bovina In Natura',
        ncm: '0201.20.00', destination: 'Arábia Saudita', establishment: 'MeatPack International',
        issueDate: new Date('2024-10-01'), expirationDate: new Date('2025-01-01'),
        status: 'VIGENTE', inspector: 'Dr. Fernando Lima', linkedDue: '24BR00001256-0',
        volume: 6000, unit: 'ton'
      },
      {
        id: 'CERT-013', number: 'CFE-2024/006123', type: 'CFE', product: 'Café Arábica Cru',
        ncm: '0901.11.10', destination: 'EUA', establishment: 'Café Premium Export S.A.',
        issueDate: new Date('2024-07-20'), expirationDate: new Date('2024-10-20'),
        status: 'CANCELADO', inspector: 'Dr. Roberto Alves', linkedDue: '24BR00001257-8',
        volume: 5000, unit: 'ton'
      },
      {
        id: 'CERT-014', number: 'CSI-2024/008901', type: 'CSI', product: 'Frango Congelado',
        ncm: '0207.14.00', destination: 'China', establishment: 'Poultry Global Trade',
        issueDate: new Date('2024-12-14'), expirationDate: new Date('2025-03-14'),
        status: 'EM_EMISSÃO', inspector: 'Dr. Fernando Lima', linkedDue: '24BR00001258-6',
        volume: 3500, unit: 'ton'
      }
    ];
  }

  private initializeInspections(): void {
    this.inspections = [
      {
        id: 'INSP-001', type: 'Fitossanitária', product: 'Soja em Grãos',
        establishment: 'AgroBrasil Exportações Ltda', scheduledDate: new Date('2024-12-18'),
        inspector: 'Dr. Carlos Mendes', status: 'AGENDADA', result: '',
        observations: 'Inspeção de rotina para embarque China', linkedCertificate: 'CFE-2024/001234'
      },
      {
        id: 'INSP-002', type: 'Sanitária', product: 'Carne Bovina Desossada',
        establishment: 'MeatPack International', scheduledDate: new Date('2024-12-15'),
        inspector: 'Dra. Ana Ribeiro', status: 'EM_ANDAMENTO', result: '',
        observations: 'Verificação condições frigoríficas', linkedCertificate: 'CSI-2024/005678'
      },
      {
        id: 'INSP-003', type: 'Qualidade', product: 'Café Arábica Cru',
        establishment: 'Café Premium Export S.A.', scheduledDate: new Date('2024-12-10'),
        inspector: 'Dr. Roberto Alves', status: 'APROVADA', result: 'Conforme',
        observations: 'Padrão de qualidade tipo 4/5 confirmado', linkedCertificate: 'CFE-2024/001890'
      },
      {
        id: 'INSP-004', type: 'Sanitária', product: 'Frango Congelado',
        establishment: 'Poultry Global Trade', scheduledDate: new Date('2024-12-08'),
        inspector: 'Dr. Fernando Lima', status: 'APROVADA', result: 'Conforme',
        observations: 'Temperatura e embalagem dentro dos padrões', linkedCertificate: 'CZI-2024/003456'
      },
      {
        id: 'INSP-005', type: 'Fitossanitária', product: 'Manga Fresca',
        establishment: 'Tropical Fruits Co.', scheduledDate: new Date('2024-12-05'),
        inspector: 'Dr. Paulo Santos', status: 'APROVADA', result: 'Conforme',
        observations: 'Sem pragas detectadas, tratamento térmico aplicado', linkedCertificate: 'CFE-2024/003210'
      },
      {
        id: 'INSP-006', type: 'Sanitária', product: 'Carne Bovina In Natura',
        establishment: 'MeatPack International', scheduledDate: new Date('2024-12-20'),
        inspector: 'Dra. Ana Ribeiro', status: 'AGENDADA', result: '',
        observations: 'Nova habilitação mercado chinês', linkedCertificate: 'CSI-2024/006789'
      },
      {
        id: 'INSP-007', type: 'Qualidade', product: 'Laranja in Natura',
        establishment: 'Citrus Valley Ltda', scheduledDate: new Date('2024-12-03'),
        inspector: 'Dr. Roberto Alves', status: 'REPROVADA', result: 'Não conforme',
        observations: 'Lote com índice de maturação fora do padrão', linkedCertificate: 'CFE-2024/004890'
      },
      {
        id: 'INSP-008', type: 'Fitossanitária', product: 'Milho em Grãos',
        establishment: 'AgroBrasil Exportações Ltda', scheduledDate: new Date('2024-11-28'),
        inspector: 'Dr. Carlos Mendes', status: 'APROVADA', result: 'Conforme',
        observations: 'Sem micotoxinas acima do limite permitido', linkedCertificate: 'CFE-2024/002345'
      },
      {
        id: 'INSP-009', type: 'Sanitária', product: 'Frango Congelado',
        establishment: 'Poultry Global Trade', scheduledDate: new Date('2024-12-22'),
        inspector: 'Dr. Fernando Lima', status: 'AGENDADA', result: '',
        observations: 'Inspeção para certificado mercado chinês', linkedCertificate: 'CSI-2024/008901'
      },
      {
        id: 'INSP-010', type: 'Qualidade', product: 'Soja em Grãos',
        establishment: 'AgroBrasil Exportações Ltda', scheduledDate: new Date('2024-12-12'),
        inspector: 'Dr. Paulo Santos', status: 'CANCELADA', result: '',
        observations: 'Cancelada por reagendamento do embarque', linkedCertificate: 'CFE-2024/005678'
      }
    ];
  }

  private initializeHabilitacoes(): void {
    this.habilitacoes = [
      {
        id: 'HAB-001', establishment: 'MeatPack International', cnpj: '34.567.890/0001-12',
        sifNumber: 'SIF-1234', products: ['Carne Bovina Desossada', 'Carne Bovina In Natura'],
        markets: ['China', 'Arábia Saudita', 'EU'], status: 'ATIVA',
        issueDate: new Date('2023-06-15'), expirationDate: new Date('2025-06-15'),
        lastAudit: new Date('2024-09-20')
      },
      {
        id: 'HAB-002', establishment: 'Poultry Global Trade', cnpj: '90.123.456/0001-78',
        sifNumber: 'SIF-2345', products: ['Frango Congelado', 'Peru Congelado'],
        markets: ['Japão', 'Arábia Saudita', 'China'], status: 'ATIVA',
        issueDate: new Date('2023-03-10'), expirationDate: new Date('2025-03-10'),
        lastAudit: new Date('2024-08-15')
      },
      {
        id: 'HAB-003', establishment: 'AgroBrasil Exportações Ltda', cnpj: '12.345.678/0001-90',
        sifNumber: 'SIF-3456', products: ['Soja em Grãos', 'Milho em Grãos', 'Farelo de Soja'],
        markets: ['China', 'EU', 'Japão', 'EUA'], status: 'ATIVA',
        issueDate: new Date('2022-11-20'), expirationDate: new Date('2024-11-20'),
        lastAudit: new Date('2024-11-10')
      },
      {
        id: 'HAB-004', establishment: 'Café Premium Export S.A.', cnpj: '23.456.789/0001-01',
        sifNumber: 'SIF-4567', products: ['Café Arábica Cru'],
        markets: ['EU', 'EUA', 'Japão'], status: 'ATIVA',
        issueDate: new Date('2023-09-01'), expirationDate: new Date('2025-09-01'),
        lastAudit: new Date('2024-07-22')
      },
      {
        id: 'HAB-005', establishment: 'Tropical Fruits Co.', cnpj: '01.234.567/0001-89',
        sifNumber: 'SIF-5678', products: ['Manga Fresca', 'Laranja in Natura'],
        markets: ['EU', 'EUA'], status: 'SUSPENSA',
        issueDate: new Date('2023-01-15'), expirationDate: new Date('2025-01-15'),
        lastAudit: new Date('2024-10-05')
      },
      {
        id: 'HAB-006', establishment: 'Citrus Valley Ltda', cnpj: '45.678.901/0001-23',
        sifNumber: 'SIF-6789', products: ['Laranja in Natura', 'Suco de Laranja Concentrado'],
        markets: ['EUA', 'EU'], status: 'EM_RENOVAÇÃO',
        issueDate: new Date('2022-08-10'), expirationDate: new Date('2024-08-10'),
        lastAudit: new Date('2024-06-30')
      },
      {
        id: 'HAB-007', establishment: 'Sugar Mills International', cnpj: '78.901.234/0001-56',
        sifNumber: 'SIF-7890', products: ['Açúcar Cristal'],
        markets: ['Índia', 'China'], status: 'VENCIDA',
        issueDate: new Date('2022-05-01'), expirationDate: new Date('2024-05-01'),
        lastAudit: new Date('2024-03-15')
      }
    ];
  }
}
