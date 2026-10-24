-- V36__user_management.sql
-- Fields backing the admin "Gestao de Usuarios" screen.
--  * app_user.login_count: lifetime successful-login counter (shown in the grid).
--  * organization_membership.department / mfa_enabled: per-org profile fields
--    managed by the tenant admin when inviting/editing users. department and
--    mfa are per-membership because a user may belong to more than one org.
-- Identity tables are not RLS-scoped (read before org context exists).
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0;
ALTER TABLE organization_membership ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE organization_membership ADD COLUMN IF NOT EXISTS mfa_enabled boolean NOT NULL DEFAULT false;
