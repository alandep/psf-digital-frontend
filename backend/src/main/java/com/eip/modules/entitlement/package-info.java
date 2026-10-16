/**
 * Entitlement module: plan-based feature/limit entitlements. The GLOBAL
 * {@code plan_feature} catalog maps each plan to the modules it enables and
 * their numeric limits; {@code organization_entitlement} is the tenant-scoped
 * snapshot applied to an organization when its plan is chosen. Enforcement
 * reads the org snapshot and FAILS OPEN when absent so existing tenants are
 * never locked out. Hexagonal: application services, inbound BFF adapter and
 * outbound JPA adapters.
 */
@ApplicationModule(displayName = "Entitlement")
package com.eip.modules.entitlement;

import org.springframework.modulith.ApplicationModule;