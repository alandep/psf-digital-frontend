/**
 * Organization module: manages organizations (tenants) and user memberships.
 * Exposes read-side queries used by the Identity module to resolve which
 * organizations an authenticated user may operate under. Follows hexagonal
 * architecture — pure domain, application use cases and an outbound JPA
 * persistence adapter.
 */
@ApplicationModule(displayName = "Organization")
package com.eip.modules.organization;

import org.springframework.modulith.ApplicationModule;
