-- V21__ai_model_catalog_real.sql
-- Point the global AI model router catalog (ai_model_config, V8) at the real,
-- validated Vertex model and set per-slot thinking defaults. Replaces a manual
-- UPDATE run during cloud validation so a CLEAN database reproduces the same
-- routing without hand edits. Config, not code: changing the model/thinking here
-- needs no redeploy (the router reads this table at request time).
--
-- ai_model_config is a GLOBAL catalog (no RLS); this migration only updates data,
-- preserving the unique(task, priority) and enabled flags from V8.

-- Real model id for every enabled vertex-ai route (validated: gemini-3.8-flash).
UPDATE ai_model_config
   SET model = 'gemini-3.8-flash'
 WHERE provider = 'vertex-ai';

-- Per-slot thinking defaults derived from priority (FAST->LOW, STANDARD->MEDIUM,
-- DEEP->HIGH) plus a sensible max output budget. These columns (V19) let ops tune
-- thinking/output per (task, priority) without a code change; the adapter reads
-- them instead of hardcoding LOW/MEDIUM/HIGH.
UPDATE ai_model_config SET thinking_level = 'LOW',    max_output_tokens = 1024 WHERE priority = 'FAST';
UPDATE ai_model_config SET thinking_level = 'MEDIUM', max_output_tokens = 2048 WHERE priority = 'STANDARD';
UPDATE ai_model_config SET thinking_level = 'HIGH',   max_output_tokens = 4096 WHERE priority = 'DEEP';
