import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Container,
  ContainerSize,
  ContainerType,
  ContainerStatus,
  ContainerKPIs,
  ContainerFilters
} from '../types/containers';

@Injectable({
  providedIn: 'root'
})
export class ContainersMockService {

  private containers: Container[] = [];

  constructor() {
    this.initializeMockData();
  }

  getContainers(filters?: ContainerFilters): Observable<Container[]> {
    let result = [...this.containers];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(c =>
          c.containerNumber.toLowerCase().includes(search) ||
          c.vessel.toLowerCase().includes(search) ||
          c.bookingRef.toLowerCase().includes(search) ||
          c.currentLocation.toLowerCase().includes(search)
        );
      }
      if (filters.size) {
        result = result.filter(c => c.size === filters.size);
      }
      if (filters.type) {
        result = result.filter(c => c.type === filters.type);
      }
      if (filters.status) {
        result = result.filter(c => c.status === filters.status);
      }
      if (filters.vessel) {
        result = result.filter(c => c.vessel === filters.vessel);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getKPIs(): Observable<ContainerKPIs> {
    const ativos = this.containers.filter(c => c.status !== 'RETURNED');
    const emRisco = this.containers.filter(c => c.freeDaysRemaining <= 2 && c.freeDaysRemaining > 0);
    const kpis: ContainerKPIs = {
      totalAtivos: ativos.length,
      riscoDemurrage: emRisco.length,
      custoDemurrageTotal: this.containers.reduce((sum, c) => sum + c.totalDemurrageCost, 0),
      dwellTimeMedio: 4.2
    };
    return of(kpis).pipe(delay(this.randomDelay()));
  }

  getSizes(): ContainerSize[] {
    return ['20FT', '40FT', '40HC', '45HC'];
  }

  getTypes(): ContainerType[] {
    return ['DRY', 'REEFER', 'OPEN_TOP', 'FLAT_RACK', 'TANK'];
  }

  getStatuses(): ContainerStatus[] {
    return ['BOOKED', 'GATE_IN', 'LOADED', 'IN_TRANSIT', 'ARRIVED', 'GATE_OUT', 'RETURNED', 'DETAINED'];
  }

  getVessels(): string[] {
    return ['MV Santos Star', 'MV Atlantic Breeze', 'MV Copacabana Bay', 'MV Tropical Harvest', 'MV Rio Grande Express'];
  }

  private randomDelay(): number {
    return Math.floor(Math.random() * 300) + 200;
  }

  private initializeMockData(): void {
    this.containers = [
      {
        id: 'CNT-001', containerNumber: 'MSCU1234567', size: '40HC', type: 'DRY', status: 'IN_TRANSIT',
        currentLocation: 'Atlântico Sul', vessel: 'MV Atlantic Breeze', bookingRef: 'BKG-2024-001',
        blNumber: 'BL-2024-0089', shipper: 'Agro Export Brasil Ltda', consignee: 'Rotterdam Traders BV',
        commodity: 'Café Arábica Premium', weight: 24500, sealNumber: 'BR2024001',
        freeDays: 14, freeDaysRemaining: 8, gateInDate: new Date('2024-08-28'),
        gateOutDate: null, loadDate: new Date('2024-09-02'), dischargeDate: null,
        returnDate: null, demurrageRate: 150, detentionRate: 100, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Rotterdam', portOfLoading: 'Santos', portOfDischarge: 'Rotterdam',
        linkedExport: 'EXP-2024-042'
      },
      {
        id: 'CNT-002', containerNumber: 'HLCU7654321', size: '40FT', type: 'REEFER', status: 'LOADED',
        currentLocation: 'Porto de Santos', vessel: 'MV Rio Grande Express', bookingRef: 'BKG-2024-002',
        blNumber: 'BL-2024-0092', shipper: 'JBS SA', consignee: 'Dubai Import LLC',
        commodity: 'Carne Bovina Congelada', weight: 22000, sealNumber: 'BR2024002',
        freeDays: 7, freeDaysRemaining: 3, gateInDate: new Date('2024-09-05'),
        gateOutDate: null, loadDate: new Date('2024-09-08'), dischargeDate: null,
        returnDate: null, demurrageRate: 250, detentionRate: 180, totalDemurrageCost: 0,
        temperature: -18, humidity: 85, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Jebel Ali', portOfLoading: 'Santos', portOfDischarge: 'Jebel Ali',
        linkedExport: 'EXP-2024-058'
      },
      {
        id: 'CNT-003', containerNumber: 'MAEU9876543', size: '20FT', type: 'DRY', status: 'GATE_IN',
        currentLocation: 'Terminal Santos Brasil', vessel: 'MV Santos Star', bookingRef: 'BKG-2024-003',
        blNumber: '', shipper: 'Brazilian Commodities SA', consignee: 'Shanghai Trading Co.',
        commodity: 'Soja em Grãos', weight: 0, sealNumber: '',
        freeDays: 10, freeDaysRemaining: 9, gateInDate: new Date('2024-09-10'),
        gateOutDate: null, loadDate: null, dischargeDate: null,
        returnDate: null, demurrageRate: 120, detentionRate: 80, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Shanghai', portOfLoading: 'Santos', portOfDischarge: 'Shanghai',
        linkedExport: 'EXP-2024-063'
      },
      {
        id: 'CNT-004', containerNumber: 'CMAU1122334', size: '40HC', type: 'DRY', status: 'ARRIVED',
        currentLocation: 'Porto de Rotterdam', vessel: 'MV Copacabana Bay', bookingRef: 'BKG-2024-004',
        blNumber: 'BL-2024-0078', shipper: 'Export Excellence Corp', consignee: 'Hamburg Import GmbH',
        commodity: 'Celulose', weight: 26000, sealNumber: 'BR2024004',
        freeDays: 14, freeDaysRemaining: -2, gateInDate: new Date('2024-08-15'),
        gateOutDate: null, loadDate: new Date('2024-08-20'), dischargeDate: new Date('2024-09-08'),
        returnDate: null, demurrageRate: 180, detentionRate: 120, totalDemurrageCost: 360,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Hamburg', portOfLoading: 'Santos', portOfDischarge: 'Rotterdam',
        linkedExport: 'EXP-2024-035'
      },
      {
        id: 'CNT-005', containerNumber: 'TCNU5566778', size: '40FT', type: 'OPEN_TOP', status: 'BOOKED',
        currentLocation: 'Depot Santos', vessel: 'MV Tropical Harvest', bookingRef: 'BKG-2024-005',
        blNumber: '', shipper: 'Agro Export Brasil Ltda', consignee: 'Tokyo Foods Inc',
        commodity: 'Máquinas Agrícolas', weight: 0, sealNumber: '',
        freeDays: 7, freeDaysRemaining: 7, gateInDate: null,
        gateOutDate: null, loadDate: null, dischargeDate: null,
        returnDate: null, demurrageRate: 200, detentionRate: 150, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Itajaí', destination: 'Yokohama', portOfLoading: 'Itajaí', portOfDischarge: 'Yokohama',
        linkedExport: 'EXP-2024-072'
      },
      {
        id: 'CNT-006', containerNumber: 'EISU8899001', size: '40HC', type: 'DRY', status: 'GATE_OUT',
        currentLocation: 'Em trânsito rodoviário', vessel: 'MV Atlantic Breeze', bookingRef: 'BKG-2024-006',
        blNumber: 'BL-2024-0095', shipper: 'Brazilian Commodities SA', consignee: 'London Commodities Ltd',
        commodity: 'Açúcar Cristal', weight: 25000, sealNumber: 'BR2024006',
        freeDays: 14, freeDaysRemaining: 5, gateInDate: new Date('2024-08-20'),
        gateOutDate: new Date('2024-09-12'), loadDate: new Date('2024-08-25'), dischargeDate: new Date('2024-09-10'),
        returnDate: null, demurrageRate: 150, detentionRate: 100, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Santos', destination: 'London', portOfLoading: 'Santos', portOfDischarge: 'Tilbury',
        linkedExport: 'EXP-2024-048'
      },
      {
        id: 'CNT-007', containerNumber: 'OOLU2233445', size: '20FT', type: 'TANK', status: 'IN_TRANSIT',
        currentLocation: 'Oceano Índico', vessel: 'MV Santos Star', bookingRef: 'BKG-2024-007',
        blNumber: 'BL-2024-0101', shipper: 'Petrobras Export', consignee: 'Mumbai Traders Pvt Ltd',
        commodity: 'Etanol Anidro', weight: 18000, sealNumber: 'BR2024007',
        freeDays: 21, freeDaysRemaining: 12, gateInDate: new Date('2024-08-18'),
        gateOutDate: null, loadDate: new Date('2024-08-22'), dischargeDate: null,
        returnDate: null, demurrageRate: 300, detentionRate: 200, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Mumbai', portOfLoading: 'Santos', portOfDischarge: 'Mumbai',
        linkedExport: 'EXP-2024-055'
      },
      {
        id: 'CNT-008', containerNumber: 'SUDU3344556', size: '40HC', type: 'DRY', status: 'RETURNED',
        currentLocation: 'Depot Guarujá', vessel: 'MV Copacabana Bay', bookingRef: 'BKG-2024-008',
        blNumber: 'BL-2024-0065', shipper: 'Export Excellence Corp', consignee: 'Buenos Aires Trading SA',
        commodity: 'Papel Kraft', weight: 0, sealNumber: 'BR2024008',
        freeDays: 10, freeDaysRemaining: 10, gateInDate: new Date('2024-07-20'),
        gateOutDate: new Date('2024-08-28'), loadDate: new Date('2024-07-25'), dischargeDate: new Date('2024-08-20'),
        returnDate: new Date('2024-09-01'), demurrageRate: 150, detentionRate: 100, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Paranaguá', destination: 'Buenos Aires', portOfLoading: 'Paranaguá', portOfDischarge: 'Buenos Aires',
        linkedExport: 'EXP-2024-031'
      },
      {
        id: 'CNT-009', containerNumber: 'MSKU4455667', size: '40FT', type: 'REEFER', status: 'DETAINED',
        currentLocation: 'Porto de Santos - Inspeção', vessel: 'MV Rio Grande Express', bookingRef: 'BKG-2024-009',
        blNumber: 'BL-2024-0088', shipper: 'Agro Export Brasil Ltda', consignee: 'Cairo Trading Est',
        commodity: 'Frango Congelado', weight: 21000, sealNumber: 'BR2024009',
        freeDays: 7, freeDaysRemaining: -5, gateInDate: new Date('2024-08-25'),
        gateOutDate: null, loadDate: null, dischargeDate: null,
        returnDate: null, demurrageRate: 280, detentionRate: 200, totalDemurrageCost: 1400,
        temperature: -22, humidity: 90, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Alexandria', portOfLoading: 'Santos', portOfDischarge: 'Alexandria',
        linkedExport: 'EXP-2024-068'
      },
      {
        id: 'CNT-010', containerNumber: 'APLU5566778', size: '45HC', type: 'DRY', status: 'IN_TRANSIT',
        currentLocation: 'Atlântico Norte', vessel: 'MV Atlantic Breeze', bookingRef: 'BKG-2024-010',
        blNumber: 'BL-2024-0105', shipper: 'Brazilian Commodities SA', consignee: 'Amsterdam Grains BV',
        commodity: 'Milho em Grãos', weight: 27000, sealNumber: 'BR2024010',
        freeDays: 14, freeDaysRemaining: 6, gateInDate: new Date('2024-08-30'),
        gateOutDate: null, loadDate: new Date('2024-09-03'), dischargeDate: null,
        returnDate: null, demurrageRate: 160, detentionRate: 110, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Paranaguá', destination: 'Amsterdam', portOfLoading: 'Paranaguá', portOfDischarge: 'Amsterdam',
        linkedExport: 'EXP-2024-075'
      },
      {
        id: 'CNT-011', containerNumber: 'CSQU6677889', size: '20FT', type: 'FLAT_RACK', status: 'LOADED',
        currentLocation: 'Porto de Itajaí', vessel: 'MV Tropical Harvest', bookingRef: 'BKG-2024-011',
        blNumber: 'BL-2024-0110', shipper: 'Export Excellence Corp', consignee: 'Singapore Agri Pte Ltd',
        commodity: 'Peças Industriais', weight: 15000, sealNumber: 'BR2024011',
        freeDays: 7, freeDaysRemaining: 2, gateInDate: new Date('2024-09-06'),
        gateOutDate: null, loadDate: new Date('2024-09-09'), dischargeDate: null,
        returnDate: null, demurrageRate: 350, detentionRate: 250, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Itajaí', destination: 'Singapore', portOfLoading: 'Itajaí', portOfDischarge: 'Singapore',
        linkedExport: 'EXP-2024-082'
      },
      {
        id: 'CNT-012', containerNumber: 'TRLU7788990', size: '40HC', type: 'DRY', status: 'ARRIVED',
        currentLocation: 'Porto de Jebel Ali', vessel: 'MV Santos Star', bookingRef: 'BKG-2024-012',
        blNumber: 'BL-2024-0072', shipper: 'Agro Export Brasil Ltda', consignee: 'Dubai Import LLC',
        commodity: 'Soja Processada', weight: 24000, sealNumber: 'BR2024012',
        freeDays: 10, freeDaysRemaining: -3, gateInDate: new Date('2024-08-05'),
        gateOutDate: null, loadDate: new Date('2024-08-10'), dischargeDate: new Date('2024-09-05'),
        returnDate: null, demurrageRate: 200, detentionRate: 140, totalDemurrageCost: 600,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Jebel Ali', portOfLoading: 'Santos', portOfDischarge: 'Jebel Ali',
        linkedExport: 'EXP-2024-038'
      },
      {
        id: 'CNT-013', containerNumber: 'ZIMU8899001', size: '40FT', type: 'DRY', status: 'GATE_IN',
        currentLocation: 'Terminal Embraport', vessel: 'MV Copacabana Bay', bookingRef: 'BKG-2024-013',
        blNumber: '', shipper: 'Brazilian Commodities SA', consignee: 'Lagos Import Co',
        commodity: 'Farelo de Soja', weight: 0, sealNumber: '',
        freeDays: 10, freeDaysRemaining: 8, gateInDate: new Date('2024-09-11'),
        gateOutDate: null, loadDate: null, dischargeDate: null,
        returnDate: null, demurrageRate: 150, detentionRate: 100, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Lagos', portOfLoading: 'Santos', portOfDischarge: 'Lagos',
        linkedExport: 'EXP-2024-085'
      },
      {
        id: 'CNT-014', containerNumber: 'YMLU9900112', size: '40HC', type: 'REEFER', status: 'IN_TRANSIT',
        currentLocation: 'Pacífico Sul', vessel: 'MV Rio Grande Express', bookingRef: 'BKG-2024-014',
        blNumber: 'BL-2024-0115', shipper: 'JBS SA', consignee: 'Tokyo Foods Inc',
        commodity: 'Carne Suína Resfriada', weight: 20000, sealNumber: 'BR2024014',
        freeDays: 7, freeDaysRemaining: 1, gateInDate: new Date('2024-09-01'),
        gateOutDate: null, loadDate: new Date('2024-09-04'), dischargeDate: null,
        returnDate: null, demurrageRate: 280, detentionRate: 200, totalDemurrageCost: 0,
        temperature: -2, humidity: 88, lastUpdate: new Date(),
        origin: 'Rio Grande', destination: 'Yokohama', portOfLoading: 'Rio Grande', portOfDischarge: 'Yokohama',
        linkedExport: 'EXP-2024-090'
      },
      {
        id: 'CNT-015', containerNumber: 'HDMU1011223', size: '20FT', type: 'DRY', status: 'BOOKED',
        currentLocation: 'Depot Paranaguá', vessel: 'MV Tropical Harvest', bookingRef: 'BKG-2024-015',
        blNumber: '', shipper: 'Export Excellence Corp', consignee: 'Mumbai Traders Pvt Ltd',
        commodity: 'Tabaco em Folha', weight: 0, sealNumber: '',
        freeDays: 14, freeDaysRemaining: 14, gateInDate: null,
        gateOutDate: null, loadDate: null, dischargeDate: null,
        returnDate: null, demurrageRate: 120, detentionRate: 80, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Paranaguá', destination: 'Mumbai', portOfLoading: 'Paranaguá', portOfDischarge: 'Mumbai',
        linkedExport: 'EXP-2024-092'
      },
      {
        id: 'CNT-016', containerNumber: 'KKFU2122334', size: '40HC', type: 'DRY', status: 'IN_TRANSIT',
        currentLocation: 'Canal de Suez', vessel: 'MV Santos Star', bookingRef: 'BKG-2024-016',
        blNumber: 'BL-2024-0120', shipper: 'Agro Export Brasil Ltda', consignee: 'Shanghai Trading Co.',
        commodity: 'Algodão em Pluma', weight: 23000, sealNumber: 'BR2024016',
        freeDays: 21, freeDaysRemaining: 15, gateInDate: new Date('2024-08-22'),
        gateOutDate: null, loadDate: new Date('2024-08-26'), dischargeDate: null,
        returnDate: null, demurrageRate: 150, detentionRate: 100, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Shanghai', portOfLoading: 'Santos', portOfDischarge: 'Shanghai',
        linkedExport: 'EXP-2024-095'
      },
      {
        id: 'CNT-017', containerNumber: 'GESU3233445', size: '40FT', type: 'DRY', status: 'ARRIVED',
        currentLocation: 'Porto de Antwerp', vessel: 'MV Copacabana Bay', bookingRef: 'BKG-2024-017',
        blNumber: 'BL-2024-0082', shipper: 'Brazilian Commodities SA', consignee: 'Amsterdam Grains BV',
        commodity: 'Minério de Ferro Pelotizado', weight: 26500, sealNumber: 'BR2024017',
        freeDays: 14, freeDaysRemaining: 0, gateInDate: new Date('2024-08-10'),
        gateOutDate: null, loadDate: new Date('2024-08-15'), dischargeDate: new Date('2024-09-08'),
        returnDate: null, demurrageRate: 180, detentionRate: 120, totalDemurrageCost: 0,
        temperature: null, humidity: null, lastUpdate: new Date(),
        origin: 'Tubarão', destination: 'Antwerp', portOfLoading: 'Tubarão', portOfDischarge: 'Antwerp',
        linkedExport: 'EXP-2024-078'
      },
      {
        id: 'CNT-018', containerNumber: 'NYKU4344556', size: '40HC', type: 'REEFER', status: 'GATE_OUT',
        currentLocation: 'Transporte terrestre - SP', vessel: 'MV Atlantic Breeze', bookingRef: 'BKG-2024-018',
        blNumber: 'BL-2024-0098', shipper: 'Citrosuco SA', consignee: 'Rotterdam Traders BV',
        commodity: 'Suco de Laranja Concentrado', weight: 23500, sealNumber: 'BR2024018',
        freeDays: 10, freeDaysRemaining: 4, gateInDate: new Date('2024-08-25'),
        gateOutDate: new Date('2024-09-10'), loadDate: new Date('2024-08-28'), dischargeDate: new Date('2024-09-08'),
        returnDate: null, demurrageRate: 250, detentionRate: 180, totalDemurrageCost: 0,
        temperature: -8, humidity: 75, lastUpdate: new Date(),
        origin: 'Santos', destination: 'Rotterdam', portOfLoading: 'Santos', portOfDischarge: 'Rotterdam',
        linkedExport: 'EXP-2024-065'
      }
    ];
  }
}
