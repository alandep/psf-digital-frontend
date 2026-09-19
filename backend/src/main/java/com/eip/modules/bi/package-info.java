/**
 * BI module: manages per-tenant dashboards (with their widgets) and saved
 * data-explorer queries. Follows a hexagonal architecture — a pure domain core,
 * an application layer of use cases, inbound BFF adapters and outbound JPA
 * persistence adapters. Dashboard layout is persisted as JSON serialized to
 * text; timestamps use {@link java.time.OffsetDateTime}. Tenant-scoped by
 * {@code organization_id} and emitting domain events through the transactional
 * outbox.
 */
@ApplicationModule(displayName = "Bi")
package com.eip.modules.bi;

import org.springframework.modulith.ApplicationModule;
