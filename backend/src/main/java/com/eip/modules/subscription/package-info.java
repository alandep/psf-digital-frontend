/**
 * Subscription &amp; Billing module: manages an organization's plan,
 * subscription lifecycle, add-on packs and invoices, backed by the Asaas
 * payment gateway (public checkout, plan/payment changes, webhooks, invoice PDF).
 * Follows a hexagonal architecture — a pure domain core with ports
 * ({@code PaymentGatewayPort}, repositories), an application layer of use cases,
 * inbound adapters (BFF + webhook) and outbound adapters (JPA/JDBC, Asaas REST or
 * in-memory fake, OpenPDF). Tenant-scoped by {@code organization_id} with RLS,
 * emitting domain events through the transactional outbox. Depends on the shared
 * platform and on the admin module's public {@code TenantSignupApi}.
 */
@ApplicationModule(displayName = "Subscription")
package com.eip.modules.subscription;

import org.springframework.modulith.ApplicationModule;
