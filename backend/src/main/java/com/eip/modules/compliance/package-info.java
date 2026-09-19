/**
 * Compliance module: manages sanctions/PEP screening, certifications, licenses,
 * ESG assessments and an append-only audit trail. Follows a hexagonal
 * architecture — a pure domain core, an application layer of use cases, inbound
 * BFF adapters and outbound JPA persistence adapters. Dates are modelled with
 * {@link java.time.LocalDate}, timestamps with {@link java.time.OffsetDateTime}
 * and ESG scores with {@link java.math.BigDecimal}. Tenant-scoped by
 * {@code organization_id} and emitting domain events through the transactional
 * outbox.
 */
@ApplicationModule(displayName = "Compliance")
package com.eip.modules.compliance;

import org.springframework.modulith.ApplicationModule;
