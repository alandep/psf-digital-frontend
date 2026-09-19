/**
 * CRM module: manages marketing/sales leads and their conversion funnel,
 * CRM customers and sales opportunities along the pipeline. Follows a
 * hexagonal architecture — a pure domain core, an application layer of use
 * cases, inbound BFF adapters and outbound JPA persistence adapters. Money is
 * modelled with {@link java.math.BigDecimal}, dates with
 * {@link java.time.LocalDate} and timestamps with
 * {@link java.time.OffsetDateTime}. Tenant-scoped by {@code organization_id}
 * and emitting domain events through the transactional outbox.
 */
@ApplicationModule(displayName = "Crm")
package com.eip.modules.crm;

import org.springframework.modulith.ApplicationModule;
