-- V18__event_publication.sql
-- Spring Modulith event publication registry table (spring-modulith-starter-jpa).
-- Required because spring.jpa.hibernate.ddl-auto=validate validates the mapping
-- for the ManagedType 'event_publication' shipped by Spring Modulith's JPA
-- EventPublication entity. Without this table the SessionFactory fails to build.
-- Schema matches Spring Modulith 1.3.x for PostgreSQL.
--
-- NOTE: EIP uses its OWN transactional outbox (outbox_event) for domain event
-- reliability; this table exists only to satisfy the Modulith JPA starter that
-- is on the classpath. It is a platform/infra table (no RLS, no organization_id).

CREATE TABLE IF NOT EXISTS event_publication (
    id               uuid NOT NULL,
    listener_id      text NOT NULL,
    event_type       text NOT NULL,
    serialized_event text NOT NULL,
    publication_date timestamp with time zone NOT NULL,
    completion_date  timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS event_publication_serialized_event_hash_idx
    ON event_publication USING hash (serialized_event);

CREATE INDEX IF NOT EXISTS event_publication_by_completion_date_idx
    ON event_publication (completion_date);
