-- V23__ai_usage_outcome.sql
-- Outcome-aware observability for the AI Hub usage ledger (ai_usage_event, V8).
-- Adds the richer outcome signals produced by the recordOutcome(...) ledger path
-- (ATTEMPT/SUCCESS/FAILURE/RETRY + failure category + propagated trace id).
-- This migration is ADDITIVE ONLY:
--   * it only ADDs three nullable columns to ai_usage_event (outcome,
--     failure_category, trace_id); it does NOT alter or recreate any existing
--     column (operation, request_id, telemetry from V19, etc.);
--   * it does NOT touch any RLS policy — ai_usage_event keeps the FORCE ROW LEVEL
--     SECURITY from V8 untouched (ADD COLUMN does not alter policies);
--   * existing rows and the legacy success-path record(...) meter leave these three
--     columns null; only the new recordOutcome(...) path populates them.
-- See V8 for the AI Hub schema, V19 for the token telemetry columns and V4 for the
-- tenant isolation (RLS) model.

-- Outcome signals on the usage ledger. All nullable so historical rows and the
-- legacy record(...) path stay valid without backfill. ADD COLUMN does not alter
-- policies, so ai_usage_event remains FORCE ROW LEVEL SECURITY (V8).
ALTER TABLE ai_usage_event ADD COLUMN outcome          text;
ALTER TABLE ai_usage_event ADD COLUMN failure_category text;
ALTER TABLE ai_usage_event ADD COLUMN trace_id         text;
