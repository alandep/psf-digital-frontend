import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ConfigItem, ConfigGroup, ConfigCategory } from '../types/admin-configuracoes';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracoesMockService {

  private configGroups: ConfigGroup[] = [];

  constructor() {
    this.initializeMockData();
  }

  getConfigGroups(): Observable<ConfigGroup[]> {
    return of([...this.configGroups]).pipe(delay(400));
  }

  getConfigByCategory(category: ConfigCategory): Observable<ConfigItem[]> {
    const group = this.configGroups.find(g => g.category === category);
    return of(group ? [...group.items] : []).pipe(delay(300));
  }

  saveConfig(items: ConfigItem[]): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  private initializeMockData(): void {
    this.configGroups = [
      {
        category: 'GERAL',
        icon: 'settings',
        label: 'Geral',
        description: 'Configurações gerais da plataforma',
        items: [
          {
            id: 'cfg-001', key: 'company.name', label: 'Nome da Empresa',
            description: 'Nome exibido nos documentos e relatórios',
            category: 'GERAL', type: 'TEXT', value: 'AgroBrasil Trading Ltda',
            defaultValue: '', required: true,
            lastModified: new Date('2024-12-01'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-002', key: 'company.currency', label: 'Moeda Padrão',
            description: 'Moeda utilizada como referência nos cálculos financeiros',
            category: 'GERAL', type: 'SELECT', value: 'BRL',
            defaultValue: 'BRL', options: ['BRL', 'USD', 'EUR', 'GBP', 'CNY'],
            required: true, lastModified: new Date('2024-11-20'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-003', key: 'company.language', label: 'Idioma',
            description: 'Idioma padrão da interface do sistema',
            category: 'GERAL', type: 'SELECT', value: 'pt-BR',
            defaultValue: 'pt-BR', options: ['pt-BR', 'en-US', 'es-ES'],
            required: true, lastModified: new Date('2024-11-15'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-004', key: 'company.timezone', label: 'Fuso Horário',
            description: 'Fuso horário utilizado para datas e relatórios',
            category: 'GERAL', type: 'SELECT', value: 'America/Sao_Paulo',
            defaultValue: 'America/Sao_Paulo',
            options: ['America/Sao_Paulo', 'America/New_York', 'Europe/London', 'Asia/Shanghai'],
            required: true, lastModified: new Date('2024-10-05'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-005', key: 'company.fiscal_year_start', label: 'Início Ano Fiscal',
            description: 'Mês de início do ano fiscal da empresa',
            category: 'GERAL', type: 'SELECT', value: 'Janeiro',
            defaultValue: 'Janeiro',
            options: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            required: true, lastModified: new Date('2024-09-01'), modifiedBy: 'finance@empresa.com'
          }
        ]
      },
      {
        category: 'SEGURANÇA',
        icon: 'security',
        label: 'Segurança',
        description: 'Políticas de segurança e autenticação',
        items: [
          {
            id: 'cfg-010', key: 'security.mfa_required', label: 'MFA Obrigatório',
            description: 'Exigir autenticação multifator para todos os usuários',
            category: 'SEGURANÇA', type: 'BOOLEAN', value: true,
            defaultValue: false, required: false,
            lastModified: new Date('2024-12-05'), modifiedBy: 'security@empresa.com'
          },
          {
            id: 'cfg-011', key: 'security.session_timeout', label: 'Timeout de Sessão (min)',
            description: 'Tempo de inatividade antes de desconectar o usuário',
            category: 'SEGURANÇA', type: 'NUMBER', value: 30,
            defaultValue: 60, required: true,
            lastModified: new Date('2024-12-03'), modifiedBy: 'security@empresa.com'
          },
          {
            id: 'cfg-012', key: 'security.min_password_length', label: 'Tamanho Mínimo da Senha',
            description: 'Número mínimo de caracteres exigido para senhas',
            category: 'SEGURANÇA', type: 'NUMBER', value: 12,
            defaultValue: 8, required: true,
            lastModified: new Date('2024-11-28'), modifiedBy: 'security@empresa.com'
          },
          {
            id: 'cfg-013', key: 'security.max_login_attempts', label: 'Máximo Tentativas Login',
            description: 'Número de tentativas antes de bloquear a conta',
            category: 'SEGURANÇA', type: 'NUMBER', value: 5,
            defaultValue: 5, required: true,
            lastModified: new Date('2024-11-25'), modifiedBy: 'security@empresa.com'
          },
          {
            id: 'cfg-014', key: 'security.password_expiry_days', label: 'Expiração Senha (dias)',
            description: 'Dias até exigir troca de senha',
            category: 'SEGURANÇA', type: 'NUMBER', value: 90,
            defaultValue: 90, required: true,
            lastModified: new Date('2024-11-20'), modifiedBy: 'security@empresa.com'
          }
        ]
      },
      {
        category: 'NOTIFICAÇÕES',
        icon: 'notifications',
        label: 'Notificações',
        description: 'Canais e frequência de notificações',
        items: [
          {
            id: 'cfg-020', key: 'notifications.email_enabled', label: 'Email Habilitado',
            description: 'Enviar notificações por email',
            category: 'NOTIFICAÇÕES', type: 'BOOLEAN', value: true,
            defaultValue: true, required: false,
            lastModified: new Date('2024-12-01'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-021', key: 'notifications.whatsapp_enabled', label: 'WhatsApp Habilitado',
            description: 'Enviar alertas críticos via WhatsApp Business',
            category: 'NOTIFICAÇÕES', type: 'BOOLEAN', value: false,
            defaultValue: false, required: false,
            lastModified: new Date('2024-11-30'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-022', key: 'notifications.summary_frequency', label: 'Frequência do Resumo',
            description: 'Frequência de envio do resumo diário/semanal',
            category: 'NOTIFICAÇÕES', type: 'SELECT', value: 'DIÁRIO',
            defaultValue: 'SEMANAL', options: ['DIÁRIO', 'SEMANAL', 'QUINZENAL', 'MENSAL'],
            required: true, lastModified: new Date('2024-11-28'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-023', key: 'notifications.critical_sms', label: 'SMS para Alertas Críticos',
            description: 'Enviar SMS em situações críticas (falha de compliance, etc.)',
            category: 'NOTIFICAÇÕES', type: 'BOOLEAN', value: true,
            defaultValue: false, required: false,
            lastModified: new Date('2024-11-25'), modifiedBy: 'admin@empresa.com'
          }
        ]
      },
      {
        category: 'INTEGRAÇÕES',
        icon: 'hub',
        label: 'Integrações',
        description: 'APIs externas e integrações de sistema',
        items: [
          {
            id: 'cfg-030', key: 'integrations.siscomex_enabled', label: 'Siscomex Ativo',
            description: 'Habilitar integração com Siscomex',
            category: 'INTEGRAÇÕES', type: 'BOOLEAN', value: true,
            defaultValue: true, required: false,
            lastModified: new Date('2024-12-04'), modifiedBy: 'tech@empresa.com'
          },
          {
            id: 'cfg-031', key: 'integrations.api_timeout', label: 'Timeout API (seg)',
            description: 'Tempo máximo de espera para chamadas de API externas',
            category: 'INTEGRAÇÕES', type: 'NUMBER', value: 30,
            defaultValue: 30, required: true,
            lastModified: new Date('2024-12-02'), modifiedBy: 'tech@empresa.com'
          },
          {
            id: 'cfg-032', key: 'integrations.retry_attempts', label: 'Tentativas de Retry',
            description: 'Número de tentativas em caso de falha de integração',
            category: 'INTEGRAÇÕES', type: 'NUMBER', value: 3,
            defaultValue: 3, required: true,
            lastModified: new Date('2024-11-30'), modifiedBy: 'tech@empresa.com'
          },
          {
            id: 'cfg-033', key: 'integrations.webhook_url', label: 'URL Webhook',
            description: 'URL para envio de eventos via webhook',
            category: 'INTEGRAÇÕES', type: 'TEXT', value: 'https://hooks.empresa.com/events',
            defaultValue: '', required: false,
            lastModified: new Date('2024-11-28'), modifiedBy: 'tech@empresa.com'
          }
        ]
      },
      {
        category: 'DOCUMENTOS',
        icon: 'description',
        label: 'Documentos',
        description: 'Configurações de geração e armazenamento de documentos',
        items: [
          {
            id: 'cfg-040', key: 'documents.auto_numbering', label: 'Numeração Automática',
            description: 'Gerar numeração sequencial automática para documentos',
            category: 'DOCUMENTOS', type: 'BOOLEAN', value: true,
            defaultValue: true, required: false,
            lastModified: new Date('2024-12-01'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-041', key: 'documents.prefix', label: 'Prefixo Documentos',
            description: 'Prefixo usado na numeração de documentos (ex: DOC-2024)',
            category: 'DOCUMENTOS', type: 'TEXT', value: 'DOC-2024',
            defaultValue: 'DOC', required: true,
            lastModified: new Date('2024-12-01'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-042', key: 'documents.retention_days', label: 'Retenção (dias)',
            description: 'Dias para manter documentos antes de arquivar',
            category: 'DOCUMENTOS', type: 'NUMBER', value: 365,
            defaultValue: 365, required: true,
            lastModified: new Date('2024-11-20'), modifiedBy: 'compliance@empresa.com'
          },
          {
            id: 'cfg-043', key: 'documents.max_file_size_mb', label: 'Tamanho Máximo (MB)',
            description: 'Tamanho máximo de upload de documentos em megabytes',
            category: 'DOCUMENTOS', type: 'NUMBER', value: 25,
            defaultValue: 10, required: true,
            lastModified: new Date('2024-11-18'), modifiedBy: 'tech@empresa.com'
          }
        ]
      },
      {
        category: 'FINANCEIRO',
        icon: 'account_balance',
        label: 'Financeiro',
        description: 'Parâmetros financeiros e cambiais',
        items: [
          {
            id: 'cfg-050', key: 'finance.exchange_source', label: 'Fonte Câmbio',
            description: 'Fonte de cotação de câmbio utilizada',
            category: 'FINANCEIRO', type: 'SELECT', value: 'BACEN',
            defaultValue: 'BACEN', options: ['BACEN', 'Bloomberg', 'Reuters', 'Manual'],
            required: true, lastModified: new Date('2024-12-05'), modifiedBy: 'finance@empresa.com'
          },
          {
            id: 'cfg-051', key: 'finance.auto_update_rates', label: 'Atualizar Câmbio Automaticamente',
            description: 'Buscar cotações automaticamente a cada hora',
            category: 'FINANCEIRO', type: 'BOOLEAN', value: true,
            defaultValue: true, required: false,
            lastModified: new Date('2024-12-04'), modifiedBy: 'finance@empresa.com'
          },
          {
            id: 'cfg-052', key: 'finance.default_payment_terms', label: 'Prazo Pagamento Padrão (dias)',
            description: 'Prazo padrão em dias para condições de pagamento',
            category: 'FINANCEIRO', type: 'NUMBER', value: 30,
            defaultValue: 30, required: true,
            lastModified: new Date('2024-11-30'), modifiedBy: 'finance@empresa.com'
          },
          {
            id: 'cfg-053', key: 'finance.decimal_places', label: 'Casas Decimais',
            description: 'Número de casas decimais para valores financeiros',
            category: 'FINANCEIRO', type: 'NUMBER', value: 2,
            defaultValue: 2, required: true,
            lastModified: new Date('2024-11-25'), modifiedBy: 'finance@empresa.com'
          }
        ]
      },
      {
        category: 'LOGÍSTICA',
        icon: 'local_shipping',
        label: 'Logística',
        description: 'Configurações de transporte e embarques',
        items: [
          {
            id: 'cfg-060', key: 'logistics.default_incoterm', label: 'Incoterm Padrão',
            description: 'Incoterm padrão para novas exportações',
            category: 'LOGÍSTICA', type: 'SELECT', value: 'FOB',
            defaultValue: 'FOB', options: ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'FCA'],
            required: true, lastModified: new Date('2024-12-03'), modifiedBy: 'logistica@empresa.com'
          },
          {
            id: 'cfg-061', key: 'logistics.tracking_enabled', label: 'Rastreamento Ativo',
            description: 'Habilitar rastreamento em tempo real de embarques',
            category: 'LOGÍSTICA', type: 'BOOLEAN', value: true,
            defaultValue: true, required: false,
            lastModified: new Date('2024-12-01'), modifiedBy: 'logistica@empresa.com'
          },
          {
            id: 'cfg-062', key: 'logistics.lead_time_days', label: 'Lead Time Padrão (dias)',
            description: 'Dias de antecedência para planejamento de embarque',
            category: 'LOGÍSTICA', type: 'NUMBER', value: 15,
            defaultValue: 15, required: true,
            lastModified: new Date('2024-11-28'), modifiedBy: 'logistica@empresa.com'
          },
          {
            id: 'cfg-063', key: 'logistics.container_default', label: 'Container Padrão',
            description: 'Tipo de container padrão para novas operações',
            category: 'LOGÍSTICA', type: 'SELECT', value: '40HC',
            defaultValue: '20DRY', options: ['20DRY', '40DRY', '40HC', '20RF', '40RF'],
            required: true, lastModified: new Date('2024-11-25'), modifiedBy: 'logistica@empresa.com'
          }
        ]
      },
      {
        category: 'IA',
        icon: 'smart_toy',
        label: 'Inteligência Artificial',
        description: 'Configurações do assistente IA e automações',
        items: [
          {
            id: 'cfg-070', key: 'ai.assistant_enabled', label: 'Assistente IA Ativo',
            description: 'Habilitar assistente de IA para sugestões e análises',
            category: 'IA', type: 'BOOLEAN', value: true,
            defaultValue: true, required: false,
            lastModified: new Date('2024-12-05'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-071', key: 'ai.auto_classification', label: 'Classificação Automática NCM',
            description: 'Sugerir classificação NCM automaticamente para novos produtos',
            category: 'IA', type: 'BOOLEAN', value: true,
            defaultValue: false, required: false,
            lastModified: new Date('2024-12-03'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-072', key: 'ai.risk_analysis', label: 'Análise de Risco Automática',
            description: 'Executar análise de risco em novas operações',
            category: 'IA', type: 'BOOLEAN', value: true,
            defaultValue: false, required: false,
            lastModified: new Date('2024-12-01'), modifiedBy: 'admin@empresa.com'
          },
          {
            id: 'cfg-073', key: 'ai.model_version', label: 'Versão do Modelo',
            description: 'Versão do modelo de IA utilizado nas análises',
            category: 'IA', type: 'SELECT', value: 'v3.2-stable',
            defaultValue: 'v3.0-stable', options: ['v3.0-stable', 'v3.1-stable', 'v3.2-stable', 'v4.0-beta'],
            required: true, lastModified: new Date('2024-11-28'), modifiedBy: 'tech@empresa.com'
          }
        ]
      }
    ];
  }
}
