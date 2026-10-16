/**
 * Reference module: global, read-only reference data shared by all tenants.
 * Follows a hexagonal architecture — an application layer of use cases, an
 * inbound BFF adapter and an outbound JPA persistence adapter. Unlike the
 * tenant-scoped business modules, this data is <em>not</em> scoped by
 * {@code organization_id} and carries no RLS policy; it is static lookup data
 * (e.g. the ISO 3166-1 country list) consumed by many screens.
 */
@ApplicationModule(displayName = "Reference")
package com.eip.modules.reference;

import org.springframework.modulith.ApplicationModule;
