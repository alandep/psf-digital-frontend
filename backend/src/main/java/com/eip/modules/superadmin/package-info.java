/**
 * Super Admin module: read-side SaaS analytics powering the command center
 * (MRR/ARR/ARPA metrics, tenants list, commercial funnel and unit economics)
 * plus a tenant-scoped {@code product_event} ledger. Follows a hexagonal
 * architecture — a pure domain core, an application layer of use cases, an
 * inbound BFF adapter and outbound JPA persistence adapters.
 *
 * <p>To keep modules decoupled (and Modulith {@code verify()} green) this
 * module does NOT import the Subscription, CRM or AI modules. Instead it owns
 * small read-only entities mapped at the shared {@code subscription},
 * {@code organization} and {@code ai_usage_event} tables — a read model over a
 * shared table in this monolith (the same approach the AI module uses for
 * {@code subscription_usage}). A production system would consume published
 * cross-module APIs/events rather than reading the tables directly; extraction
 * can happen later without touching this module's application/domain code.
 *
 * <p><b>RLS caveat:</b> the aggregated SaaS metrics, tenants and unit economics
 * are cross-tenant, but {@code subscription}, {@code ai_usage_event} and
 * {@code product_event} are RLS-protected per tenant. Under the current
 * request-scoped org context these reads only see the active org until a
 * privileged reporting role / separate read model is introduced.
 *
 * <p>Depends only on the shared platform (tenant, outbox, security, error).
 */
@ApplicationModule(displayName = "SuperAdmin")
package com.eip.modules.superadmin;

import org.springframework.modulith.ApplicationModule;
