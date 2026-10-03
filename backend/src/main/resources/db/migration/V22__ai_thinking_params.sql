-- V22__ai_thinking_params.sql
-- Promote AI "thinking" to a first-class, config-driven provider parameter in the
-- GLOBAL router catalog (ai_model_config, V8). Additive, data-only columns:
--
--   thinking_budget_tokens  the provider THINKING BUDGET in tokens (the TECHNICAL
--                           Gemini thinkingConfig.thinkingBudget value). This is
--                           semantically DISTINCT from max_output_tokens (the
--                           output cap) and must NOT be conflated with it.
--   thinking_supported      whether the model supports thinking at all; when
--                           false the adapter MUST skip thinkingConfig entirely
--                           (compatibility with models without a thinking budget).
--
-- These versioned values REPLACE the former hardcoded Java constants in the
-- Vertex adapter (FAST=512 / STANDARD=2048 / DEEP=8192), mirroring the
-- thinking_level LOW/MEDIUM/HIGH set per priority in V21. Config, not code:
-- tuning the budget here needs no redeploy (the router reads this table at
-- request time).
--
-- ai_model_config is a GLOBAL catalog (no RLS). This migration runs after V21
-- (which seeds the rows): the columns are additive and the UPDATEs are
-- idempotent-friendly / clean-DB safe.

-- Additive columns.
ALTER TABLE ai_model_config
    ADD COLUMN thinking_budget_tokens integer;

ALTER TABLE ai_model_config
    ADD COLUMN thinking_supported boolean NOT NULL DEFAULT true;

-- Per-slot thinking budget derived from priority, mirroring V21's thinking_level.
-- These versioned values replace the Java constants (512 / 2048 / 8192).
UPDATE ai_model_config SET thinking_budget_tokens = 512  WHERE priority = 'FAST';
UPDATE ai_model_config SET thinking_budget_tokens = 2048 WHERE priority = 'STANDARD';
UPDATE ai_model_config SET thinking_budget_tokens = 8192 WHERE priority = 'DEEP';

-- gemini-3.8-flash supports thinking, so the seeded rows keep the default
-- thinking_supported = true (no explicit UPDATE needed).
