-- V32__plan_entitlements.sql
-- Plan-based entitlements: maps each plan to the modules/features it enables
-- and their numeric limits. plan_feature is a GLOBAL editable catalog (no RLS);
-- organization_entitlement is the tenant-scoped (RLS) snapshot applied to an org
-- when its plan is chosen. Enforcement reads organization_entitlement for the
-- current org and FAILS OPEN when absent (existing tenants are never locked out).

CREATE TABLE IF NOT EXISTS plan_feature (
    plan_code    text NOT NULL REFERENCES plan(code),
    feature_key  text NOT NULL,
    enabled      boolean NOT NULL DEFAULT true,
    limit_value  numeric(18,2),
    PRIMARY KEY (plan_code, feature_key)
);

CREATE TABLE IF NOT EXISTS organization_entitlement (
    organization_id uuid NOT NULL,
    feature_key     text NOT NULL,
    enabled         boolean NOT NULL DEFAULT true,
    limit_value     numeric(18,2),
    applied_plan    text,
    updated_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (organization_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_org_entitlement_org ON organization_entitlement (organization_id);

ALTER TABLE organization_entitlement ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_entitlement FORCE ROW LEVEL SECURITY;
CREATE POLICY organization_entitlement_isolation ON organization_entitlement
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

INSERT INTO plan_feature (plan_code, feature_key, enabled, limit_value) VALUES
('START','mod.export',true,NULL),
('START','mod.ncm',true,NULL),
('START','mod.documents',true,NULL),
('START','mod.compliance',false,NULL),
('START','mod.logistics',false,NULL),
('START','mod.finance',false,NULL),
('START','mod.crm',false,NULL),
('START','mod.intelligence',false,NULL),
('START','mod.api',false,NULL),
('START','limit.users',true,3),
('START','limit.ai_credits',true,500),
('START','limit.ocr_pages',true,200),
('START','limit.storage_gb',true,5),
('BUSINESS','mod.export',true,NULL),
('BUSINESS','mod.ncm',true,NULL),
('BUSINESS','mod.documents',true,NULL),
('BUSINESS','mod.compliance',true,NULL),
('BUSINESS','mod.logistics',true,NULL),
('BUSINESS','mod.finance',false,NULL),
('BUSINESS','mod.crm',false,NULL),
('BUSINESS','mod.intelligence',false,NULL),
('BUSINESS','mod.api',false,NULL),
('BUSINESS','limit.users',true,15),
('BUSINESS','limit.ai_credits',true,5000),
('BUSINESS','limit.ocr_pages',true,2000),
('BUSINESS','limit.storage_gb',true,100),
('PRO','mod.export',true,NULL),
('PRO','mod.ncm',true,NULL),
('PRO','mod.documents',true,NULL),
('PRO','mod.compliance',true,NULL),
('PRO','mod.logistics',true,NULL),
('PRO','mod.finance',true,NULL),
('PRO','mod.crm',true,NULL),
('PRO','mod.intelligence',true,NULL),
('PRO','mod.api',true,NULL),
('PRO','limit.users',true,50),
('PRO','limit.ai_credits',true,20000),
('PRO','limit.ocr_pages',true,10000),
('PRO','limit.storage_gb',true,500),
('ENTERPRISE','mod.export',true,NULL),
('ENTERPRISE','mod.ncm',true,NULL),
('ENTERPRISE','mod.documents',true,NULL),
('ENTERPRISE','mod.compliance',true,NULL),
('ENTERPRISE','mod.logistics',true,NULL),
('ENTERPRISE','mod.finance',true,NULL),
('ENTERPRISE','mod.crm',true,NULL),
('ENTERPRISE','mod.intelligence',true,NULL),
('ENTERPRISE','mod.api',true,NULL),
('ENTERPRISE','limit.users',true,NULL),
('ENTERPRISE','limit.ai_credits',true,NULL),
('ENTERPRISE','limit.ocr_pages',true,NULL),
('ENTERPRISE','limit.storage_gb',true,NULL)
ON CONFLICT (plan_code, feature_key) DO NOTHING;
