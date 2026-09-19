-- V12__crm.sql
-- CRM domain. Maps crm/leads/oportunidades mocks. All tenant-scoped (RLS).
-- See V4 for the tenant isolation model.

-- Leads. Aggregate root with optimistic-lock version column.
CREATE TABLE lead (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    company_name    text,
    email           text,
    phone           text,
    -- HOME/DEMO/PRICING/INTELLIGENCE/EVENT/REFERRAL
    source          text,
    origin          text,
    -- NEW/CONTACTED/QUALIFIED/TRIAL/CUSTOMER/LOST
    status          text NOT NULL DEFAULT 'NEW',
    version         bigint NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_org_status ON lead (organization_id, status);
CREATE INDEX idx_lead_org_source ON lead (organization_id, source);

-- CRM customers registry.
CREATE TABLE crm_cliente (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    cnpj            text,
    segmento        text,
    pais            text,
    -- ATIVO/INATIVO/PROSPECT
    status          text NOT NULL DEFAULT 'ATIVO',
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_crm_cliente_org_status ON crm_cliente (organization_id, status);

-- Opportunities. Aggregate root with optimistic-lock version column.
CREATE TABLE oportunidade (
    id                  uuid PRIMARY KEY,
    organization_id     uuid NOT NULL,
    cliente_id          uuid,
    titulo              text NOT NULL,
    valor_estimado      numeric(18,2),
    moeda               text DEFAULT 'USD',
    -- PROSPECCAO/QUALIFICACAO/PROPOSTA/NEGOCIACAO/GANHA/PERDIDA
    estagio             text NOT NULL DEFAULT 'PROSPECCAO',
    probabilidade       int,
    fechamento_previsto date,
    version             bigint NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_oportunidade_org_estagio ON oportunidade (organization_id, estagio);
CREATE INDEX idx_oportunidade_org_cliente ON oportunidade (organization_id, cliente_id);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
ALTER TABLE lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead FORCE ROW LEVEL SECURITY;
CREATE POLICY lead_isolation ON lead
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE crm_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_cliente FORCE ROW LEVEL SECURITY;
CREATE POLICY crm_cliente_isolation ON crm_cliente
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE oportunidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidade FORCE ROW LEVEL SECURITY;
CREATE POLICY oportunidade_isolation ON oportunidade
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Leads: one qualified event lead and one new inbound lead.
INSERT INTO lead (id, organization_id, name, company_name, email, phone,
                  source, origin, status)
VALUES
  ('00000000-0000-0000-0000-000000000c01',
   '00000000-0000-0000-0000-000000000001',
   'Maria Silva', 'AgroTech Ltda', 'maria.silva@agrotech.exemplo', NULL,
   'EVENT', 'CAMARU_2026', 'QUALIFIED'),
  ('00000000-0000-0000-0000-000000000c02',
   '00000000-0000-0000-0000-000000000001',
   'Joao Souza', 'Comex Br', 'joao.souza@comexbr.exemplo', NULL,
   'PRICING', 'GOOGLE', 'NEW')
ON CONFLICT (id) DO NOTHING;

-- CRM customer (Global Importers Inc), active.
INSERT INTO crm_cliente (id, organization_id, name, cnpj, segmento, pais, status)
VALUES
  ('00000000-0000-0000-0000-000000000c03',
   '00000000-0000-0000-0000-000000000001',
   'Global Importers Inc', NULL, NULL, 'US', 'ATIVO')
ON CONFLICT (id) DO NOTHING;

-- Opportunity for the CRM customer, in proposal stage.
INSERT INTO oportunidade (id, organization_id, cliente_id, titulo,
                          valor_estimado, moeda, estagio, probabilidade,
                          fechamento_previsto)
VALUES
  ('00000000-0000-0000-0000-000000000c04',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000c03',
   'Exportacao recorrente cafe', 120000.00, 'USD', 'PROPOSTA', 60,
   (CURRENT_DATE + 45))
ON CONFLICT (id) DO NOTHING;
