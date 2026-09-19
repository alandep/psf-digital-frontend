/**
 * Shared platform kernel (cross-cutting).
 *
 * <p>Declared as the shared Spring Modulith module in the application bootstrap
 * ({@code @Modulithic(sharedModules = "platform")}). It holds only cross-cutting
 * building blocks reusable by every business module — tenant/RLS context, error
 * handling, observability, idempotency, transactional outbox/inbox and security
 * — and must contain no business logic.
 */
package com.eip.platform;
