-- V15__cms_admin.sql
-- CMS & Admin domain. Institutional public settings + official links +
-- advertising (GLOBAL, no RLS); access profiles + notifications (per-tenant,
-- RLS). Mirrors publicSettings/official-links/advertising/perfis-acesso/
-- notificacoes mocks. See V8/V13 for the global-vs-tenant split rationale.

-- Institutional public settings. GLOBAL key/value store shared across tenants,
-- so NOT tenant-scoped (no RLS).
CREATE TABLE public_setting (
    key        text PRIMARY KEY,
    value      text,
    -- PUBLIC/PRIVATE
    type       text NOT NULL DEFAULT 'PUBLIC',
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by uuid
);

-- Curated official/external links. GLOBAL catalog (no RLS).
CREATE TABLE official_link (
    id            uuid PRIMARY KEY,
    -- BRAZIL/CUSTOMS/PORTS/FOREIGN_TRADE/INTERNATIONAL/REGULATORY
    category      text,
    name          text NOT NULL,
    description   text,
    url           text NOT NULL,
    country       text,
    display_order int NOT NULL DEFAULT 0,
    active        boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_official_link_category_order ON official_link (category, display_order);

-- Advertisers. GLOBAL directory (no RLS).
CREATE TABLE advertiser (
    id         uuid PRIMARY KEY,
    legal_name text,
    trade_name text NOT NULL,
    cnpj       text,
    website    text,
    -- ACTIVE/INACTIVE
    status     text NOT NULL DEFAULT 'ACTIVE',
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Advertising campaigns. GLOBAL (no RLS).
CREATE TABLE ad_campaign (
    id            uuid PRIMARY KEY,
    advertiser_id uuid REFERENCES advertiser(id),
    name          text NOT NULL,
    placement     text,
    start_at      date,
    end_at        date,
    -- DRAFT/PENDING_APPROVAL/ACTIVE/PAUSED/ENDED
    status        text NOT NULL DEFAULT 'DRAFT',
    target_url    text,
    impressions   int NOT NULL DEFAULT 0,
    clicks        int NOT NULL DEFAULT 0,
    revenue       numeric(18,2) NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ad_campaign_status ON ad_campaign (status);

-- Access profiles (aggregate root). Tenant-scoped (RLS).
CREATE TABLE access_profile (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    description     text,
    color           text,
    is_system       boolean NOT NULL DEFAULT false,
    -- permissions stored as JSON text
    permissions     text,
    version         bigint NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_profile_org ON access_profile (organization_id);

-- In-app notifications. Tenant-scoped (RLS).
CREATE TABLE app_notification (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    user_id         uuid,
    -- SUCCESS/WARNING/ERROR/INFO
    type            text,
    title           text NOT NULL,
    body            text,
    read            boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_notification_org_created ON app_notification (organization_id, created_at DESC);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
-- public_setting, official_link, advertiser and ad_campaign are GLOBAL and are
-- deliberately left without RLS.
ALTER TABLE access_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_profile FORCE ROW LEVEL SECURITY;
CREATE POLICY access_profile_isolation ON access_profile
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE app_notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_notification FORCE ROW LEVEL SECURITY;
CREATE POLICY app_notification_isolation ON app_notification
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Institutional settings seed (global, no org context needed).
INSERT INTO public_setting (key, value, type)
VALUES
  ('MISSION',
   'Simplificar e integrar a operacao de comercio exterior...', 'PUBLIC'),
  ('VISION',
   'Ser uma plataforma brasileira de referencia...', 'PUBLIC'),
  ('VALUES',
   'Confianca, Seguranca, Inovacao, Transparencia, Eficiencia, Inteligencia, Foco no cliente',
   'PUBLIC'),
  ('SUPPORT_EMAIL', 'suporte@eip.exemplo', 'PUBLIC'),
  ('COMMERCIAL_EMAIL', 'comercial@eip.exemplo', 'PUBLIC'),
  ('COMPANY_LEGAL_NAME', '', 'PUBLIC'),
  ('COMPANY_CNPJ', '', 'PUBLIC'),
  ('COMPANY_ADDRESS', '', 'PUBLIC')
ON CONFLICT (key) DO NOTHING;

-- Official links seed (global, no org context needed).
INSERT INTO official_link (id, category, name, description, url, display_order)
VALUES
  ('00000000-0000-0000-0000-000000000f01', 'BRAZIL', 'Siscomex',
   NULL, 'https://www.gov.br/siscomex', 1),
  ('00000000-0000-0000-0000-000000000f02', 'CUSTOMS', 'Receita Federal',
   NULL, 'https://www.gov.br/receitafederal', 2),
  ('00000000-0000-0000-0000-000000000f03', 'PORTS', 'ANTAQ',
   NULL, 'https://www.gov.br/antaq', 3),
  ('00000000-0000-0000-0000-000000000f04', 'FOREIGN_TRADE', 'Banco Central',
   NULL, 'https://www.bcb.gov.br', 4),
  ('00000000-0000-0000-0000-000000000f05', 'REGULATORY', 'MAPA',
   NULL, 'https://www.gov.br/agricultura', 5),
  ('00000000-0000-0000-0000-000000000f06', 'INTERNATIONAL', 'WTO',
   NULL, 'https://www.wto.org', 6),
  ('00000000-0000-0000-0000-000000000f07', 'INTERNATIONAL', 'WCO',
   NULL, 'https://www.wcoomd.org', 7),
  ('00000000-0000-0000-0000-000000000f08', 'INTERNATIONAL', 'IMO',
   NULL, 'https://www.imo.org', 8)
ON CONFLICT (id) DO NOTHING;

-- Advertising seed (global, no org context needed).
INSERT INTO advertiser (id, trade_name, status)
VALUES
  ('00000000-0000-0000-0000-000000000f10', 'MSC', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ad_campaign (id, advertiser_id, name, placement, status,
                         impressions, clicks, revenue)
VALUES
  ('00000000-0000-0000-0000-000000000f11',
   '00000000-0000-0000-0000-000000000f10',
   'MSC Q1', 'Home Intelligence', 'ACTIVE', 12000, 340, 5000.00)
ON CONFLICT (id) DO NOTHING;

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Default system access profile.
INSERT INTO access_profile (id, organization_id, name, is_system, permissions)
VALUES
  ('00000000-0000-0000-0000-000000000f20',
   '00000000-0000-0000-0000-000000000001',
   'Administrador', true, '{"fullAccess":true}')
ON CONFLICT (id) DO NOTHING;

-- Sample notifications mirroring the notificacoes mock.
INSERT INTO app_notification (id, organization_id, type, title, read)
VALUES
  ('00000000-0000-0000-0000-000000000f21',
   '00000000-0000-0000-0000-000000000001',
   'SUCCESS', 'Exportacao aprovada', false),
  ('00000000-0000-0000-0000-000000000f22',
   '00000000-0000-0000-0000-000000000001',
   'WARNING', 'Margem baixa detectada', false)
ON CONFLICT (id) DO NOTHING;
