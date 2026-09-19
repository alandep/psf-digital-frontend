/**
 * Intelligence module: curated market-intelligence content plus per-tenant
 * watchlists and alerts. Follows a hexagonal architecture — a pure domain core,
 * an application layer of use cases, inbound BFF adapters and outbound JPA
 * persistence adapters.
 *
 * <p>Curated content ({@code intelligence_item}) is GLOBAL (not tenant-scoped,
 * no RLS) and its public feed is reachable without authentication. Watchlist
 * ({@code watchlist_item}) and alerts ({@code intelligence_alert}) are
 * tenant-scoped by {@code organization_id} under RLS. Timestamps use
 * {@link java.time.OffsetDateTime}.
 */
@ApplicationModule(displayName = "Intelligence")
package com.eip.modules.intelligence;

import org.springframework.modulith.ApplicationModule;
