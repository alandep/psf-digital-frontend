/**
 * Logistics module: manages shipments (embarques), their containers and status
 * lifecycle, plus the tenant-scoped registries of ports, carriers and vessels.
 * Follows a hexagonal architecture — a pure domain core, an application layer of
 * use cases, inbound BFF adapters and an outbound JPA persistence adapter.
 * Tenant-scoped by {@code organization_id} and emitting domain events through
 * the transactional outbox.
 */
@ApplicationModule(displayName = "Logistics")
package com.eip.modules.logistics;

import org.springframework.modulith.ApplicationModule;
