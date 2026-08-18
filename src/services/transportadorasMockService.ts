import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Transportadora,
  ModalType,
  CarrierStatus,
  CarrierService,
  CarrierCoverage,
  CarrierFleet,
  TrackingEvent,
  PerformanceIndicator,
  CarrierAIInsights,
  TransportadoraFilters,
  TransportadoraMetrics,
  TransportSimulationRequest,
  TransportSimulationResult
} from '../types/transportadoras';

@Injectable({
  providedIn: 'root'
})
export class TransportadorasMockService {

  private transportadoras: Transportadora[] = [];
  private services: Map<string, CarrierService[]> = new Map();
  private coverage: Map<string, CarrierCoverage> = new Map();
  private fleet: Map<string, CarrierFleet> = new Map();
  private tracking: Map<string, TrackingEvent[]> = new Map();
  private performance: Map<string, PerformanceIndicator> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getTransportadoras(filters?: TransportadoraFilters): Observable<Transportadora[]> {
    let result = [...this.transportadoras];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(t =>
          t.nomeFantasia.toLowerCase().includes(search) ||
          t.razaoSocial.toLowerCase().includes(search) ||
          t.cnpj.includes(search) ||
          t.city.toLowerCase().includes(search) ||
          t.state.toLowerCase().includes(search)
        );
      }
      if (filters.modalPrincipal) {
        result = result.filter(t => t.modalPrincipal === filters.modalPrincipal);
      }
      if (filters.status) {
        result = result.filter(t => t.status === filters.status);
      }
      if (filters.state) {
        result = result.filter(t => t.state === filters.state);
      }
      if (filters.minScore !== null && filters.minScore !== undefined) {
        result = result.filter(t => t.aiScore >= filters.minScore!);
      }
      if (filters.maxCostPerTon !== null && filters.maxCostPerTon !== undefined) {
        result = result.filter(t => t.costPerTon <= filters.maxCostPerTon!);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getTransportadoraById(id: string): Observable<Transportadora | null> {
    const t = this.transportadoras.find(tr => tr.id === id) || null;
    return of(t).pipe(delay(this.randomDelay()));
  }

  createTransportadora(data: Partial<Transportadora>): Observable<Transportadora> {
    const newT: Transportadora = {
      id: `CARRIER-${Date.now()}`,
      razaoSocial: data.razaoSocial || 'Nova Transportadora LTDA',
      nomeFantasia: data.nomeFantasia || 'Nova Transportadora',
      cnpj: data.cnpj || '00.000.000/0001-00',
      modalPrincipal: data.modalPrincipal || 'RODOVIÁRIO',
      country: data.country || 'Brasil',
      state: data.state || 'SP',
      city: data.city || 'São Paulo',
      address: data.address || '',
      commercialContact: data.commercialContact || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      status: data.status || 'HOMOLOGAÇÃO',
      aiScore: data.aiScore || 70,
      avgSLA: data.avgSLA || 85,
      overallRating: data.overallRating || 3.5,
      totalDeliveries: data.totalDeliveries || 0,
      onTimeRate: data.onTimeRate || 85,
      costPerTon: data.costPerTon || 45,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transportadoras.push(newT);
    return of(newT).pipe(delay(this.randomDelay()));
  }

  getServices(carrierId: string): Observable<CarrierService[]> {
    const svcs = this.services.get(carrierId) || [];
    return of(svcs).pipe(delay(this.randomDelay()));
  }

  getCoverage(carrierId: string): Observable<CarrierCoverage> {
    const cov = this.coverage.get(carrierId) || this.generateDefaultCoverage(carrierId);
    return of(cov).pipe(delay(this.randomDelay()));
  }

  getFleet(carrierId: string): Observable<CarrierFleet> {
    const fl = this.fleet.get(carrierId) || this.generateDefaultFleet(carrierId);
    return of(fl).pipe(delay(this.randomDelay()));
  }

  getTracking(carrierId: string): Observable<TrackingEvent[]> {
    const trk = this.tracking.get(carrierId) || [];
    return of(trk).pipe(delay(this.randomDelay()));
  }

  getPerformance(carrierId: string): Observable<PerformanceIndicator> {
    const perf = this.performance.get(carrierId) || this.generateDefaultPerformance(carrierId);
    return of(perf).pipe(delay(this.randomDelay()));
  }

  getAIInsights(carrierId: string): Observable<CarrierAIInsights> {
    const carrier = this.transportadoras.find(t => t.id === carrierId);
    const insights: CarrierAIInsights = {
      carrierId,
      score: carrier?.aiScore || 75,
      bestCarrier: 'Transportes Alfa Logística',
      recommendedModal: carrier?.modalPrincipal || 'RODOVIÁRIO',
      alerts: [
        { severity: 'HIGH', message: 'SLA abaixo da meta nos últimos 7 dias', detectedAt: new Date(Date.now() - 86400000) },
        { severity: 'MEDIUM', message: 'Aumento de 12% no custo/ton no corredor Centro-Oeste', detectedAt: new Date(Date.now() - 172800000) },
        { severity: 'LOW', message: 'Nova rota ferroviária disponível via Rondonópolis', detectedAt: new Date(Date.now() - 259200000) },
        { severity: 'CRITICAL', message: 'Capacidade limitada para embarques na próxima semana', detectedAt: new Date(Date.now() - 43200000) }
      ],
      suggestions: [
        {
          action: 'Migrar 30% da carga rodoviária para modal ferroviário',
          reason: 'Análise de custo-benefício indica economia de 18% no corredor MT-Santos',
          criteria: ['Custo', 'Prazo', 'Capacidade', 'Emissões CO₂'],
          confidence: 87,
          financialImpact: 'Economia estimada de R$ 2.4M/ano',
          operationalImpact: 'Aumento de 2 dias no lead time, compensado por menor custo'
        },
        {
          action: 'Diversificar transportadoras no corredor Norte',
          reason: 'Concentração de 70% em uma única transportadora aumenta risco operacional',
          criteria: ['Risco', 'Disponibilidade', 'SLA'],
          confidence: 92,
          financialImpact: 'Redução de risco avaliada em R$ 800K',
          operationalImpact: 'Melhoria de 5% na disponibilidade de frota'
        }
      ],
      ranking: [
        { carrierName: 'Transportes Alfa Logística', score: 92, cost: 38.5, sla: 96, availability: '95%' },
        { carrierName: 'Atlas Cargo Aéreo', score: 91, cost: 120.0, sla: 99, availability: '88%' },
        { carrierName: 'JSL (Julio Simões)', score: 90, cost: 42.0, sla: 94, availability: '92%' },
        { carrierName: 'Rumo Logística SA', score: 88, cost: 28.5, sla: 91, availability: '85%' },
        { carrierName: 'MRS Logística', score: 87, cost: 30.0, sla: 90, availability: '87%' }
      ],
      executiveSummary: `Análise consolidada do portfólio de transportadoras indica performance geral de ${carrier?.aiScore || 75}/100. ` +
        'O corredor Centro-Oeste apresenta oportunidade de otimização modal com potencial economia de 18%. ' +
        'Recomenda-se diversificação de fornecedores na região Norte para mitigar risco de concentração. ' +
        'A frota disponível atende 92% da demanda projetada para os próximos 30 dias.'
    };
    return of(insights).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<TransportadoraMetrics> {
    const active = this.transportadoras.filter(t => t.status === 'ATIVA').length;
    const avgScore = Math.round(this.transportadoras.reduce((sum, t) => sum + t.aiScore, 0) / this.transportadoras.length);
    const avgSLA = Math.round(this.transportadoras.reduce((sum, t) => sum + t.avgSLA, 0) / this.transportadoras.length);
    const avgCost = +(this.transportadoras.reduce((sum, t) => sum + t.costPerTon, 0) / this.transportadoras.length).toFixed(2);

    const metrics: TransportadoraMetrics = {
      totalCarriers: this.transportadoras.length,
      activeCount: active,
      avgScore,
      avgSLA,
      avgCostPerTon: avgCost,
      totalDeliveriesMonth: 1847
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  simulateTransport(request: TransportSimulationRequest): Observable<TransportSimulationResult> {
    const eta = new Date(request.desiredDate);
    eta.setDate(eta.getDate() + 5);

    const result: TransportSimulationResult = {
      bestCarrier: 'Transportes Alfa Logística',
      estimatedCost: request.quantity * 42.5,
      estimatedTime: 5,
      eta,
      emissions: request.quantity * 0.032,
      riskLevel: 'Baixo',
      availability: '95%',
      ranking: [
        { carrierName: 'Transportes Alfa Logística', score: 92, cost: 42.5, sla: 96, availability: '95%' },
        { carrierName: 'JSL (Julio Simões)', score: 90, cost: 44.0, sla: 94, availability: '92%' },
        { carrierName: 'Rumo Logística SA', score: 88, cost: 28.5, sla: 91, availability: '85%' },
        { carrierName: 'VLI Multimodal', score: 85, cost: 35.0, sla: 89, availability: '88%' },
        { carrierName: 'Brado Logística', score: 86, cost: 31.0, sla: 90, availability: '82%' }
      ]
    };
    return of(result).pipe(delay(800));
  }

  // Synchronous helpers
  getModals(): ModalType[] {
    return ['RODOVIÁRIO', 'FERROVIÁRIO', 'MARÍTIMO', 'FLUVIAL', 'AÉREO', 'MULTIMODAL'];
  }

  getStates(): string[] {
    return ['SP', 'RJ', 'MG', 'MT', 'GO', 'PR', 'PA', 'RS', 'BA', 'SC', 'MS', 'ES'];
  }

  getStatuses(): CarrierStatus[] {
    return ['ATIVA', 'INATIVA', 'SUSPENSA', 'HOMOLOGAÇÃO'];
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  private randomDelay(): number {
    return Math.floor(Math.random() * 300) + 200;
  }

  private generateDefaultCoverage(carrierId: string): CarrierCoverage {
    return {
      carrierId,
      states: ['SP', 'MG', 'MT', 'GO', 'PR'],
      countries: ['Brasil'],
      ports: ['Santos', 'Paranaguá'],
      airports: ['GRU', 'VCP'],
      railTerminals: ['Rondonópolis', 'Alto Araguaia'],
      frequentRoutes: [
        { origin: 'Rondonópolis - MT', destination: 'Santos - SP', avgTime: 72, avgCost: 42.0, frequency: 'Diário' },
        { origin: 'Sorriso - MT', destination: 'Paranaguá - PR', avgTime: 96, avgCost: 48.0, frequency: '3x/semana' }
      ]
    };
  }

  private generateDefaultFleet(carrierId: string): CarrierFleet {
    return {
      carrierId,
      vehicleCount: 150,
      vehicleTypes: ['Bitrem Graneleiro', 'Rodotrem', 'Carreta Sider'],
      totalCapacity: 5500,
      avgFleetAge: 4.2,
      currentAvailability: 88,
      specialEquipment: ['Lona Térmica', 'Balança Embarcada'],
      trackingAvailable: true,
      technologies: ['GPS', 'Telemetria', 'Sensor de Temperatura']
    };
  }

  private generateDefaultPerformance(carrierId: string): PerformanceIndicator {
    return {
      carrierId,
      punctuality: 89,
      sla: 91,
      avgDeliveryTime: 72,
      damageRate: 0.8,
      incidentRate: 1.2,
      returnRate: 0.3,
      avgResponseTime: 2.5,
      nps: 72,
      costPerTon: 42.0,
      costPerKm: 3.8
    };
  }

  private initializeMockData(): void {
    this.transportadoras = [
      {
        id: 'CARRIER-001',
        razaoSocial: 'Transportes Alfa Logística LTDA',
        nomeFantasia: 'Transportes Alfa Logística',
        cnpj: '12.345.678/0001-90',
        modalPrincipal: 'RODOVIÁRIO',
        country: 'Brasil',
        state: 'MT',
        city: 'Rondonópolis',
        address: 'Rod. BR-364, Km 12, Distrito Industrial',
        commercialContact: 'Carlos Menezes',
        phone: '(66) 3411-5500',
        email: 'comercial@alfalogistica.com.br',
        website: 'www.alfalogistica.com.br',
        status: 'ATIVA',
        aiScore: 92,
        avgSLA: 96,
        overallRating: 4.7,
        totalDeliveries: 12450,
        onTimeRate: 95,
        costPerTon: 38.5,
        createdAt: new Date('2018-03-15'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-002',
        razaoSocial: 'Rumo Logística SA',
        nomeFantasia: 'Rumo Logística SA',
        cnpj: '23.456.789/0001-01',
        modalPrincipal: 'FERROVIÁRIO',
        country: 'Brasil',
        state: 'SP',
        city: 'Curitiba',
        address: 'Av. Presidente Juscelino, 1000, Juvevê',
        commercialContact: 'Ricardo Almeida',
        phone: '(11) 3474-8800',
        email: 'comercial@rumolog.com.br',
        website: 'www.rumolog.com',
        status: 'ATIVA',
        aiScore: 88,
        avgSLA: 91,
        overallRating: 4.3,
        totalDeliveries: 8920,
        onTimeRate: 90,
        costPerTon: 28.5,
        createdAt: new Date('2015-06-01'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-003',
        razaoSocial: 'VLI Multimodal SA',
        nomeFantasia: 'VLI Multimodal',
        cnpj: '34.567.890/0001-12',
        modalPrincipal: 'MULTIMODAL',
        country: 'Brasil',
        state: 'MG',
        city: 'Belo Horizonte',
        address: 'Av. do Contorno, 4520, Funcionários',
        commercialContact: 'Fernanda Costa',
        phone: '(31) 3299-4000',
        email: 'comercial@vli-logistica.com.br',
        website: 'www.vli-logistica.com.br',
        status: 'ATIVA',
        aiScore: 85,
        avgSLA: 89,
        overallRating: 4.1,
        totalDeliveries: 6780,
        onTimeRate: 88,
        costPerTon: 35.0,
        createdAt: new Date('2016-09-20'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-004',
        razaoSocial: 'JSL SA',
        nomeFantasia: 'JSL (Julio Simões)',
        cnpj: '45.678.901/0001-23',
        modalPrincipal: 'RODOVIÁRIO',
        country: 'Brasil',
        state: 'SP',
        city: 'Mogi das Cruzes',
        address: 'Rua Dr. Deodato Wertheimer, 1400',
        commercialContact: 'Paulo Santos',
        phone: '(11) 4795-5000',
        email: 'comercial@jsl.com.br',
        website: 'www.jsl.com.br',
        status: 'ATIVA',
        aiScore: 90,
        avgSLA: 94,
        overallRating: 4.5,
        totalDeliveries: 15200,
        onTimeRate: 93,
        costPerTon: 42.0,
        createdAt: new Date('2012-01-10'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-005',
        razaoSocial: 'Hidrovias do Brasil SA',
        nomeFantasia: 'Hidrovias do Brasil',
        cnpj: '56.789.012/0001-34',
        modalPrincipal: 'FLUVIAL',
        country: 'Brasil',
        state: 'PA',
        city: 'Barcarena',
        address: 'Terminal de Vila do Conde, s/n',
        commercialContact: 'Marcos Lima',
        phone: '(91) 3322-8000',
        email: 'comercial@hfrodobrasil.com.br',
        website: 'www.hfrodobrasil.com.br',
        status: 'ATIVA',
        aiScore: 78,
        avgSLA: 82,
        overallRating: 3.8,
        totalDeliveries: 3200,
        onTimeRate: 80,
        costPerTon: 22.0,
        createdAt: new Date('2017-04-12'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-006',
        razaoSocial: 'Log-In Logística Intermodal SA',
        nomeFantasia: 'Log-In Logística',
        cnpj: '67.890.123/0001-45',
        modalPrincipal: 'MARÍTIMO',
        country: 'Brasil',
        state: 'RJ',
        city: 'Rio de Janeiro',
        address: 'Praia de Botafogo, 501, Torre Corcovado',
        commercialContact: 'Ana Paula Reis',
        phone: '(21) 2113-8700',
        email: 'comercial@loginlogistica.com.br',
        website: 'www.loginlogistica.com.br',
        status: 'ATIVA',
        aiScore: 84,
        avgSLA: 88,
        overallRating: 4.0,
        totalDeliveries: 4100,
        onTimeRate: 86,
        costPerTon: 32.0,
        createdAt: new Date('2014-08-05'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-007',
        razaoSocial: 'Brado Logística SA',
        nomeFantasia: 'Brado Logística',
        cnpj: '78.901.234/0001-56',
        modalPrincipal: 'FERROVIÁRIO',
        country: 'Brasil',
        state: 'PR',
        city: 'Curitiba',
        address: 'Rua Emiliano Perneta, 725, Centro',
        commercialContact: 'Roberto Ferreira',
        phone: '(41) 2118-2800',
        email: 'comercial@bfrrado.com.br',
        website: 'www.brado.com.br',
        status: 'ATIVA',
        aiScore: 86,
        avgSLA: 90,
        overallRating: 4.2,
        totalDeliveries: 5600,
        onTimeRate: 89,
        costPerTon: 31.0,
        createdAt: new Date('2016-02-18'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-008',
        razaoSocial: 'Tegma Gestão Logística SA',
        nomeFantasia: 'Tegma Transportes',
        cnpj: '89.012.345/0001-67',
        modalPrincipal: 'RODOVIÁRIO',
        country: 'Brasil',
        state: 'SP',
        city: 'São Bernardo do Campo',
        address: 'Rua Marcos Penteado de Ulhôa, 75',
        commercialContact: 'Luciana Braga',
        phone: '(11) 4346-2500',
        email: 'comercial@tegma.com.br',
        website: 'www.tegma.com.br',
        status: 'ATIVA',
        aiScore: 82,
        avgSLA: 87,
        overallRating: 3.9,
        totalDeliveries: 9800,
        onTimeRate: 85,
        costPerTon: 45.0,
        createdAt: new Date('2013-11-08'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-009',
        razaoSocial: 'Transporte Central Agro LTDA',
        nomeFantasia: 'Transporte Central Agro',
        cnpj: '90.123.456/0001-78',
        modalPrincipal: 'RODOVIÁRIO',
        country: 'Brasil',
        state: 'GO',
        city: 'Goiânia',
        address: 'Rod. GO-060, Km 8, Setor Industrial',
        commercialContact: 'Antônio Oliveira',
        phone: '(62) 3250-7000',
        email: 'comercial@centralagro.com.br',
        website: 'www.centralagro.com.br',
        status: 'ATIVA',
        aiScore: 79,
        avgSLA: 84,
        overallRating: 3.7,
        totalDeliveries: 4500,
        onTimeRate: 82,
        costPerTon: 40.0,
        createdAt: new Date('2019-05-22'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-010',
        razaoSocial: 'Ferrogrão Express Logística SA',
        nomeFantasia: 'Ferrogrão Express',
        cnpj: '01.234.567/0001-89',
        modalPrincipal: 'FERROVIÁRIO',
        country: 'Brasil',
        state: 'MT',
        city: 'Sinop',
        address: 'Av. das Embaúbas, 2500, Setor Industrial',
        commercialContact: 'Eduardo Nascimento',
        phone: '(66) 3531-4000',
        email: 'comercial@ferrograo.com.br',
        website: 'www.ferrograo.com.br',
        status: 'HOMOLOGAÇÃO',
        aiScore: 75,
        avgSLA: 80,
        overallRating: 3.5,
        totalDeliveries: 1200,
        onTimeRate: 78,
        costPerTon: 26.0,
        createdAt: new Date('2021-08-14'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-011',
        razaoSocial: 'Atlas Cargo Aéreo SA',
        nomeFantasia: 'Atlas Cargo Aéreo',
        cnpj: '11.222.333/0001-44',
        modalPrincipal: 'AÉREO',
        country: 'Brasil',
        state: 'SP',
        city: 'Guarulhos',
        address: 'Aeroporto Internacional de Guarulhos, Terminal de Cargas',
        commercialContact: 'Marina Vasconcelos',
        phone: '(11) 2445-9000',
        email: 'comercial@atlascargo.com.br',
        website: 'www.atlascargo.com.br',
        status: 'ATIVA',
        aiScore: 91,
        avgSLA: 98,
        overallRating: 4.6,
        totalDeliveries: 2800,
        onTimeRate: 97,
        costPerTon: 120.0,
        createdAt: new Date('2017-12-01'),
        updatedAt: new Date()
      },
      {
        id: 'CARRIER-012',
        razaoSocial: 'MRS Logística SA',
        nomeFantasia: 'MRS Logística',
        cnpj: '22.333.444/0001-55',
        modalPrincipal: 'FERROVIÁRIO',
        country: 'Brasil',
        state: 'MG',
        city: 'Juiz de Fora',
        address: 'Av. Brasil, 2001, Centro',
        commercialContact: 'Patrícia Duarte',
        phone: '(32) 3239-5000',
        email: 'comercial@mrs.com.br',
        website: 'www.mrs.com.br',
        status: 'ATIVA',
        aiScore: 87,
        avgSLA: 90,
        overallRating: 4.2,
        totalDeliveries: 7300,
        onTimeRate: 89,
        costPerTon: 30.0,
        createdAt: new Date('2010-03-20'),
        updatedAt: new Date()
      }
    ];

    // Initialize services for each carrier
    this.transportadoras.forEach(carrier => {
      this.services.set(carrier.id, this.generateServices(carrier));
      this.coverage.set(carrier.id, this.generateCoverage(carrier));
      this.fleet.set(carrier.id, this.generateFleetData(carrier));
      this.tracking.set(carrier.id, this.generateTrackingEvents(carrier));
      this.performance.set(carrier.id, this.generatePerformanceData(carrier));
    });
  }

  private generateServices(carrier: Transportadora): CarrierService[] {
    const base: CarrierService[] = [
      {
        id: `SVC-${carrier.id}-01`,
        carrierId: carrier.id,
        serviceName: 'Transporte de Grãos a Granel',
        capacity: '37 ton/viagem',
        coverage: `${carrier.state} → Santos/Paranaguá`,
        restrictions: 'Carga seca, não fracionada',
        certifications: ['SASSMAQ', 'ISO 9001', 'ANTT Regular']
      },
      {
        id: `SVC-${carrier.id}-02`,
        carrierId: carrier.id,
        serviceName: 'Transporte de Açúcar',
        capacity: '30 ton/viagem',
        coverage: `${carrier.state} → Portos exportação`,
        restrictions: 'Ambiente controlado',
        certifications: ['SASSMAQ', 'BPF', 'ISO 22000']
      }
    ];
    return base;
  }

  private generateCoverage(carrier: Transportadora): CarrierCoverage {
    const stateMap: Record<string, string[]> = {
      'MT': ['MT', 'GO', 'MS', 'SP', 'PR'],
      'SP': ['SP', 'MG', 'RJ', 'PR', 'MS', 'MT', 'GO'],
      'MG': ['MG', 'SP', 'RJ', 'ES', 'GO', 'BA'],
      'PR': ['PR', 'SC', 'SP', 'MS', 'RS'],
      'PA': ['PA', 'MT', 'MA', 'TO', 'AP'],
      'RJ': ['RJ', 'SP', 'MG', 'ES'],
      'GO': ['GO', 'MT', 'MG', 'SP', 'MS', 'TO']
    };

    return {
      carrierId: carrier.id,
      states: stateMap[carrier.state] || ['SP', 'MG', 'RJ'],
      countries: ['Brasil'],
      ports: ['Santos', 'Paranaguá', 'São Luís', 'Barcarena'],
      airports: carrier.modalPrincipal === 'AÉREO' ? ['GRU', 'VCP', 'GIG', 'CNF'] : [],
      railTerminals: carrier.modalPrincipal === 'FERROVIÁRIO' ? ['Rondonópolis', 'Alto Araguaia', 'Santos', 'Paulínia'] : [],
      frequentRoutes: [
        { origin: 'Rondonópolis - MT', destination: 'Santos - SP', avgTime: 72, avgCost: 38.5, frequency: 'Diário' },
        { origin: 'Sorriso - MT', destination: 'Paranaguá - PR', avgTime: 96, avgCost: 44.0, frequency: '3x/semana' },
        { origin: 'Rio Verde - GO', destination: 'Santos - SP', avgTime: 48, avgCost: 35.0, frequency: 'Diário' }
      ]
    };
  }

  private generateFleetData(carrier: Transportadora): CarrierFleet {
    const fleetMap: Record<string, Partial<CarrierFleet>> = {
      'RODOVIÁRIO': { vehicleCount: 280, vehicleTypes: ['Bitrem Graneleiro', 'Rodotrem', 'Carreta Sider', 'Carreta Baú'], totalCapacity: 10000, avgFleetAge: 3.8 },
      'FERROVIÁRIO': { vehicleCount: 45, vehicleTypes: ['Vagão Hopper', 'Vagão Plataforma', 'Vagão Tanque'], totalCapacity: 85000, avgFleetAge: 8.5 },
      'MARÍTIMO': { vehicleCount: 12, vehicleTypes: ['Navio Graneleiro', 'Porta-contêiner', 'Barcaça'], totalCapacity: 150000, avgFleetAge: 12.0 },
      'FLUVIAL': { vehicleCount: 18, vehicleTypes: ['Barcaça Graneleira', 'Empurrador', 'Balsa'], totalCapacity: 45000, avgFleetAge: 6.5 },
      'AÉREO': { vehicleCount: 8, vehicleTypes: ['Boeing 767F', 'Boeing 737-800BCF', 'Embraer E195-E2F'], totalCapacity: 800, avgFleetAge: 5.0 },
      'MULTIMODAL': { vehicleCount: 120, vehicleTypes: ['Bitrem', 'Vagão Hopper', 'Barcaça', 'Contêiner'], totalCapacity: 35000, avgFleetAge: 5.5 }
    };

    const data = fleetMap[carrier.modalPrincipal] || fleetMap['RODOVIÁRIO'];

    return {
      carrierId: carrier.id,
      vehicleCount: data.vehicleCount!,
      vehicleTypes: data.vehicleTypes!,
      totalCapacity: data.totalCapacity!,
      avgFleetAge: data.avgFleetAge!,
      currentAvailability: carrier.aiScore > 85 ? 92 : 78,
      specialEquipment: ['Lona Térmica', 'Balança Embarcada', 'Sistema Anti-tombamento'],
      trackingAvailable: true,
      technologies: ['GPS Satelital', 'Telemetria', 'IoT Sensors', 'Câmera Embarcada']
    };
  }

  private generateTrackingEvents(carrier: Transportadora): TrackingEvent[] {
    const now = Date.now();
    return [
      { id: `TRK-${carrier.id}-01`, carrierId: carrier.id, shipmentId: 'SHP-001', timestamp: new Date(now - 3600000), latitude: -15.78, longitude: -47.93, speed: 82, status: 'Em Trânsito', event: 'Passagem por pedágio', details: 'BR-364 Km 245' },
      { id: `TRK-${carrier.id}-02`, carrierId: carrier.id, shipmentId: 'SHP-001', timestamp: new Date(now - 7200000), latitude: -16.12, longitude: -49.25, speed: 78, status: 'Em Trânsito', event: 'Atualização GPS', details: 'GO-060 próximo a Jataí' },
      { id: `TRK-${carrier.id}-03`, carrierId: carrier.id, shipmentId: 'SHP-002', timestamp: new Date(now - 14400000), latitude: -23.55, longitude: -46.63, speed: 0, status: 'Parado', event: 'Parada para descanso', details: 'Posto fiscal divisa SP/PR' },
      { id: `TRK-${carrier.id}-04`, carrierId: carrier.id, shipmentId: 'SHP-002', timestamp: new Date(now - 28800000), latitude: -22.91, longitude: -43.17, speed: 65, status: 'Em Trânsito', event: 'Saída do terminal', details: 'Terminal de cargas Santos' },
      { id: `TRK-${carrier.id}-05`, carrierId: carrier.id, shipmentId: 'SHP-003', timestamp: new Date(now - 43200000), latitude: -13.00, longitude: -55.92, speed: 75, status: 'Em Trânsito', event: 'Carregamento concluído', details: 'Silo Sorriso - MT' }
    ];
  }

  private generatePerformanceData(carrier: Transportadora): PerformanceIndicator {
    return {
      carrierId: carrier.id,
      punctuality: carrier.onTimeRate,
      sla: carrier.avgSLA,
      avgDeliveryTime: carrier.modalPrincipal === 'AÉREO' ? 24 : carrier.modalPrincipal === 'FERROVIÁRIO' ? 96 : 72,
      damageRate: +(Math.random() * 1.5 + 0.2).toFixed(2),
      incidentRate: +(Math.random() * 2.0 + 0.5).toFixed(2),
      returnRate: +(Math.random() * 0.8 + 0.1).toFixed(2),
      avgResponseTime: +(Math.random() * 3 + 1).toFixed(1) as unknown as number,
      nps: Math.floor(Math.random() * 40 + 50),
      costPerTon: carrier.costPerTon,
      costPerKm: +(carrier.costPerTon / 12).toFixed(2)
    };
  }
}
