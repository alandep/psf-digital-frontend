-- V17__reporting_role.sql
-- Least-privilege REPORTING role for cross-tenant Super Admin analytics.
--
-- WHY THIS EXISTS
-- The application connects as a NON-superuser, NON-BYPASSRLS role (eip_app, see
-- V4/PostgresIT) whose reads are always RLS-scoped to the request's ACTIVE org.
-- That is correct for tenant traffic, but the Super Admin SaaS metrics / tenants
-- / unit-economics / funnel screens must aggregate ACROSS ALL tenants. Rather
-- than weaken RLS, we introduce a dedicated read-only role that is allowed to
-- see every tenant's rows for aggregation only.
--
-- ISOLATION MODEL
-- eip_report has BYPASSRLS so aggregate queries see all tenants, but it is
-- GRANTed only SELECT on the specific reporting tables below. It has no write
-- privilege and is never used for tenant-scoped writes. The application's main
-- role (eip_app) remains fully RLS-enforced.
--
-- PRODUCTION NOTE
-- In managed Postgres (e.g. Cloud SQL) the BYPASSRLS attribute may require
-- elevated privileges to set. In production the role name/password come from
-- Secret Manager and the role creation + grants are performed by a database
-- admin (not by the app's Flyway user). For local/dev the docker-compose
-- superuser runs Flyway, so this migration provisions the role directly.

-- Create the reporting role idempotently.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'eip_report') THEN
        CREATE ROLE eip_report LOGIN PASSWORD 'eip_report' NOSUPERUSER BYPASSRLS;
    END IF;
END $$;

-- Schema access + read-only grants on ONLY the tables Super Admin aggregates.
GRANT USAGE ON SCHEMA public TO eip_report;
GRANT SELECT ON subscription, organization, ai_usage_event, product_event, lead
    TO eip_report;

-- NOTE: ALTER DEFAULT PRIVILEGES is intentionally NOT used here. Grants are
-- explicit and table-scoped. Any NEW reporting table introduced later must be
-- GRANTed SELECT to eip_report explicitly in its own migration.
