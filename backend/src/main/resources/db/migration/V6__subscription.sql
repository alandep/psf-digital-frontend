-- V6__subscription.sql
-- Subscription & Billing domain. Maps the frontend saasBillingMockService.
-- plan is a global catalog (no RLS); subscription/trial/subscription_usage/
-- invoice are tenant-scoped (RLS).

-- Global catalog: shared across all tenants, so NOT tenant-scoped (no RLS).
CREATE TABLE plan (
    code          text PRIMARY KEY,   -- START/BUSINESS/PRO/ENTERPRISE
    name          text NOT NULL,
    description   text,
    monthly_price numeric(18,2) NOT NULL,
    annual_price  numeric(18,2) NOT NULL,
    highlighted   boolean NOT NULL DEFAULT false,
    active        boolean NOT NULL DEFAULT true
);

CREATE TABLE subscription (
    id                     uuid PRIMARY KEY,
    organization_id        uuid NOT NULL,
    plan_code              text NOT NULL REFERENCES plan(code),
    plan_name              text NOT NULL,
    billing_interval       text NOT NULL DEFAULT 'MONTHLY',
    amount                 numeric(18,2) NOT NULL,
    -- TRIALING/ACTIVE/PAST_DUE/GRACE_PERIOD/SUSPENDED/CANCELED/TERMINATED
    status                 text NOT NULL DEFAULT 'TRIALING',
    current_period_start   timestamptz NOT NULL DEFAULT now(),
    current_period_end     timestamptz,
    trial_end              timestamptz,
    cancel_at_period_end   boolean NOT NULL DEFAULT false,
    payment_brand          text,
    payment_last4          text,
    stripe_customer_id     text,
    stripe_subscription_id text,
    version                bigint NOT NULL DEFAULT 0,
    created_at             timestamptz NOT NULL DEFAULT now(),
    updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_org ON subscription (organization_id);
-- A real impl may add a partial unique index to enforce a single active-ish
-- subscription per org; not enforced strictly here.

CREATE TABLE trial (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    plan_code       text,
    -- ACTIVE/EXPIRING/EXPIRED/CONVERTED/CANCELED
    status          text NOT NULL DEFAULT 'ACTIVE',
    started_at      timestamptz NOT NULL DEFAULT now(),
    expires_at      timestamptz NOT NULL,
    converted_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_trial_org ON trial (organization_id);

CREATE TABLE subscription_usage (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    feature         text NOT NULL,   -- AI/OCR/STORAGE
    label           text,
    used            numeric(18,2) NOT NULL DEFAULT 0,
    included        numeric(18,2) NOT NULL DEFAULT 0,
    unit            text,
    period          text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_usage_org ON subscription_usage (organization_id, feature);

CREATE TABLE invoice (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    subscription_id uuid,
    number          text,
    period          text,
    plan_name       text,
    amount          numeric(18,2) NOT NULL,
    status          text NOT NULL DEFAULT 'OPEN',   -- OPEN/PAID/FAILED
    issued_at       timestamptz NOT NULL DEFAULT now(),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_org_issued ON invoice (organization_id, issued_at DESC);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
-- plan is a global catalog and is deliberately left without RLS.

ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription FORCE ROW LEVEL SECURITY;
CREATE POLICY subscription_isolation ON subscription
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE trial ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial FORCE ROW LEVEL SECURITY;
CREATE POLICY trial_isolation ON trial
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage FORCE ROW LEVEL SECURITY;
CREATE POLICY subscription_usage_isolation ON subscription_usage
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice FORCE ROW LEVEL SECURITY;
CREATE POLICY invoice_isolation ON invoice
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Seed data (idempotent). Plan catalog mirrors the front PLAN_CATALOG.
INSERT INTO plan (code, name, description, monthly_price, annual_price, highlighted, active)
VALUES
  ('START', 'EIP Start',
   'Para empresas iniciando ou com menor volume de exportacoes.',
   1290.00, 12900.00, false, true),
  ('BUSINESS', 'EIP Business',
   'Para o exportador recorrente que precisa de automacao e IA avancada.',
   2490.00, 24900.00, true, true),
  ('PRO', 'EIP Pro',
   'Para operacoes mais complexas que exigem API e compliance avancado.',
   4490.00, 44900.00, false, true),
  ('ENTERPRISE', 'EIP Enterprise',
   'A partir de R$ 6.990/mes',
   6990.00, 0.00, false, true)
ON CONFLICT (code) DO NOTHING;

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- Active BUSINESS subscription for the dev org.
INSERT INTO subscription (id, organization_id, plan_code, plan_name,
                          billing_interval, amount, status,
                          current_period_start, current_period_end,
                          payment_brand, payment_last4)
VALUES ('00000000-0000-0000-0000-00000000015a',
        '00000000-0000-0000-0000-000000000001',
        'BUSINESS', 'EIP Business',
        'MONTHLY', 2490.00, 'ACTIVE',
        now(), now() + interval '28 days',
        'Mastercard', '4242')
ON CONFLICT (id) DO NOTHING;

-- Usage meters (AI/OCR/STORAGE).
INSERT INTO subscription_usage (id, organization_id, feature, label,
                                used, included, unit)
VALUES
  ('00000000-0000-0000-0000-0000000001a1',
   '00000000-0000-0000-0000-000000000001',
   'AI', 'Creditos de IA', 3920, 5000, 'creditos'),
  ('00000000-0000-0000-0000-0000000001a2',
   '00000000-0000-0000-0000-000000000001',
   'OCR', 'Paginas OCR', 1180, 2000, 'paginas'),
  ('00000000-0000-0000-0000-0000000001a3',
   '00000000-0000-0000-0000-000000000001',
   'STORAGE', 'Armazenamento', 21, 100, 'GB')
ON CONFLICT (id) DO NOTHING;

-- Invoices: current period (OPEN) and previous month (PAID).
INSERT INTO invoice (id, organization_id, subscription_id, number, period,
                     plan_name, amount, status, issued_at)
VALUES
  ('00000000-0000-0000-0000-0000000001b1',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-00000000015a',
   'INV-2024-0002', 'Periodo atual', 'EIP Business',
   2490.00, 'OPEN', now()),
  ('00000000-0000-0000-0000-0000000001b2',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-00000000015a',
   'INV-2024-0001', 'Mes anterior', 'EIP Business',
   2490.00, 'PAID', now() - interval '1 month')
ON CONFLICT (id) DO NOTHING;
