-- V1__platform.sql
-- Platform / infrastructure tables. NO Row Level Security here.
-- These tables are keyed by organization_id but are managed directly by the
-- application/worker (idempotency, transactional outbox, inbox dedup) and are
-- accessed outside of a tenant transaction context. Tenant isolation for these
-- is enforced at the application layer.

CREATE TABLE idempotency_record (
    id              uuid PRIMARY KEY,
    organization_id uuid NOT NULL,
    idem_key        text NOT NULL,
    operation       text NOT NULL,
    request_hash    text NOT NULL,
    response_status int  NOT NULL,
    response_body   text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    expires_at      timestamptz NOT NULL,
    CONSTRAINT uq_idem UNIQUE (organization_id, operation, idem_key)
);

CREATE TABLE outbox_event (
    id              uuid PRIMARY KEY,
    aggregate_type  text NOT NULL,
    aggregate_id    text NOT NULL,
    organization_id uuid,
    event_type      text NOT NULL,
    payload         text NOT NULL,
    occurred_at     timestamptz NOT NULL DEFAULT now(),
    available_at    timestamptz NOT NULL DEFAULT now(),
    processed_at    timestamptz,
    attempts        int  NOT NULL DEFAULT 0,
    last_error      text
);

-- Supports the worker poll: fetch unprocessed events that are due.
CREATE INDEX idx_outbox_event_poll ON outbox_event (processed_at, available_at);

CREATE TABLE inbox_event (
    id                uuid PRIMARY KEY,
    source            text NOT NULL,
    external_event_id text NOT NULL,
    payload_hash      text,
    status            text NOT NULL,
    received_at       timestamptz NOT NULL DEFAULT now(),
    processed_at      timestamptz,
    CONSTRAINT uq_inbox UNIQUE (source, external_event_id)
);
