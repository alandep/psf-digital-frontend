-- V8__ai_hub.sql
-- AI Hub domain. Model Router config + usage ledger (the reliable record of
-- AI/OCR consumption; Redis/cache is secondary). ai_usage_event is the ledger
-- that feeds the subscription franquia (subscription_usage from V6).
-- See V4 for the tenant isolation (RLS) model.

-- Model router config. GLOBAL catalog shared across tenants, so NOT tenant-scoped
-- (no RLS). unique(task, priority) selects one model per (task, priority) slot.
CREATE TABLE ai_model_config (
    id         uuid PRIMARY KEY,
    provider   text NOT NULL,
    model      text NOT NULL,
    -- NCM_CLASSIFICATION/DOCUMENT_SUMMARY/TRANSLATION/RISK_ANALYSIS/
    -- DOCUMENT_EXTRACTION/CHAT
    task       text NOT NULL,
    -- FAST/STANDARD/DEEP
    priority   text NOT NULL,
    cost_class text,
    enabled    boolean NOT NULL DEFAULT true,
    CONSTRAINT uq_model_task_priority UNIQUE (task, priority)
);

-- Usage ledger: the authoritative record of AI/OCR consumption per tenant.
CREATE TABLE ai_usage_event (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    user_id         uuid,
    operation       text NOT NULL,
    provider        text,
    model           text,
    input_units     bigint NOT NULL DEFAULT 0,
    output_units    bigint NOT NULL DEFAULT 0,
    ocr_pages       int NOT NULL DEFAULT 0,
    provider_cost   numeric(18,6),
    eip_credits     numeric(18,2),
    request_id      text,
    idempotency_key text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_event_org_created ON ai_usage_event (organization_id, created_at DESC);
CREATE INDEX idx_ai_usage_event_org_operation ON ai_usage_event (organization_id, operation);

CREATE TABLE ai_job (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    user_id         uuid,
    task            text NOT NULL,
    -- QUEUED/PROCESSING/COMPLETED/FAILED
    status          text NOT NULL DEFAULT 'QUEUED',
    input_ref       text,
    result_ref      text,
    error           text,
    attempts        int NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    available_at    timestamptz NOT NULL DEFAULT now(),
    processed_at    timestamptz
);

CREATE INDEX idx_ai_job_status_available ON ai_job (status, available_at);
CREATE INDEX idx_ai_job_org ON ai_job (organization_id);

-- Row Level Security for tenant-scoped tables (see V4 for the isolation model).
-- ai_model_config is a GLOBAL catalog and is deliberately left without RLS.
ALTER TABLE ai_usage_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_event FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_event_isolation ON ai_usage_event
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE ai_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_job FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_job_isolation ON ai_job
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Router seed (global, no org context needed). Fixed ids + ON CONFLICT (id).
-- IMPORTANT: the model names below (gemini-flash/standard/pro) are ILLUSTRATIVE
-- config values, NOT authoritative provider model IDs; treat them as tunable
-- router entries that ops can point at the real deployed models.
INSERT INTO ai_model_config (id, provider, model, task, priority, cost_class)
VALUES
  ('00000000-0000-0000-0000-0000000003a1', 'vertex-ai', 'gemini-flash',
   'NCM_CLASSIFICATION', 'FAST', 'low'),
  ('00000000-0000-0000-0000-0000000003a2', 'vertex-ai', 'gemini-standard',
   'DOCUMENT_EXTRACTION', 'STANDARD', 'medium'),
  ('00000000-0000-0000-0000-0000000003a3', 'vertex-ai', 'gemini-pro',
   'RISK_ANALYSIS', 'DEEP', 'high'),
  ('00000000-0000-0000-0000-0000000003a4', 'vertex-ai', 'gemini-flash',
   'DOCUMENT_SUMMARY', 'FAST', 'low'),
  ('00000000-0000-0000-0000-0000000003a5', 'vertex-ai', 'gemini-flash',
   'TRANSLATION', 'FAST', 'low'),
  ('00000000-0000-0000-0000-0000000003a6', 'vertex-ai', 'gemini-standard',
   'CHAT', 'STANDARD', 'medium')
ON CONFLICT (id) DO NOTHING;

-- Tenant-scoped seed for the dev org (from V5). RLS is FORCED above, so we set
-- the transaction-local org context to satisfy the WITH CHECK policies.
SELECT set_config('app.current_organization',
                  '00000000-0000-0000-0000-000000000001', true);

-- A few usage ledger entries feeding the AI/OCR franquia meters.
INSERT INTO ai_usage_event (id, organization_id, user_id, operation, provider,
                            model, input_units, output_units, ocr_pages,
                            provider_cost, eip_credits, request_id)
VALUES
  ('00000000-0000-0000-0000-0000000003b1',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000a1',
   'NCM_CLASSIFICATION', 'vertex-ai', 'gemini-flash',
   1200, 320, 0, 0.004500, 12.00, 'req-ncm-0001'),
  ('00000000-0000-0000-0000-0000000003b2',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000a1',
   'DOCUMENT_EXTRACTION', 'vertex-ai', 'gemini-standard',
   4800, 900, 6, 0.028000, 48.00, 'req-ext-0001'),
  ('00000000-0000-0000-0000-0000000003b3',
   '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-0000000000a1',
   'NCM_CLASSIFICATION', 'vertex-ai', 'gemini-flash',
   950, 210, 0, 0.003100, 9.00, 'req-ncm-0002')
ON CONFLICT (id) DO NOTHING;
