import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Porto,
  PortType,
  OperationalStatus,
  CongestionLevel,
  PortInfrastructure,
  OperationalIndicator,
  LogisticsRoute,
  PortShipment,
  PortAIInsights,
  PortFilters,
  PortMetrics,
  SimulationRequest,
  SimulationResult
} from '../types/portos';

@Injectable({
  providedIn: 'root'
})
export class PortosMockService {

  private portos: Porto[] = [];
  private infrastructure: Map<string, PortInfrastructure> = new Map();
  private indicators: Map<string, OperationalIndicator> = new Map();
  private routes: Map<string, LogisticsRoute[]> = new Map();
  private shipments: Map<string, PortShipment[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // PUBLIC API
  // ================================

  getPortos(filters?: PortFilters): Observable<Porto[]> {
    let result = [...this.portos];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(p =>
          p.name.toLowerCase().includes(search) ||
          p.unLocode.toLowerCase().includes(search) ||
          p.city.toLowerCase().includes(search) ||
          p.country.toLowerCase().includes(search) ||
          p.operator.toLowerCase().includes(search)
        );
      }
      if (filters.country) {
        result = result.filter(p => p.country === filters.country);
      }
      if (filters.portType) {
        result = result.filter(p => p.portType === filters.portType);
      }
      if (filters.operationalStatus) {
        result = result.filter(p => p.operationalStatus === filters.operationalStatus);
      }
      if (filters.congestionLevel) {
        result = result.filter(p => p.congestionLevel === filters.congestionLevel);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getPortoById(id: string): Observable<Porto | null> {
    const porto = this.portos.find(p => p.id === id) || null;
    return of(porto).pipe(delay(this.randomDelay()));
  }

  createPorto(data: Partial<Porto>): Observable<Porto> {
    const newPorto: Porto = {
      id: `PORT-${Date.now()}`,
      name: data.name || 'Novo Porto',
      unLocode: data.unLocode || 'BRXXX',
      country: data.country || 'Brasil',
      city: data.city || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      portType: data.portType || 'MARÍTIMO',
      operator: data.operator || '',
      annualCapacity: data.annualCapacity || 0,
      operationalStatus: data.operationalStatus || 'OPERACIONAL',
      operatingHours: data.operatingHours || '24h',
      aiLogisticsScore: data.aiLogisticsScore || 70,
      congestionLevel: data.congestionLevel || 'LOW',
      lastUpdated: new Date()
    };
    this.portos.push(newPorto);
    return of(newPorto).pipe(delay(this.randomDelay()));
  }

  getInfrastructure(portId: string): Observable<PortInfrastructure> {
    const infra = this.infrastructure.get(portId) || this.generateDefaultInfrastructure(portId);
    return of(infra).pipe(delay(this.randomDelay()));
  }

  getIndicators(portId: string): Observable<OperationalIndicator> {
    const ind = this.indicators.get(portId) || this.generateDefaultIndicators(portId);
    return of(ind).pipe(delay(this.randomDelay()));
  }

  getRoutes(portId: string): Observable<LogisticsRoute[]> {
    const r = this.routes.get(portId) || [];
    return of(r).pipe(delay(this.randomDelay()));
  }

  getShipments(portId: string): Observable<PortShipment[]> {
    const s = this.shipments.get(portId) || [];
    return of(s).pipe(delay(this.randomDelay()));
  }

  getAIInsights(portId: string): Observable<PortAIInsights> {
    const porto = this.portos.find(p => p.id === portId);
    const insights: PortAIInsights = {
      portId,
      logisticsScore: porto?.aiLogisticsScore || 75,
      recommendedPort: 'Santos (BRSSZ)',
      recommendedModal: 'Marítimo + Ferroviário',
      alerts: this.generateAlerts(porto),
      suggestions: this.generateSuggestions(porto),
      portRanking: this.generatePortRanking(),
      executiveSummary: this.generateExecutiveSummary(porto)
    };
    return of(insights).pipe(delay(this.randomDelay()));
  }

  getMetrics(): Observable<PortMetrics> {
    const metrics: PortMetrics = {
      totalPorts: this.portos.length,
      operationalCount: this.portos.filter(p => p.operationalStatus === 'OPERACIONAL').length,
      congestedCount: this.portos.filter(p => p.congestionLevel === 'HIGH' || p.congestionLevel === 'CRITICAL').length,
      avgLogisticsScore: Math.round(this.portos.reduce((sum, p) => sum + p.aiLogisticsScore, 0) / this.portos.length),
      activeShipments: Array.from(this.shipments.values()).reduce((sum, s) => sum + s.length, 0)
    };
    return of(metrics).pipe(delay(this.randomDelay()));
  }

  simulateExport(request: SimulationRequest): Observable<SimulationResult> {
    const result: SimulationResult = {
      bestPort: 'Porto de Santos (BRSSZ)',
      bestRoute: `${request.origin} → Ferroviário → Santos → Marítimo → ${request.destination}`,
      estimatedCost: Math.round(15000 + request.quantity * 12 + Math.random() * 5000),
      estimatedTime: Math.round(18 + Math.random() * 12),
      eta: new Date(request.date.getTime() + (20 + Math.random() * 10) * 86400000),
      riskLevel: 'Médio',
      emissions: Math.round(request.quantity * 0.08 + Math.random() * 500),
      alternatives: [
        {
          port: 'Porto de Paranaguá (BRPNG)',
          route: `${request.origin} → Rodoviário → Paranaguá → Marítimo → ${request.destination}`,
          cost: Math.round(17000 + request.quantity * 14 + Math.random() * 4000),
          time: Math.round(22 + Math.random() * 8),
          risk: 'Baixo'
        },
        {
          port: 'Porto de Rio Grande (BRRGS)',
          route: `${request.origin} → Ferroviário → Rio Grande → Marítimo → ${request.destination}`,
          cost: Math.round(14000 + request.quantity * 11 + Math.random() * 6000),
          time: Math.round(25 + Math.random() * 10),
          risk: 'Alto'
        },
        {
          port: 'Porto de Itaguaí (BRITG)',
          route: `${request.origin} → Rodoviário → Itaguaí → Marítimo → ${request.destination}`,
          cost: Math.round(16000 + request.quantity * 13 + Math.random() * 3000),
          time: Math.round(20 + Math.random() * 7),
          risk: 'Médio'
        }
      ]
    };
    return of(result).pipe(delay(1200));
  }

  getCountries(): string[] {
    return [...new Set(this.portos.map(p => p.country))].sort();
  }

  getPortTypes(): PortType[] {
    return ['MARÍTIMO', 'FLUVIAL', 'AÉREO', 'FERROVIÁRIO', 'MULTIMODAL'];
  }

  getStatuses(): OperationalStatus[] {
    return ['OPERACIONAL', 'PARCIAL', 'CONGESTIONADO', 'INOPERANTE', 'MANUTENÇÃO'];
  }

  // ================================
  // PRIVATE HELPERS
  // ================================

  private randomDelay(): number {
    return 300 + Math.random() * 500;
  }

  private generateDefaultInfrastructure(portId: string): PortInfrastructure {
    return {
      portId,
      berthCount: 8,
      maxDraft: 14.5,
      storageCapacity: 500000,
      siloCount: 12,
      warehouseCount: 6,
      containerYardCapacity: 25000,
      equipment: ['Guindastes Pórtico', 'Empilhadeiras', 'Correias Transportadoras'],
      dailyMovementCapacity: 45000,
      supportedModals: ['MARÍTIMO', 'FERROVIÁRIO'],
      customsServices: ['Despacho Aduaneiro', 'Inspeção Fitossanitária']
    };
  }

  private generateDefaultIndicators(portId: string): OperationalIndicator {
    return {
      portId,
      congestionLevel: 'MEDIUM',
      avgWaitTime: 24,
      avgBerthingTime: 48,
      avgClearanceTime: 12,
      availableCapacity: 65,
      dailyMovement: 35000,
      currentOccupancy: 72,
      lastUpdated: new Date()
    };
  }

  private generateAlerts(porto: Porto | undefined): PortAIInsights['alerts'] {
    const alerts: PortAIInsights['alerts'] = [];
    if (porto?.congestionLevel === 'HIGH' || porto?.congestionLevel === 'CRITICAL') {
      alerts.push({
        severity: 'HIGH',
        message: `Congestionamento elevado detectado no ${porto.name}. Tempo médio de espera acima de 48h.`,
        detectedAt: new Date()
      });
    }
    alerts.push({
      severity: 'MEDIUM',
      message: 'Previsão de chuvas intensas pode afetar operações nos próximos 3 dias.',
      detectedAt: new Date(Date.now() - 3600000)
    });
    alerts.push({
      severity: 'LOW',
      message: 'Manutenção programada no berço 3 para próxima semana.',
      detectedAt: new Date(Date.now() - 7200000)
    });
    return alerts;
  }

  private generateSuggestions(porto: Porto | undefined): PortAIInsights['suggestions'] {
    return [
      {
        action: 'Considerar rota multimodal via ferrovia até Santos',
        reason: 'Redução de custo logístico em 18% com uso de modal ferroviário para distâncias acima de 500km',
        criteria: ['Custo', 'Tempo', 'Capacidade'],
        confidence: 87,
        estimatedImpact: 'Economia de USD 2.400/container'
      },
      {
        action: 'Antecipar embarque em 3 dias para evitar pico de congestionamento',
        reason: 'Modelo preditivo indica aumento de 40% no fluxo de navios na próxima semana',
        criteria: ['Congestionamento', 'Tempo de espera'],
        confidence: 72,
        estimatedImpact: 'Redução de 24h no tempo de espera'
      },
      {
        action: 'Avaliar porto alternativo (Paranaguá) para carga de grãos',
        reason: 'Paranaguá apresenta menor congestionamento e maior disponibilidade de silos',
        criteria: ['Disponibilidade', 'Infraestrutura', 'Custo'],
        confidence: 65,
        estimatedImpact: 'Ganho de 2 dias no tempo total'
      }
    ];
  }

  private generatePortRanking(): PortAIInsights['portRanking'] {
    return [
      { portName: 'Santos (BRSSZ)', score: 92, cost: 12500, time: 18, congestion: 'MEDIUM' },
      { portName: 'Paranaguá (BRPNG)', score: 88, cost: 11800, time: 20, congestion: 'LOW' },
      { portName: 'Rio Grande (BRRGS)', score: 79, cost: 10500, time: 25, congestion: 'LOW' },
      { portName: 'Itaguaí (BRITG)', score: 85, cost: 13200, time: 17, congestion: 'MEDIUM' },
      { portName: 'São Francisco do Sul (BRSFS)', score: 76, cost: 11000, time: 22, congestion: 'LOW' }
    ];
  }

  private generateExecutiveSummary(porto: Porto | undefined): string {
    const name = porto?.name || 'Porto selecionado';
    return `O ${name} apresenta condições operacionais favoráveis para embarque. ` +
      `O score logístico atual é ${porto?.aiLogisticsScore || 75}/100, indicando boa performance geral. ` +
      `Recomenda-se priorizar modal ferroviário para cargas originadas acima de 500km, ` +
      `o que pode gerar economia de até 18% no custo logístico total. ` +
      `O modelo de IA detectou janela favorável de operação nos próximos 5 dias com ` +
      `baixa probabilidade de congestionamento.`;
  }

  // ================================
  // DATA INITIALIZATION
  // ================================

  private initializeMockData(): void {
    this.portos = [
      {
        id: 'PORT-001', name: 'Porto de Santos', unLocode: 'BRSSZ',
        country: 'Brasil', city: 'Santos - SP', latitude: -23.9536, longitude: -46.3261,
        portType: 'MARÍTIMO', operator: 'Santos Port Authority',
        annualCapacity: 145000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 92, congestionLevel: 'MEDIUM',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-002', name: 'Porto de Paranaguá', unLocode: 'BRPNG',
        country: 'Brasil', city: 'Paranaguá - PR', latitude: -25.5163, longitude: -48.5105,
        portType: 'MARÍTIMO', operator: 'APPA - Administração dos Portos de Paranaguá',
        annualCapacity: 56000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 88, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-003', name: 'Porto de Rio Grande', unLocode: 'BRRGS',
        country: 'Brasil', city: 'Rio Grande - RS', latitude: -32.0505, longitude: -52.0986,
        portType: 'MARÍTIMO', operator: 'SUPRG - Superintendência do Porto',
        annualCapacity: 42000000, operationalStatus: 'PARCIAL',
        operatingHours: '24h/7d', aiLogisticsScore: 79, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-004', name: 'Porto de Itaguaí', unLocode: 'BRITG',
        country: 'Brasil', city: 'Itaguaí - RJ', latitude: -22.9083, longitude: -43.7967,
        portType: 'MARÍTIMO', operator: 'Companhia Docas do Rio de Janeiro',
        annualCapacity: 75000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 85, congestionLevel: 'MEDIUM',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-005', name: 'Porto de São Francisco do Sul', unLocode: 'BRSFS',
        country: 'Brasil', city: 'São Francisco do Sul - SC', latitude: -26.2426, longitude: -48.6383,
        portType: 'MARÍTIMO', operator: 'APSFS - Administração do Porto',
        annualCapacity: 18000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '06h-22h', aiLogisticsScore: 76, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-006', name: 'Porto de Vitória', unLocode: 'BRVIX',
        country: 'Brasil', city: 'Vitória - ES', latitude: -20.3155, longitude: -40.2920,
        portType: 'MARÍTIMO', operator: 'CODESA - Companhia Docas do Espírito Santo',
        annualCapacity: 32000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 82, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-007', name: 'Porto de Itajaí', unLocode: 'BRITJ',
        country: 'Brasil', city: 'Itajaí - SC', latitude: -26.9086, longitude: -48.6508,
        portType: 'MARÍTIMO', operator: 'Superintendência do Porto de Itajaí',
        annualCapacity: 15000000, operationalStatus: 'CONGESTIONADO',
        operatingHours: '24h/7d', aiLogisticsScore: 68, congestionLevel: 'HIGH',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-008', name: 'Porto de Salvador', unLocode: 'BRSSA',
        country: 'Brasil', city: 'Salvador - BA', latitude: -12.9747, longitude: -38.5127,
        portType: 'MARÍTIMO', operator: 'CODEBA - Companhia das Docas da Bahia',
        annualCapacity: 8000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 74, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-009', name: 'Porto de Shanghai', unLocode: 'CNSHA',
        country: 'China', city: 'Shanghai', latitude: 31.2304, longitude: 121.4737,
        portType: 'MARÍTIMO', operator: 'Shanghai International Port Group',
        annualCapacity: 470000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 95, congestionLevel: 'MEDIUM',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-010', name: 'Porto de Rotterdam', unLocode: 'NLRTM',
        country: 'Holanda', city: 'Rotterdam', latitude: 51.9036, longitude: 4.4993,
        portType: 'MULTIMODAL', operator: 'Port of Rotterdam Authority',
        annualCapacity: 440000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 94, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-011', name: 'Porto de New Orleans', unLocode: 'USMSY',
        country: 'EUA', city: 'New Orleans - LA', latitude: 29.9546, longitude: -90.0750,
        portType: 'MARÍTIMO', operator: 'Port of New Orleans',
        annualCapacity: 95000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 86, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-012', name: 'Porto de Hamburg', unLocode: 'DEHAM',
        country: 'Alemanha', city: 'Hamburg', latitude: 53.5511, longitude: 9.9937,
        portType: 'MARÍTIMO', operator: 'Hamburg Port Authority',
        annualCapacity: 130000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 91, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-013', name: 'Porto de Yokohama', unLocode: 'JPYOK',
        country: 'Japão', city: 'Yokohama', latitude: 35.4437, longitude: 139.6380,
        portType: 'MARÍTIMO', operator: 'Yokohama Port Corporation',
        annualCapacity: 120000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 90, congestionLevel: 'LOW',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-014', name: 'Porto de Jeddah', unLocode: 'SAJED',
        country: 'Arábia Saudita', city: 'Jeddah', latitude: 21.4858, longitude: 39.1925,
        portType: 'MARÍTIMO', operator: 'Saudi Ports Authority',
        annualCapacity: 65000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '24h/7d', aiLogisticsScore: 83, congestionLevel: 'MEDIUM',
        lastUpdated: new Date()
      },
      {
        id: 'PORT-015', name: 'Porto de Manaus', unLocode: 'BRMAO',
        country: 'Brasil', city: 'Manaus - AM', latitude: -3.1190, longitude: -60.0217,
        portType: 'FLUVIAL', operator: 'Sociedade de Navegação, Portos e Hidrovias - SNPH',
        annualCapacity: 22000000, operationalStatus: 'OPERACIONAL',
        operatingHours: '06h-22h', aiLogisticsScore: 71, congestionLevel: 'LOW',
        lastUpdated: new Date()
      }
    ];

    // Infrastructure
    this.infrastructure.set('PORT-001', {
      portId: 'PORT-001', berthCount: 67, maxDraft: 16.5, storageCapacity: 2500000,
      siloCount: 45, warehouseCount: 28, containerYardCapacity: 120000,
      equipment: ['Guindastes Pórtico STS', 'RTG', 'Empilhadeiras Reach Stacker', 'Ship Loaders', 'Correias Transportadoras'],
      dailyMovementCapacity: 450000, supportedModals: ['MARÍTIMO', 'FERROVIÁRIO', 'MULTIMODAL'],
      customsServices: ['Despacho Aduaneiro 24h', 'Inspeção Fitossanitária', 'Certificação ISPM-15', 'Armazém Alfandegado', 'Zona de Processamento']
    });
    this.infrastructure.set('PORT-002', {
      portId: 'PORT-002', berthCount: 28, maxDraft: 13.5, storageCapacity: 1800000,
      siloCount: 32, warehouseCount: 15, containerYardCapacity: 45000,
      equipment: ['Guindastes Pórtico', 'Ship Loaders Grãos', 'Correias Transportadoras', 'Tombadores de Vagão'],
      dailyMovementCapacity: 180000, supportedModals: ['MARÍTIMO', 'FERROVIÁRIO'],
      customsServices: ['Despacho Aduaneiro', 'Inspeção Fitossanitária', 'Fumigação', 'Armazém Alfandegado']
    });
    this.infrastructure.set('PORT-003', {
      portId: 'PORT-003', berthCount: 18, maxDraft: 14.0, storageCapacity: 1200000,
      siloCount: 22, warehouseCount: 10, containerYardCapacity: 35000,
      equipment: ['Guindastes Pórtico', 'Ship Loaders', 'Empilhadeiras', 'Correias'],
      dailyMovementCapacity: 130000, supportedModals: ['MARÍTIMO', 'FERROVIÁRIO'],
      customsServices: ['Despacho Aduaneiro', 'Inspeção Fitossanitária', 'Armazém Alfandegado']
    });
    this.infrastructure.set('PORT-007', {
      portId: 'PORT-007', berthCount: 12, maxDraft: 12.0, storageCapacity: 650000,
      siloCount: 8, warehouseCount: 6, containerYardCapacity: 28000,
      equipment: ['Guindastes Pórtico', 'RTG', 'Empilhadeiras'],
      dailyMovementCapacity: 55000, supportedModals: ['MARÍTIMO'],
      customsServices: ['Despacho Aduaneiro', 'Inspeção Fitossanitária']
    });

    // Operational Indicators
    this.indicators.set('PORT-001', {
      portId: 'PORT-001', congestionLevel: 'MEDIUM', avgWaitTime: 36,
      avgBerthingTime: 52, avgClearanceTime: 8, availableCapacity: 58,
      dailyMovement: 420000, currentOccupancy: 78, lastUpdated: new Date()
    });
    this.indicators.set('PORT-002', {
      portId: 'PORT-002', congestionLevel: 'LOW', avgWaitTime: 18,
      avgBerthingTime: 40, avgClearanceTime: 10, availableCapacity: 72,
      dailyMovement: 160000, currentOccupancy: 55, lastUpdated: new Date()
    });
    this.indicators.set('PORT-003', {
      portId: 'PORT-003', congestionLevel: 'LOW', avgWaitTime: 12,
      avgBerthingTime: 36, avgClearanceTime: 14, availableCapacity: 80,
      dailyMovement: 95000, currentOccupancy: 42, lastUpdated: new Date()
    });
    this.indicators.set('PORT-007', {
      portId: 'PORT-007', congestionLevel: 'HIGH', avgWaitTime: 72,
      avgBerthingTime: 68, avgClearanceTime: 16, availableCapacity: 15,
      dailyMovement: 52000, currentOccupancy: 92, lastUpdated: new Date()
    });

    // Routes
    this.routes.set('PORT-001', [
      {
        id: 'ROUTE-001', portId: 'PORT-001', origin: 'Rondonópolis - MT', destination: 'Shanghai - China',
        segments: [
          { mode: 'Ferroviário', from: 'Rondonópolis', to: 'Santos', distance: 1400, time: 72, cost: 4500 },
          { mode: 'Portuário', from: 'Terminal Santos', to: 'Navio', distance: 0, time: 48, cost: 2200 },
          { mode: 'Marítimo', from: 'Santos', to: 'Shanghai', distance: 19200, time: 720, cost: 8500 }
        ],
        totalDistance: 20600, estimatedTime: 35, estimatedCost: 15200, estimatedEmissions: 1850,
        risks: ['Congestionamento moderado em Santos', 'Sazonalidade de safra']
      },
      {
        id: 'ROUTE-002', portId: 'PORT-001', origin: 'Uberlândia - MG', destination: 'Rotterdam - Holanda',
        segments: [
          { mode: 'Rodoviário', from: 'Uberlândia', to: 'Santos', distance: 620, time: 12, cost: 3200 },
          { mode: 'Portuário', from: 'Terminal Santos', to: 'Navio', distance: 0, time: 36, cost: 1800 },
          { mode: 'Marítimo', from: 'Santos', to: 'Rotterdam', distance: 10500, time: 456, cost: 6800 }
        ],
        totalDistance: 11120, estimatedTime: 21, estimatedCost: 11800, estimatedEmissions: 1200,
        risks: ['Condições climáticas Atlântico Norte']
      }
    ]);
    this.routes.set('PORT-002', [
      {
        id: 'ROUTE-003', portId: 'PORT-002', origin: 'Cascavel - PR', destination: 'Tokyo - Japão',
        segments: [
          { mode: 'Rodoviário', from: 'Cascavel', to: 'Paranaguá', distance: 530, time: 10, cost: 2800 },
          { mode: 'Portuário', from: 'Terminal Paranaguá', to: 'Navio', distance: 0, time: 24, cost: 1500 },
          { mode: 'Marítimo', from: 'Paranaguá', to: 'Tokyo', distance: 22500, time: 840, cost: 9200 }
        ],
        totalDistance: 23030, estimatedTime: 37, estimatedCost: 13500, estimatedEmissions: 2100,
        risks: ['Tempo de travessia longo', 'Custos de seguro elevados']
      }
    ]);
    this.routes.set('PORT-007', [
      {
        id: 'ROUTE-004', portId: 'PORT-007', origin: 'Chapecó - SC', destination: 'Hamburg - Alemanha',
        segments: [
          { mode: 'Rodoviário', from: 'Chapecó', to: 'Itajaí', distance: 480, time: 9, cost: 2500 },
          { mode: 'Portuário', from: 'Terminal Itajaí', to: 'Navio', distance: 0, time: 72, cost: 2800 },
          { mode: 'Marítimo', from: 'Itajaí', to: 'Hamburg', distance: 10800, time: 480, cost: 7100 }
        ],
        totalDistance: 11280, estimatedTime: 24, estimatedCost: 12400, estimatedEmissions: 1350,
        risks: ['Congestionamento alto no porto', 'Atrasos frequentes']
      }
    ]);

    // Shipments
    this.shipments.set('PORT-001', [
      { id: 'SHIP-001', portId: 'PORT-001', bookingNumber: 'BK-2024-001234', exportNumber: 'EXP-2024-0089',
        containerNumber: 'MSCU7834521', vesselName: 'MSC Gülsün', eta: new Date('2024-12-20'), etd: new Date('2024-12-22'), status: 'Programado' },
      { id: 'SHIP-002', portId: 'PORT-001', bookingNumber: 'BK-2024-001235', exportNumber: 'EXP-2024-0090',
        containerNumber: 'MAEU6291834', vesselName: 'Maersk Edinburgh', eta: new Date('2024-12-18'), etd: new Date('2024-12-19'), status: 'Atracado' },
      { id: 'SHIP-003', portId: 'PORT-001', bookingNumber: 'BK-2024-001236', exportNumber: 'EXP-2024-0091',
        containerNumber: 'CMAU9182736', vesselName: 'CMA CGM Jacques Saadé', eta: new Date('2024-12-15'), etd: new Date('2024-12-17'), status: 'Em Trânsito' },
      { id: 'SHIP-004', portId: 'PORT-001', bookingNumber: 'BK-2024-001237', exportNumber: 'EXP-2024-0092',
        containerNumber: 'HLCU8374625', vesselName: 'Hapag-Lloyd Berlin Express', eta: new Date('2024-12-12'), etd: new Date('2024-12-14'), status: 'Liberado' }
    ]);
    this.shipments.set('PORT-002', [
      { id: 'SHIP-005', portId: 'PORT-002', bookingNumber: 'BK-2024-002001', exportNumber: 'EXP-2024-0093',
        containerNumber: 'OOLU5647382', vesselName: 'OOCL Hong Kong', eta: new Date('2024-12-21'), etd: new Date('2024-12-23'), status: 'Programado' },
      { id: 'SHIP-006', portId: 'PORT-002', bookingNumber: 'BK-2024-002002', exportNumber: 'EXP-2024-0094',
        containerNumber: 'EGLV4829173', vesselName: 'Ever Given', eta: new Date('2024-12-19'), etd: new Date('2024-12-20'), status: 'Atracado' }
    ]);
    this.shipments.set('PORT-007', [
      { id: 'SHIP-007', portId: 'PORT-007', bookingNumber: 'BK-2024-003001', exportNumber: 'EXP-2024-0095',
        containerNumber: 'CSLU7182943', vesselName: 'COSCO Shipping Universe', eta: new Date('2024-12-25'), etd: new Date('2024-12-28'), status: 'Programado' }
    ]);
  }
}
