-- V24__ai_scope_b_router.sql
-- Scope B routing seed. Adds one STANDARD route per NEW AiTask introduced by the
-- Escopo B capabilities so the global Model Router can resolve them from config:
--
--   TRANSPORT_SIMULATION  structured carrier/modal/route recommendation
--   EXPORT_NL_CREATION    natural-language export draft generation
--   OCR_DOCUMENT          multimodal document extraction (Gemini via Vertex)
--
-- Additive and data-only: this migration INSERTs new rows into ai_model_config
-- (the GLOBAL router catalog from V8, no RLS) and touches nothing else. It does
-- NOT alter structure, RLS, or ai_usage_event.
--
-- Every relevant column is populated so the router resolver's fail-fast holds:
-- because thinking_supported = true, thinking_budget_tokens MUST be present
-- (the resolver rejects a thinking-capable route without a budget). Values match
-- the STANDARD slot seeded in V21/V22 (thinking_level MEDIUM, max_output_tokens
-- 2048, thinking_budget_tokens 2048) and the real validated model gemini-3.8-flash
-- (V21). Config, not code: ops can retune these per (task, priority) with no
-- redeploy (the router reads this table at request time).
--
-- Idempotent against a re-seed via the unique(task, priority) constraint
-- (uq_model_task_priority): ON CONFLICT (task, priority) DO NOTHING leaves any
-- existing route untouched, so this is safe on both a clean DB and a re-run.

INSERT INTO ai_model_config (
    id, provider, model, task, priority, cost_class, enabled,
    thinking_level, max_output_tokens, thinking_supported, thinking_budget_tokens
)
VALUES
  ('00000000-0000-0000-0000-0000000003c1', 'vertex-ai', 'gemini-3.8-flash',
   'TRANSPORT_SIMULATION', 'STANDARD', 'medium', true,
   'MEDIUM', 2048, true, 2048),
  ('00000000-0000-0000-0000-0000000003c2', 'vertex-ai', 'gemini-3.8-flash',
   'EXPORT_NL_CREATION', 'STANDARD', 'medium', true,
   'MEDIUM', 2048, true, 2048),
  ('00000000-0000-0000-0000-0000000003c3', 'vertex-ai', 'gemini-3.8-flash',
   'OCR_DOCUMENT', 'STANDARD', 'medium', true,
   'MEDIUM', 2048, true, 2048)
ON CONFLICT (task, priority) DO NOTHING;
