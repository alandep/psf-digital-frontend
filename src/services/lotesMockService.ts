import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import {
  Lote,
  LoteStatus,
  LoteFilters,
  LoteCreatePayload,
  LoteUpdatePayload,
  StockMovement,
  QualityInspection,
  AILotScore,
  ExportSuggestion,
  AnomalyAlert,
  ExpiryPrediction,
  KPIMetrics,
  MovementType,
  PhysicalLocation
} from '../types/lotes';

@Injectable({
  providedIn: 'root'
})
export class LotesMockService {

  private lots: Lote[] = [];
  private movements: StockMovement[] = [];
  private inspections: QualityInspection[] = [];

  constructor() {
    this.initializeMockData();
  }

  // ================================
  // HELPER UTILITIES
  // ================================

  private randomDelay(): number {
    return Math.floor(Math.random() * 600) + 200;
  }

  private generateId(): string {
    return `id_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  private generateLoteNumber(index: number): string {
    return `LOT-2025-${String(index).padStart(3, '0')}`;
  }

  // ================================
  // MOCK DATA INITIALIZATION
  // ================================

  private initializeMockData(): void {
    const products = [
      { id: 'prod_soja', name: 'Soja em Grão' },
      { id: 'prod_milho', name: 'Milho em Grão' },
      { id: 'prod_cafe', name: 'Café Arábica' },
      { id: 'prod_acucar', name: 'Açúcar Cristal' },
      { id: 'prod_carne', name: 'Carne Bovina Congelada' }
    ];

    const warehouses = [
      { id: 'wh_santos', name: 'Santos' },
      { id: 'wh_paranagua', name: 'Paranaguá' },
      { id: 'wh_riogrande', name: 'Rio Grande' },
      { id: 'wh_itajai', name: 'Itajaí' },
      { id: 'wh_vitoria', name: 'Vitória' }
    ];

    const statuses: LoteStatus[] = [
      'DISPONÍVEL', 'DISPONÍVEL', 'DISPONÍVEL', 'DISPONÍVEL',
      'DISPONÍVEL', 'DISPONÍVEL', 'DISPONÍVEL', 'DISPONÍVEL',
      'BLOQUEADO', 'BLOQUEADO', 'BLOQUEADO',
      'QUARENTENA', 'QUARENTENA',
      'EM_TRÂNSITO', 'EM_TRÂNSITO', 'EM_TRÂNSITO',
      'RESERVADO', 'RESERVADO', 'RESERVADO',
      'ESGOTADO', 'ESGOTADO'
    ];

    const harvests = ['2024/2025', '2023/2024'];
    const countries = ['China', 'Japan', 'United States', 'Germany', 'Netherlands', 'Saudi Arabia'];

    const sections = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1'];
    const rows = ['1', '2', '3', '4', '5', '6'];
    const positions = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    for (let i = 1; i <= 21; i++) {
      const product = products[(i - 1) % products.length];
      const warehouse = warehouses[(i - 1) % warehouses.length];
      const status = statuses[i - 1];
      const harvest = harvests[i % 2];
      const country = countries[(i - 1) % countries.length];
      const quantity = Math.floor(Math.random() * 9000) + 1000;

      let reservedQty = 0;
      let exportedQty = 0;

      if (status === 'RESERVADO') {
        reservedQty = Math.floor(quantity * 0.4);
      } else if (status === 'ESGOTADO') {
        reservedQty = Math.floor(quantity * 0.5);
        exportedQty = quantity - reservedQty;
      } else if (status === 'EM_TRÂNSITO') {
        exportedQty = Math.floor(quantity * 0.3);
      }

      const availableQty = quantity - reservedQty - exportedQty;
      const daysOffset = Math.floor(Math.random() * 180) + 30;
      const createdDaysAgo = Math.floor(Math.random() * 90) + 10;

      const lot: Lote = {
        id: `lot_${String(i).padStart(3, '0')}`,
        loteNumber: this.generateLoteNumber(i),
        productName: product.name,
        productId: product.id,
        harvest: harvest,
        status: status,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        quantity: quantity,
        reservedQuantity: reservedQty,
        exportedQuantity: exportedQty,
        availableQuantity: availableQty,
        expiryDate: new Date(Date.now() + daysOffset * 86400000),
        physicalLocation: {
          warehouseId: warehouse.id,
          section: sections[i % sections.length],
          row: rows[i % rows.length],
          position: positions[i % positions.length]
        },
        aiScore: Math.floor(Math.random() * 40) + 60,
        createdAt: new Date(Date.now() - createdDaysAgo * 86400000),
        updatedAt: new Date(Date.now() - Math.floor(createdDaysAgo / 2) * 86400000),
        destinationCountry: country
      };

      this.lots.push(lot);

      // Create initial movement for each lot
      this.movements.push({
        id: `mov_entry_${i}`,
        loteId: lot.id,
        movementType: 'ENTRY',
        fromStatus: null,
        toStatus: 'DISPONÍVEL',
        quantity: quantity,
        userId: 'user_001',
        userName: 'João Silva',
        timestamp: lot.createdAt,
        notes: `Entrada inicial do lote ${lot.loteNumber}`
      });

      // Add status-specific movements
      if (status === 'BLOQUEADO') {
        this.movements.push({
          id: `mov_block_${i}`,
          loteId: lot.id,
          movementType: 'BLOCK',
          fromStatus: 'DISPONÍVEL',
          toStatus: 'BLOQUEADO',
          quantity: 0,
          userId: 'user_002',
          userName: 'Maria Santos',
          timestamp: new Date(lot.createdAt.getTime() + 86400000 * 3),
          notes: 'Bloqueio por inspeção de qualidade pendente'
        });
      }

      if (status === 'RESERVADO') {
        this.movements.push({
          id: `mov_reserve_${i}`,
          loteId: lot.id,
          movementType: 'RESERVE',
          fromStatus: 'DISPONÍVEL',
          toStatus: 'RESERVADO',
          quantity: reservedQty,
          userId: 'user_003',
          userName: 'Pedro Costa',
          timestamp: new Date(lot.createdAt.getTime() + 86400000 * 5),
          notes: `Reserva para exportação - ${country}`
        });
      }
    }

    // Create quality inspections for some lots
    this.initializeInspections();
  }

  private initializeInspections(): void {
    const inspectors = ['Ana Oliveira', 'Carlos Mendes', 'Beatriz Lima'];

    for (let i = 1; i <= 12; i++) {
      const lot = this.lots[i - 1];
      const isGrain = ['prod_soja', 'prod_milho', 'prod_cafe'].includes(lot.productId);

      this.inspections.push({
        id: `insp_${String(i).padStart(3, '0')}`,
        loteId: lot.id,
        humidity: isGrain ? Math.random() * 6 + 10 : Math.random() * 10 + 5,
        impurity: Math.random() * 3 + 0.5,
        protein: isGrain ? Math.random() * 10 + 30 : Math.random() * 20 + 15,
        pH: Math.random() * 2 + 5.5,
        weight: lot.quantity * (Math.random() * 0.02 + 0.99),
        temperature: isGrain ? Math.random() * 10 + 18 : Math.random() * 20 - 5,
        color: isGrain ? 'Amarelo claro' : 'Normal',
        odor: 'Característico',
        pestPresence: Math.random() > 0.9,
        labResults: 'Dentro dos parâmetros aceitáveis',
        inspectedBy: inspectors[i % inspectors.length],
        inspectedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000)
      });
    }
  }

  // ================================
  // CORE CRUD METHODS
  // ================================

  getLotes(filters?: LoteFilters): Observable<Lote[]> {
    let result = [...this.lots];

    if (filters) {
      if (filters.searchText && filters.searchText.trim()) {
        const search = filters.searchText.toLowerCase().trim();
        result = result.filter(lot =>
          lot.loteNumber.toLowerCase().includes(search) ||
          lot.productName.toLowerCase().includes(search) ||
          lot.warehouseName.toLowerCase().includes(search) ||
          lot.harvest.toLowerCase().includes(search) ||
          lot.destinationCountry.toLowerCase().includes(search)
        );
      }

      if (filters.product) {
        result = result.filter(lot => lot.productName === filters.product);
      }

      if (filters.harvest) {
        result = result.filter(lot => lot.harvest === filters.harvest);
      }

      if (filters.status) {
        result = result.filter(lot => lot.status === filters.status);
      }

      if (filters.warehouseId) {
        result = result.filter(lot => lot.warehouseId === filters.warehouseId);
      }

      if (filters.destinationCountry) {
        result = result.filter(lot => lot.destinationCountry === filters.destinationCountry);
      }

      if (filters.expiryDateStart) {
        const start = new Date(filters.expiryDateStart).getTime();
        result = result.filter(lot => new Date(lot.expiryDate).getTime() >= start);
      }

      if (filters.expiryDateEnd) {
        const end = new Date(filters.expiryDateEnd).getTime();
        result = result.filter(lot => new Date(lot.expiryDate).getTime() <= end);
      }

      if (filters.aiScoreMin !== null && filters.aiScoreMin !== undefined) {
        result = result.filter(lot => lot.aiScore >= filters.aiScoreMin!);
      }

      if (filters.aiScoreMax !== null && filters.aiScoreMax !== undefined) {
        result = result.filter(lot => lot.aiScore <= filters.aiScoreMax!);
      }
    }

    return of(result).pipe(delay(this.randomDelay()));
  }

  getLoteById(id: string): Observable<Lote | null> {
    const lot = this.lots.find(l => l.id === id) || null;
    return of(lot).pipe(delay(this.randomDelay()));
  }

  createLote(payload: LoteCreatePayload): Observable<Lote> {
    const newLot: Lote = {
      id: this.generateId(),
      loteNumber: `LOT-2025-${String(this.lots.length + 1).padStart(3, '0')}`,
      productName: payload.productName,
      productId: payload.productId,
      harvest: payload.harvest,
      status: 'DISPONÍVEL',
      warehouseId: payload.warehouseId,
      warehouseName: payload.warehouseName,
      quantity: payload.quantity,
      reservedQuantity: 0,
      exportedQuantity: 0,
      availableQuantity: payload.quantity,
      expiryDate: payload.expiryDate,
      physicalLocation: payload.physicalLocation,
      aiScore: Math.floor(Math.random() * 20) + 70,
      createdAt: new Date(),
      updatedAt: new Date(),
      destinationCountry: payload.destinationCountry
    };

    this.lots.push(newLot);

    // Record entry movement
    this.movements.push({
      id: this.generateId(),
      loteId: newLot.id,
      movementType: 'ENTRY',
      fromStatus: null,
      toStatus: 'DISPONÍVEL',
      quantity: payload.quantity,
      userId: 'current_user',
      userName: 'Usuário Atual',
      timestamp: new Date(),
      notes: `Criação do lote ${newLot.loteNumber}`
    });

    return of(newLot).pipe(delay(this.randomDelay()));
  }

  updateLote(id: string, payload: LoteUpdatePayload): Observable<Lote> {
    const index = this.lots.findIndex(l => l.id === id);
    if (index === -1) {
      return throwError(() => new Error('Lote não encontrado'));
    }

    this.lots[index] = {
      ...this.lots[index],
      ...payload,
      updatedAt: new Date()
    };

    return of(this.lots[index]).pipe(delay(this.randomDelay()));
  }

  // ================================
  // STATUS TRANSITION METHODS
  // ================================

  blockLote(id: string, notes: string): Observable<Lote> {
    const index = this.lots.findIndex(l => l.id === id);
    if (index === -1) {
      return throwError(() => new Error('Lote não encontrado'));
    }

    const lot = this.lots[index];
    if (lot.status !== 'DISPONÍVEL') {
      return throwError(() => new Error('Apenas lotes com status DISPONÍVEL podem ser bloqueados'));
    }

    const previousStatus = lot.status;
    this.lots[index] = {
      ...lot,
      status: 'BLOQUEADO',
      updatedAt: new Date()
    };

    this.movements.push({
      id: this.generateId(),
      loteId: id,
      movementType: 'BLOCK',
      fromStatus: previousStatus,
      toStatus: 'BLOQUEADO',
      quantity: 0,
      userId: 'current_user',
      userName: 'Usuário Atual',
      timestamp: new Date(),
      notes: notes
    });

    return of(this.lots[index]).pipe(delay(this.randomDelay()));
  }

  unblockLote(id: string, notes: string): Observable<Lote> {
    const index = this.lots.findIndex(l => l.id === id);
    if (index === -1) {
      return throwError(() => new Error('Lote não encontrado'));
    }

    const lot = this.lots[index];
    if (lot.status !== 'BLOQUEADO') {
      return throwError(() => new Error('Apenas lotes com status BLOQUEADO podem ser desbloqueados'));
    }

    const previousStatus = lot.status;
    this.lots[index] = {
      ...lot,
      status: 'DISPONÍVEL',
      updatedAt: new Date()
    };

    this.movements.push({
      id: this.generateId(),
      loteId: id,
      movementType: 'UNBLOCK',
      fromStatus: previousStatus,
      toStatus: 'DISPONÍVEL',
      quantity: 0,
      userId: 'current_user',
      userName: 'Usuário Atual',
      timestamp: new Date(),
      notes: notes
    });

    return of(this.lots[index]).pipe(delay(this.randomDelay()));
  }

  reserveLote(id: string, quantity: number, destination: string): Observable<Lote> {
    const index = this.lots.findIndex(l => l.id === id);
    if (index === -1) {
      return throwError(() => new Error('Lote não encontrado'));
    }

    const lot = this.lots[index];
    if (lot.status !== 'DISPONÍVEL') {
      return throwError(() => new Error('Apenas lotes com status DISPONÍVEL podem ser reservados'));
    }

    if (quantity > lot.availableQuantity) {
      return throwError(() => new Error(`Quantidade solicitada (${quantity}) excede a disponível (${lot.availableQuantity})`));
    }

    const previousStatus = lot.status;
    const newReserved = lot.reservedQuantity + quantity;
    const newAvailable = lot.quantity - newReserved - lot.exportedQuantity;

    // Determine new status
    let newStatus: LoteStatus = 'RESERVADO';
    if (newAvailable <= 0) {
      newStatus = 'ESGOTADO';
    }

    this.lots[index] = {
      ...lot,
      status: newStatus,
      reservedQuantity: newReserved,
      availableQuantity: newAvailable,
      destinationCountry: destination,
      updatedAt: new Date()
    };

    // Record reserve movement
    this.movements.push({
      id: this.generateId(),
      loteId: id,
      movementType: 'RESERVE',
      fromStatus: previousStatus,
      toStatus: newStatus,
      quantity: quantity,
      userId: 'current_user',
      userName: 'Usuário Atual',
      timestamp: new Date(),
      notes: `Reserva de ${quantity}kg para ${destination}`
    });

    // If auto-ESGOTADO triggered, record additional movement
    if (newAvailable <= 0 && newStatus === 'ESGOTADO') {
      this.movements.push({
        id: this.generateId(),
        loteId: id,
        movementType: 'STATUS_CHANGE',
        fromStatus: 'RESERVADO',
        toStatus: 'ESGOTADO',
        quantity: 0,
        userId: 'system',
        userName: 'Sistema',
        timestamp: new Date(),
        notes: 'Transição automática: estoque esgotado'
      });
    }

    return of(this.lots[index]).pipe(delay(this.randomDelay()));
  }

  // ================================
  // MOVEMENT & QUALITY METHODS
  // ================================

  getMovementHistory(loteId: string): Observable<StockMovement[]> {
    const history = this.movements
      .filter(m => m.loteId === loteId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return of(history).pipe(delay(this.randomDelay()));
  }

  getQualityInspections(loteId: string): Observable<QualityInspection[]> {
    const lotInspections = this.inspections.filter(insp => insp.loteId === loteId);
    return of(lotInspections).pipe(delay(this.randomDelay()));
  }

  saveQualityInspection(inspection: Omit<QualityInspection, 'id'>): Observable<QualityInspection> {
    const newInspection: QualityInspection = {
      ...inspection,
      id: this.generateId()
    };

    this.inspections.push(newInspection);
    return of(newInspection).pipe(delay(this.randomDelay()));
  }

  // ================================
  // AI & KPI METHODS
  // ================================

  getAIInsights(loteId: string): Observable<AILotScore> {
    const lot = this.lots.find(l => l.id === loteId);
    if (!lot) {
      return throwError(() => new Error('Lote não encontrado'));
    }

    const inspection = this.inspections.find(insp => insp.loteId === loteId);
    const score = this.calculateAIScore(lot, inspection);
    const suggestions = this.generateExportSuggestions(score);
    const anomalies = this.detectAnomalies(lot, inspection);
    const expiryPrediction = this.calculateExpiryPrediction(lot);

    const aiScore: AILotScore = {
      loteId: loteId,
      score: score,
      exportSuggestions: suggestions,
      anomalyAlerts: anomalies,
      expiryPrediction: expiryPrediction,
      calculatedAt: new Date()
    };

    return of(aiScore).pipe(delay(this.randomDelay()));
  }

  private calculateAIScore(lot: Lote, inspection: QualityInspection | undefined): number {
    let score = 70; // Base score

    if (inspection) {
      // Humidity deviation (lower is better for grains, target ~12%)
      const humidityDeviation = Math.abs(inspection.humidity - 12);
      score += (10 - Math.min(humidityDeviation, 10)) * 2; // 0 to 20 points

      // Impurity (lower is better)
      score += Math.max(0, (3 - inspection.impurity)) * 3; // 0 to 9 points

      // Protein (higher is better for soy/corn)
      if (inspection.protein > 35) {
        score += 5;
      }
    }

    // Freshness factor based on days to expiry
    const daysToExpiry = Math.ceil(
      (new Date(lot.expiryDate).getTime() - Date.now()) / 86400000
    );
    if (daysToExpiry > 120) {
      score += 10;
    } else if (daysToExpiry > 60) {
      score += 5;
    } else if (daysToExpiry < 30) {
      score -= 10;
    }

    // Random slight variation for realism (+/- 3 points)
    score += Math.floor(Math.random() * 7) - 3;

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private generateExportSuggestions(score: number): ExportSuggestion[] {
    const suggestions: ExportSuggestion[] = [];

    if (score >= 85) {
      suggestions.push(
        {
          destination: 'Japan',
          confidence: 0.92,
          reason: 'Alta qualidade atende padrões japoneses rigorosos'
        },
        {
          destination: 'European Union',
          confidence: 0.88,
          reason: 'Conformidade com regulamentações fitossanitárias da UE'
        },
        {
          destination: 'South Korea',
          confidence: 0.85,
          reason: 'Mercado premium com demanda crescente'
        }
      );
    } else if (score >= 60) {
      suggestions.push(
        {
          destination: 'China',
          confidence: 0.90,
          reason: 'Grande demanda por commodities agrícolas'
        },
        {
          destination: 'Middle East',
          confidence: 0.82,
          reason: 'Mercado estável com requisitos moderados'
        }
      );
    } else {
      suggestions.push({
        destination: 'Melhoria de qualidade necessária',
        confidence: 0.95,
        reason: 'Score abaixo do mínimo para exportação. Recomendado: re-inspeção e tratamento'
      });
    }

    return suggestions.slice(0, 3);
  }

  private detectAnomalies(lot: Lote, inspection: QualityInspection | undefined): AnomalyAlert[] {
    const anomalies: AnomalyAlert[] = [];
    const isGrain = ['prod_soja', 'prod_milho', 'prod_cafe'].includes(lot.productId);

    if (inspection) {
      // Humidity check for grains
      if (isGrain && inspection.humidity > 14) {
        anomalies.push({
          severity: inspection.humidity > 16 ? 'HIGH' : 'MEDIUM',
          description: `Umidade elevada (${inspection.humidity.toFixed(1)}%) - risco de deterioração para grãos`,
          detectedAt: new Date()
        });
      }

      // Temperature extremes
      if (inspection.temperature > 35) {
        anomalies.push({
          severity: 'HIGH',
          description: `Temperatura alta (${inspection.temperature.toFixed(1)}°C) - risco de degradação do produto`,
          detectedAt: new Date()
        });
      } else if (inspection.temperature < -10 && !lot.productId.includes('carne')) {
        anomalies.push({
          severity: 'MEDIUM',
          description: `Temperatura muito baixa (${inspection.temperature.toFixed(1)}°C) - verificar armazenamento`,
          detectedAt: new Date()
        });
      }

      // pH deviation
      if (Math.abs(inspection.pH - 6.5) > 1.0) {
        anomalies.push({
          severity: 'LOW',
          description: `pH fora do esperado (${inspection.pH.toFixed(1)}) - monitorar`,
          detectedAt: new Date()
        });
      }

      // Pest presence
      if (inspection.pestPresence) {
        anomalies.push({
          severity: 'CRITICAL',
          description: 'Presença de pragas detectada - quarentena recomendada',
          detectedAt: new Date()
        });
      }
    }

    // Expiry check
    const daysToExpiry = Math.ceil(
      (new Date(lot.expiryDate).getTime() - Date.now()) / 86400000
    );
    if (daysToExpiry < 15) {
      anomalies.push({
        severity: 'CRITICAL',
        description: `Produto próximo do vencimento (${daysToExpiry} dias restantes)`,
        detectedAt: new Date()
      });
    } else if (daysToExpiry < 30) {
      anomalies.push({
        severity: 'HIGH',
        description: `Atenção ao vencimento (${daysToExpiry} dias restantes)`,
        detectedAt: new Date()
      });
    }

    return anomalies;
  }

  private calculateExpiryPrediction(lot: Lote): ExpiryPrediction | null {
    const daysToExpiry = Math.ceil(
      (new Date(lot.expiryDate).getTime() - Date.now()) / 86400000
    );

    if (daysToExpiry < 0) {
      return { daysToExpiry: 0, riskLevel: 'CRITICAL' };
    }

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (daysToExpiry > 90) {
      riskLevel = 'LOW';
    } else if (daysToExpiry > 45) {
      riskLevel = 'MEDIUM';
    } else if (daysToExpiry > 15) {
      riskLevel = 'HIGH';
    } else {
      riskLevel = 'CRITICAL';
    }

    return { daysToExpiry, riskLevel };
  }

  getKPIMetrics(lots: Lote[]): KPIMetrics {
    const totalAvailableQty = lots
      .filter(l => l.status === 'DISPONÍVEL')
      .reduce((sum, l) => sum + l.quantity, 0);

    const blockedCount = lots.filter(l => l.status === 'BLOQUEADO').length;

    const thirtyDaysFromNow = Date.now() + 30 * 86400000;
    const expiringSoonCount = lots.filter(
      l => new Date(l.expiryDate).getTime() <= thirtyDaysFromNow
    ).length;

    const avgAIScore = lots.length > 0
      ? lots.reduce((sum, l) => sum + l.aiScore, 0) / lots.length
      : 0;

    return {
      totalAvailableQty,
      blockedCount,
      expiringSoonCount,
      avgAIScore: Math.round(avgAIScore * 10) / 10
    };
  }

  // ================================
  // FILTER OPTIONS (SYNCHRONOUS)
  // ================================

  getProducts(): string[] {
    return [
      'Soja em Grão',
      'Milho em Grão',
      'Café Arábica',
      'Açúcar Cristal',
      'Carne Bovina Congelada'
    ];
  }

  getHarvests(): string[] {
    return ['2024/2025', '2023/2024'];
  }

  getWarehouses(): { id: string; name: string }[] {
    return [
      { id: 'wh_santos', name: 'Santos' },
      { id: 'wh_paranagua', name: 'Paranaguá' },
      { id: 'wh_riogrande', name: 'Rio Grande' },
      { id: 'wh_itajai', name: 'Itajaí' },
      { id: 'wh_vitoria', name: 'Vitória' }
    ];
  }

  getCountries(): string[] {
    return [
      'China',
      'Japan',
      'United States',
      'Germany',
      'Netherlands',
      'Saudi Arabia'
    ];
  }
}
