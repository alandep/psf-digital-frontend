-- V26__customer_fields_and_export_reference.sql
-- Additive: enrich customer (importador) for reuse, and add a per-org/per-year
-- sequence table to generate human-readable export references (EXP-YYYY-NNNN).

ALTER TABLE customer ADD COLUMN IF NOT EXISTS document text;
ALTER TABLE customer ADD COLUMN IF NOT EXISTS address  text;
ALTER TABLE customer ADD COLUMN IF NOT EXISTS contact  text;

-- Per-organization, per-year counter for export references. Row-locked on
-- increment (SELECT ... FOR UPDATE) to serialize concurrent allocations.
CREATE TABLE IF NOT EXISTS export_reference_sequence (
    organization_id uuid    NOT NULL,
    year            int     NOT NULL,
    last_value      bigint  NOT NULL DEFAULT 0,
    PRIMARY KEY (organization_id, year)
);

-- RLS consistent with the rest of the schema (tenant isolation).
ALTER TABLE export_reference_sequence ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_reference_sequence FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS export_reference_sequence_isolation ON export_reference_sequence;
CREATE POLICY export_reference_sequence_isolation ON export_reference_sequence
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

-- Unique reference per org (null allowed for legacy rows).
CREATE UNIQUE INDEX IF NOT EXISTS uq_export_org_reference ON export (organization_id, reference);
