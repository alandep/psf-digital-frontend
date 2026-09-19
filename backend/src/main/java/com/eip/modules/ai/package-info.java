/**
 * AI Hub module: routes AI/OCR operations to configured models, meters usage
 * into the {@code ai_usage_event} ledger and enqueues heavy work as
 * {@code ai_job}s. Follows a hexagonal architecture — a pure domain core, an
 * application layer of use cases, an inbound BFF adapter, an outbound provider
 * (gateway) adapter and outbound JPA persistence adapters. Tenant-scoped by
 * {@code organization_id} with RLS, emitting domain events through the
 * transactional outbox.
 *
 * <p>Before running an operation the module checks the tenant's AI franquia.
 * To keep modules decoupled (and Modulith {@code verify()} green) it does NOT
 * import the Subscription module: it owns a small read-only entity mapped at
 * the shared {@code subscription_usage} table (a read model over a shared
 * table in this monolith). Extraction to a real cross-module API/event can
 * come later without touching the AI application/domain code.
 *
 * <p>Depends only on the shared platform (tenant, outbox, security, error).
 */
@ApplicationModule(displayName = "AiHub")
package com.eip.modules.ai;

import org.springframework.modulith.ApplicationModule;
