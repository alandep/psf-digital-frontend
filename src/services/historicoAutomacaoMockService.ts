import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ExecucaoRegra, HistoricoMetrics } from '../types/automacao-historico';

@Injectable({
  providedIn: 'root'
})
export class HistoricoAutomacaoMockService {

  private execucoes: ExecucaoRegra[] = [];

  constructor() {
    this.initializeMockData();
  }

  getExecucoes(): Observable<ExecucaoRegra[]> {
    return of([...this.execucoes]).pipe(delay(400));
  }

  getMetrics(): Observable<HistoricoMetrics> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const execucoesHoje = this.execucoes.filter(e => {
      const execDate = new Date(e.startTime);
      execDate.setHours(0, 0, 0, 0);
      return execDate.getTime() === hoje.getTime();
    }).length;

    const sucessos = this.execucoes.filter(e => e.status === 'SUCESSO').length;
    const falhas = this.execucoes.filter(e => e.status === 'FALHA').length;
    const tempoMedio = Math.round(this.execucoes.reduce((sum, e) => sum + e.duration, 0) / this.execucoes.length);
    const taxaSucesso = Math.round((sucessos / this.execucoes.length) * 100);

    const metrics: HistoricoMetrics = {
      totalExecucoes: this.execucoes.length,
      execucoesHoje,
      sucessos,
      falhas,
      tempoMedio,
      taxaSucesso
    };
    return of(metrics).pipe(delay(300));
  }

  private initializeMockData(): void {
    const now = new Date();

    this.execucoes = [
      {
        id: 'EXE-001', ruleId: 'REG-001', ruleName: 'Enviar alerta quando certificado vencer em 30 dias',
        categoria: 'DOCUMENTOS', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 1200),
        duration: 1200, input: '3 certificados próximos do vencimento',
        output: '3 e-mails enviados com sucesso', error: '', affectedEntities: 3
      },
      {
        id: 'EXE-002', ruleId: 'REG-005', ruleName: 'Atualizar câmbio diariamente às 09:00',
        categoria: 'FINANCEIRO', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 3 * 60 * 60 * 1000 + 3500),
        duration: 3500, input: 'Consulta cotações USD, EUR, GBP',
        output: 'USD: 5.89, EUR: 6.12, GBP: 7.35 - atualizado', error: '', affectedEntities: 3
      },
      {
        id: 'EXE-003', ruleId: 'REG-011', ruleName: 'Sincronizar dados com Siscomex',
        categoria: 'EXPORTAÇÕES', trigger: 'AGENDAMENTO', status: 'FALHA',
        startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 4 * 60 * 60 * 1000 + 30000),
        duration: 30000, input: 'Sincronização de 15 DU-Es pendentes',
        output: '', error: 'Timeout: API Siscomex não respondeu em 30s', affectedEntities: 0
      },
      {
        id: 'EXE-004', ruleId: 'REG-002', ruleName: 'Gerar Invoice automaticamente após contrato aprovado',
        categoria: 'FINANCEIRO', trigger: 'EVENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 5 * 60 * 60 * 1000 + 4500),
        duration: 4500, input: 'Contrato CTR-2025-0142 aprovado',
        output: 'Invoice INV-2025-0089 gerada com sucesso', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-005', ruleId: 'REG-004', ruleName: 'Bloquear embarque sem certificado fitossanitário',
        categoria: 'QUALIDADE', trigger: 'CONDIÇÃO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 6 * 60 * 60 * 1000 + 800),
        duration: 800, input: 'Embarque EMB-2025-0034 sem certificado',
        output: 'Embarque bloqueado - notificação enviada a Pedro Mendes', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-006', ruleId: 'REG-013', ruleName: 'Webhook - Receber confirmação de chegada do navio',
        categoria: 'LOGÍSTICA', trigger: 'WEBHOOK', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 8 * 60 * 60 * 1000 + 2100),
        duration: 2100, input: 'Navio MSC Fantasia - Porto de Santos',
        output: 'Status atualizado para 3 embarques', error: '', affectedEntities: 3
      },
      {
        id: 'EXE-007', ruleId: 'REG-007', ruleName: 'Alertar sobre embarque atrasado > 5 dias',
        categoria: 'LOGÍSTICA', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 14 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 14 * 60 * 60 * 1000 + 1800),
        duration: 1800, input: 'Verificação de 45 embarques ativos',
        output: '2 embarques com atraso > 5 dias - alertas enviados', error: '', affectedEntities: 2
      },
      {
        id: 'EXE-008', ruleId: 'REG-008', ruleName: 'Validar dados do packing list antes do embarque',
        categoria: 'DOCUMENTOS', trigger: 'EVENTO', status: 'PARCIAL',
        startTime: new Date(now.getTime() - 20 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 20 * 60 * 60 * 1000 + 5200),
        duration: 5200, input: 'Packing List PL-2025-0067 finalizado',
        output: 'Quantidades OK - Divergência de peso em 1 item (2.3kg vs 2.5kg)',
        error: 'Aviso: peso divergente no item 4', affectedEntities: 1
      },
      {
        id: 'EXE-009', ruleId: 'REG-011', ruleName: 'Sincronizar dados com Siscomex',
        categoria: 'EXPORTAÇÕES', trigger: 'AGENDAMENTO', status: 'TIMEOUT',
        startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 60000),
        duration: 60000, input: 'Sincronização completa agendada',
        output: '', error: 'Connection timeout após 60s - serviço Siscomex indisponível', affectedEntities: 0
      },
      {
        id: 'EXE-010', ruleId: 'REG-003', ruleName: 'Notificar compliance quando DU-E for parametrizada em canal vermelho',
        categoria: 'COMPLIANCE', trigger: 'EVENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 26 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 26 * 60 * 60 * 1000 + 900),
        duration: 900, input: 'DU-E 2025/0001234 parametrizada canal vermelho',
        output: 'Equipe compliance notificada - tarefa URG-089 criada', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-011', ruleId: 'REG-010', ruleName: 'Calcular rentabilidade ao fechar contrato',
        categoria: 'FINANCEIRO', trigger: 'EVENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 30 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 30 * 60 * 60 * 1000 + 6800),
        duration: 6800, input: 'Contrato CTR-2025-0138 fechado',
        output: 'Margem bruta: 22.4% | Margem líquida: 15.8%', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-012', ruleId: 'REG-006', ruleName: 'Enviar relatório semanal de exportações',
        categoria: 'EXPORTAÇÕES', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 48 * 60 * 60 * 1000 + 12000),
        duration: 12000, input: 'Gerar relatório semana 02/2025',
        output: 'PDF gerado (23 páginas) - enviado para 5 destinatários', error: '', affectedEntities: 5
      },
      {
        id: 'EXE-013', ruleId: 'REG-012', ruleName: 'Gerar alerta de estoque mínimo para exportação',
        categoria: 'LOGÍSTICA', trigger: 'CONDIÇÃO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 50 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 50 * 60 * 60 * 1000 + 1500),
        duration: 1500, input: 'Produto Café Arábica Premium atingiu nível crítico',
        output: 'Alerta enviado ao setor de produção', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-014', ruleId: 'REG-015', ruleName: 'Monitorar prazo de drawback',
        categoria: 'COMPLIANCE', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 52 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 52 * 60 * 60 * 1000 + 2200),
        duration: 2200, input: 'Verificação de 8 atos concessórios ativos',
        output: '1 ato concessório vence em 40 dias - alerta enviado', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-015', ruleId: 'REG-016', ruleName: 'Notificar quando NCM for reclassificada',
        categoria: 'NOTIFICAÇÕES', trigger: 'WEBHOOK', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 72 * 60 * 60 * 1000 + 1100),
        duration: 1100, input: 'NCM 0901.11.10 reclassificada pela RFB',
        output: 'Equipe tributária notificada - 4 produtos afetados marcados', error: '', affectedEntities: 4
      },
      {
        id: 'EXE-016', ruleId: 'REG-002', ruleName: 'Gerar Invoice automaticamente após contrato aprovado',
        categoria: 'FINANCEIRO', trigger: 'EVENTO', status: 'FALHA',
        startTime: new Date(now.getTime() - 75 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 75 * 60 * 60 * 1000 + 8000),
        duration: 8000, input: 'Contrato CTR-2025-0135 aprovado',
        output: '', error: 'Erro: Campo "incoterm" obrigatório não preenchido no contrato', affectedEntities: 0
      },
      {
        id: 'EXE-017', ruleId: 'REG-001', ruleName: 'Enviar alerta quando certificado vencer em 30 dias',
        categoria: 'DOCUMENTOS', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 96 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 96 * 60 * 60 * 1000 + 1400),
        duration: 1400, input: '5 certificados próximos do vencimento',
        output: '5 e-mails enviados com sucesso', error: '', affectedEntities: 5
      },
      {
        id: 'EXE-018', ruleId: 'REG-017', ruleName: 'Gerar relatório de qualidade pós-embarque',
        categoria: 'QUALIDADE', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 100 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 100 * 60 * 60 * 1000 + 15000),
        duration: 15000, input: 'Embarque EMB-2024-0298 chegou há 7 dias',
        output: 'Relatório de qualidade QR-2025-012 gerado e enviado', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-019', ruleId: 'REG-011', ruleName: 'Sincronizar dados com Siscomex',
        categoria: 'EXPORTAÇÕES', trigger: 'AGENDAMENTO', status: 'PARCIAL',
        startTime: new Date(now.getTime() - 110 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 110 * 60 * 60 * 1000 + 25000),
        duration: 25000, input: 'Sincronização de 20 DU-Es',
        output: '15 DU-Es sincronizadas com sucesso', error: '5 DU-Es com erro de validação no Siscomex', affectedEntities: 15
      },
      {
        id: 'EXE-020', ruleId: 'REG-007', ruleName: 'Alertar sobre embarque atrasado > 5 dias',
        categoria: 'LOGÍSTICA', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 120 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 120 * 60 * 60 * 1000 + 2000),
        duration: 2000, input: 'Verificação de 42 embarques ativos',
        output: '4 embarques com atraso > 5 dias - alertas enviados', error: '', affectedEntities: 4
      },
      {
        id: 'EXE-021', ruleId: 'REG-005', ruleName: 'Atualizar câmbio diariamente às 09:00',
        categoria: 'FINANCEIRO', trigger: 'AGENDAMENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 124 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 124 * 60 * 60 * 1000 + 2800),
        duration: 2800, input: 'Consulta cotações USD, EUR, GBP',
        output: 'USD: 5.92, EUR: 6.15, GBP: 7.38 - atualizado', error: '', affectedEntities: 3
      },
      {
        id: 'EXE-022', ruleId: 'REG-013', ruleName: 'Webhook - Receber confirmação de chegada do navio',
        categoria: 'LOGÍSTICA', trigger: 'WEBHOOK', status: 'CANCELADA',
        startTime: new Date(now.getTime() - 130 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 130 * 60 * 60 * 1000 + 500),
        duration: 500, input: 'Navio CMA CGM Marco Polo - Porto de Paranaguá',
        output: '', error: 'Cancelada: navio não consta nos embarques ativos', affectedEntities: 0
      },
      {
        id: 'EXE-023', ruleId: 'REG-004', ruleName: 'Bloquear embarque sem certificado fitossanitário',
        categoria: 'QUALIDADE', trigger: 'CONDIÇÃO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 140 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 140 * 60 * 60 * 1000 + 750),
        duration: 750, input: 'Embarque EMB-2025-0029 sem certificado',
        output: 'Embarque bloqueado - notificação enviada', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-024', ruleId: 'REG-008', ruleName: 'Validar dados do packing list antes do embarque',
        categoria: 'DOCUMENTOS', trigger: 'EVENTO', status: 'FALHA',
        startTime: new Date(now.getTime() - 145 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 145 * 60 * 60 * 1000 + 3200),
        duration: 3200, input: 'Packing List PL-2025-0061 finalizado',
        output: '', error: 'Erro crítico: Quantidade total excede capacidade do container (28.5t > 26t)', affectedEntities: 0
      },
      {
        id: 'EXE-025', ruleId: 'REG-010', ruleName: 'Calcular rentabilidade ao fechar contrato',
        categoria: 'FINANCEIRO', trigger: 'EVENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 150 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 150 * 60 * 60 * 1000 + 7200),
        duration: 7200, input: 'Contrato CTR-2025-0130 fechado',
        output: 'Margem bruta: 18.7% | Margem líquida: 12.3%', error: '', affectedEntities: 1
      },
      {
        id: 'EXE-026', ruleId: 'REG-003', ruleName: 'Notificar compliance quando DU-E for parametrizada em canal vermelho',
        categoria: 'COMPLIANCE', trigger: 'EVENTO', status: 'SUCESSO',
        startTime: new Date(now.getTime() - 160 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 160 * 60 * 60 * 1000 + 850),
        duration: 850, input: 'DU-E 2024/0009876 parametrizada canal vermelho',
        output: 'Equipe compliance notificada - tarefa URG-085 criada', error: '', affectedEntities: 1
      }
    ];
  }
}
