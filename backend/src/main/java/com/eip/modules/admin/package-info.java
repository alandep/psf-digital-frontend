/**
 * Admin module: platform-level administration surfaces (the "Gestão de
 * Empresas" screen). Provisions and manages empresas/tenants.
 *
 * <p>Empresa == Organization + its LegalEntity. Creating an empresa provisions
 * the organization, its legal entity, a subscription on the chosen plan and the
 * entitlement snapshot for that plan, then (in the cloud profile) a GCP tenant.
 *
 * <p>This module is intentionally SELF-CONTAINED: to respect Spring Modulith's
 * strict boundaries it maps the tables it needs via its own JPA entities and
 * applies entitlements directly, rather than reaching into other modules'
 * internals. It depends only on {@code com.eip.platform} (shared, external to
 * the module base package and therefore always allowed).
 */
@ApplicationModule(displayName = "Admin")
package com.eip.modules.admin;

import org.springframework.modulith.ApplicationModule;