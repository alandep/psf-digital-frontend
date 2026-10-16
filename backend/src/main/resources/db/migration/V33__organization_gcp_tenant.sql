-- V33__organization_gcp_tenant.sql
-- Adds the GCP Identity Platform tenantId to the organization. Nullable: it is
-- populated asynchronously on empresa creation (real value in the cloud profile,
-- a deterministic mock value in local/dev). The DB organization.id UUID + RLS
-- remains the authoritative tenant isolation key; gcp_tenant_id is the external
-- identity-platform correlation handle.
ALTER TABLE organization ADD COLUMN IF NOT EXISTS gcp_tenant_id text;
CREATE INDEX IF NOT EXISTS idx_organization_gcp_tenant ON organization (gcp_tenant_id);