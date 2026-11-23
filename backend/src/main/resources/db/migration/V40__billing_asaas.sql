-- V40__billing_asaas.sql
-- Billing real via Asaas (ver docs/billing-asaas-contract.md, secao 2).
-- subscription/invoice ganham os vinculos com o gateway; addon_purchase e
-- checkout_acceptance sao tenant-scoped (RLS FORCE, mesmo padrao da V10);
-- billing_gateway_ref, coupon e demo_request sao globais (sem RLS).

ALTER TABLE subscription
  ADD COLUMN IF NOT EXISTS asaas_customer_id text,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id text,
  ADD COLUMN IF NOT EXISTS billing_type text,              -- CREDIT_CARD | PIX | BOLETO
  ADD COLUMN IF NOT EXISTS card_token text,               -- creditCardToken do Asaas (nunca PAN)
  ADD COLUMN IF NOT EXISTS next_due_date date,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS coupon_price numeric(18,2),
  ADD COLUMN IF NOT EXISTS coupon_cycles_remaining integer,
  ADD COLUMN IF NOT EXISTS invoices_synced_at timestamptz;

ALTER TABLE invoice
  ADD COLUMN IF NOT EXISTS asaas_payment_id text,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'SUBSCRIPTION',  -- SUBSCRIPTION | ADDON
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS billing_type text,
  ADD COLUMN IF NOT EXISTS invoice_url text,
  ADD COLUMN IF NOT EXISTS bank_slip_url text,
  ADD COLUMN IF NOT EXISTS net_value numeric(18,2),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoice_asaas_payment ON invoice (asaas_payment_id) WHERE asaas_payment_id IS NOT NULL;
-- status de invoice: OPEN | PAID | OVERDUE | REFUNDED | CANCELED | FAILED

CREATE TABLE IF NOT EXISTS addon_purchase (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, addon_code text NOT NULL,
  ai_credits integer NOT NULL DEFAULT 0, ocr_pages integer NOT NULL DEFAULT 0,
  amount numeric(18,2) NOT NULL, status text NOT NULL DEFAULT 'PENDING',   -- PENDING | PAID | CANCELED
  billing_type text, invoice_id uuid, asaas_payment_id text,
  period_start timestamptz, period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz);

CREATE INDEX IF NOT EXISTS idx_addon_purchase_org_status ON addon_purchase (organization_id, status);

ALTER TABLE addon_purchase ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_purchase FORCE ROW LEVEL SECURITY;
CREATE POLICY addon_purchase_isolation ON addon_purchase
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

CREATE TABLE IF NOT EXISTS billing_gateway_ref (           -- SEM RLS: usado pelo webhook (sem org na thread)
  gateway_id text PRIMARY KEY,                             -- cus_..., sub_... ou "addon:<uuid>"
  kind text NOT NULL,                                      -- CUSTOMER | SUBSCRIPTION | ADDON
  organization_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS coupon (                        -- global, sem RLS
  code text PRIMARY KEY, description text, plan_code text, billing_interval text,
  fixed_price numeric(18,2) NOT NULL, cycles integer NOT NULL, max_redemptions integer,
  redeemed integer NOT NULL DEFAULT 0, valid_until timestamptz, active boolean NOT NULL DEFAULT true);
INSERT INTO coupon VALUES ('FOUNDERS2026','Programa Cliente Fundador EIP','BUSINESS','MONTHLY',1790.00,12,50,0,'2027-06-30T23:59:59Z',true) ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS checkout_acceptance (
  id uuid PRIMARY KEY, organization_id uuid NOT NULL, user_id uuid,
  terms_version text NOT NULL, privacy_version text NOT NULL, billing_consent boolean NOT NULL,
  ip text, user_agent text, accepted_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS idx_checkout_acceptance_org ON checkout_acceptance (organization_id);

ALTER TABLE checkout_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_acceptance FORCE ROW LEVEL SECURITY;
CREATE POLICY checkout_acceptance_isolation ON checkout_acceptance
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

CREATE TABLE IF NOT EXISTS demo_request (                  -- global, sem RLS
  id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL, phone text, company text, cnpj text,
  message text, origin text, ip text, status text NOT NULL DEFAULT 'NEW', created_at timestamptz NOT NULL DEFAULT now());

-- Usuarios ilimitados em todos os planos (catalogo global, sem RLS).
UPDATE plan_feature SET limit_value = NULL WHERE feature_key = 'limit.users';

-- Backfill das tabelas tenant-scoped (FORCE RLS). Em producao o Flyway roda como
-- `postgres` (superuser, ignora RLS). Para tambem funcionar quando o Flyway roda
-- como DONO nao-superuser, o FORCE e desligado temporariamente (o dono passa a
-- ignorar as policies) e religado ao final. Tudo roda na transacao da migration:
-- em caso de erro o ALTER e revertido junto.
DO $$
BEGIN
  EXECUTE 'ALTER TABLE organization_entitlement NO FORCE ROW LEVEL SECURITY';
  UPDATE organization_entitlement SET limit_value = NULL WHERE feature_key = 'limit.users';
  EXECUTE 'ALTER TABLE organization_entitlement FORCE ROW LEVEL SECURITY';

  EXECUTE 'ALTER TABLE subscription NO FORCE ROW LEVEL SECURITY';
  UPDATE subscription SET trial_end = current_period_end WHERE status = 'TRIALING' AND trial_end IS NULL;
  EXECUTE 'ALTER TABLE subscription FORCE ROW LEVEL SECURITY';

  EXECUTE 'ALTER TABLE ai_usage_event NO FORCE ROW LEVEL SECURITY';
  UPDATE ai_usage_event SET eip_credits = GREATEST(1, CEIL((COALESCE(input_units,0) + 5 * (COALESCE(output_units,0) + COALESCE(thinking_tokens,0))) / 1000.0))
    WHERE eip_credits IS NULL AND (COALESCE(input_units,0) + COALESCE(output_units,0) + COALESCE(thinking_tokens,0)) > 0;
  EXECUTE 'ALTER TABLE ai_usage_event FORCE ROW LEVEL SECURITY';
END $$;
