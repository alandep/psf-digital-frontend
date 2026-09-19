-- V11__compliance.sql
-- Compliance domain. Maps dueDiligence/certifications/licencas/esg/auditoria
-- mocks. All tenant-scoped (RLS). See V4 for the tenant isolation model.

-- Due diligence / sanctions screening. Aggregate root with optimistic-lock
-- version column.
CREATE TABLE screening (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    entity_name     text NOT NULL,
    -- CUSTOMER/SUPPLIER/PARTNER/OTHER
    entity_type     text,
    document        text,
    -- PENDENTE/EM_ANALISE/APROVADO/REPROVADO
    status          text NOT NULL DEFAULT 'PENDENTE',
    -- BAIXO/MEDIO/ALTO/CRITICO
    risk_level      text,
    lists_checked   text,
    result_summary  text,
    version         bigint NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_screening_org_status ON screening (organization_id, status);
CREATE INDEX idx_screening_org_risk ON screening (organization_id, risk_level);

-- Certifications registry.
CREATE TABLE certificacao (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    tipo            text,
    orgao_emissor   text,
    numero          text,
    -- ATIVA/VENCIDA/SUSPENSA/PENDENTE
    status          text NOT NULL DEFAULT 'ATIVA',
    emitida_em      date,
    valida_ate      date,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_certificacao_org_status ON certificacao (organization_id, status);

-- Licenses. Aggregate root with optimistic-lock version column.
CREATE TABLE licenca (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    tipo            text,
    orgao           text,
    numero          text,
    -- ATIVA/VENCIDA/EM_RENOVACAO/CANCELADA
    status          text NOT NULL DEFAULT 'ATIVA',
    emitida_em      date,
    valida_ate      date,
    version         bigint NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_licenca_org_status ON licenca (organization_id, status);
CREATE INDEX idx_licenca_org_valida ON licenca (organization_id, valida_ate);

-- ESG assessments. Scores are numeric(5,2) (0.00 - 100.00).
CREATE TABLE esg_avaliacao (
    id                uuid PRIMARY KEY,
    organization_id   uuid NOT NULL,
    periodo           text,
    score_ambiental   numeric(5,2),
    score_social      numeric(5,2),
    score_governanca  numeric(5,2),
    score_total       numeric(5,2),
    -- RASCUNHO/PUBLICADA
    status            text NOT NULL DEFAULT 'RASCUNHO',
    created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_esg_avaliacao_org ON esg_avaliacao (organization_id);

-- Business audit trail. Immutable by convention (append-only).
CREATE TABLE audit_event (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    actor_id        uuid,
    action          text NOT NULL,
    resource_type   text,
    resource_id     text,
    before_hash     text,
    after_hash      text,
    ip              text,
    correlation_id  text,
    occurred_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_event_org_occurred ON audit_event (organization_id, occurred_at DESC);
CREATE INDEX idx_audit_event_org_resource ON audit_event (organization_id, resource_type);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
ALTER TABLE screening ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening FORCE ROW LEVEL SECURITY;
CREATE POLICY screening_isolation ON screening
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE certificacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificacao FORCE ROW LEVEL SECURITY;
CREATE POLICY certificacao_isolation ON certificacao
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE licenca ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenca FORCE ROW LEVEL SECURITY;
CREATE POLICY licenca_isolation ON licenca
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE esg_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_avaliacao FORCE ROW LEVEL SECURITY;
CREATE POLICY esg_avaliacao_isolation ON esg_avaliacao
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE audit_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_event FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_event_isolation ON audit_event
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Screening for the seeded customer (Global Importers Inc), approved low risk.
INSERT INTO screening (id, organization_id, entity_name, entity_type, document,
                       status, risk_level, lists_checked, result_summary)
VALUES
  ('00000000-0000-0000-0000-000000000b01',
   '00000000-0000-0000-0000-000000000001',
   'Global Importers Inc', 'CUSTOMER', NULL,
   'APROVADO', 'BAIXO', 'OFAC,ONU,PEP',
   'Nenhuma ocorrencia relevante nas listas verificadas.')
ON CONFLICT (id) DO NOTHING;

-- Certification, active, valid for ~180 days.
INSERT INTO certificacao (id, organization_id, name, tipo, orgao_emissor,
                          numero, status, emitida_em, valida_ate)
VALUES
  ('00000000-0000-0000-0000-000000000b02',
   '00000000-0000-0000-0000-000000000001',
   'Certificado de Origem', 'ORIGEM', 'Camara de Comercio',
   'CO-2024-0001', 'ATIVA', CURRENT_DATE, (CURRENT_DATE + 180))
ON CONFLICT (id) DO NOTHING;

-- License (MAPA export), active, valid for ~365 days.
INSERT INTO licenca (id, organization_id, name, tipo, orgao, numero,
                     status, emitida_em, valida_ate)
VALUES
  ('00000000-0000-0000-0000-000000000b03',
   '00000000-0000-0000-0000-000000000001',
   'Licenca de Exportacao MAPA', 'EXPORTACAO', 'MAPA',
   'LIC-2024-0001', 'ATIVA', CURRENT_DATE, (CURRENT_DATE + 365))
ON CONFLICT (id) DO NOTHING;

-- ESG assessment for 2024, published.
INSERT INTO esg_avaliacao (id, organization_id, periodo, score_ambiental,
                           score_social, score_governanca, score_total, status)
VALUES
  ('00000000-0000-0000-0000-000000000b04',
   '00000000-0000-0000-0000-000000000001',
   '2024', 82.50, 78.00, 90.00, 83.50, 'PUBLICADA')
ON CONFLICT (id) DO NOTHING;

-- Audit event: the seeded export (...f1) was confirmed.
INSERT INTO audit_event (id, organization_id, actor_id, action, resource_type,
                         resource_id, before_hash, after_hash, ip, correlation_id)
VALUES
  ('00000000-0000-0000-0000-000000000b05',
   '00000000-0000-0000-0000-000000000001',
   NULL, 'EXPORT_CONFIRMED', 'export',
   '00000000-0000-0000-0000-0000000000f1',
   NULL, NULL, '127.0.0.1', NULL)
ON CONFLICT (id) DO NOTHING;
