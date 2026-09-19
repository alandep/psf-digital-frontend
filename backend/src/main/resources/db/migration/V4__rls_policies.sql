-- V4__rls_policies.sql
-- Row Level Security for tenant-scoped tables.
--
-- ISOLATION MODEL
-- The application connects as a NON-superuser role that does NOT have the
-- BYPASSRLS attribute, so these policies are always enforced (FORCE RLS also
-- enforces them for the table owner). Tenant context is TRANSACTION-LOCAL:
-- at the start of each request transaction the app runs
--     SELECT set_config('app.current_organization', '<org-uuid>', true);
-- The `true` third argument scopes the setting to the current transaction, so
-- it never leaks across pooled connections.
--
-- Each policy reads that setting with current_setting('app.current_organization', true).
-- The `true` (missing_ok) argument makes it return NULL instead of erroring
-- when the setting is absent. NULLIF(..., '') maps an empty/unset value to NULL
-- so the comparison yields no rows (fail-closed) when no org context is set.
--
-- USING       -> gates which rows are visible to reads (SELECT/UPDATE/DELETE).
-- WITH CHECK  -> gates INSERT/UPDATE so a row can never be written with an
--                organization_id belonging to a different (foreign) tenant.
--
-- Identity tables (organization, legal_entity, app_user, user_credential,
-- organization_membership, mfa_*, password_reset, security_event) are
-- deliberately NOT under RLS: they are read before an org context exists
-- (login, MFA, org selection). They are guarded at the application layer and
-- may receive their own row-security strategy later.

ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE product FORCE ROW LEVEL SECURITY;
CREATE POLICY product_isolation ON product
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer FORCE ROW LEVEL SECURITY;
CREATE POLICY customer_isolation ON customer
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE export ENABLE ROW LEVEL SECURITY;
ALTER TABLE export FORCE ROW LEVEL SECURITY;
CREATE POLICY export_isolation ON export
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);

ALTER TABLE export_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_item FORCE ROW LEVEL SECURITY;
CREATE POLICY export_item_isolation ON export_item
  USING (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_organization', true), '')::uuid);
