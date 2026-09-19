-- V13__intelligence.sql
-- Intelligence domain. Public curated content (GLOBAL, no RLS) + per-tenant
-- watchlist and alerts (RLS). Mirrors intelligence/watchlist/alertas + CMS
-- Intelligence mocks. See V8 for the global-vs-tenant split rationale.

-- Curated public content. GLOBAL catalog shared across tenants, so NOT
-- tenant-scoped (no RLS).
CREATE TABLE intelligence_item (
    id                 uuid PRIMARY KEY,
    -- FX/ALERT/NEWS/OPPORTUNITY/REGULATION
    type               text NOT NULL,
    title              text NOT NULL,
    slug               text UNIQUE,
    summary            text,
    content            text,
    source_name        text,
    source_url         text,
    country            text,
    sector             text,
    commodity          text,
    -- INFORMATIONAL/LOW/MEDIUM/HIGH/CRITICAL
    impact_level       text,
    ai_generated       boolean NOT NULL DEFAULT false,
    ai_analysis        text,
    -- DRAFT/REVIEW_REQUIRED/APPROVED/REJECTED
    review_status      text NOT NULL DEFAULT 'APPROVED',
    -- SCHEDULED/PUBLISHED/EXPIRED/ARCHIVED
    publication_status text NOT NULL DEFAULT 'PUBLISHED',
    published_at       timestamptz,
    expires_at         timestamptz,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intelligence_item_type ON intelligence_item (type);
CREATE INDEX idx_intelligence_item_pub_status ON intelligence_item (publication_status);
CREATE INDEX idx_intelligence_item_slug ON intelligence_item (slug);

-- Sources backing a curated item. GLOBAL (no RLS).
CREATE TABLE intelligence_source (
    id                   uuid PRIMARY KEY,
    intelligence_item_id uuid REFERENCES intelligence_item(id) ON DELETE CASCADE,
    source_name          text,
    source_url           text,
    -- OFFICIAL/NEWS/MARKET_DATA/OTHER
    source_type          text,
    published_at         timestamptz,
    retrieved_at         timestamptz
);

CREATE INDEX idx_intelligence_source_item ON intelligence_source (intelligence_item_id);

-- Per-tenant watchlist entries. Tenant-scoped (RLS).
CREATE TABLE watchlist_item (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    user_id         uuid,
    -- COUNTRY/PRODUCT/NCM/PORT/COMMODITY/REGULATION/ROUTE
    type            text NOT NULL,
    label           text NOT NULL,
    active          boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_watchlist_item_org ON watchlist_item (organization_id);

-- Per-tenant intelligence alerts. Tenant-scoped (RLS).
CREATE TABLE intelligence_alert (
    id                  uuid PRIMARY KEY,
    organization_id     uuid NOT NULL,
    title               text NOT NULL,
    -- LOW/MEDIUM/HIGH/CRITICAL
    impact_level        text,
    related_to          text,
    affected_operations int NOT NULL DEFAULT 0,
    summary             text,
    read                boolean NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intelligence_alert_org_created ON intelligence_alert (organization_id, created_at DESC);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
-- intelligence_item and intelligence_source are GLOBAL curated content and are
-- deliberately left without RLS.
ALTER TABLE watchlist_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_item FORCE ROW LEVEL SECURITY;
CREATE POLICY watchlist_item_isolation ON watchlist_item
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE intelligence_alert ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_alert FORCE ROW LEVEL SECURITY;
CREATE POLICY intelligence_alert_isolation ON intelligence_alert
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Curated content seed (global, no org context needed). Fixed ids + ON CONFLICT.
INSERT INTO intelligence_item (id, type, title, slug, summary, source_name,
                               country, sector, commodity, impact_level,
                               ai_generated, ai_analysis, published_at)
VALUES
  ('00000000-0000-0000-0000-000000000d01', 'NEWS',
   'China anuncia revisao de habilitacoes para carne bovina',
   'china-carne-bovina',
   'Revisao pode afetar habilitacoes e embarques em transito.',
   'Fonte oficial', 'CN', 'Frigorificos', 'Carne bovina', 'MEDIUM',
   true,
   'Analise EIP: possivel impacto em habilitacoes e embarques em transito.',
   now()),
  ('00000000-0000-0000-0000-000000000d02', 'ALERT',
   'Congestionamento no Porto de Santos', 'congestionamento-porto-santos',
   NULL, NULL, 'BR', 'Logistica', NULL, 'HIGH',
   false, NULL, now()),
  ('00000000-0000-0000-0000-000000000d03', 'FX',
   'USD/BRL PTAX', 'usd-brl-ptax',
   'Referencia PTAX do Banco Central', NULL, NULL, NULL, NULL,
   'INFORMATIONAL', false, NULL, now()),
  ('00000000-0000-0000-0000-000000000d04', 'OPPORTUNITY',
   'Demanda crescente por cafe nos EUA', 'cafe-eua-oportunidade',
   NULL, NULL, 'US', NULL, 'Cafe', 'LOW', false, NULL, now())
ON CONFLICT (id) DO NOTHING;

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Watchlist entries mirroring the front watchlist mock.
INSERT INTO watchlist_item (id, organization_id, type, label, active)
VALUES
  ('00000000-0000-0000-0000-000000000d11',
   '00000000-0000-0000-0000-000000000001',
   'COMMODITY', 'Carne bovina', true),
  ('00000000-0000-0000-0000-000000000d12',
   '00000000-0000-0000-0000-000000000001',
   'COUNTRY', 'China', true),
  ('00000000-0000-0000-0000-000000000d13',
   '00000000-0000-0000-0000-000000000001',
   'PORT', 'Porto de Santos', true)
ON CONFLICT (id) DO NOTHING;

-- Tenant alerts mirroring the front alertas mock.
INSERT INTO intelligence_alert (id, organization_id, title, impact_level,
                                related_to, affected_operations, read)
VALUES
  ('00000000-0000-0000-0000-000000000d21',
   '00000000-0000-0000-0000-000000000001',
   'China / Carne bovina', 'HIGH', 'China · Carne bovina', 3, false),
  ('00000000-0000-0000-0000-000000000d22',
   '00000000-0000-0000-0000-000000000001',
   'Congestionamento Porto de Santos', 'MEDIUM', NULL, 2, false)
ON CONFLICT (id) DO NOTHING;
