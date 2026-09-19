/**
 * Subscription &amp; Billing module: manages an organization's plan,
 * subscription lifecycle, usage meters and invoices, and processes Stripe
 * billing webhooks. Follows a hexagonal architecture — a pure domain core, an
 * application layer of use cases, inbound adapters (BFF + webhook) and outbound
 * JPA persistence adapters. Tenant-scoped by {@code organization_id} with RLS,
 * emitting domain events through the transactional outbox. Depends only on the
 * shared platform (tenant, outbox, inbox, security, error).
 */
@ApplicationModule(displayName = "Subscription")
package com.eip.modules.subscription;

import org.springframework.modulith.ApplicationModule;
