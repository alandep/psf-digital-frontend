import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Navio,
  VesselType,
  VesselStatus,
  NavioKPIs,
  NavioFilters,
  PortCall
} from '../types/navios';

@Injectable({
  providedIn: 'root'
})
export class NaviosMockService {

  private navios: Navio[] = [];

  constructor() {
    this.initializeMockData();
  }

  getNavios(filters?: NavioFilters): Observable<Navio[]> {
    let result = [...this.navios];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(n =>
          n.vesselName.toLowerCase().includes(search) ||
          n.imoNumber.toLowerCase().includes(search) ||
          n.currentPort.toLowerCase().includes(search) ||
          n.voyageNumber.toLowerCase().includes(search)
        );
      }
      if (filters.vesselType) {
        result = result.filter(n => n.vesselType === filters.vesselType);
      }
      if (filters.status) {
        result = result.filter(n => n.status === filters.status);
      }
      if (filters.flag) {
        result = result.filter(n => n.flag === filters.flag);
      }
      if (filters.port) {
        result = result.filter(n => n.currentPort === filters.port || n.nextPort === filters.port);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getKPIs(): Observable<NavioKPIs> {
    const now = new Date();
    const kpis: NavioKPIs = {
      totalRastreados: this.navios.length,
      emTransito: this.navios.filter(n => n.status === 'EM_TRANSITO').length,
      noPorto: this.navios.filter(n => n.status === 'NO_PORTO' || n.status === 'CARREGANDO' || n.status === 'DESCARREGANDO').length,
      comAlertaAtraso: this.navios.filter(n => {
        const diff = Math.abs(new Date(n.eta).getTime() - new Date(n.originalEta).getTime());
        return diff > 24 * 60 * 60 * 1000;
      }).length
    };
    return of(kpis).pipe(delay(this.randomDelay()));
  }

  getPortCalls(navioId: string): Observable<PortCall[]> {
    const navio = this.navios.find(n => n.id === navioId);
    return of(navio?.portCalls || []).pipe(delay(this.randomDelay()));
  }

  getVesselTypes(): VesselType[] {
    return ['BULK_CARRIER', 'CONTAINER_SHIP', 'TANKER', 'REEFER', 'RORO', 'GENERAL_CARGO'];
  }

  getStatuses(): VesselStatus[] {
    return ['EM_TRANSITO', 'NO_PORTO', 'FUNDEADO', 'EM_MANUTENCAO', 'ATRASADO', 'CARREGANDO', 'DESCARREGANDO'];
  }

  getFlags(): string[] {
    return ['Brasil', 'Panamá', 'Libéria', 'Ilhas Marshall', 'Bahamas', 'Singapura', 'Hong Kong', 'Grécia'];
  }

  getPorts(): string[] {
    return ['Santos', 'Paranaguá', 'Rio Grande', 'Itajaí', 'Tubarão', 'São Luís', 'Manaus', 'Salvador'];
  }

  private randomDelay(): number {
    return Math.floor(Math.random() * 300) + 200;
  }

  private initializeMockData(): void {
    this.navios = [
      {
        id: 'NAV-001', vesselName: 'MV Santos Star', imoNumber: '9876543', flag: 'Panamá',
        vesselType: 'BULK_CARRIER', capacity: 75000, capacityUnit: 'DWT', currentPort: 'Santos',
        nextPort: 'Shanghai', eta: new Date('2024-10-15'), originalEta: new Date('2024-10-15'),
        etd: new Date('2024-09-01'), status: 'CARREGANDO', owner: 'Pacific Bulk Shipping',
        operator: 'Cargill Ocean Transport', yearBuilt: 2018, length: 229, beam: 32, draft: 14.5,
        grossTonnage: 43000, deadweight: 75000, linkedShipments: ['EMB-2024-001', 'EMB-2024-002'],
        lastUpdate: new Date(), route: 'Santos → Shanghai', speed: 0, voyageNumber: 'VOY-2024-055',
        portCalls: [
          { port: 'Santos', country: 'Brasil', arrivalDate: new Date('2024-08-28'), departureDate: new Date('2024-09-01'), purpose: 'Loading', cargoOps: '65,000 MT soja' },
          { port: 'Cape Town', country: 'África do Sul', arrivalDate: new Date('2024-09-18'), departureDate: new Date('2024-09-19'), purpose: 'Bunkers', cargoOps: 'Abastecimento' },
          { port: 'Shanghai', country: 'China', arrivalDate: new Date('2024-10-15'), departureDate: new Date('2024-10-18'), purpose: 'Discharge', cargoOps: 'Descarga total' }
        ]
      },
      {
        id: 'NAV-002', vesselName: 'MV Paranaguá Voyager', imoNumber: '9812345', flag: 'Libéria',
        vesselType: 'BULK_CARRIER', capacity: 82000, capacityUnit: 'DWT', currentPort: 'Em alto mar',
        nextPort: 'Paranaguá', eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), originalEta: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        etd: new Date('2024-08-15'), status: 'ATRASADO', owner: 'Oldendorff Carriers',
        operator: 'Louis Dreyfus Company', yearBuilt: 2020, length: 235, beam: 33, draft: 15.0,
        grossTonnage: 45000, deadweight: 82000, linkedShipments: ['EMB-2024-005'],
        lastUpdate: new Date(), route: 'Houston → Paranaguá', speed: 11.5, voyageNumber: 'VOY-2024-062',
        portCalls: [
          { port: 'Houston', country: 'EUA', arrivalDate: new Date('2024-08-10'), departureDate: new Date('2024-08-15'), purpose: 'Discharge', cargoOps: 'Descarga fertilizantes' },
          { port: 'Paranaguá', country: 'Brasil', arrivalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), departureDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), purpose: 'Loading', cargoOps: '72,000 MT milho' }
        ]
      },
      {
        id: 'NAV-003', vesselName: 'MV Atlantic Breeze', imoNumber: '9765432', flag: 'Ilhas Marshall',
        vesselType: 'CONTAINER_SHIP', capacity: 4500, capacityUnit: 'TEU', currentPort: 'Em alto mar',
        nextPort: 'Rotterdam', eta: new Date('2024-09-28'), originalEta: new Date('2024-09-28'),
        etd: new Date('2024-09-05'), status: 'EM_TRANSITO', owner: 'Hapag-Lloyd',
        operator: 'Hapag-Lloyd', yearBuilt: 2019, length: 300, beam: 42, draft: 13.5,
        grossTonnage: 55000, deadweight: 65000, linkedShipments: ['EMB-2024-008', 'EMB-2024-009'],
        lastUpdate: new Date(), route: 'Santos → Rotterdam', speed: 18.2, voyageNumber: 'VOY-2024-078',
        portCalls: [
          { port: 'Santos', country: 'Brasil', arrivalDate: new Date('2024-09-02'), departureDate: new Date('2024-09-05'), purpose: 'Loading', cargoOps: '1,200 TEU café/suco' },
          { port: 'Rotterdam', country: 'Holanda', arrivalDate: new Date('2024-09-28'), departureDate: new Date('2024-10-01'), purpose: 'Discharge', cargoOps: 'Descarga parcial' }
        ]
      },
      {
        id: 'NAV-004', vesselName: 'MV Rio Grande Express', imoNumber: '9654321', flag: 'Brasil',
        vesselType: 'REEFER', capacity: 12000, capacityUnit: 'MT', currentPort: 'Rio Grande',
        nextPort: 'Jeddah', eta: new Date('2024-10-20'), originalEta: new Date('2024-10-18'),
        etd: new Date('2024-09-10'), status: 'NO_PORTO', owner: 'Norsul SA',
        operator: 'JBS Transportes', yearBuilt: 2016, length: 180, beam: 28, draft: 10.5,
        grossTonnage: 18000, deadweight: 22000, linkedShipments: ['EMB-2024-012'],
        lastUpdate: new Date(), route: 'Rio Grande → Jeddah', speed: 0, voyageNumber: 'VOY-2024-091',
        portCalls: [
          { port: 'Rio Grande', country: 'Brasil', arrivalDate: new Date('2024-09-07'), departureDate: new Date('2024-09-10'), purpose: 'Loading', cargoOps: '10,500 MT carne bovina' },
          { port: 'Jeddah', country: 'Arábia Saudita', arrivalDate: new Date('2024-10-20'), departureDate: new Date('2024-10-22'), purpose: 'Discharge', cargoOps: 'Descarga total' }
        ]
      },
      {
        id: 'NAV-005', vesselName: 'MV Cerrado Bulk', imoNumber: '9543210', flag: 'Bahamas',
        vesselType: 'BULK_CARRIER', capacity: 95000, capacityUnit: 'DWT', currentPort: 'Em alto mar',
        nextPort: 'Tubarão', eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), originalEta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        etd: new Date('2024-08-20'), status: 'EM_TRANSITO', owner: 'Vale SA',
        operator: 'Vale SA', yearBuilt: 2021, length: 250, beam: 43, draft: 16.5,
        grossTonnage: 52000, deadweight: 95000, linkedShipments: ['EMB-2024-015'],
        lastUpdate: new Date(), route: 'Qingdao → Tubarão', speed: 13.8, voyageNumber: 'VOY-2024-103',
        portCalls: [
          { port: 'Qingdao', country: 'China', arrivalDate: new Date('2024-08-15'), departureDate: new Date('2024-08-20'), purpose: 'Discharge', cargoOps: 'Descarga minério' },
          { port: 'Tubarão', country: 'Brasil', arrivalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), purpose: 'Loading', cargoOps: '88,000 MT minério de ferro' }
        ]
      },
      {
        id: 'NAV-006', vesselName: 'MV Tropical Harvest', imoNumber: '9432109', flag: 'Singapura',
        vesselType: 'BULK_CARRIER', capacity: 68000, capacityUnit: 'DWT', currentPort: 'Itajaí',
        nextPort: 'Antwerp', eta: new Date('2024-10-05'), originalEta: new Date('2024-10-05'),
        etd: new Date('2024-09-12'), status: 'DESCARREGANDO', owner: 'Golden Ocean Group',
        operator: 'Bunge Shipping', yearBuilt: 2017, length: 220, beam: 32, draft: 14.0,
        grossTonnage: 39000, deadweight: 68000, linkedShipments: ['EMB-2024-018'],
        lastUpdate: new Date(), route: 'Itajaí → Antwerp', speed: 0, voyageNumber: 'VOY-2024-115',
        portCalls: [
          { port: 'Itajaí', country: 'Brasil', arrivalDate: new Date('2024-09-08'), departureDate: new Date('2024-09-12'), purpose: 'Loading', cargoOps: '55,000 MT farelo de soja' },
          { port: 'Antwerp', country: 'Bélgica', arrivalDate: new Date('2024-10-05'), departureDate: new Date('2024-10-08'), purpose: 'Discharge', cargoOps: 'Descarga total' }
        ]
      },
      {
        id: 'NAV-007', vesselName: 'MV Amazon River', imoNumber: '9321098', flag: 'Brasil',
        vesselType: 'GENERAL_CARGO', capacity: 15000, capacityUnit: 'DWT', currentPort: 'São Luís',
        nextPort: 'Manaus', eta: new Date('2024-09-18'), originalEta: new Date('2024-09-16'),
        etd: new Date('2024-09-14'), status: 'FUNDEADO', owner: 'ANTAQ Navegação',
        operator: 'Hidrovias do Brasil', yearBuilt: 2014, length: 150, beam: 22, draft: 8.0,
        grossTonnage: 12000, deadweight: 15000, linkedShipments: ['EMB-2024-020'],
        lastUpdate: new Date(), route: 'São Luís → Manaus', speed: 0, voyageNumber: 'VOY-2024-122',
        portCalls: [
          { port: 'São Luís', country: 'Brasil', arrivalDate: new Date('2024-09-11'), departureDate: new Date('2024-09-14'), purpose: 'Loading', cargoOps: 'Carga geral' },
          { port: 'Manaus', country: 'Brasil', arrivalDate: new Date('2024-09-18'), departureDate: new Date('2024-09-20'), purpose: 'Discharge', cargoOps: 'Descarga parcial' }
        ]
      },
      {
        id: 'NAV-008', vesselName: 'MV Southern Cross', imoNumber: '9210987', flag: 'Hong Kong',
        vesselType: 'TANKER', capacity: 110000, capacityUnit: 'DWT', currentPort: 'Em alto mar',
        nextPort: 'Santos', eta: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), originalEta: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        etd: new Date('2024-08-25'), status: 'EM_TRANSITO', owner: 'Petrobras Transporte',
        operator: 'Transpetro', yearBuilt: 2015, length: 274, beam: 48, draft: 17.0,
        grossTonnage: 62000, deadweight: 110000, linkedShipments: [],
        lastUpdate: new Date(), route: 'Ras Tanura → Santos', speed: 14.5, voyageNumber: 'VOY-2024-088',
        portCalls: [
          { port: 'Ras Tanura', country: 'Arábia Saudita', arrivalDate: new Date('2024-08-20'), departureDate: new Date('2024-08-25'), purpose: 'Loading', cargoOps: '95,000 MT petróleo bruto' },
          { port: 'Santos', country: 'Brasil', arrivalDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), departureDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), purpose: 'Discharge', cargoOps: 'Descarga total' }
        ]
      },
      {
        id: 'NAV-009', vesselName: 'MV Iguaçu Falls', imoNumber: '9109876', flag: 'Grécia',
        vesselType: 'RORO', capacity: 5000, capacityUnit: 'CEU', currentPort: 'Santos',
        nextPort: 'Buenos Aires', eta: new Date('2024-09-20'), originalEta: new Date('2024-09-20'),
        etd: new Date('2024-09-16'), status: 'NO_PORTO', owner: 'Grimaldi Lines',
        operator: 'Grimaldi Lines', yearBuilt: 2019, length: 200, beam: 32, draft: 9.5,
        grossTonnage: 45000, deadweight: 25000, linkedShipments: ['EMB-2024-025'],
        lastUpdate: new Date(), route: 'Santos → Buenos Aires', speed: 0, voyageNumber: 'VOY-2024-130',
        portCalls: [
          { port: 'Santos', country: 'Brasil', arrivalDate: new Date('2024-09-13'), departureDate: new Date('2024-09-16'), purpose: 'Loading', cargoOps: '800 veículos' },
          { port: 'Buenos Aires', country: 'Argentina', arrivalDate: new Date('2024-09-20'), departureDate: new Date('2024-09-22'), purpose: 'Discharge', cargoOps: 'Descarga veículos' }
        ]
      },
      {
        id: 'NAV-010', vesselName: 'MV Pantanal Spirit', imoNumber: '9098765', flag: 'Panamá',
        vesselType: 'BULK_CARRIER', capacity: 58000, capacityUnit: 'DWT', currentPort: 'Salvador',
        nextPort: 'Lagos', eta: new Date('2024-10-08'), originalEta: new Date('2024-10-05'),
        etd: new Date('2024-09-18'), status: 'EM_MANUTENCAO', owner: 'Star Bulk Carriers',
        operator: 'ADM Shipping', yearBuilt: 2013, length: 190, beam: 30, draft: 13.0,
        grossTonnage: 33000, deadweight: 58000, linkedShipments: ['EMB-2024-028'],
        lastUpdate: new Date(), route: 'Salvador → Lagos', speed: 0, voyageNumber: 'VOY-2024-138',
        portCalls: [
          { port: 'Salvador', country: 'Brasil', arrivalDate: new Date('2024-09-14'), departureDate: new Date('2024-09-18'), purpose: 'Loading/Maintenance', cargoOps: '45,000 MT açúcar' },
          { port: 'Lagos', country: 'Nigéria', arrivalDate: new Date('2024-10-08'), departureDate: new Date('2024-10-11'), purpose: 'Discharge', cargoOps: 'Descarga total' }
        ]
      },
      {
        id: 'NAV-011', vesselName: 'MV Copacabana Bay', imoNumber: '9987654', flag: 'Libéria',
        vesselType: 'CONTAINER_SHIP', capacity: 8500, capacityUnit: 'TEU', currentPort: 'Em alto mar',
        nextPort: 'Santos', eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), originalEta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        etd: new Date('2024-09-01'), status: 'EM_TRANSITO', owner: 'MSC',
        operator: 'MSC Mediterranean Shipping', yearBuilt: 2022, length: 336, beam: 48, draft: 14.5,
        grossTonnage: 95000, deadweight: 108000, linkedShipments: ['EMB-2024-030', 'EMB-2024-031'],
        lastUpdate: new Date(), route: 'Le Havre → Santos', speed: 20.1, voyageNumber: 'VOY-2024-145',
        portCalls: [
          { port: 'Le Havre', country: 'França', arrivalDate: new Date('2024-08-28'), departureDate: new Date('2024-09-01'), purpose: 'Loading', cargoOps: '3,500 TEU' },
          { port: 'Santos', country: 'Brasil', arrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), departureDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), purpose: 'Discharge/Loading', cargoOps: '2,800 TEU descarga + 1,200 TEU embarque' }
        ]
      },
      {
        id: 'NAV-012', vesselName: 'MV Carajás Pioneer', imoNumber: '9876501', flag: 'Brasil',
        vesselType: 'BULK_CARRIER', capacity: 400000, capacityUnit: 'DWT', currentPort: 'Em alto mar',
        nextPort: 'Qingdao', eta: new Date('2024-10-25'), originalEta: new Date('2024-10-22'),
        etd: new Date('2024-09-05'), status: 'ATRASADO', owner: 'Vale SA',
        operator: 'Vale SA', yearBuilt: 2023, length: 362, beam: 65, draft: 23.0,
        grossTonnage: 200000, deadweight: 400000, linkedShipments: ['EMB-2024-035'],
        lastUpdate: new Date(), route: 'Tubarão → Qingdao', speed: 12.8, voyageNumber: 'VOY-2024-098',
        portCalls: [
          { port: 'Tubarão', country: 'Brasil', arrivalDate: new Date('2024-08-30'), departureDate: new Date('2024-09-05'), purpose: 'Loading', cargoOps: '380,000 MT minério de ferro' },
          { port: 'Qingdao', country: 'China', arrivalDate: new Date('2024-10-25'), departureDate: new Date('2024-10-30'), purpose: 'Discharge', cargoOps: 'Descarga total' }
        ]
      }
    ];
  }
}
