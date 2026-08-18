import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AuditEntry, AuditMetrics, AuditAction, AuditModule } from '../types/admin-auditoria';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaMockService {

  private entries: AuditEntry[] = [];

  constructor() {
    this.initializeMockData();
  }

  getEntries(): Observable<AuditEntry[]> {
    return of([...this.entries]).pipe(delay(400));
  }

  getMetrics(): Observable<AuditMetrics> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventsToday = this.entries.filter(e => e.timestamp >= today).length;
    const uniqueUsers = new Set(this.entries.map(e => e.user)).size;
    const criticalActions = this.entries.filter(e =>
      ['DELETE', 'APPROVE', 'REJECT', 'SIGN'].includes(e.action)
    ).length;

    const moduleCounts = this.entries.reduce((acc, e) => {
      acc[e.module] = (acc[e.module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostActiveModule = Object.entries(moduleCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const metrics: AuditMetrics = {
      totalEvents: this.entries.length,
      eventsToday,
      uniqueUsers,
      criticalActions,
      mostActiveModule,
      lastEvent: this.entries[0]?.timestamp || new Date()
    };
    return of(metrics).pipe(delay(300));
  }

  private initializeMockData(): void {
    const now = new Date();

    this.entries = [
      {
        id: 'AUD-001', timestamp: new Date(now.getTime() - 1000 * 60 * 5),
        user: 'Carlos Silva', userEmail: 'carlos.silva@empresa.com',
        action: 'LOGIN', module: 'USUÁRIOS', entity: 'Sessão', entityId: 'SES-4521',
        description: 'Login realizado com sucesso via MFA', ipAddress: '192.168.1.100',
        details: 'Browser: Chrome 120, OS: Windows 11', oldValue: '', newValue: ''
      },
      {
        id: 'AUD-002', timestamp: new Date(now.getTime() - 1000 * 60 * 15),
        user: 'Maria Santos', userEmail: 'maria.santos@empresa.com',
        action: 'CREATE', module: 'CONTRATOS', entity: 'Contrato', entityId: 'CTR-2024-089',
        description: 'Novo contrato criado: Exportação Soja China Q1/2025', ipAddress: '192.168.1.105',
        details: 'Contrato de venda internacional', oldValue: '', newValue: 'Status: RASCUNHO, Valor: USD 2.500.000'
      },
      {
        id: 'AUD-003', timestamp: new Date(now.getTime() - 1000 * 60 * 32),
        user: 'João Oliveira', userEmail: 'joao.oliveira@empresa.com',
        action: 'APPROVE', module: 'DOCUMENTOS', entity: 'DU-E', entityId: 'DUE-24BR00005678',
        description: 'DU-E aprovada para embarque de café arábica', ipAddress: '192.168.1.110',
        details: 'Aprovação final do gerente de exportação', oldValue: 'Status: PENDENTE', newValue: 'Status: APROVADA'
      },
      {
        id: 'AUD-004', timestamp: new Date(now.getTime() - 1000 * 60 * 45),
        user: 'Ana Costa', userEmail: 'ana.costa@empresa.com',
        action: 'UPDATE', module: 'FINANCEIRO', entity: 'Taxa Câmbio', entityId: 'FX-USD-BRL',
        description: 'Cotação USD/BRL atualizada manualmente', ipAddress: '192.168.1.108',
        details: 'Atualização manual devido a oscilação do mercado', oldValue: 'USD/BRL: 4.8920', newValue: 'USD/BRL: 4.9150'
      },
      {
        id: 'AUD-005', timestamp: new Date(now.getTime() - 1000 * 60 * 60),
        user: 'Carlos Silva', userEmail: 'carlos.silva@empresa.com',
        action: 'EXPORT', module: 'EXPORTAÇÕES', entity: 'Relatório', entityId: 'REL-EXP-2024-12',
        description: 'Relatório de exportações exportado em PDF', ipAddress: '192.168.1.100',
        details: 'Formato: PDF, Período: Nov/2024', oldValue: '', newValue: ''
      },
      {
        id: 'AUD-006', timestamp: new Date(now.getTime() - 1000 * 60 * 90),
        user: 'Pedro Mendes', userEmail: 'pedro.mendes@empresa.com',
        action: 'SIGN', module: 'DOCUMENTOS', entity: 'Invoice', entityId: 'INV-2024-1567',
        description: 'Invoice comercial assinada digitalmente', ipAddress: '192.168.1.112',
        details: 'Assinatura digital ICP-Brasil', oldValue: 'Status: GERADA', newValue: 'Status: ASSINADA'
      },
      {
        id: 'AUD-007', timestamp: new Date(now.getTime() - 1000 * 60 * 120),
        user: 'Maria Santos', userEmail: 'maria.santos@empresa.com',
        action: 'UPDATE', module: 'CONTRATOS', entity: 'Contrato', entityId: 'CTR-2024-085',
        description: 'Cláusula de penalidade atualizada', ipAddress: '192.168.1.105',
        details: 'Revisão jurídica concluída', oldValue: 'Penalidade: 2% ao mês', newValue: 'Penalidade: 1.5% ao mês'
      },
      {
        id: 'AUD-008', timestamp: new Date(now.getTime() - 1000 * 60 * 150),
        user: 'Fernanda Lima', userEmail: 'fernanda.lima@empresa.com',
        action: 'CREATE', module: 'PRODUTOS', entity: 'Produto', entityId: 'PRD-CAF-005',
        description: 'Novo produto cadastrado: Café Robusta Premium', ipAddress: '192.168.1.115',
        details: 'NCM: 0901.11.10, Origem: Espírito Santo', oldValue: '', newValue: 'Status: ATIVO'
      },
      {
        id: 'AUD-009', timestamp: new Date(now.getTime() - 1000 * 60 * 180),
        user: 'Roberto Dias', userEmail: 'roberto.dias@empresa.com',
        action: 'REJECT', module: 'COMPLIANCE', entity: 'Licença', entityId: 'LIC-IMP-2024-034',
        description: 'Licença de importação rejeitada por documentação incompleta', ipAddress: '192.168.1.120',
        details: 'Motivo: Falta certificado fitossanitário', oldValue: 'Status: EM_ANÁLISE', newValue: 'Status: REJEITADA'
      },
      {
        id: 'AUD-010', timestamp: new Date(now.getTime() - 1000 * 60 * 210),
        user: 'Ana Costa', userEmail: 'ana.costa@empresa.com',
        action: 'IMPORT', module: 'FINANCEIRO', entity: 'Planilha Custos', entityId: 'IMP-FIN-089',
        description: 'Planilha de custos operacionais importada', ipAddress: '192.168.1.108',
        details: 'Arquivo: custos_q4_2024.xlsx, 245 registros', oldValue: '', newValue: '245 registros importados'
      },
      {
        id: 'AUD-011', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3),
        user: 'João Oliveira', userEmail: 'joao.oliveira@empresa.com',
        action: 'UPDATE', module: 'LOGÍSTICA', entity: 'Embarque', entityId: 'EMB-2024-456',
        description: 'Data de embarque alterada devido a congestionamento no porto', ipAddress: '192.168.1.110',
        details: 'Porto de Santos com restrição de atracação', oldValue: 'Data: 15/12/2024', newValue: 'Data: 18/12/2024'
      },
      {
        id: 'AUD-012', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 4),
        user: 'Carlos Silva', userEmail: 'carlos.silva@empresa.com',
        action: 'DELETE', module: 'LOTES', entity: 'Lote', entityId: 'LOT-2024-099',
        description: 'Lote cancelado por contaminação detectada', ipAddress: '192.168.1.100',
        details: 'Análise laboratorial reprovou amostra', oldValue: 'Status: APROVADO', newValue: 'Status: CANCELADO'
      },
      {
        id: 'AUD-013', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5),
        user: 'Fernanda Lima', userEmail: 'fernanda.lima@empresa.com',
        action: 'APPROVE', module: 'EXPORTAÇÕES', entity: 'Pedido Export', entityId: 'PED-2024-178',
        description: 'Pedido de exportação aprovado pelo gerente comercial', ipAddress: '192.168.1.115',
        details: 'Aprovação condicional - aguarda confirmação de crédito', oldValue: 'Status: PENDENTE', newValue: 'Status: APROVADO'
      },
      {
        id: 'AUD-014', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 6),
        user: 'Pedro Mendes', userEmail: 'pedro.mendes@empresa.com',
        action: 'CREATE', module: 'DOCUMENTOS', entity: 'Certificado', entityId: 'CERT-FIT-2024-067',
        description: 'Certificado fitossanitário emitido para lote de soja', ipAddress: '192.168.1.112',
        details: 'Emitido via integração MAPA', oldValue: '', newValue: 'Validade: 30 dias'
      },
      {
        id: 'AUD-015', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 8),
        user: 'Roberto Dias', userEmail: 'roberto.dias@empresa.com',
        action: 'UPDATE', module: 'COMPLIANCE', entity: 'Regulamentação', entityId: 'REG-ANVISA-2024',
        description: 'Atualização de normativa ANVISA para embalagens', ipAddress: '192.168.1.120',
        details: 'Nova RDC publicada em 10/12/2024', oldValue: 'Versão: 2.1', newValue: 'Versão: 2.2'
      },
      {
        id: 'AUD-016', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 10),
        user: 'Maria Santos', userEmail: 'maria.santos@empresa.com',
        action: 'SIGN', module: 'CONTRATOS', entity: 'Contrato', entityId: 'CTR-2024-082',
        description: 'Contrato de venda assinado pelas partes', ipAddress: '192.168.1.105',
        details: 'Assinatura digital bilateral via DocuSign', oldValue: 'Status: REVISÃO', newValue: 'Status: ASSINADO'
      },
      {
        id: 'AUD-017', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 12),
        user: 'Ana Costa', userEmail: 'ana.costa@empresa.com',
        action: 'EXPORT', module: 'FINANCEIRO', entity: 'DRE', entityId: 'DRE-2024-NOV',
        description: 'DRE mensal exportada para contabilidade', ipAddress: '192.168.1.108',
        details: 'Formato: Excel, Período: Novembro/2024', oldValue: '', newValue: ''
      },
      {
        id: 'AUD-018', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 14),
        user: 'João Oliveira', userEmail: 'joao.oliveira@empresa.com',
        action: 'LOGIN', module: 'USUÁRIOS', entity: 'Sessão', entityId: 'SES-4498',
        description: 'Login realizado via SSO corporativo', ipAddress: '10.0.1.50',
        details: 'Browser: Firefox 121, OS: macOS 14', oldValue: '', newValue: ''
      },
      {
        id: 'AUD-019', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 18),
        user: 'Carlos Silva', userEmail: 'carlos.silva@empresa.com',
        action: 'UPDATE', module: 'CONFIGURAÇÕES', entity: 'Config', entityId: 'CFG-SEC-011',
        description: 'Timeout de sessão alterado de 60 para 30 minutos', ipAddress: '192.168.1.100',
        details: 'Medida de segurança após auditoria externa', oldValue: 'Timeout: 60 min', newValue: 'Timeout: 30 min'
      },
      {
        id: 'AUD-020', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 20),
        user: 'Fernanda Lima', userEmail: 'fernanda.lima@empresa.com',
        action: 'CREATE', module: 'LOTES', entity: 'Lote', entityId: 'LOT-2024-105',
        description: 'Novo lote de café registrado: 500 sacas, Fazenda Bela Vista', ipAddress: '192.168.1.115',
        details: 'Origem: Minas Gerais, Variedade: Arábica', oldValue: '', newValue: 'Quantidade: 500 sacas, Peso: 30.000kg'
      },
      {
        id: 'AUD-021', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        user: 'Pedro Mendes', userEmail: 'pedro.mendes@empresa.com',
        action: 'APPROVE', module: 'DOCUMENTOS', entity: 'RE', entityId: 'RE-2024-BRA-4521',
        description: 'Registro de exportação aprovado no Siscomex', ipAddress: '192.168.1.112',
        details: 'Protocolo Siscomex: 2024120512345', oldValue: 'Status: REGISTRADO', newValue: 'Status: DEFERIDO'
      },
      {
        id: 'AUD-022', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 26),
        user: 'Roberto Dias', userEmail: 'roberto.dias@empresa.com',
        action: 'DELETE', module: 'USUÁRIOS', entity: 'Usuário', entityId: 'USR-EXT-034',
        description: 'Conta de ex-funcionário desativada', ipAddress: '192.168.1.120',
        details: 'Procedimento padrão de offboarding', oldValue: 'Status: ATIVO', newValue: 'Status: INATIVO'
      },
      {
        id: 'AUD-023', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 30),
        user: 'Maria Santos', userEmail: 'maria.santos@empresa.com',
        action: 'UPDATE', module: 'EXPORTAÇÕES', entity: 'Exportação', entityId: 'EXP-2024-0015',
        description: 'Volume de embarque ajustado conforme disponibilidade', ipAddress: '192.168.1.105',
        details: 'Ajuste negociado com o cliente', oldValue: 'Volume: 4.000 ton', newValue: 'Volume: 3.500 ton'
      },
      {
        id: 'AUD-024', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 36),
        user: 'Ana Costa', userEmail: 'ana.costa@empresa.com',
        action: 'CREATE', module: 'FINANCEIRO', entity: 'Contrato Câmbio', entityId: 'FX-CTR-2024-089',
        description: 'Novo contrato de câmbio fechado: USD 500.000', ipAddress: '192.168.1.108',
        details: 'Banco: Itaú BBA, Taxa: 4.9200', oldValue: '', newValue: 'Valor: USD 500.000, Vencimento: 15/01/2025'
      },
      {
        id: 'AUD-025', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 40),
        user: 'João Oliveira', userEmail: 'joao.oliveira@empresa.com',
        action: 'IMPORT', module: 'LOGÍSTICA', entity: 'Tracking', entityId: 'TRK-IMP-2024-567',
        description: 'Dados de rastreamento importados do armador', ipAddress: '192.168.1.110',
        details: 'Maersk Line - 12 containers atualizados', oldValue: '', newValue: '12 containers com tracking atualizado'
      },
      {
        id: 'AUD-026', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 48),
        user: 'Carlos Silva', userEmail: 'carlos.silva@empresa.com',
        action: 'LOGOUT', module: 'USUÁRIOS', entity: 'Sessão', entityId: 'SES-4489',
        description: 'Logout realizado pelo usuário', ipAddress: '192.168.1.100',
        details: 'Duração da sessão: 4h 32min', oldValue: '', newValue: ''
      },
      {
        id: 'AUD-027', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 52),
        user: 'Fernanda Lima', userEmail: 'fernanda.lima@empresa.com',
        action: 'UPDATE', module: 'PRODUTOS', entity: 'Produto', entityId: 'PRD-SOJ-001',
        description: 'Preço FOB atualizado para soja convencional', ipAddress: '192.168.1.115',
        details: 'Reajuste trimestral conforme mercado', oldValue: 'Preço: USD 450/ton', newValue: 'Preço: USD 468/ton'
      },
      {
        id: 'AUD-028', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 60),
        user: 'Pedro Mendes', userEmail: 'pedro.mendes@empresa.com',
        action: 'EXPORT', module: 'COMPLIANCE', entity: 'Relatório Compliance', entityId: 'REL-COMP-2024-Q4',
        description: 'Relatório trimestral de compliance exportado', ipAddress: '192.168.1.112',
        details: 'Formato: PDF, Destinatário: Diretoria', oldValue: '', newValue: ''
      },
      {
        id: 'AUD-029', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 72),
        user: 'Roberto Dias', userEmail: 'roberto.dias@empresa.com',
        action: 'APPROVE', module: 'COMPLIANCE', entity: 'Auditoria Interna', entityId: 'AUD-INT-2024-012',
        description: 'Resultado de auditoria interna aprovado', ipAddress: '192.168.1.120',
        details: 'Sem não-conformidades críticas identificadas', oldValue: 'Status: EM_REVISÃO', newValue: 'Status: APROVADO'
      },
      {
        id: 'AUD-030', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 80),
        user: 'Maria Santos', userEmail: 'maria.santos@empresa.com',
        action: 'SIGN', module: 'EXPORTAÇÕES', entity: 'BL', entityId: 'BL-2024-MSKU-789',
        description: 'Bill of Lading assinado eletronicamente', ipAddress: '192.168.1.105',
        details: 'Embarque Santos → Rotterdam, Navio: MSC Fantasia', oldValue: 'Status: DRAFT', newValue: 'Status: ORIGINAL'
      },
      {
        id: 'AUD-031', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 96),
        user: 'Ana Costa', userEmail: 'ana.costa@empresa.com',
        action: 'REJECT', module: 'FINANCEIRO', entity: 'Pagamento', entityId: 'PAG-2024-567',
        description: 'Pagamento rejeitado por divergência de valores', ipAddress: '192.168.1.108',
        details: 'Valor apresentado difere do contratual em 3.2%', oldValue: 'Valor: USD 125.000', newValue: 'Status: REJEITADO'
      },
      {
        id: 'AUD-032', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 110),
        user: 'João Oliveira', userEmail: 'joao.oliveira@empresa.com',
        action: 'CREATE', module: 'LOGÍSTICA', entity: 'Booking', entityId: 'BKG-2024-890',
        description: 'Reserva de espaço criada: 5x40HC Santos-Shanghai', ipAddress: '192.168.1.110',
        details: 'Armador: COSCO, ETD: 20/12/2024', oldValue: '', newValue: '5 containers 40HC reservados'
      },
      {
        id: 'AUD-033', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 130),
        user: 'Carlos Silva', userEmail: 'carlos.silva@empresa.com',
        action: 'UPDATE', module: 'CONFIGURAÇÕES', entity: 'Config', entityId: 'CFG-AI-071',
        description: 'Classificação automática NCM habilitada', ipAddress: '192.168.1.100',
        details: 'Recurso de IA ativado após período de testes', oldValue: 'Habilitado: false', newValue: 'Habilitado: true'
      },
      {
        id: 'AUD-034', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 145),
        user: 'Fernanda Lima', userEmail: 'fernanda.lima@empresa.com',
        action: 'LOGIN', module: 'USUÁRIOS', entity: 'Sessão', entityId: 'SES-4450',
        description: 'Login via aplicativo mobile', ipAddress: '10.0.2.15',
        details: 'Device: iPhone 15 Pro, App v2.4.1', oldValue: '', newValue: ''
      },
      {
        id: 'AUD-035', timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 160),
        user: 'Pedro Mendes', userEmail: 'pedro.mendes@empresa.com',
        action: 'DELETE', module: 'DOCUMENTOS', entity: 'Draft Invoice', entityId: 'INV-DRAFT-2024-089',
        description: 'Rascunho de invoice descartado', ipAddress: '192.168.1.112',
        details: 'Substituído por versão corrigida', oldValue: 'Status: RASCUNHO', newValue: 'Status: EXCLUÍDO'
      }
    ];
  }
}
