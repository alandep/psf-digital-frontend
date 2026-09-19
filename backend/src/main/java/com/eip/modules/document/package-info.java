/**
 * Documents module: manages document metadata (invoice, packing list, bill of
 * lading, certificates, contracts), two-phase async upload via signed storage
 * URLs, signed downloads, and async processing jobs. Follows a hexagonal
 * architecture — a pure domain core, an application layer of use cases, an
 * inbound BFF adapter, and outbound adapters for JPA persistence and object
 * storage. Tenant-scoped by {@code organization_id} and emitting domain events
 * through the transactional outbox. Depends only on shared platform code.
 */
@ApplicationModule(displayName = "Documents")
package com.eip.modules.document;

import org.springframework.modulith.ApplicationModule;
