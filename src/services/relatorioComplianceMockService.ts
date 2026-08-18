import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ComplianceReport, ComplianceMetrics, ComplianceByArea } from '../types/relatorio-compliance';

@Injectable({
  providedIn: 'root'
})
export class RelatorioComplianceMockService {

  private reports: ComplianceReport[] = [];
  private areas: ComplianceByArea[] = [];

  constructor() {
    this.initializeMockData();
  }

  getReports(): Observable<ComplianceReport[]> {
    return of([...this.reports]).pipe(delay(400));
  }

  getMetrics(): Observable<ComplianceMetrics> {
    const conformeCount = this.reports.filter(r => r.status === 'CONFORME').length;
    const parcialCount = this.reports.filter(r => r.status === 'PARCIAL').length;
    const naoConformeCount = this.reports.filter(r => r.status === 'NÃO_CONFORME').length;
    const naoAvaliadoCount = this.reports.filter(r => r.status === 'NÃO_AVALIADO').length;
    const overallScore = Math.round(((conformeCount * 100 + parcialCount * 50) / (this.reports.length * 100)) * 100);
    const criticalRisks = this.reports.filter(r => r.riskScore >= 80).length;
    const pendingActions = this.reports.reduce((sum, r) => sum + r.actions, 0);

    const metrics: ComplianceMetrics = {
      totalRequirements: this.reports.length,
      conformeCount,
      parcialCount,
      naoConformeCount,
      naoAvaliadoCount,
      overallScore,
      criticalRisks,
      pendingActions
    };
    return of(metrics).pipe(delay(300));
  }

  getAreaBreakdowns(): Observable<ComplianceByArea[]> {
    return of([...this.areas]).pipe(delay(350));
  }

  private initializeMockData(): void {
    this.reports = [
      {
        id: 'CMP-001', area: 'Aduaneiro', requirement: 'Classificação NCM correta',
        regulation: 'IN SRF 680/2006', status: 'CONFORME', riskScore: 15,
        responsible: 'João Oliveira', dueDate: new Date('2025-03-31'),
        lastAssessment: new Date('2024-12-01'), evidence: 'Auditoria interna Q4/2024',
        actions: 0, observations: 'Todas classificações revisadas e validadas'
      },
      {
        id: 'CMP-002', area: 'Aduaneiro', requirement: 'Declaração DU-E em conformidade',
        regulation: 'IN RFB 1702/2017', status: 'CONFORME', riskScore: 10,
        responsible: 'João Oliveira', dueDate: new Date('2025-06-30'),
        lastAssessment: new Date('2024-11-28'), evidence: 'Relatório Siscomex sem pendências',
        actions: 0, observations: 'Zero rejeições nos últimos 6 meses'
      },
      {
        id: 'CMP-003', area: 'Aduaneiro', requirement: 'Habilitação RADAR ativa',
        regulation: 'IN RFB 1984/2020', status: 'CONFORME', riskScore: 5,
        responsible: 'Carlos Silva', dueDate: new Date('2025-12-31'),
        lastAssessment: new Date('2024-12-05'), evidence: 'Certificado RADAR modalidade Ilimitada',
        actions: 0, observations: 'Renovação automática programada'
      },
      {
        id: 'CMP-004', area: 'Fiscal', requirement: 'Notas fiscais de exportação válidas',
        regulation: 'Decreto 7.212/2010', status: 'CONFORME', riskScore: 20,
        responsible: 'Ana Costa', dueDate: new Date('2025-01-31'),
        lastAssessment: new Date('2024-12-03'), evidence: 'Validação SEFAZ sem erros',
        actions: 0, observations: 'Processo automatizado via integração'
      },
      {
        id: 'CMP-005', area: 'Fiscal', requirement: 'Apuração ICMS exportação',
        regulation: 'LC 87/1996 Art. 3°', status: 'PARCIAL', riskScore: 45,
        responsible: 'Ana Costa', dueDate: new Date('2025-02-28'),
        lastAssessment: new Date('2024-11-25'), evidence: 'Relatório contábil com ressalvas',
        actions: 2, observations: 'Pendente ajuste de créditos acumulados em 3 estados'
      },
      {
        id: 'CMP-006', area: 'Fiscal', requirement: 'Drawback suspensão controlado',
        regulation: 'Portaria SECEX 44/2020', status: 'PARCIAL', riskScore: 55,
        responsible: 'Ana Costa', dueDate: new Date('2025-01-15'),
        lastAssessment: new Date('2024-12-02'), evidence: 'Atos concessórios em análise',
        actions: 3, observations: '2 atos concessórios com prazo próximo do vencimento'
      },
      {
        id: 'CMP-007', area: 'Sanitário', requirement: 'Certificado fitossanitário válido',
        regulation: 'IN MAPA 36/2006', status: 'CONFORME', riskScore: 12,
        responsible: 'Pedro Mendes', dueDate: new Date('2025-06-30'),
        lastAssessment: new Date('2024-12-04'), evidence: 'Certificados emitidos via e-SIF',
        actions: 0, observations: 'Integração MAPA funcionando corretamente'
      },
      {
        id: 'CMP-008', area: 'Sanitário', requirement: 'Habilitação SIF para exportação',
        regulation: 'Decreto 9.013/2017', status: 'CONFORME', riskScore: 8,
        responsible: 'Pedro Mendes', dueDate: new Date('2025-12-31'),
        lastAssessment: new Date('2024-11-20'), evidence: 'Registro SIF ativo e vigente',
        actions: 0, observations: 'Planta habilitada para mercados UE e Oriente Médio'
      },
      {
        id: 'CMP-009', area: 'Sanitário', requirement: 'Controle de resíduos e contaminantes',
        regulation: 'IN MAPA 51/2019', status: 'NÃO_CONFORME', riskScore: 85,
        responsible: 'Pedro Mendes', dueDate: new Date('2024-12-31'),
        lastAssessment: new Date('2024-12-05'), evidence: 'Laudo laboratorial com desvio',
        actions: 4, observations: 'Lote LOT-099 apresentou resíduo acima do limite para mercado japonês'
      },
      {
        id: 'CMP-010', area: 'Ambiental', requirement: 'Licença ambiental de operação',
        regulation: 'LC 140/2011', status: 'CONFORME', riskScore: 18,
        responsible: 'Roberto Dias', dueDate: new Date('2026-06-30'),
        lastAssessment: new Date('2024-11-15'), evidence: 'LO n° 2024/AMB-567 vigente',
        actions: 0, observations: 'Válida até junho/2026'
      },
      {
        id: 'CMP-011', area: 'Ambiental', requirement: 'PGRS - Gestão de resíduos sólidos',
        regulation: 'Lei 12.305/2010', status: 'PARCIAL', riskScore: 40,
        responsible: 'Roberto Dias', dueDate: new Date('2025-03-31'),
        lastAssessment: new Date('2024-11-30'), evidence: 'PGRS atualizado parcialmente',
        actions: 2, observations: 'Falta incluir novo galpão de armazenagem'
      },
      {
        id: 'CMP-012', area: 'Ambiental', requirement: 'Controle de emissões atmosféricas',
        regulation: 'Resolução CONAMA 382/2006', status: 'NÃO_AVALIADO', riskScore: 30,
        responsible: 'Roberto Dias', dueDate: new Date('2025-06-30'),
        lastAssessment: new Date('2024-09-15'), evidence: 'Pendente medição semestral',
        actions: 1, observations: 'Medição agendada para janeiro/2025'
      },
      {
        id: 'CMP-013', area: 'Cambial', requirement: 'Contratos de câmbio registrados',
        regulation: 'Circular BCB 3.691/2013', status: 'CONFORME', riskScore: 10,
        responsible: 'Ana Costa', dueDate: new Date('2025-12-31'),
        lastAssessment: new Date('2024-12-05'), evidence: 'Todos contratos registrados no SCE',
        actions: 0, observations: 'Processo integrado com bancos parceiros'
      },
      {
        id: 'CMP-014', area: 'Cambial', requirement: 'Prazo de liquidação de câmbio',
        regulation: 'Resolução BCB 277/2022', status: 'PARCIAL', riskScore: 50,
        responsible: 'Ana Costa', dueDate: new Date('2025-01-31'),
        lastAssessment: new Date('2024-12-01'), evidence: 'Relatório com 2 operações atrasadas',
        actions: 2, observations: '2 contratos com vencimento excedido aguardando documentação'
      },
      {
        id: 'CMP-015', area: 'Cambial', requirement: 'Vinculação RE x Contrato Câmbio',
        regulation: 'Circular BCB 3.691/2013', status: 'NÃO_CONFORME', riskScore: 75,
        responsible: 'Ana Costa', dueDate: new Date('2024-12-20'),
        lastAssessment: new Date('2024-12-04'), evidence: '5 REs sem vinculação cambial',
        actions: 5, observations: 'Urgente: vincular contratos antes do fechamento do mês'
      },
      {
        id: 'CMP-016', area: 'Documental', requirement: 'Invoice comercial conforme UCP 600',
        regulation: 'UCP 600 - ICC', status: 'CONFORME', riskScore: 15,
        responsible: 'Maria Santos', dueDate: new Date('2025-06-30'),
        lastAssessment: new Date('2024-12-03'), evidence: 'Templates revisados pelo jurídico',
        actions: 0, observations: 'Modelo padronizado para todos os mercados'
      },
      {
        id: 'CMP-017', area: 'Documental', requirement: 'Packing List com rastreabilidade',
        regulation: 'Instrução normativa interna', status: 'CONFORME', riskScore: 12,
        responsible: 'Maria Santos', dueDate: new Date('2025-12-31'),
        lastAssessment: new Date('2024-11-28'), evidence: 'Sistema gera automaticamente',
        actions: 0, observations: 'QR Code implementado em 100% dos embarques'
      },
      {
        id: 'CMP-018', area: 'Documental', requirement: 'Certificado de Origem digital',
        regulation: 'Portaria SECEX 12/2024', status: 'PARCIAL', riskScore: 35,
        responsible: 'Maria Santos', dueDate: new Date('2025-02-28'),
        lastAssessment: new Date('2024-12-01'), evidence: 'Migração em andamento',
        actions: 1, observations: 'Falta integração com 2 câmaras de comércio bilaterais'
      },
      {
        id: 'CMP-019', area: 'Trabalhista', requirement: 'NR-11 Transporte e movimentação',
        regulation: 'NR-11 MTE', status: 'CONFORME', riskScore: 20,
        responsible: 'Fernanda Lima', dueDate: new Date('2025-06-30'),
        lastAssessment: new Date('2024-11-15'), evidence: 'Inspeção SESMT aprovada',
        actions: 0, observations: 'Treinamentos atualizados em novembro/2024'
      },
      {
        id: 'CMP-020', area: 'Trabalhista', requirement: 'PPRA - Riscos ambientais',
        regulation: 'NR-9 MTE', status: 'NÃO_AVALIADO', riskScore: 35,
        responsible: 'Fernanda Lima', dueDate: new Date('2025-03-31'),
        lastAssessment: new Date('2024-08-20'), evidence: 'Pendente revisão anual',
        actions: 1, observations: 'Última avaliação há mais de 4 meses'
      },
      {
        id: 'CMP-021', area: 'Segurança', requirement: 'ISPS Code - Segurança portuária',
        regulation: 'Decreto 6.869/2009', status: 'CONFORME', riskScore: 10,
        responsible: 'João Oliveira', dueDate: new Date('2025-12-31'),
        lastAssessment: new Date('2024-12-02'), evidence: 'Certificado ISPS vigente',
        actions: 0, observations: 'Renovado em setembro/2024'
      },
      {
        id: 'CMP-022', area: 'Segurança', requirement: 'OEA - Operador Econômico Autorizado',
        regulation: 'IN RFB 1985/2020', status: 'PARCIAL', riskScore: 60,
        responsible: 'Carlos Silva', dueDate: new Date('2025-06-30'),
        lastAssessment: new Date('2024-11-30'), evidence: 'Processo de certificação em andamento',
        actions: 3, observations: 'Fase 2 de 4 concluída - pendente auditoria RFB'
      },
      {
        id: 'CMP-023', area: 'Segurança', requirement: 'Proteção de dados LGPD',
        regulation: 'Lei 13.709/2018', status: 'NÃO_CONFORME', riskScore: 90,
        responsible: 'Roberto Dias', dueDate: new Date('2024-12-15'),
        lastAssessment: new Date('2024-12-05'), evidence: 'Gap analysis com 8 não-conformidades',
        actions: 8, observations: 'CRÍTICO: Dados de parceiros internacionais sem consentimento adequado'
      }
    ];

    this.areas = [
      { area: 'Aduaneiro', total: 3, conforme: 3, parcial: 0, naoConforme: 0, score: 100 },
      { area: 'Fiscal', total: 3, conforme: 1, parcial: 2, naoConforme: 0, score: 67 },
      { area: 'Sanitário', total: 3, conforme: 2, parcial: 0, naoConforme: 1, score: 67 },
      { area: 'Ambiental', total: 3, conforme: 1, parcial: 1, naoConforme: 0, score: 50 },
      { area: 'Cambial', total: 3, conforme: 1, parcial: 1, naoConforme: 1, score: 50 },
      { area: 'Documental', total: 3, conforme: 2, parcial: 1, naoConforme: 0, score: 83 },
      { area: 'Trabalhista', total: 2, conforme: 1, parcial: 0, naoConforme: 0, score: 50 },
      { area: 'Segurança', total: 3, conforme: 1, parcial: 1, naoConforme: 1, score: 50 }
    ];
  }
}
