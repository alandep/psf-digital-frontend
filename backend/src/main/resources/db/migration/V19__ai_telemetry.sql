-- V19__ai_telemetry.sql
-- Additive telemetry for the AI Hub (Vertex). Adds the real token-metering
-- columns produced by the Vertex generateContent call (thinking/total tokens,
-- finish reason, latency) to the ai_usage_event ledger from V8.
-- This migration is ADDITIVE ONLY:
--   * it does NOT recreate idempotency_key or provider_cost (both already exist
--     on ai_usage_event since V8__ai_hub.sql);
--   * it does NOT touch any RLS policy (ai_usage_event and ai_job stay under the
--     FORCE ROW LEVEL SECURITY from V8 untouched);
--   * ai_model_config stays GLOBAL (no RLS) and keeps its unique(task, priority)
--     from V8.
-- See V8 for the AI Hub schema and V4 for the tenant isolation (RLS) model.

-- Real token metering on the usage ledger. ADD COLUMN does not alter policies,
-- so ai_usage_event remains FORCE ROW LEVEL SECURITY (V8).
ALTER TABLE ai_usage_event ADD COLUMN thinking_tokens bigint NOT NULL DEFAULT 0;
ALTER TABLE ai_usage_event ADD COLUMN total_tokens    bigint NOT NULL DEFAULT 0;
ALTER TABLE ai_usage_event ADD COLUMN finish_reason   text;
ALTER TABLE ai_usage_event ADD COLUMN latency_ms      bigint;

-- Optional per-router-slot thinking config. ai_model_config stays a GLOBAL
-- catalog (no RLS) and keeps its unique(task, priority) from V8; these columns
-- let ops override the thinking level / output budget per (task, priority) slot
-- without a redeploy. Nullable: null means "derive from priority / YAML".
ALTER TABLE ai_model_config ADD COLUMN thinking_level    text;
ALTER TABLE ai_model_config ADD COLUMN max_output_tokens int;
