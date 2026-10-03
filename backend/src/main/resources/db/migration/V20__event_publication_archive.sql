-- V20__event_publication_archive.sql
-- Spring Modulith's completed/archived event publications table
-- (spring-modulith-starter-jpa). Sibling of event_publication (V18): Modulith
-- 1.3.x maps a second JPA entity for archived publications, so with
-- spring.jpa.hibernate.ddl-auto=validate the SessionFactory requires this table
-- too. V18 created event_publication but not this archive sibling, which made the
-- cloud profile fail schema validation. Schema matches Spring Modulith 1.3.x for
-- PostgreSQL (identical columns to event_publication).
--
-- NOTE: EIP uses its OWN transactional outbox (outbox_event) for domain event
-- reliability; this table exists only to satisfy the Modulith JPA starter on the
-- classpath. Platform/infra table (no RLS, no organization_id).

CREATE TABLE IF NOT EXISTS event_publication_archive (
    id               uuid NOT NULL,
    listener_id      text NOT NULL,
    event_type       text NOT NULL,
    serialized_event text NOT NULL,
    publication_date timestamp with time zone NOT NULL,
    completion_date  timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS event_publication_archive_serialized_event_hash_idx
    ON event_publication_archive USING hash (serialized_event);

CREATE INDEX IF NOT EXISTS event_publication_archive_by_completion_date_idx
    ON event_publication_archive (completion_date);
