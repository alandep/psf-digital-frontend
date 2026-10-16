-- V25__export_cost_and_shipment.sql
-- Additive, idempotent evolution of the export header to feed the Dashboard
-- Principal KPIs that currently have no real source: profit/margin (needs cost)
-- and shipped/pending (needs a shipment flag). Mirrors the additive ALTER style
-- of V22; does NOT touch RLS policies (export is tenant-scoped and RLS-protected
-- since V4, so these columns inherit the same per-tenant isolation).
--
--   total_cost   the export's total COST at the header level (numeric(18,2)).
--                NULLABLE on purpose: pre-existing exports have no cost, and the
--                analytics layer treats absent cost as ZERO (COALESCE), so profit
--                collapses to revenue when cost is unknown.
--   shipped      whether the export has been shipped. NOT NULL DEFAULT false so
--                legacy exports count as PENDING in the shipped/pending partition.
--   shipped_at   when the export was marked shipped (timestamptz, nullable until
--                the shipment flag is set).
--
-- Indexes support the dashboard's pushdown aggregations (GROUP BY/SUM/COUNT),
-- scoped by organization_id (tenant): by destination country, by shipment flag,
-- and by product (join into export_item for the per-product series). All
-- statements use IF NOT EXISTS so re-applying on a partially migrated / clean
-- database is safe.

ALTER TABLE export ADD COLUMN IF NOT EXISTS total_cost numeric(18,2);
ALTER TABLE export ADD COLUMN IF NOT EXISTS shipped    boolean NOT NULL DEFAULT false;
ALTER TABLE export ADD COLUMN IF NOT EXISTS shipped_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_export_org_country ON export (organization_id, destination_country);
CREATE INDEX IF NOT EXISTS idx_export_org_shipped ON export (organization_id, shipped);
CREATE INDEX IF NOT EXISTS idx_export_item_product ON export_item (product_id);
