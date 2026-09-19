-- V14__bi.sql
-- BI domain. Per-tenant dashboards and saved data-explorer queries.
-- Tenant-scoped (RLS). Mirrors dashboard/dashboardBuilder/dataExplorer mocks.
-- See V4 for the tenant isolation model.

-- Dashboards. Aggregate root with optimistic-lock version column.
CREATE TABLE dashboard (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    user_id         uuid,
    name            text NOT NULL,
    description     text,
    -- layout persisted as JSON serialized to text
    layout          text,
    is_default      boolean NOT NULL DEFAULT false,
    version         bigint NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dashboard_org ON dashboard (organization_id);

-- Widgets belonging to a dashboard.
CREATE TABLE dashboard_widget (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    dashboard_id    uuid REFERENCES dashboard(id) ON DELETE CASCADE,
    tipo            text,
    titulo          text,
    config          text,
    ordem           int,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dashboard_widget_dashboard ON dashboard_widget (dashboard_id);
CREATE INDEX idx_dashboard_widget_org ON dashboard_widget (organization_id);

-- Saved data-explorer queries.
CREATE TABLE saved_query (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    user_id         uuid,
    name            text NOT NULL,
    dataset         text,
    query_json      text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_saved_query_org ON saved_query (organization_id);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
ALTER TABLE dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard FORCE ROW LEVEL SECURITY;
CREATE POLICY dashboard_isolation ON dashboard
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE dashboard_widget ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widget FORCE ROW LEVEL SECURITY;
CREATE POLICY dashboard_widget_isolation ON dashboard_widget
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE saved_query ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_query FORCE ROW LEVEL SECURITY;
CREATE POLICY saved_query_isolation ON saved_query
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Default dashboard for the dev org.
INSERT INTO dashboard (id, organization_id, name, description, is_default)
VALUES
  ('00000000-0000-0000-0000-000000000e01',
   '00000000-0000-0000-0000-000000000001',
   'Visao Geral', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Widgets on the default dashboard.
INSERT INTO dashboard_widget (id, organization_id, dashboard_id, tipo, titulo,
                              ordem)
VALUES
  ('00000000-0000-0000-0000-000000000e02',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000e01',
   'KPI', 'Exportacoes', 1),
  ('00000000-0000-0000-0000-000000000e03',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000e01',
   'CHART', 'MRR por plano', 2)
ON CONFLICT (id) DO NOTHING;

-- Saved data-explorer query.
INSERT INTO saved_query (id, organization_id, name, dataset, query_json)
VALUES
  ('00000000-0000-0000-0000-000000000e04',
   '00000000-0000-0000-0000-000000000001',
   'Exportacoes por mes', 'export', '{"groupBy":"month"}')
ON CONFLICT (id) DO NOTHING;
