-- V34__legal_entity_profile.sql
-- Adds the empresa profile fields managed by the admin "Gestao de Empresas"
-- screen to legal_entity (type, location, contact). One legal entity per org
-- in the onboarding flow. legal_entity is an identity table (not RLS-scoped).
ALTER TABLE legal_entity ADD COLUMN IF NOT EXISTS tipo        text;
ALTER TABLE legal_entity ADD COLUMN IF NOT EXISTS pais        text;
ALTER TABLE legal_entity ADD COLUMN IF NOT EXISTS estado      text;
ALTER TABLE legal_entity ADD COLUMN IF NOT EXISTS cidade      text;
ALTER TABLE legal_entity ADD COLUMN IF NOT EXISTS responsavel text;
ALTER TABLE legal_entity ADD COLUMN IF NOT EXISTS email       text;
ALTER TABLE legal_entity ADD COLUMN IF NOT EXISTS telefone    text;
