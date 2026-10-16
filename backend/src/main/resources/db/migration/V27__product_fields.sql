-- V27__product_fields.sql
-- Additive: enrich product for reuse in the export item selector (combo).
ALTER TABLE product ADD COLUMN IF NOT EXISTS name           text;
ALTER TABLE product ADD COLUMN IF NOT EXISTS unit           text;
ALTER TABLE product ADD COLUMN IF NOT EXISTS standard_price numeric(18,2);
ALTER TABLE product ADD COLUMN IF NOT EXISTS currency       text;
ALTER TABLE product ADD COLUMN IF NOT EXISTS origin_country text;
