import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Regulamentacao, RegulationRequirement, CountryProductMatrix,
  ImpactAnalysis, NonConformity, RegulationTimelineEvent,
  RegulationAIInsights, RegulamentacaoMetrics, RegulamentacaoFilters,
  RegulationType, RegulationStatus, RegulationCategory, Criticality
} from '../types/regulamentacoes';

@Injectable({ providedIn: 'root' })
export class RegulamentacoesMockService {

  private regulations: Regulamentacao[] = [
    {
      id: 'REG-001', code: 'IN-MAPA-45/2024', title: 'Instrução Normativa MAPA nº 45/2024 - Requisitos fitossanitários para exportação de grãos',
      shortTitle: 'IN MAPA 45/2024', description: 'Estabelece requisitos fitossanitários para exportação de grãos e cereais.',
      category: 'FITOSSANITÁRIA', regulationType: 'NORMATIVE_INSTRUCTION', status: 'ACTIVE', criticality: 'HIGH',
      country: 'Brasil', regulatoryBody: 'MAPA', publicationDate: new Date('2024-03-15'),
      effectiveStartDate: new Date('2024-06-01'), effectiveEndDate: null,
      officialNumber: 'IN 45/2024', officialUrl: 'https://www.gov.br/mapa', officialSource: 'DOU',
      owner: 'Maria Silva', version: '1.0', affectedProducts: 12, affectedOperations: 45,
      riskScore: 78, aiAnalyzed: true, lastUpdated: new Date('2024-11-20'), createdAt: new Date('2024-03-20')
    },
    {
      id: 'REG-002', code: 'EU-2023/1115', title: 'EU Regulation 2023/1115 - Deforestation-free Products (EUDR)',
      shortTitle: 'EUDR 2023/1115', description: 'Regulamento europeu que proíbe importação de commodities ligadas ao desmatamento.',
      category: 'AMBIENTAL', regulationType: 'LAW', status: 'ACTIVE', criticality: 'CRITICAL',
      country: 'Alemanha', regulatoryBody: 'Comissão Europeia', publicationDate: new Date('2023-06-29'),
      effectiveStartDate: new Date('2024-12-30'), effectiveEndDate: null,
      officialNumber: '2023/1115', officialUrl: 'https://eur-lex.europa.eu', officialSource: 'Official Journal EU',
      owner: 'Carlos Mendes', version: '2.1', affectedProducts: 8, affectedOperations: 120,
      riskScore: 95, aiAnalyzed: true, lastUpdated: new Date('2024-12-01'), createdAt: new Date('2023-07-10')
    },
    {
      id: 'REG-003', code: 'FDA-FSMA-204', title: 'FDA FSMA Rule - Food Traceability (Section 204)',
      shortTitle: 'FDA FSMA 204', description: 'Regra de rastreabilidade alimentar da FDA para alimentos de alto risco.',
      category: 'SEGURANÇA_ALIMENTAR', regulationType: 'RESOLUTION', status: 'ACTIVE', criticality: 'HIGH',
      country: 'Estados Unidos', regulatoryBody: 'FDA', publicationDate: new Date('2022-11-15'),
      effectiveStartDate: new Date('2026-01-20'), effectiveEndDate: null,
      officialNumber: 'FSMA 204', officialUrl: 'https://www.fda.gov', officialSource: 'Federal Register',
      owner: 'Ana Costa', version: '1.2', affectedProducts: 5, affectedOperations: 32,
      riskScore: 72, aiAnalyzed: true, lastUpdated: new Date('2024-10-15'), createdAt: new Date('2022-12-01')
    },
    {
      id: 'REG-004', code: 'GACC-248', title: 'GACC Decree 248 - Registro de estabelecimentos exportadores para China',
      shortTitle: 'GACC Decreto 248', description: 'Decreto que exige registro prévio de todos os estabelecimentos exportadores de alimentos para a China.',
      category: 'SANITÁRIA', regulationType: 'DECREE', status: 'ACTIVE', criticality: 'CRITICAL',
      country: 'China', regulatoryBody: 'GACC China', publicationDate: new Date('2021-04-12'),
      effectiveStartDate: new Date('2022-01-01'), effectiveEndDate: null,
      officialNumber: 'Decreto 248', officialUrl: 'http://www.customs.gov.cn', officialSource: 'GACC Official',
      owner: 'Roberto Lima', version: '3.0', affectedProducts: 15, affectedOperations: 88,
      riskScore: 92, aiAnalyzed: true, lastUpdated: new Date('2024-11-05'), createdAt: new Date('2021-05-01')
    },
    {
      id: 'REG-005', code: 'MAFF-JP-2024', title: 'MAFF Japan - Plant Protection Standards Update 2024',
      shortTitle: 'MAFF JP Standards', description: 'Atualização dos padrões fitossanitários japoneses para importação de grãos.',
      category: 'FITOSSANITÁRIA', regulationType: 'TECHNICAL_STANDARD', status: 'ACTIVE', criticality: 'MEDIUM',
      country: 'Japão', regulatoryBody: 'MAFF Japan', publicationDate: new Date('2024-01-10'),
      effectiveStartDate: new Date('2024-04-01'), effectiveEndDate: null,
      officialNumber: 'MAFF-2024-PP-01', officialUrl: 'https://www.maff.go.jp', officialSource: 'MAFF Official',
      owner: 'Fernanda Souza', version: '1.0', affectedProducts: 4, affectedOperations: 18,
      riskScore: 55, aiAnalyzed: true, lastUpdated: new Date('2024-09-20'), createdAt: new Date('2024-01-15')
    },
    {
      id: 'REG-006', code: 'SFDA-SA-2023', title: 'SFDA Saudi Arabia - Halal Certification Requirements',
      shortTitle: 'SFDA Halal Cert', description: 'Requisitos de certificação Halal para produtos alimentícios importados pela Arábia Saudita.',
      category: 'CERTIFICAÇÕES', regulationType: 'RESOLUTION', status: 'ACTIVE', criticality: 'HIGH',
      country: 'Arábia Saudita', regulatoryBody: 'SFDA Saudi Arabia', publicationDate: new Date('2023-08-01'),
      effectiveStartDate: new Date('2024-01-01'), effectiveEndDate: null,
      officialNumber: 'SFDA-RES-2023-45', officialUrl: 'https://www.sfda.gov.sa', officialSource: 'SFDA Official',
      owner: 'Pedro Santos', version: '2.0', affectedProducts: 6, affectedOperations: 25,
      riskScore: 82, aiAnalyzed: true, lastUpdated: new Date('2024-08-10'), createdAt: new Date('2023-08-15')
    },
    {
      id: 'REG-007', code: 'RFB-IN-2098', title: 'IN RFB nº 2098/2022 - Regimes aduaneiros especiais',
      shortTitle: 'IN RFB 2098', description: 'Instrução normativa sobre regimes aduaneiros especiais para exportação.',
      category: 'ADUANEIRA', regulationType: 'NORMATIVE_INSTRUCTION', status: 'ACTIVE', criticality: 'MEDIUM',
      country: 'Brasil', regulatoryBody: 'Receita Federal', publicationDate: new Date('2022-07-01'),
      effectiveStartDate: new Date('2022-10-01'), effectiveEndDate: null,
      officialNumber: 'IN 2098/2022', officialUrl: 'https://www.gov.br/receitafederal', officialSource: 'DOU',
      owner: 'Juliana Ferreira', version: '1.3', affectedProducts: 20, affectedOperations: 65,
      riskScore: 48, aiAnalyzed: false, lastUpdated: new Date('2024-06-15'), createdAt: new Date('2022-07-10')
    },
    {
      id: 'REG-008', code: 'BACEN-RES-4893', title: 'Resolução BCB nº 4893 - Política cambial para exportação',
      shortTitle: 'BCB Res 4893', description: 'Regulamentação sobre política cambial e operações de câmbio para exportação.',
      category: 'CAMBIAL', regulationType: 'RESOLUTION', status: 'ACTIVE', criticality: 'MEDIUM',
      country: 'Brasil', regulatoryBody: 'Banco Central', publicationDate: new Date('2021-02-26'),
      effectiveStartDate: new Date('2021-07-01'), effectiveEndDate: null,
      officialNumber: 'Res 4893', officialUrl: 'https://www.bcb.gov.br', officialSource: 'DOU',
      owner: 'Marcos Oliveira', version: '2.0', affectedProducts: 25, affectedOperations: 110,
      riskScore: 42, aiAnalyzed: false, lastUpdated: new Date('2024-03-20'), createdAt: new Date('2021-03-01')
    },
    {
      id: 'REG-009', code: 'IBAMA-IN-12', title: 'IBAMA IN nº 12/2024 - Licenciamento ambiental para exportadores',
      shortTitle: 'IBAMA IN 12', description: 'Instrução normativa sobre licenciamento ambiental obrigatório para exportadores de commodities.',
      category: 'AMBIENTAL', regulationType: 'NORMATIVE_INSTRUCTION', status: 'ACTIVE', criticality: 'HIGH',
      country: 'Brasil', regulatoryBody: 'IBAMA', publicationDate: new Date('2024-02-20'),
      effectiveStartDate: new Date('2024-08-01'), effectiveEndDate: null,
      officialNumber: 'IN 12/2024', officialUrl: 'https://www.gov.br/ibama', officialSource: 'DOU',
      owner: 'Luciana Ramos', version: '1.0', affectedProducts: 10, affectedOperations: 55,
      riskScore: 75, aiAnalyzed: true, lastUpdated: new Date('2024-10-30'), createdAt: new Date('2024-02-25')
    },
    {
      id: 'REG-010', code: 'ANVISA-RDC-623', title: 'Anvisa RDC nº 623/2022 - Boas práticas de fabricação para alimentos exportados',
      shortTitle: 'Anvisa RDC 623', description: 'Resolução sobre boas práticas de fabricação para alimentos destinados à exportação.',
      category: 'QUALIDADE', regulationType: 'RESOLUTION', status: 'ACTIVE', criticality: 'MEDIUM',
      country: 'Brasil', regulatoryBody: 'Anvisa', publicationDate: new Date('2022-03-24'),
      effectiveStartDate: new Date('2022-09-01'), effectiveEndDate: null,
      officialNumber: 'RDC 623/2022', officialUrl: 'https://www.gov.br/anvisa', officialSource: 'DOU',
      owner: 'Thiago Almeida', version: '1.1', affectedProducts: 18, affectedOperations: 40,
      riskScore: 58, aiAnalyzed: true, lastUpdated: new Date('2024-07-10'), createdAt: new Date('2022-04-01')
    },
    {
      id: 'REG-011', code: 'KR-MFDS-2024', title: 'Korea MFDS - Food Import Safety Standards 2024',
      shortTitle: 'MFDS Korea 2024', description: 'Padrões de segurança alimentar da Coreia do Sul para importação de produtos agrícolas.',
      category: 'SEGURANÇA_ALIMENTAR', regulationType: 'TECHNICAL_STANDARD', status: 'ACTIVE', criticality: 'MEDIUM',
      country: 'Coreia do Sul', regulatoryBody: 'MFDS Korea', publicationDate: new Date('2024-05-01'),
      effectiveStartDate: new Date('2024-09-01'), effectiveEndDate: null,
      officialNumber: 'MFDS-2024-FS-08', officialUrl: 'https://www.mfds.go.kr', officialSource: 'MFDS Official',
      owner: 'Amanda Borges', version: '1.0', affectedProducts: 7, affectedOperations: 22,
      riskScore: 60, aiAnalyzed: true, lastUpdated: new Date('2024-11-01'), createdAt: new Date('2024-05-10')
    },
    {
      id: 'REG-012', code: 'MX-NOM-051', title: 'NOM-051-SCFI/SSA1-2010 - Rotulagem México',
      shortTitle: 'NOM-051 Rotulagem', description: 'Norma mexicana de rotulagem para alimentos pré-embalados.',
      category: 'ROTULAGEM', regulationType: 'TECHNICAL_STANDARD', status: 'ACTIVE', criticality: 'MEDIUM',
      country: 'México', regulatoryBody: 'COFEPRIS México', publicationDate: new Date('2020-10-01'),
      effectiveStartDate: new Date('2020-10-01'), effectiveEndDate: null,
      officialNumber: 'NOM-051', officialUrl: 'https://www.gob.mx/cofepris', officialSource: 'DOF',
      owner: 'Rafael Torres', version: '3.0', affectedProducts: 14, affectedOperations: 30,
      riskScore: 52, aiAnalyzed: false, lastUpdated: new Date('2024-04-15'), createdAt: new Date('2020-10-10')
    },
    {
      id: 'REG-013', code: 'MAPA-PORT-587', title: 'Portaria MAPA nº 587/2023 - Embalagens para exportação',
      shortTitle: 'MAPA Port 587', description: 'Portaria que define padrões de embalagem para produtos exportados.',
      category: 'EMBALAGEM', regulationType: 'ORDINANCE', status: 'ACTIVE', criticality: 'LOW',
      country: 'Brasil', regulatoryBody: 'MAPA', publicationDate: new Date('2023-11-15'),
      effectiveStartDate: new Date('2024-03-01'), effectiveEndDate: null,
      officialNumber: 'Port 587/2023', officialUrl: 'https://www.gov.br/mapa', officialSource: 'DOU',
      owner: 'Patrícia Moura', version: '1.0', affectedProducts: 22, affectedOperations: 38,
      riskScore: 30, aiAnalyzed: false, lastUpdated: new Date('2024-05-20'), createdAt: new Date('2023-11-20')
    },
    {
      id: 'REG-014', code: 'ESG-CSRD-2023', title: 'EU Corporate Sustainability Reporting Directive (CSRD)',
      shortTitle: 'CSRD ESG', description: 'Diretiva europeia sobre relatórios de sustentabilidade corporativa.',
      category: 'ESG', regulationType: 'LAW', status: 'ACTIVE', criticality: 'HIGH',
      country: 'Alemanha', regulatoryBody: 'Comissão Europeia', publicationDate: new Date('2023-01-05'),
      effectiveStartDate: new Date('2024-01-01'), effectiveEndDate: null,
      officialNumber: '2022/2464', officialUrl: 'https://eur-lex.europa.eu', officialSource: 'Official Journal EU',
      owner: 'Carlos Mendes', version: '1.0', affectedProducts: 25, affectedOperations: 95,
      riskScore: 70, aiAnalyzed: true, lastUpdated: new Date('2024-11-15'), createdAt: new Date('2023-01-15')
    },
    {
      id: 'REG-015', code: 'RFB-DUIMP-2024', title: 'IN RFB - DUIMP Declaração Única de Importação',
      shortTitle: 'DUIMP 2024', description: 'Nova declaração única de importação no Portal Único de Comércio Exterior.',
      category: 'ADUANEIRA', regulationType: 'NORMATIVE_INSTRUCTION', status: 'UNDER_REVIEW', criticality: 'MEDIUM',
      country: 'Brasil', regulatoryBody: 'Receita Federal', publicationDate: new Date('2024-06-01'),
      effectiveStartDate: new Date('2025-01-01'), effectiveEndDate: null,
      officialNumber: 'IN RFB DUIMP', officialUrl: 'https://www.gov.br/receitafederal', officialSource: 'DOU',
      owner: 'Juliana Ferreira', version: '0.9', affectedProducts: 30, affectedOperations: 150,
      riskScore: 45, aiAnalyzed: false, lastUpdated: new Date('2024-11-28'), createdAt: new Date('2024-06-05')
    },
    {
      id: 'REG-016', code: 'FISCAL-CFOP-2024', title: 'Ajuste SINIEF - Novos CFOPs para exportação 2024',
      shortTitle: 'CFOP Export 2024', description: 'Novos códigos fiscais de operações para exportação direta e indireta.',
      category: 'FISCAL', regulationType: 'RESOLUTION', status: 'ACTIVE', criticality: 'LOW',
      country: 'Brasil', regulatoryBody: 'Receita Federal', publicationDate: new Date('2024-01-10'),
      effectiveStartDate: new Date('2024-04-01'), effectiveEndDate: null,
      officialNumber: 'Ajuste SINIEF 01/2024', officialUrl: 'https://www.confaz.fazenda.gov.br', officialSource: 'DOU',
      owner: 'Marcos Oliveira', version: '1.0', affectedProducts: 30, affectedOperations: 200,
      riskScore: 35, aiAnalyzed: false, lastUpdated: new Date('2024-04-10'), createdAt: new Date('2024-01-15')
    },
    {
      id: 'REG-017', code: 'GACC-249', title: 'GACC Decree 249 - Requisitos de rotulagem para China',
      shortTitle: 'GACC Decreto 249', description: 'Requisitos de rotulagem em chinês para produtos alimentícios importados.',
      category: 'ROTULAGEM', regulationType: 'DECREE', status: 'SUSPENDED', criticality: 'MEDIUM',
      country: 'China', regulatoryBody: 'GACC China', publicationDate: new Date('2022-01-01'),
      effectiveStartDate: new Date('2022-06-01'), effectiveEndDate: new Date('2024-06-01'),
      officialNumber: 'Decreto 249', officialUrl: 'http://www.customs.gov.cn', officialSource: 'GACC Official',
      owner: 'Roberto Lima', version: '2.0', affectedProducts: 10, affectedOperations: 35,
      riskScore: 40, aiAnalyzed: true, lastUpdated: new Date('2024-06-01'), createdAt: new Date('2022-01-10')
    },
    {
      id: 'REG-018', code: 'ACORDO-MERCOSUL-42', title: 'Acordo Mercosul - Certificação de Origem Digital',
      shortTitle: 'Mercosul COD', description: 'Acordo de certificação de origem digital entre países do Mercosul.',
      category: 'CERTIFICAÇÕES', regulationType: 'TRADE_AGREEMENT', status: 'ACTIVE', criticality: 'LOW',
      country: 'Brasil', regulatoryBody: 'MDIC', publicationDate: new Date('2023-06-01'),
      effectiveStartDate: new Date('2023-09-01'), effectiveEndDate: null,
      officialNumber: 'ACE 42', officialUrl: 'https://www.gov.br/mdic', officialSource: 'DOU',
      owner: 'Fernanda Souza', version: '1.0', affectedProducts: 15, affectedOperations: 28,
      riskScore: 22, aiAnalyzed: false, lastUpdated: new Date('2024-02-10'), createdAt: new Date('2023-06-10')
    },
    {
      id: 'REG-019', code: 'POL-INT-QA-001', title: 'Política Interna de Qualidade - Exportação',
      shortTitle: 'Pol Qualidade Exp', description: 'Política interna de qualidade para processos de exportação.',
      category: 'QUALIDADE', regulationType: 'INTERNAL_POLICY', status: 'ACTIVE', criticality: 'LOW',
      country: 'Brasil', regulatoryBody: 'Interno', publicationDate: new Date('2024-01-01'),
      effectiveStartDate: new Date('2024-01-01'), effectiveEndDate: null,
      officialNumber: 'POL-QA-001', officialUrl: '', officialSource: 'Intranet',
      owner: 'Thiago Almeida', version: '2.5', affectedProducts: 30, affectedOperations: 180,
      riskScore: 15, aiAnalyzed: false, lastUpdated: new Date('2024-09-01'), createdAt: new Date('2024-01-05')
    },
    {
      id: 'REG-020', code: 'CLIENT-CARGILL-2024', title: 'Requisito Cargill - Sustainability Protocol 2024',
      shortTitle: 'Cargill Sustain', description: 'Protocolo de sustentabilidade exigido pela Cargill para fornecedores.',
      category: 'ESG', regulationType: 'CLIENT_REQUIREMENT', status: 'ACTIVE', criticality: 'MEDIUM',
      country: 'Estados Unidos', regulatoryBody: 'Cargill', publicationDate: new Date('2024-02-01'),
      effectiveStartDate: new Date('2024-06-01'), effectiveEndDate: new Date('2025-05-31'),
      officialNumber: 'CARG-SP-2024', officialUrl: 'https://www.cargill.com', officialSource: 'Cargill Portal',
      owner: 'Ana Costa', version: '1.0', affectedProducts: 5, affectedOperations: 15,
      riskScore: 50, aiAnalyzed: true, lastUpdated: new Date('2024-08-20'), createdAt: new Date('2024-02-10')
    },
    {
      id: 'REG-021', code: 'MAPA-SDA-15', title: 'Portaria SDA/MAPA nº 15/2024 - Certificado Sanitário Internacional',
      shortTitle: 'CSI MAPA 2024', description: 'Nova portaria sobre emissão de Certificado Sanitário Internacional.',
      category: 'SANITÁRIA', regulationType: 'ORDINANCE', status: 'REVOKED', criticality: 'LOW',
      country: 'Brasil', regulatoryBody: 'MAPA', publicationDate: new Date('2024-01-20'),
      effectiveStartDate: new Date('2024-03-01'), effectiveEndDate: new Date('2024-09-30'),
      officialNumber: 'Port SDA 15/2024', officialUrl: 'https://www.gov.br/mapa', officialSource: 'DOU',
      owner: 'Maria Silva', version: '1.0', affectedProducts: 8, affectedOperations: 20,
      riskScore: 10, aiAnalyzed: false, lastUpdated: new Date('2024-10-01'), createdAt: new Date('2024-01-25')
    },
  ];

  private matrix: CountryProductMatrix[] = [
    { id: 'CPM-001', product: 'Soja', country: 'China', allowed: 'SIM', certificates: 3, licenses: 1, riskLevel: 'MEDIUM', complianceStatus: 'CONFORME' },
    { id: 'CPM-002', product: 'Café', country: 'Estados Unidos', allowed: 'SIM', certificates: 2, licenses: 0, riskLevel: 'LOW', complianceStatus: 'CONFORME' },
    { id: 'CPM-003', product: 'Carne Bovina', country: 'Arábia Saudita', allowed: 'CONDICIONAL', certificates: 4, licenses: 2, riskLevel: 'HIGH', complianceStatus: 'PENDENTE' },
    { id: 'CPM-004', product: 'Milho', country: 'Japão', allowed: 'SIM', certificates: 3, licenses: 1, riskLevel: 'MEDIUM', complianceStatus: 'CONFORME' },
    { id: 'CPM-005', product: 'Soja', country: 'Alemanha', allowed: 'CONDICIONAL', certificates: 4, licenses: 2, riskLevel: 'HIGH', complianceStatus: 'PENDENTE' },
    { id: 'CPM-006', product: 'Açúcar', country: 'Coreia do Sul', allowed: 'SIM', certificates: 2, licenses: 1, riskLevel: 'LOW', complianceStatus: 'CONFORME' },
    { id: 'CPM-007', product: 'Carne Bovina', country: 'China', allowed: 'CONDICIONAL', certificates: 5, licenses: 3, riskLevel: 'CRITICAL', complianceStatus: 'NÃO_CONFORME' },
    { id: 'CPM-008', product: 'Café', country: 'Alemanha', allowed: 'CONDICIONAL', certificates: 3, licenses: 1, riskLevel: 'HIGH', complianceStatus: 'PENDENTE' },
    { id: 'CPM-009', product: 'Soja', country: 'México', allowed: 'SIM', certificates: 1, licenses: 0, riskLevel: 'LOW', complianceStatus: 'CONFORME' },
    { id: 'CPM-010', product: 'Açúcar', country: 'Estados Unidos', allowed: 'SIM', certificates: 2, licenses: 1, riskLevel: 'LOW', complianceStatus: 'CONFORME' },
  ];

  private requirements: RegulationRequirement[] = [
    { id: 'RQ-001', regulationId: 'REG-001', title: 'Certificado Fitossanitário de Origem', requirementType: 'Documento', mandatory: true, blocking: true, responsibleRole: 'Analista Fitossanitário', riskScore: 85, status: 'ACTIVE' },
    { id: 'RQ-002', regulationId: 'REG-001', title: 'Laudo de Análise de Resíduos', requirementType: 'Análise', mandatory: true, blocking: true, responsibleRole: 'Laboratório', riskScore: 90, status: 'ACTIVE' },
    { id: 'RQ-003', regulationId: 'REG-001', title: 'Registro no SIGVIG', requirementType: 'Registro', mandatory: true, blocking: false, responsibleRole: 'Gestor Compliance', riskScore: 60, status: 'ACTIVE' },
    { id: 'RQ-004', regulationId: 'REG-002', title: 'Due Diligence Statement', requirementType: 'Declaração', mandatory: true, blocking: true, responsibleRole: 'Gestor ESG', riskScore: 95, status: 'ACTIVE' },
    { id: 'RQ-005', regulationId: 'REG-002', title: 'Geolocalização das fazendas', requirementType: 'Dados', mandatory: true, blocking: true, responsibleRole: 'Analista Rastreabilidade', riskScore: 92, status: 'ACTIVE' },
    { id: 'RQ-006', regulationId: 'REG-002', title: 'Relatório de Risco País', requirementType: 'Relatório', mandatory: false, blocking: false, responsibleRole: 'Gestor Compliance', riskScore: 55, status: 'PENDING' },
    { id: 'RQ-007', regulationId: 'REG-004', title: 'Registro GACC', requirementType: 'Registro', mandatory: true, blocking: true, responsibleRole: 'Gestor Internacional', riskScore: 95, status: 'ACTIVE' },
    { id: 'RQ-008', regulationId: 'REG-004', title: 'Inspeção SIF', requirementType: 'Inspeção', mandatory: true, blocking: true, responsibleRole: 'Inspetor MAPA', riskScore: 88, status: 'ACTIVE' },
  ];

  private nonConformities: NonConformity[] = [
    { id: 'NC-001', regulationId: 'REG-002', title: 'Geolocalização incompleta - Fazenda São José', description: 'Dados de geolocalização não cobrem toda a área produtiva.', severity: 'CRITICAL', riskScore: 95, status: 'ABERTA', responsible: 'Carlos Mendes', dueDate: new Date('2024-12-15'), detectedAt: new Date('2024-11-10'), blocking: true },
    { id: 'NC-002', regulationId: 'REG-004', title: 'Registro GACC vencido - Unidade 3', description: 'Registro de habilitação da Unidade 3 expirou em outubro.', severity: 'HIGH', riskScore: 88, status: 'EM_TRATAMENTO', responsible: 'Roberto Lima', dueDate: new Date('2024-12-30'), detectedAt: new Date('2024-11-01'), blocking: true },
    { id: 'NC-003', regulationId: 'REG-006', title: 'Certificação Halal pendente - Lote 2024-089', description: 'Lote aguardando emissão do certificado Halal.', severity: 'HIGH', riskScore: 82, status: 'EM_TRATAMENTO', responsible: 'Pedro Santos', dueDate: new Date('2025-01-10'), detectedAt: new Date('2024-11-15'), blocking: false },
    { id: 'NC-004', regulationId: 'REG-009', title: 'Licença ambiental em renovação', description: 'Licença ambiental da unidade principal em processo de renovação.', severity: 'MEDIUM', riskScore: 60, status: 'EM_TRATAMENTO', responsible: 'Luciana Ramos', dueDate: new Date('2025-02-01'), detectedAt: new Date('2024-10-20'), blocking: false },
    { id: 'NC-005', regulationId: 'REG-001', title: 'Laudo fitossanitário desatualizado', description: 'Laudo de análise com mais de 6 meses de emissão.', severity: 'LOW', riskScore: 35, status: 'RESOLVIDA', responsible: 'Maria Silva', dueDate: new Date('2024-11-30'), detectedAt: new Date('2024-09-15'), blocking: false },
  ];

  private timelineEvents: RegulationTimelineEvent[] = [
    { id: 'TL-001', regulationId: 'REG-002', event: 'Regulamentação Identificada', date: new Date('2023-07-01'), user: 'Sistema IA', details: 'Nova regulamentação detectada via monitoramento automático' },
    { id: 'TL-002', regulationId: 'REG-002', event: 'Resumo IA Gerado', date: new Date('2023-07-02'), user: 'IA Compliance', details: 'Análise de impacto preliminar gerada automaticamente' },
    { id: 'TL-003', regulationId: 'REG-002', event: 'Aplicabilidade Confirmada', date: new Date('2023-07-10'), user: 'Carlos Mendes', details: 'Regulamentação confirmada como aplicável às operações da empresa' },
    { id: 'TL-004', regulationId: 'REG-002', event: 'Análise de Impacto', date: new Date('2023-08-01'), user: 'Equipe Compliance', details: 'Impacto avaliado: 8 produtos, 120 operações, custo estimado R$ 2.5M' },
    { id: 'TL-005', regulationId: 'REG-002', event: 'Revisão Jurídica', date: new Date('2023-09-15'), user: 'Jurídico', details: 'Parecer jurídico emitido com recomendações de adequação' },
    { id: 'TL-006', regulationId: 'REG-002', event: 'Aprovação Diretoria', date: new Date('2023-10-01'), user: 'Diretoria', details: 'Plano de adequação aprovado pela diretoria executiva' },
    { id: 'TL-007', regulationId: 'REG-002', event: 'Obrigações Distribuídas', date: new Date('2023-11-01'), user: 'Compliance', details: 'Obrigações distribuídas entre áreas responsáveis' },
    { id: 'TL-008', regulationId: 'REG-002', event: 'Notificações Enviadas', date: new Date('2023-11-05'), user: 'Sistema', details: 'Notificações enviadas a todos os stakeholders' },
    { id: 'TL-009', regulationId: 'REG-002', event: 'Monitoramento Ativo', date: new Date('2024-01-01'), user: 'Sistema IA', details: 'Monitoramento contínuo ativado para acompanhar alterações' },
  ];

  // =========== PUBLIC METHODS ===========

  getRegulations(filters?: RegulamentacaoFilters): Observable<Regulamentacao[]> {
    let result = [...this.regulations];
    if (filters) {
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        result = result.filter(r =>
          r.code.toLowerCase().includes(search) ||
          r.title.toLowerCase().includes(search) ||
          r.shortTitle.toLowerCase().includes(search) ||
          r.country.toLowerCase().includes(search) ||
          r.regulatoryBody.toLowerCase().includes(search)
        );
      }
      if (filters.category) result = result.filter(r => r.category === filters.category);
      if (filters.regulationType) result = result.filter(r => r.regulationType === filters.regulationType);
      if (filters.status) result = result.filter(r => r.status === filters.status);
      if (filters.criticality) result = result.filter(r => r.criticality === filters.criticality);
      if (filters.country) result = result.filter(r => r.country === filters.country);
      if (filters.regulatoryBody) result = result.filter(r => r.regulatoryBody === filters.regulatoryBody);
    }
    return of(result).pipe(delay(300));
  }

  getRegulationById(id: string): Observable<Regulamentacao | null> {
    return of(this.regulations.find(r => r.id === id) || null).pipe(delay(200));
  }

  createRegulation(data: Partial<Regulamentacao>): Observable<Regulamentacao> {
    const newReg: Regulamentacao = {
      id: `REG-${String(this.regulations.length + 1).padStart(3, '0')}`,
      code: data.code || 'NEW-001',
      title: data.title || 'Nova Regulamentação',
      shortTitle: data.shortTitle || 'Nova Reg',
      description: data.description || '',
      category: data.category || 'ADUANEIRA',
      regulationType: data.regulationType || 'OTHER',
      status: 'DRAFT',
      criticality: data.criticality || 'MEDIUM',
      country: data.country || 'Brasil',
      regulatoryBody: data.regulatoryBody || '',
      publicationDate: new Date(),
      effectiveStartDate: new Date(),
      effectiveEndDate: null,
      officialNumber: data.officialNumber || '',
      officialUrl: data.officialUrl || '',
      officialSource: data.officialSource || '',
      owner: data.owner || 'Usuário',
      version: '1.0',
      affectedProducts: 0,
      affectedOperations: 0,
      riskScore: 0,
      aiAnalyzed: false,
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    this.regulations.unshift(newReg);
    return of(newReg).pipe(delay(500));
  }

  getRequirements(regulationId: string): Observable<RegulationRequirement[]> {
    return of(this.requirements.filter(r => r.regulationId === regulationId)).pipe(delay(200));
  }

  getCountryProductMatrix(): Observable<CountryProductMatrix[]> {
    return of(this.matrix).pipe(delay(300));
  }

  getImpactAnalysis(regulationId: string): Observable<ImpactAnalysis> {
    const reg = this.regulations.find(r => r.id === regulationId);
    const impact: ImpactAnalysis = {
      regulationId,
      affectedProducts: reg?.affectedProducts || 5,
      affectedNCMs: Math.floor((reg?.affectedProducts || 5) * 1.5),
      affectedContracts: Math.floor((reg?.affectedOperations || 10) * 0.3),
      affectedExports: reg?.affectedOperations || 10,
      affectedShipments: Math.floor((reg?.affectedOperations || 10) * 0.8),
      documentsToReview: Math.floor((reg?.affectedProducts || 5) * 3),
      responsibleUsers: Math.floor(Math.random() * 8) + 3,
      estimatedCost: Math.floor(Math.random() * 500000) + 50000,
      adaptationDeadline: Math.floor(Math.random() * 180) + 30
    };
    return of(impact).pipe(delay(300));
  }

  getNonConformities(regulationId: string): Observable<NonConformity[]> {
    return of(this.nonConformities.filter(nc => nc.regulationId === regulationId)).pipe(delay(200));
  }

  getTimeline(regulationId: string): Observable<RegulationTimelineEvent[]> {
    return of(this.timelineEvents.filter(t => t.regulationId === regulationId)).pipe(delay(200));
  }

  getAIInsights(regulationId: string): Observable<RegulationAIInsights> {
    const reg = this.regulations.find(r => r.id === regulationId);
    const insights: RegulationAIInsights = {
      regulationId,
      riskScore: reg?.riskScore || 50,
      criticality: reg?.criticality || 'MEDIUM',
      summary: `Análise inteligente da regulamentação ${reg?.code || ''}: Esta norma impacta diretamente as operações de exportação, requerendo atenção imediata em ${reg?.affectedProducts || 0} produtos e ${reg?.affectedOperations || 0} operações.`,
      keyChanges: [
        'Novos requisitos de documentação obrigatória',
        'Prazo de adequação reduzido para 90 dias',
        'Inclusão de rastreabilidade end-to-end',
        'Exigência de auditorias trimestrais'
      ],
      affectedAreas: ['Exportação', 'Qualidade', 'Compliance', 'Logística', 'Comercial'],
      recommendations: [
        { action: 'Atualizar procedimentos internos', reason: 'Novos requisitos exigem revisão dos POPs', regulation: reg?.code || '', confidence: 92, deadline: '30 dias', impact: 'Alto' },
        { action: 'Treinar equipe operacional', reason: 'Mudanças nos processos de documentação', regulation: reg?.code || '', confidence: 88, deadline: '45 dias', impact: 'Médio' },
        { action: 'Revisar contratos com fornecedores', reason: 'Novas cláusulas de compliance necessárias', regulation: reg?.code || '', confidence: 75, deadline: '60 dias', impact: 'Alto' }
      ],
      alerts: [
        { severity: 'HIGH', message: 'Prazo de adequação em 45 dias', regulation: reg?.code || '', detectedAt: new Date() },
        { severity: 'MEDIUM', message: '3 documentos pendentes de atualização', regulation: reg?.code || '', detectedAt: new Date(Date.now() - 86400000) },
        { severity: 'LOW', message: 'Nova versão disponível para análise', regulation: reg?.code || '', detectedAt: new Date(Date.now() - 172800000) }
      ],
      impactAnalysis: {
        regulationId,
        affectedProducts: reg?.affectedProducts || 5,
        affectedNCMs: Math.floor((reg?.affectedProducts || 5) * 1.5),
        affectedContracts: 12,
        affectedExports: reg?.affectedOperations || 10,
        affectedShipments: Math.floor((reg?.affectedOperations || 10) * 0.8),
        documentsToReview: 18,
        responsibleUsers: 6,
        estimatedCost: 350000,
        adaptationDeadline: 90
      },
      executiveSummary: `A regulamentação ${reg?.code || ''} apresenta risco ${reg?.criticality?.toLowerCase() || 'médio'} para as operações. São necessárias ações imediatas de adequação em ${reg?.affectedProducts || 0} produtos. A IA identificou 3 recomendações prioritárias com confiança média de 85%. O custo estimado de adequação é R$ 350.000 com prazo de 90 dias.`
    };
    return of(insights).pipe(delay(400));
  }

  getMetrics(): Observable<RegulamentacaoMetrics> {
    const metrics: RegulamentacaoMetrics = {
      totalRegulations: this.regulations.length,
      activeCount: this.regulations.filter(r => r.status === 'ACTIVE').length,
      recentChanges: 7,
      affectedOperations: 890,
      nonConformities: this.nonConformities.filter(nc => nc.status !== 'RESOLVIDA' && nc.status !== 'CANCELADA').length,
      criticalRisks: this.regulations.filter(r => r.criticality === 'CRITICAL').length,
      countriesMonitored: [...new Set(this.regulations.map(r => r.country))].length,
      productsWithPendencies: this.matrix.filter(m => m.complianceStatus === 'PENDENTE' || m.complianceStatus === 'NÃO_CONFORME').length
    };
    return of(metrics).pipe(delay(200));
  }

  analyzeImpact(regulationId: string): Observable<ImpactAnalysis> {
    return this.getImpactAnalysis(regulationId);
  }

  // =========== SYNCHRONOUS METHODS ===========

  getCategories(): RegulationCategory[] {
    return ['ADUANEIRA', 'FISCAL', 'SANITÁRIA', 'FITOSSANITÁRIA', 'AMBIENTAL', 'CAMBIAL', 'SEGURANÇA_ALIMENTAR', 'QUALIDADE', 'ESG', 'CERTIFICAÇÕES', 'ROTULAGEM', 'EMBALAGEM'];
  }

  getTypes(): RegulationType[] {
    return ['LAW', 'DECREE', 'RESOLUTION', 'ORDINANCE', 'NORMATIVE_INSTRUCTION', 'TECHNICAL_STANDARD', 'TRADE_AGREEMENT', 'INTERNAL_POLICY', 'CLIENT_REQUIREMENT', 'OTHER'];
  }

  getStatuses(): RegulationStatus[] {
    return ['DRAFT', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED', 'REPLACED', 'ARCHIVED'];
  }

  getCriticalities(): Criticality[] {
    return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  }

  getCountries(): string[] {
    return [...new Set(this.regulations.map(r => r.country))];
  }

  getBodies(): string[] {
    return [...new Set(this.regulations.map(r => r.regulatoryBody))];
  }
}
