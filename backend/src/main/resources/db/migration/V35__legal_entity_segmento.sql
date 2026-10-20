-- V35__legal_entity_segmento.sql
-- Adds the business segment captured during the public "Experimentar Gratis"
-- signup flow (step 2) to legal_entity. Identity table (not RLS-scoped).
ALTER TABLE legal_entity ADD COLUMN IF NOT EXISTS segmento text;
