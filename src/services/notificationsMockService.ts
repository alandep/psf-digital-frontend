import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  AppNotification,
  NotificationChannel,
  NotificationPriority,
  NotificationMetrics,
  NotificationFilters
} from '../types/notifications';

@Injectable({ providedIn: 'root' })
export class NotificationsMockService {

  private notifications: AppNotification[] = this.generateNotifications();

  getNotifications(filters?: NotificationFilters): Observable<AppNotification[]> {
    let result = [...this.notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (filters) {
      if (filters.searchText) {
        const s = filters.searchText.toLowerCase();
        result = result.filter(n =>
          n.title.toLowerCase().includes(s) ||
          n.message.toLowerCase().includes(s) ||
          n.sender.toLowerCase().includes(s)
        );
      }
      if (filters.channels.length > 0) result = result.filter(n => filters.channels.includes(n.channel));
      if (filters.priorities.length > 0) result = result.filter(n => filters.priorities.includes(n.priority));
      if (filters.readStatus === 'read') result = result.filter(n => n.isRead);
      if (filters.readStatus === 'unread') result = result.filter(n => !n.isRead);
      if (filters.dateStart) result = result.filter(n => n.createdAt >= new Date(filters.dateStart!));
      if (filters.dateEnd) result = result.filter(n => n.createdAt <= new Date(filters.dateEnd!));
    }
    return of(result).pipe(delay(300));
  }

  getMetrics(): Observable<NotificationMetrics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const metrics: NotificationMetrics = {
      naoLidas: this.notifications.filter(n => !n.isRead).length,
      criticasNaoLidas: this.notifications.filter(n => !n.isRead && n.priority === 'CRITICAL').length,
      hoje: this.notifications.filter(n => n.createdAt >= todayStart).length,
      estaSemana: this.notifications.filter(n => n.createdAt >= weekStart).length,
    };
    return of(metrics).pipe(delay(200));
  }

  markAsRead(id: string): Observable<AppNotification> {
    const n = this.notifications.find(x => x.id === id);
    if (n) {
      n.isRead = true;
      n.readAt = new Date();
    }
    return of(n!).pipe(delay(150));
  }

  markAllAsRead(): Observable<{ success: boolean; count: number }> {
    const count = this.notifications.filter(n => !n.isRead).length;
    this.notifications.forEach(n => {
      if (!n.isRead) {
        n.isRead = true;
        n.readAt = new Date();
      }
    });
    return of({ success: true, count }).pipe(delay(300));
  }

  getChannels(): { value: NotificationChannel; label: string; icon: string }[] {
    return [
      { value: 'PLATFORM', label: 'Plataforma', icon: 'computer' },
      { value: 'EMAIL', label: 'E-mail', icon: 'email' },
      { value: 'PUSH', label: 'Push', icon: 'notifications' },
      { value: 'WHATSAPP', label: 'WhatsApp', icon: 'chat' },
    ];
  }

  getPriorities(): { value: NotificationPriority; label: string }[] {
    return [
      { value: 'CRITICAL', label: 'Crítica' },
      { value: 'HIGH', label: 'Alta' },
      { value: 'MEDIUM', label: 'Média' },
      { value: 'LOW', label: 'Baixa' },
    ];
  }

  isEscalated(notification: AppNotification): boolean {
    if (notification.isRead || notification.priority !== 'CRITICAL') return false;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return notification.createdAt < oneHourAgo;
  }

  private generateNotifications(): AppNotification[] {
    const templates: { title: string; message: string; channel: NotificationChannel; priority: NotificationPriority; category: string; sender: string }[] = [
      { title: 'Exportação EXP-2025-0012 aprovada', message: 'A exportação para China Foods Import foi aprovada e está pronta para embarque. Documentação completa e validada pelo Siscomex.', channel: 'PLATFORM', priority: 'HIGH', category: 'Exportações', sender: 'Sistema' },
      { title: 'DU-E vencendo em 48h', message: 'A DU-E BR20251000012 tem prazo de validade em 2 dias. Providenciar embarque ou solicitar prorrogação.', channel: 'PLATFORM', priority: 'CRITICAL', category: 'Documentos', sender: 'Sistema' },
      { title: 'Novo pedido recebido', message: 'Global Grain Corp enviou novo pedido de 5.000 TON de soja. Valor estimado: USD 2.350.000,00.', channel: 'EMAIL', priority: 'HIGH', category: 'Vendas', sender: 'CRM' },
      { title: 'Variação cambial significativa', message: 'USD/BRL variou 2.3% nas últimas 24h. Hedge cambial pode ser necessário para contratos em aberto.', channel: 'PUSH', priority: 'CRITICAL', category: 'Financeiro', sender: 'Módulo Câmbio' },
      { title: 'Certificado fitossanitário emitido', message: 'CERT-2025-0045 emitido pelo MAPA para lote LT-2025-0089. Válido até 15/03/2025.', channel: 'PLATFORM', priority: 'MEDIUM', category: 'Compliance', sender: 'MAPA' },
      { title: 'Embarque EMB-2025-0008 partiu', message: 'Navio MV Pacific Star partiu de Santos com destino a Shanghai. ETA: 35 dias.', channel: 'WHATSAPP', priority: 'MEDIUM', category: 'Logística', sender: 'Transportadora' },
      { title: 'Pagamento recebido - LC confirmada', message: 'Letter of Credit USD 890.000 confirmada pelo Banco do Brasil para contrato CT-2025-0003.', channel: 'EMAIL', priority: 'HIGH', category: 'Financeiro', sender: 'Banco do Brasil' },
      { title: 'Alerta de compliance - OFAC', message: 'Verificação OFAC pendente para novo comprador registrado. Necessário completar due diligence.', channel: 'PLATFORM', priority: 'CRITICAL', category: 'Compliance', sender: 'Compliance' },
      { title: 'Relatório mensal disponível', message: 'Relatório consolidado de exportações de Janeiro/2025 está disponível para download.', channel: 'EMAIL', priority: 'LOW', category: 'Relatórios', sender: 'Sistema' },
      { title: 'Container MSKU1234567 liberado', message: 'Container liberado pela alfândega de Santos. Previsão de carregamento: amanhã às 08h.', channel: 'PUSH', priority: 'MEDIUM', category: 'Logística', sender: 'Alfândega' },
      { title: 'Margem abaixo do esperado', message: 'Contrato CT-2025-0015 apresenta margem de 4.2%, abaixo do target de 6%. Ação recomendada.', channel: 'PLATFORM', priority: 'HIGH', category: 'Rentabilidade', sender: 'Módulo Análise' },
      { title: 'Siscomex indisponível', message: 'Sistema Siscomex em manutenção programada das 22h às 06h. Operações serão retomadas automaticamente.', channel: 'WHATSAPP', priority: 'MEDIUM', category: 'Integrações', sender: 'Siscomex' },
      { title: 'Novo regulamento sanitário', message: 'China atualizou requisitos sanitários para importação de carne bovina. Verificar adequação dos certificados.', channel: 'EMAIL', priority: 'HIGH', category: 'Compliance', sender: 'Alertas Regulatórios' },
      { title: 'Booking confirmado', message: 'Reserva BK-2025-0034 confirmada com MSC para embarque em 15/02. Prazo de entrega no terminal: 12/02.', channel: 'PLATFORM', priority: 'MEDIUM', category: 'Logística', sender: 'MSC' },
      { title: 'Auditoria programada', message: 'Auditoria interna programada para próxima semana. Documentação dos últimos 3 meses deve estar organizada.', channel: 'EMAIL', priority: 'LOW', category: 'Admin', sender: 'Controle Interno' },
      { title: 'Hedge vencendo', message: 'Contrato de hedge HG-2025-003 vence em 5 dias. Avaliar renovação ou liquidação.', channel: 'PUSH', priority: 'HIGH', category: 'Financeiro', sender: 'Módulo Hedge' },
      { title: 'Peso divergente detectado', message: 'Packing List PL-2025-0007 apresenta divergência de 2.1% no peso bruto em relação à Invoice. Revisar antes do embarque.', channel: 'PLATFORM', priority: 'CRITICAL', category: 'Documentos', sender: 'Validação Automática' },
      { title: 'Cotação atualizada', message: 'Frete marítimo Santos-Shanghai atualizado: USD 45/TON (redução de 8% vs. mês anterior).', channel: 'WHATSAPP', priority: 'LOW', category: 'Logística', sender: 'Cotações' },
      { title: 'Contrato próximo ao vencimento', message: 'Contrato CT-2025-0002 com European Commodities vence em 30 dias. Iniciar negociação de renovação.', channel: 'EMAIL', priority: 'MEDIUM', category: 'Contratos', sender: 'CRM' },
      { title: 'AI detectou anomalia', message: 'Padrão incomum detectado em documentos da exportação EXP-2025-0019. Verificação manual recomendada.', channel: 'PLATFORM', priority: 'HIGH', category: 'AI Operations', sender: 'AI Engine' },
      { title: 'Backup realizado com sucesso', message: 'Backup automático dos dados da plataforma concluído. Próximo backup em 24h.', channel: 'PLATFORM', priority: 'LOW', category: 'Sistema', sender: 'Sistema' },
      { title: 'Licença de exportação aprovada', message: 'Licença LIC-2025-0023 aprovada pela SECEX. Válida por 60 dias para produto NCM 1201.90.00.', channel: 'EMAIL', priority: 'MEDIUM', category: 'Compliance', sender: 'SECEX' },
      { title: 'Novo fornecedor qualificado', message: 'Fornecedor Fazenda São João aprovado na qualificação. Score de confiança: 92%.', channel: 'PLATFORM', priority: 'LOW', category: 'Supply Chain', sender: 'Qualificação' },
      { title: 'Prazo de embarque crítico', message: 'Exportação EXP-2025-0005 tem deadline de embarque em 72h. Container ainda não solicitado.', channel: 'PUSH', priority: 'CRITICAL', category: 'Logística', sender: 'Alertas Prazo' },
      { title: 'Fatura pendente de pagamento', message: 'Invoice INV-2025-00008 com Global Grain está pendente há 15 dias. Verificar com financeiro.', channel: 'EMAIL', priority: 'HIGH', category: 'Financeiro', sender: 'Contas a Receber' },
      { title: 'Temperatura do container', message: 'Monitoramento IoT: container reefer TCLU9876543 em 2.1°C (dentro do range 0-4°C).', channel: 'WHATSAPP', priority: 'LOW', category: 'Logística', sender: 'IoT Monitor' },
      { title: 'Reunião com cliente agendada', message: 'Tokyo Trading agendou reunião para discussão do contrato anual. Quinta-feira às 10h (horário de Brasília).', channel: 'EMAIL', priority: 'MEDIUM', category: 'CRM', sender: 'Agenda' },
      { title: 'Indicador ESG atualizado', message: 'Score ESG da empresa atualizado para 78/100. Melhoria de 5 pontos em relação ao trimestre anterior.', channel: 'PLATFORM', priority: 'LOW', category: 'ESG', sender: 'Módulo ESG' },
      { title: 'Tarifa antidumping aplicada', message: 'Nova tarifa de 12% aplicada a produtos brasileiros na categoria NCM 1701.14.00 pelo mercado indiano.', channel: 'EMAIL', priority: 'HIGH', category: 'Compliance', sender: 'Alertas Comércio' },
      { title: 'Conexão API restaurada', message: 'Integração com MAPA restaurada após 2h de indisponibilidade. Todas as operações pendentes foram sincronizadas.', channel: 'PLATFORM', priority: 'MEDIUM', category: 'Integrações', sender: 'Monitor API' },
      { title: 'Novo modelo IA disponível', message: 'Atualização do modelo de predição de rejeição documental. Acurácia aumentou de 89% para 93%.', channel: 'PLATFORM', priority: 'LOW', category: 'AI Operations', sender: 'AI Engine' },
      { title: 'Recall de produto detectado', message: 'Lote LT-2025-0045 de carne bovina pode estar afetado por recall sanitário. Verificar imediatamente.', channel: 'PUSH', priority: 'CRITICAL', category: 'Produtos', sender: 'Alerta Sanitário' },
      { title: 'Meta mensal atingida', message: 'Exportações de Janeiro atingiram 115% da meta. Volume: 45.000 TON / Valor: USD 22.5M.', channel: 'PLATFORM', priority: 'LOW', category: 'Dashboard', sender: 'KPI Monitor' },
      { title: 'Documento rejeitado', message: 'Certificado de origem CO-2025-0012 rejeitado pela câmara de comércio. Motivo: dados inconsistentes.', channel: 'EMAIL', priority: 'CRITICAL', category: 'Documentos', sender: 'Câmara Comércio' },
      { title: 'Atualização de sistema', message: 'Versão 2.5.0 da plataforma será implantada no domingo. Downtime estimado: 30 minutos.', channel: 'PLATFORM', priority: 'LOW', category: 'Sistema', sender: 'DevOps' },
      { title: 'Prazo BL crítico', message: 'Bill of Lading para EMB-2025-0011 precisa ser emitido até amanhã. Contatar agente marítimo.', channel: 'WHATSAPP', priority: 'HIGH', category: 'Documentos', sender: 'Agente Marítimo' },
      { title: 'Oportunidade de compra', message: 'Preço da soja caiu 3.5% no mercado spot. Oportunidade para novos contratos de compra.', channel: 'PUSH', priority: 'MEDIUM', category: 'Mercado', sender: 'Market Intelligence' },
      { title: 'Vistoria programada', message: 'Vistoria sanitária no armazém de Santos agendada para próxima terça-feira às 09h.', channel: 'EMAIL', priority: 'MEDIUM', category: 'Compliance', sender: 'MAPA' },
      { title: 'Limite de crédito atingido', message: 'Arabia Foods Import atingiu 95% do limite de crédito. Novas operações requerem aprovação especial.', channel: 'PLATFORM', priority: 'HIGH', category: 'Financeiro', sender: 'Crédito' },
      { title: 'ETD atualizado', message: 'Navio MV Atlantic Trader teve ETD atualizado para 18/02 (atraso de 3 dias). Notificar comprador.', channel: 'WHATSAPP', priority: 'MEDIUM', category: 'Logística', sender: 'Tracking' },
    ];

    const now = new Date();
    return templates.map((t, i) => {
      const hoursAgo = Math.floor(Math.random() * 168) + (i < 10 ? 0 : i * 2);
      const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      const isRead = i > 15 || Math.random() > 0.5;
      return {
        id: `notif-${String(i + 1).padStart(3, '0')}`,
        title: t.title,
        message: t.message,
        channel: t.channel,
        priority: t.priority,
        category: t.category,
        isRead,
        isArchived: false,
        createdAt,
        readAt: isRead ? new Date(createdAt.getTime() + Math.random() * 3600000) : null,
        sender: t.sender,
        actionUrl: '',
        metadata: {},
      } as AppNotification;
    });
  }
}
