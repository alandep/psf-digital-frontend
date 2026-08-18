import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { RegraAutomacao, RegrasMetrics } from '../types/automacao-regras';

@Injectable({
  providedIn: 'root'
})
export class RegrasAtivasMockService {

  private regras: RegraAutomacao[] = [];

  constructor() {
    this.initializeMockData();
  }

  getRegras(): Observable<RegraAutomacao[]> {
    return of([...this.regras]).pipe(delay(400));
  }

  getMetrics(): Observable<RegrasMetrics> {
    const ativas = this.regras.filter(r => r.status === 'ATIVA').length;
    const pausadas = this.regras.filter(r => r.status === 'PAUSADA').length;
    const comErro = this.regras.filter(r => r.status === 'ERRO').length;
    const execucoesHoje = this.regras.reduce((sum, r) => sum + Math.floor(r.executionCount * 0.05), 0);
    const taxaSucessoMedia = Math.round(this.regras.reduce((sum, r) => sum + r.successRate, 0) / this.regras.length);

    const metrics: RegrasMetrics = {
      totalRegras: this.regras.length,
      ativas,
      pausadas,
      comErro,
      execucoesHoje,
      taxaSucessoMedia
    };
    return of(metrics).pipe(delay(300));
  }

  private initializeMockData(): void {
    this.regras = [
      {
        id: 'REG-001', name: 'Enviar alerta quando certificado vencer em 30 dias',
        description: 'Monitora validade dos certificados e envia notificação ao responsável',
        categoria: 'DOCUMENTOS', trigger: 'AGENDAMENTO', status: 'ATIVA',
        condition: 'certificado.validade <= hoje + 30 dias',
        action: 'Enviar e-mail + notificação push ao responsável',
        createdBy: 'João Oliveira', createdAt: new Date('2024-06-15'),
        lastExecution: new Date('2025-01-10T08:30:00'), executionCount: 342, successRate: 98.5, priority: 1
      },
      {
        id: 'REG-002', name: 'Gerar Invoice automaticamente após contrato aprovado',
        description: 'Cria invoice comercial quando contrato muda para status aprovado',
        categoria: 'FINANCEIRO', trigger: 'EVENTO', status: 'ATIVA',
        condition: 'contrato.status == APROVADO',
        action: 'Gerar Invoice com dados do contrato e enviar para validação',
        createdBy: 'Ana Costa', createdAt: new Date('2024-07-20'),
        lastExecution: new Date('2025-01-09T14:22:00'), executionCount: 187, successRate: 96.2, priority: 2
      },
      {
        id: 'REG-003', name: 'Notificar compliance quando DU-E for parametrizada em canal vermelho',
        description: 'Alerta equipe de compliance sobre DU-E em canal vermelho para ação imediata',
        categoria: 'COMPLIANCE', trigger: 'EVENTO', status: 'ATIVA',
        condition: 'due.canal == VERMELHO',
        action: 'Notificar equipe compliance + criar tarefa urgente',
        createdBy: 'Carlos Silva', createdAt: new Date('2024-05-10'),
        lastExecution: new Date('2025-01-08T11:45:00'), executionCount: 23, successRate: 100, priority: 1
      },
      {
        id: 'REG-004', name: 'Bloquear embarque sem certificado fitossanitário',
        description: 'Impede finalização de embarque quando certificado fitossanitário não está anexado',
        categoria: 'QUALIDADE', trigger: 'CONDIÇÃO', status: 'ATIVA',
        condition: 'embarque.certificadoFitossanitario == null',
        action: 'Bloquear embarque + notificar responsável de qualidade',
        createdBy: 'Pedro Mendes', createdAt: new Date('2024-04-03'),
        lastExecution: new Date('2025-01-10T06:15:00'), executionCount: 56, successRate: 100, priority: 1
      },
      {
        id: 'REG-005', name: 'Atualizar câmbio diariamente às 09:00',
        description: 'Busca cotação atualizada do dólar e euro no Banco Central',
        categoria: 'FINANCEIRO', trigger: 'AGENDAMENTO', status: 'ATIVA',
        condition: 'horário == 09:00 BRT (dias úteis)',
        action: 'Consultar API BCB e atualizar tabela de câmbio',
        createdBy: 'Ana Costa', createdAt: new Date('2024-03-15'),
        lastExecution: new Date('2025-01-10T09:00:00'), executionCount: 298, successRate: 99.3, priority: 2
      },
      {
        id: 'REG-006', name: 'Enviar relatório semanal de exportações',
        description: 'Gera e envia relatório consolidado de exportações toda segunda-feira',
        categoria: 'EXPORTAÇÕES', trigger: 'AGENDAMENTO', status: 'ATIVA',
        condition: 'dia_semana == segunda-feira && horário == 07:00',
        action: 'Gerar PDF relatório + enviar para diretoria',
        createdBy: 'Maria Santos', createdAt: new Date('2024-08-01'),
        lastExecution: new Date('2025-01-06T07:00:00'), executionCount: 52, successRate: 100, priority: 3
      },
      {
        id: 'REG-007', name: 'Alertar sobre embarque atrasado > 5 dias',
        description: 'Detecta embarques com atraso superior a 5 dias e notifica gerência',
        categoria: 'LOGÍSTICA', trigger: 'AGENDAMENTO', status: 'ATIVA',
        condition: 'embarque.atraso > 5 dias',
        action: 'Enviar alerta urgente + escalar para gerência logística',
        createdBy: 'Roberto Dias', createdAt: new Date('2024-09-12'),
        lastExecution: new Date('2025-01-10T10:00:00'), executionCount: 89, successRate: 97.8, priority: 1
      },
      {
        id: 'REG-008', name: 'Validar dados do packing list antes do embarque',
        description: 'Verifica consistência do packing list com o pedido de exportação',
        categoria: 'DOCUMENTOS', trigger: 'EVENTO', status: 'ATIVA',
        condition: 'packingList.status == FINALIZADO',
        action: 'Validar quantidades, pesos e volumes vs pedido',
        createdBy: 'Maria Santos', createdAt: new Date('2024-07-05'),
        lastExecution: new Date('2025-01-09T16:30:00'), executionCount: 245, successRate: 94.7, priority: 2
      },
      {
        id: 'REG-009', name: 'Notificar vencimento de licença ANVISA',
        description: 'Monitora licenças ANVISA e alerta 60 dias antes do vencimento',
        categoria: 'COMPLIANCE', trigger: 'AGENDAMENTO', status: 'PAUSADA',
        condition: 'licenca.validade <= hoje + 60 dias',
        action: 'Enviar notificação ao setor regulatório',
        createdBy: 'Fernanda Lima', createdAt: new Date('2024-06-20'),
        lastExecution: new Date('2024-12-15T08:00:00'), executionCount: 18, successRate: 100, priority: 2
      },
      {
        id: 'REG-010', name: 'Calcular rentabilidade ao fechar contrato',
        description: 'Calcula automaticamente a rentabilidade quando contrato é finalizado',
        categoria: 'FINANCEIRO', trigger: 'EVENTO', status: 'ATIVA',
        condition: 'contrato.status == FECHADO',
        action: 'Calcular margem bruta e líquida + registrar no dashboard',
        createdBy: 'Ana Costa', createdAt: new Date('2024-10-01'),
        lastExecution: new Date('2025-01-08T17:45:00'), executionCount: 134, successRate: 99.3, priority: 2
      },
      {
        id: 'REG-011', name: 'Sincronizar dados com Siscomex',
        description: 'Sincroniza status de DU-E e RE com o Siscomex a cada 2 horas',
        categoria: 'EXPORTAÇÕES', trigger: 'AGENDAMENTO', status: 'ERRO',
        condition: 'intervalo == 2 horas (horário comercial)',
        action: 'Consultar API Siscomex e atualizar registros locais',
        createdBy: 'Carlos Silva', createdAt: new Date('2024-04-15'),
        lastExecution: new Date('2025-01-09T16:00:00'), executionCount: 1250, successRate: 87.4, priority: 1
      },
      {
        id: 'REG-012', name: 'Gerar alerta de estoque mínimo para exportação',
        description: 'Alerta quando estoque de produto para exportação atinge nível crítico',
        categoria: 'LOGÍSTICA', trigger: 'CONDIÇÃO', status: 'ATIVA',
        condition: 'produto.estoque <= produto.estoqueMinimo',
        action: 'Notificar setor de produção + atualizar forecast',
        createdBy: 'Pedro Mendes', createdAt: new Date('2024-11-05'),
        lastExecution: new Date('2025-01-10T07:30:00'), executionCount: 67, successRate: 100, priority: 2
      },
      {
        id: 'REG-013', name: 'Webhook - Receber confirmação de chegada do navio',
        description: 'Recebe notificação de armadores sobre chegada de navios nos portos',
        categoria: 'LOGÍSTICA', trigger: 'WEBHOOK', status: 'ATIVA',
        condition: 'webhook.evento == VESSEL_ARRIVAL',
        action: 'Atualizar status do embarque + notificar equipe operacional',
        createdBy: 'Roberto Dias', createdAt: new Date('2024-08-20'),
        lastExecution: new Date('2025-01-10T04:20:00'), executionCount: 156, successRate: 95.5, priority: 2
      },
      {
        id: 'REG-014', name: 'Enviar documentos automaticamente ao despachante',
        description: 'Envia pacote documental ao despachante quando embarque é confirmado',
        categoria: 'DOCUMENTOS', trigger: 'EVENTO', status: 'PAUSADA',
        condition: 'embarque.status == CONFIRMADO',
        action: 'Compilar documentos + enviar via portal do despachante',
        createdBy: 'Maria Santos', createdAt: new Date('2024-09-30'),
        lastExecution: new Date('2024-12-20T10:00:00'), executionCount: 78, successRate: 92.3, priority: 3
      },
      {
        id: 'REG-015', name: 'Monitorar prazo de drawback',
        description: 'Monitora prazos de atos concessórios de drawback e alerta antes do vencimento',
        categoria: 'COMPLIANCE', trigger: 'AGENDAMENTO', status: 'ATIVA',
        condition: 'drawback.prazo <= hoje + 45 dias',
        action: 'Alertar setor fiscal + gerar relatório de pendências',
        createdBy: 'Ana Costa', createdAt: new Date('2024-05-25'),
        lastExecution: new Date('2025-01-10T08:00:00'), executionCount: 45, successRate: 100, priority: 1
      },
      {
        id: 'REG-016', name: 'Notificar quando NCM for reclassificada',
        description: 'Detecta mudanças na classificação NCM pela Receita Federal',
        categoria: 'NOTIFICAÇÕES', trigger: 'WEBHOOK', status: 'ATIVA',
        condition: 'webhook.evento == NCM_RECLASSIFICACAO',
        action: 'Notificar equipe tributária + marcar produtos afetados',
        createdBy: 'João Oliveira', createdAt: new Date('2024-10-15'),
        lastExecution: new Date('2025-01-05T14:30:00'), executionCount: 8, successRate: 100, priority: 1
      },
      {
        id: 'REG-017', name: 'Gerar relatório de qualidade pós-embarque',
        description: 'Cria relatório de qualidade 7 dias após a chegada do embarque',
        categoria: 'QUALIDADE', trigger: 'AGENDAMENTO', status: 'ATIVA',
        condition: 'embarque.chegada + 7 dias == hoje',
        action: 'Compilar dados de qualidade + enviar ao importador',
        createdBy: 'Pedro Mendes', createdAt: new Date('2024-11-20'),
        lastExecution: new Date('2025-01-09T09:00:00'), executionCount: 34, successRate: 97.1, priority: 3
      }
    ];
  }
}
