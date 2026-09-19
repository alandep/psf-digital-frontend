-- V3__export.sql
-- Export domain. All tables here are tenant-scoped and become RLS-protected
-- in V4. Every table carries organization_id for transaction-local isolation.

CREATE TABLE product (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    ncm             text,
    description     text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_org ON product (organization_id);

CREATE TABLE customer (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    name            text NOT NULL,
    country         text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_org ON customer (organization_id);

CREATE TABLE export (
    id                  uuid PRIMARY KEY,
    organization_id     uuid NOT NULL,
    legal_entity_id     uuid,
    customer_id         uuid REFERENCES customer(id),
    reference           text,
    status              text NOT NULL DEFAULT 'RASCUNHO',
    destination_country text,
    incoterm            text,
    total_amount        numeric(18,2),
    currency            text DEFAULT 'USD',
    version             bigint NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_export_org_status   ON export (organization_id, status);
CREATE INDEX idx_export_org_created  ON export (organization_id, created_at DESC);
CREATE INDEX idx_export_org_customer ON export (organization_id, customer_id);

CREATE TABLE export_item (
    id              uuid PRIMARY KEY,
    export_id       uuid NOT NULL REFERENCES export(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL,
    product_id      uuid,
    description     text,
    quantity        numeric(18,3),
    unit_price      numeric(18,2)
);

CREATE INDEX idx_export_item_export ON export_item (export_id);
