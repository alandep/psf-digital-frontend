-- V29__certificacao_rich_fields.sql
-- Additive: enrich certifications for the production certification screen.
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS product_id            text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS product_name          text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS categoria             text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS descricao             text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS pais_emissor          text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS pais_destino          text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS assinatura_digital    boolean NOT NULL DEFAULT false;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS compliance_status     text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS export_id             text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS due_number            text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS ai_generated          boolean NOT NULL DEFAULT false;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS ai_confidence_score   numeric(6,4);
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS ai_risk_score         numeric(6,4);
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS ai_risk_level         text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS created_by            text;
ALTER TABLE certificacao ADD COLUMN IF NOT EXISTS updated_at            timestamptz;
