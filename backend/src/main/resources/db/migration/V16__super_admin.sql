-- V16__super_admin.sql
-- Super Admin analytics. product_event ledger (per-tenant, RLS) feeding the
-- funnel/product-events screens. SaaS metrics, tenants, funnel and unit
-- economics are READ-SIDE aggregations computed at query time over existing
-- tables (subscription, ai_usage_event, organization, lead), so few new tables
-- are needed. See V8/V13 for the tenant isolation (RLS) model.

-- Product analytics ledger. Tenant-scoped (RLS).
CREATE TABLE product_event (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    user_id         uuid,
    -- SIGNUP_STARTED/SIGNUP_COMPLETED/PLAN_VIEWED/CHECKOUT_STARTED/
    -- CHECKOUT_COMPLETED/ONBOARDING_STARTED/PRODUCT_CREATED/CUSTOMER_CREATED/
    -- EXPORT_CREATED/FIRST_EXPORT_CREATED/DOCUMENT_GENERATED/AI_USED
    event           text NOT NULL,
    properties      text,
    occurred_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_event_org_occurred ON product_event (organization_id, occurred_at DESC);
CREATE INDEX idx_product_event_org_event ON product_event (organization_id, event);

-- Row Level Security for the tenant-scoped ledger (see V4 for the model).
ALTER TABLE product_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_event FORCE ROW LEVEL SECURITY;
CREATE POLICY product_event_isolation ON product_event
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- NOTE: the Super Admin SaaS metrics, tenants, funnel and unit-economics
-- endpoints will aggregate at query time (mostly native/JPQL COUNT/SUM over
-- subscription, product_event, ai_usage_event, organization and lead) — no
-- dedicated tables are added here.

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Product analytics events feeding the funnel/product-events screens.
INSERT INTO product_event (id, organization_id, event, properties, occurred_at)
VALUES
  -- NB: 'g' is not valid hex; the g01..g06 labels map to the e01..e06 block.
  ('00000000-0000-0000-0000-000000000e51',
   '00000000-0000-0000-0000-000000000001',
   'SIGNUP_COMPLETED', '{"plan":"trial"}', now() - interval '30 days'),
  ('00000000-0000-0000-0000-000000000e52',
   '00000000-0000-0000-0000-000000000001',
   'PLAN_VIEWED', '{"plan":"pro"}', now() - interval '28 days'),
  ('00000000-0000-0000-0000-000000000e53',
   '00000000-0000-0000-0000-000000000001',
   'CHECKOUT_COMPLETED', '{"plan":"pro"}', now() - interval '27 days'),
  ('00000000-0000-0000-0000-000000000e54',
   '00000000-0000-0000-0000-000000000001',
   'FIRST_EXPORT_CREATED', '{"country":"CN"}', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000e55',
   '00000000-0000-0000-0000-000000000001',
   'EXPORT_CREATED', '{"country":"US"}', now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000e56',
   '00000000-0000-0000-0000-000000000001',
   'AI_USED', '{"operation":"NCM_CLASSIFICATION"}', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;
