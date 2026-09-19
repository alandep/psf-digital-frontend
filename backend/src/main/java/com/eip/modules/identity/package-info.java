/**
 * Identity module: owns users, credentials and the stepped authentication flow
 * (identify &rarr; password &rarr; MFA &rarr; organization selection). Establishes
 * the session-bound tenant context consumed by the rest of the platform. Follows
 * hexagonal architecture — pure domain, application use cases, inbound BFF
 * adapters and an outbound JPA persistence adapter.
 */
@ApplicationModule(
        displayName = "Identity",
        // Identity's AuthService/AuthBffController read the Organization module's
        // query API (OrganizationQueryService) to resolve memberships during the
        // login flow. That API is exposed via a named interface on the
        // Organization module (see its package-info). platform is shared and
        // therefore always allowed.
        allowedDependencies = {"organization :: query-api"})
package com.eip.modules.identity;

import org.springframework.modulith.ApplicationModule;
