/**
 * Export module: manages export drafts, their line items and confirmation
 * lifecycle. Follows a hexagonal architecture — a pure domain core, an
 * application layer of use cases, inbound adapters (BFF + public API) and an
 * outbound JPA persistence adapter. Tenant-scoped by {@code organization_id}
 * and emitting domain events through the transactional outbox.
 */
@ApplicationModule(displayName = "Export")
package com.eip.modules.export;

import org.springframework.modulith.ApplicationModule;
