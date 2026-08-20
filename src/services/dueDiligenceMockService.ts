import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Screening,
  ScreeningType,
  ScreeningStatus,
  MatchStatus,
  DueDiligenceMetrics,
  DueDiligenceFilters
} from '../types/due-diligence';

@Injectable({ providedIn: 'root' })
export class DueDiligenceMockService {

  private mockScreenings: Screening[] = [
    {
      id: 'SCR-001', entityName: 'Global Trading Corp', entityType: 'COMPANY', country: 'China',
      taxId: '12.345.678/0001-90', screeningType: 'KYC', status: 'PENDING',
      riskLevel: 'MEDIUM', matchStatus: null, matchedWatchlists: [],
      confidenceScore: 0, assignedAnalyst: 'Carlos Silva',
      resolution: null, justification: '',
      createdAt: new Date('2024-11-01'), completedAt: null,
      slaDeadline: new Date('2024-11-08')
    },
    {
      id: 'SCR-002', entityName: 'Ahmed Al-Rashid', entityType: 'INDIVIDUAL', country: 'Arábia Saudita',
      taxId: '987.654.321-00', screeningType: 'PEP', status: 'FLAGGED',
      riskLevel: 'HIGH', matchStatus: 'POTENTIAL_MATCH', matchedWatchlists: ['PEP List - Middle East', 'UN Sanctions List'],
      confidenceScore: 78, assignedAnalyst: 'Ana Pereira',
      resolution: null, justification: '',
      createdAt: new Date('2024-10-28'), completedAt: null,
      slaDeadline: new Date('2024-11-04')
    },
    {
      id: 'SCR-003', entityName: 'Mediterranean Exports SA', entityType: 'COMPANY', country: 'Turquia',
      taxId: 'TR-8765432100', screeningType: 'AML', status: 'IN_PROGRESS',
      riskLevel: 'HIGH', matchStatus: 'POTENTIAL_MATCH', matchedWatchlists: ['FATF Grey List'],
      confidenceScore: 65, assignedAnalyst: 'Roberto Mendes',
      resolution: null, justification: '',
      createdAt: new Date('2024-11-02'), completedAt: null,
      slaDeadline: new Date('2024-11-11')
    },
    {
      id: 'SCR-004', entityName: 'Sakura Industries Ltd', entityType: 'COMPANY', country: 'Japão',
      taxId: 'JP-1234567890', screeningType: 'KYC', status: 'COMPLETED',
      riskLevel: 'LOW', matchStatus: 'CLEAR', matchedWatchlists: [],
      confidenceScore: 98, assignedAnalyst: 'Maria Santos',
      resolution: 'APPROVE', justification: 'Empresa verificada sem restrições. Cadastro completo e atualizado.',
      createdAt: new Date('2024-10-20'), completedAt: new Date('2024-10-23'),
      slaDeadline: new Date('2024-10-27')
    },
    {
      id: 'SCR-005', entityName: 'Viktor Petrov', entityType: 'INDIVIDUAL', country: 'Rússia',
      taxId: 'RU-9876543210', screeningType: 'SANCTIONS', status: 'FLAGGED',
      riskLevel: 'CRITICAL', matchStatus: 'CONFIRMED_MATCH', matchedWatchlists: ['OFAC SDN List', 'EU Sanctions', 'UK Sanctions'],
      confidenceScore: 95, assignedAnalyst: 'Pedro Costa',
      resolution: null, justification: '',
      createdAt: new Date('2024-10-30'), completedAt: null,
      slaDeadline: new Date('2024-11-06')
    },
    {
      id: 'SCR-006', entityName: 'Agro Solutions Argentina', entityType: 'COMPANY', country: 'Argentina',
      taxId: 'AR-30-71234567-8', screeningType: 'AML', status: 'COMPLETED',
      riskLevel: 'LOW', matchStatus: 'CLEAR', matchedWatchlists: [],
      confidenceScore: 92, assignedAnalyst: 'Carlos Silva',
      resolution: 'APPROVE', justification: 'Empresa com boa reputação, sem histórico de lavagem de dinheiro.',
      createdAt: new Date('2024-10-15'), completedAt: new Date('2024-10-18'),
      slaDeadline: new Date('2024-10-22')
    },
    {
      id: 'SCR-007', entityName: 'Hong Wei Trading', entityType: 'COMPANY', country: 'China',
      taxId: 'CN-91310000MA1GTRXX', screeningType: 'SANCTIONS', status: 'PENDING',
      riskLevel: 'MEDIUM', matchStatus: null, matchedWatchlists: [],
      confidenceScore: 0, assignedAnalyst: 'Ana Pereira',
      resolution: null, justification: '',
      createdAt: new Date('2024-11-03'), completedAt: null,
      slaDeadline: new Date('2024-11-10')
    },
    {
      id: 'SCR-008', entityName: 'Mohammed Hassan', entityType: 'INDIVIDUAL', country: 'Irã',
      taxId: 'IR-1234567890', screeningType: 'SANCTIONS', status: 'FLAGGED',
      riskLevel: 'CRITICAL', matchStatus: 'POTENTIAL_MATCH', matchedWatchlists: ['OFAC SDN List', 'Iran Sanctions List'],
      confidenceScore: 82, assignedAnalyst: 'Roberto Mendes',
      resolution: null, justification: '',
      createdAt: new Date('2024-10-25'), completedAt: null,
      slaDeadline: new Date('2024-11-01')
    },
    {
      id: 'SCR-009', entityName: 'Pacific Rim Commodities', entityType: 'COMPANY', country: 'Singapura',
      taxId: 'SG-200912345K', screeningType: 'KYC', status: 'COMPLETED',
      riskLevel: 'LOW', matchStatus: 'CLEAR', matchedWatchlists: [],
      confidenceScore: 96, assignedAnalyst: 'Maria Santos',
      resolution: 'APPROVE', justification: 'Empresa de Singapura verificada. Sem riscos identificados.',
      createdAt: new Date('2024-10-10'), completedAt: new Date('2024-10-12'),
      slaDeadline: new Date('2024-10-17')
    },
    {
      id: 'SCR-010', entityName: 'Sahel Resources SARL', entityType: 'COMPANY', country: 'Mali',
      taxId: 'ML-98765432', screeningType: 'AML', status: 'EXPIRED',
      riskLevel: 'HIGH', matchStatus: null, matchedWatchlists: [],
      confidenceScore: 0, assignedAnalyst: 'Pedro Costa',
      resolution: null, justification: '',
      createdAt: new Date('2024-09-15'), completedAt: null,
      slaDeadline: new Date('2024-09-22')
    },
    {
      id: 'SCR-011', entityName: 'Nordic Grain AB', entityType: 'COMPANY', country: 'Suécia',
      taxId: 'SE-556789012301', screeningType: 'KYC', status: 'COMPLETED',
      riskLevel: 'LOW', matchStatus: 'CLEAR', matchedWatchlists: [],
      confidenceScore: 99, assignedAnalyst: 'Carlos Silva',
      resolution: 'APPROVE', justification: 'Empresa sueca com excelente histórico. Aprovada sem restrições.',
      createdAt: new Date('2024-10-05'), completedAt: new Date('2024-10-07'),
      slaDeadline: new Date('2024-10-12')
    },
    {
      id: 'SCR-012', entityName: 'Dmitri Volkov', entityType: 'INDIVIDUAL', country: 'Belarus',
      taxId: 'BY-1234567890', screeningType: 'PEP', status: 'FLAGGED',
      riskLevel: 'HIGH', matchStatus: 'POTENTIAL_MATCH', matchedWatchlists: ['EU PEP List', 'Belarus Sanctions'],
      confidenceScore: 72, assignedAnalyst: 'Ana Pereira',
      resolution: null, justification: '',
      createdAt: new Date('2024-10-29'), completedAt: null,
      slaDeadline: new Date('2024-11-05')
    },
    {
      id: 'SCR-013', entityName: 'Café Colombia SAS', entityType: 'COMPANY', country: 'Colômbia',
      taxId: 'CO-900123456-7', screeningType: 'AML', status: 'IN_PROGRESS',
      riskLevel: 'MEDIUM', matchStatus: null, matchedWatchlists: [],
      confidenceScore: 45, assignedAnalyst: 'Roberto Mendes',
      resolution: null, justification: '',
      createdAt: new Date('2024-11-01'), completedAt: null,
      slaDeadline: new Date('2024-11-08')
    },
    {
      id: 'SCR-014', entityName: 'Delta Shipping LLC', entityType: 'COMPANY', country: 'Emirados Árabes',
      taxId: 'AE-123456789', screeningType: 'SANCTIONS', status: 'COMPLETED',
      riskLevel: 'MEDIUM', matchStatus: 'CLEAR', matchedWatchlists: [],
      confidenceScore: 88, assignedAnalyst: 'Maria Santos',
      resolution: 'APPROVE', justification: 'Empresa verificada, sem conexões com entidades sancionadas.',
      createdAt: new Date('2024-10-18'), completedAt: new Date('2024-10-22'),
      slaDeadline: new Date('2024-10-25')
    },
    {
      id: 'SCR-015', entityName: 'Li Wei Chen', entityType: 'INDIVIDUAL', country: 'China',
      taxId: 'CN-110101199001011234', screeningType: 'PEP', status: 'PENDING',
      riskLevel: 'MEDIUM', matchStatus: null, matchedWatchlists: [],
      confidenceScore: 0, assignedAnalyst: 'Pedro Costa',
      resolution: null, justification: '',
      createdAt: new Date('2024-11-04'), completedAt: null,
      slaDeadline: new Date('2024-11-11')
    },
    {
      id: 'SCR-016', entityName: 'Eurograin BV', entityType: 'COMPANY', country: 'Holanda',
      taxId: 'NL-123456789B01', screeningType: 'KYC', status: 'COMPLETED',
      riskLevel: 'LOW', matchStatus: 'CLEAR', matchedWatchlists: [],
      confidenceScore: 97, assignedAnalyst: 'Carlos Silva',
      resolution: 'APPROVE', justification: 'Empresa holandesa de grande porte. Cadastro validado.',
      createdAt: new Date('2024-09-28'), completedAt: new Date('2024-09-30'),
      slaDeadline: new Date('2024-10-05')
    },
    {
      id: 'SCR-017', entityName: 'Orinoco Trading CA', entityType: 'COMPANY', country: 'Venezuela',
      taxId: 'VE-J-12345678-9', screeningType: 'SANCTIONS', status: 'EXPIRED',
      riskLevel: 'CRITICAL', matchStatus: null, matchedWatchlists: [],
      confidenceScore: 0, assignedAnalyst: 'Ana Pereira',
      resolution: null, justification: '',
      createdAt: new Date('2024-09-01'), completedAt: null,
      slaDeadline: new Date('2024-09-08')
    },
    {
      id: 'SCR-018', entityName: 'Australian Wheat Board', entityType: 'COMPANY', country: 'Austrália',
      taxId: 'AU-12345678901', screeningType: 'KYC', status: 'COMPLETED',
      riskLevel: 'LOW', matchStatus: 'CLEAR', matchedWatchlists: [],
      confidenceScore: 99, assignedAnalyst: 'Maria Santos',
      resolution: 'APPROVE', justification: 'Entidade governamental australiana. Aprovação automática.',
      createdAt: new Date('2024-10-01'), completedAt: new Date('2024-10-02'),
      slaDeadline: new Date('2024-10-08')
    },
    {
      id: 'SCR-019', entityName: 'Kim Jong-su', entityType: 'INDIVIDUAL', country: 'Coreia do Norte',
      taxId: 'KP-000000000', screeningType: 'SANCTIONS', status: 'FLAGGED',
      riskLevel: 'CRITICAL', matchStatus: 'CONFIRMED_MATCH', matchedWatchlists: ['OFAC SDN List', 'UN Sanctions', 'EU Sanctions', 'UK Sanctions'],
      confidenceScore: 99, assignedAnalyst: 'Pedro Costa',
      resolution: 'REJECT', justification: 'Match confirmado com lista de sanções da ONU. Operação bloqueada.',
      createdAt: new Date('2024-10-22'), completedAt: new Date('2024-10-22'),
      slaDeadline: new Date('2024-10-29')
    },
    {
      id: 'SCR-020', entityName: 'Maputo Logistics Lda', entityType: 'COMPANY', country: 'Moçambique',
      taxId: 'MZ-400123456', screeningType: 'AML', status: 'PENDING',
      riskLevel: 'MEDIUM', matchStatus: null, matchedWatchlists: [],
      confidenceScore: 0, assignedAnalyst: 'Roberto Mendes',
      resolution: null, justification: '',
      createdAt: new Date('2024-11-04'), completedAt: null,
      slaDeadline: new Date('2024-11-11')
    },
    {
      id: 'SCR-021', entityName: 'Swiss Commodities AG', entityType: 'COMPANY', country: 'Suíça',
      taxId: 'CH-123.456.789', screeningType: 'KYC', status: 'COMPLETED',
      riskLevel: 'LOW', matchStatus: 'CLEAR', matchedWatchlists: [],
      confidenceScore: 95, assignedAnalyst: 'Carlos Silva',
      resolution: 'APPROVE', justification: 'Empresa suíça verificada. Sem restrições.',
      createdAt: new Date('2024-10-08'), completedAt: new Date('2024-10-10'),
      slaDeadline: new Date('2024-10-15')
    }
  ];

  getScreenings(filters?: DueDiligenceFilters): Observable<Screening[]> {
    let filtered = [...this.mockScreenings];

    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        filtered = filtered.filter(s =>
          s.entityName.toLowerCase().includes(search) ||
          s.taxId.toLowerCase().includes(search) ||
          s.country.toLowerCase().includes(search) ||
          s.assignedAnalyst.toLowerCase().includes(search)
        );
      }
      if (filters.screeningType) {
        filtered = filtered.filter(s => s.screeningType === filters.screeningType);
      }
      if (filters.status) {
        filtered = filtered.filter(s => s.status === filters.status);
      }
      if (filters.riskLevel) {
        filtered = filtered.filter(s => s.riskLevel === filters.riskLevel);
      }
    }

    return of(filtered).pipe(delay(300));
  }

  getScreeningsByStatus(status: ScreeningStatus): Observable<Screening[]> {
    const filtered = this.mockScreenings.filter(s => s.status === status);
    return of(filtered).pipe(delay(200));
  }

  createScreening(data: Partial<Screening>): Observable<Screening> {
    const newScreening: Screening = {
      id: `SCR-${String(this.mockScreenings.length + 1).padStart(3, '0')}`,
      entityName: data.entityName || '',
      entityType: data.entityType || 'COMPANY',
      country: data.country || '',
      taxId: data.taxId || '',
      screeningType: data.screeningType || 'KYC',
      status: 'PENDING',
      riskLevel: 'MEDIUM',
      matchStatus: null,
      matchedWatchlists: [],
      confidenceScore: 0,
      assignedAnalyst: data.assignedAnalyst || 'Sistema',
      resolution: null,
      justification: '',
      createdAt: new Date(),
      completedAt: null,
      slaDeadline: this.calculateSlaDeadline(new Date())
    };
    this.mockScreenings.unshift(newScreening);
    return of(newScreening).pipe(delay(500));
  }

  submitResolution(screeningId: string, resolution: 'APPROVE' | 'REJECT' | 'ESCALATE', justification: string): Observable<Screening> {
    const screening = this.mockScreenings.find(s => s.id === screeningId);
    if (screening) {
      screening.resolution = resolution;
      screening.justification = justification;
      screening.status = 'COMPLETED';
      screening.completedAt = new Date();
    }
    return of(screening!).pipe(delay(500));
  }

  getMetrics(): Observable<DueDiligenceMetrics> {
    const metrics: DueDiligenceMetrics = {
      totalScreenings: this.mockScreenings.length,
      pending: this.mockScreenings.filter(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS').length,
      flagged: this.mockScreenings.filter(s => s.status === 'FLAGGED').length,
      completed: this.mockScreenings.filter(s => s.status === 'COMPLETED').length,
      expired: this.mockScreenings.filter(s => s.status === 'EXPIRED').length,
      avgResolutionTime: 2.8
    };
    return of(metrics).pipe(delay(200));
  }

  private calculateSlaDeadline(from: Date): Date {
    const deadline = new Date(from);
    let businessDays = 5;
    while (businessDays > 0) {
      deadline.setDate(deadline.getDate() + 1);
      const dayOfWeek = deadline.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays--;
      }
    }
    return deadline;
  }

  calculateBusinessDaysRemaining(slaDeadline: Date): number {
    const now = new Date();
    const deadline = new Date(slaDeadline);
    if (deadline <= now) return 0;

    let businessDays = 0;
    const current = new Date(now);
    while (current < deadline) {
      current.setDate(current.getDate() + 1);
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
    }
    return businessDays;
  }
}
