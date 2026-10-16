-- V28__ncm_classification.sql
-- Persisted NCM classifications (replaces the frontend mock). Tenant-scoped + RLS.
CREATE TABLE IF NOT EXISTS ncm_classification (
    id                      uuid PRIMARY KEY,
    organization_id         uuid NOT NULL,
    product_id              text,
    product_name            text NOT NULL,
    product_code            text,
    product_description     text,
    scientific_name         text,
    commodity_type          text,
    origin_country          text,
    ncm_code                text,
    ncm_description         text,
    hs_code                 text,
    hs_description          text,
    export_tax              numeric(6,2),
    export_license_required boolean NOT NULL DEFAULT false,
    export_license_type     text,
    lpco_required           boolean NOT NULL DEFAULT false,
    lpco_type               text,
    requires_inspection     boolean NOT NULL DEFAULT false,
    inspection_agency       text,
    export_restriction      boolean NOT NULL DEFAULT false,
    restriction_description text,
    ai_suggested_ncm        text,
    ai_confidence_score     numeric(6,2),
    ai_classification_reason text,
    ai_requires_human_review boolean NOT NULL DEFAULT false,
    ai_classification_status text,
    compliance_status       text,
    classification_source   text,
    approval_status         text NOT NULL DEFAULT 'PENDING',
    created_by              text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ncm_classification_org ON ncm_classification (organization_id);

ALTER TABLE ncm_classification ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncm_classification FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ncm_classification_isolation ON ncm_classification;
CREATE POLICY ncm_classification_isolation ON ncm_classification
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);
