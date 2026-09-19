/**
 * Finance module: manages payments (receivables/payables), FX contracts and
 * hedge contracts. Follows a hexagonal architecture — a pure domain core, an
 * application layer of use cases, inbound BFF adapters and outbound JPA
 * persistence adapters. Money is modelled with {@link java.math.BigDecimal},
 * FX rates with {@link java.math.BigDecimal}, dates with
 * {@link java.time.LocalDate} and timestamps with
 * {@link java.time.OffsetDateTime}. Tenant-scoped by {@code organization_id}
 * and emitting domain events through the transactional outbox.
 */
@ApplicationModule(displayName = "Finance")
package com.eip.modules.finance;

import org.springframework.modulith.ApplicationModule;
