package com.eip.platform.security;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.platform.security.AccessPolicyService.AccessSnapshot;
import com.eip.platform.security.AccessPolicyService.SubscriptionInfo;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

/**
 * Exposes the caller's effective access (role, license, modules, limits) so the
 * SPA can hide screens and disable actions. Authentication is enforced by the
 * BFF filter chain; no method-level authorization is applied on purpose.
 */
@RestController
@RequestMapping("/bff/acesso")
public class AccessBffController {

    private static final List<String> READ_ONLY_ROLES = List.of("VISUALIZADOR", "LEITOR");

    private final AccessPolicyService accessPolicy;

    public AccessBffController(AccessPolicyService accessPolicy) {
        this.accessPolicy = accessPolicy;
    }

    /** JSON view of the caller's access. */
    public record AccessResponse(UUID userId, UUID organizationId, String name, String email,
            String role, boolean superAdmin, String licenseMode, SubscriptionView subscription,
            Map<String, Boolean> modules, Map<String, BigDecimal> limits,
            Map<String, String> modulePrefixes, List<String> readOnlyRoles) {
    }

    /** JSON view of the subscription. */
    public record SubscriptionView(String status, String planCode, String planName,
            OffsetDateTime trialEndsAt, OffsetDateTime currentPeriodEnd,
            boolean gatewayLinked, boolean cancelAtPeriodEnd) {
    }

    /** @return the current user's access, or 401 when there is no user/organization context */
    @GetMapping("/me")
    public ResponseEntity<AccessResponse> me() {
        OrganizationContext ctx = OrganizationContextHolder.currentOrNull();
        if (ctx == null || ctx.userId() == null) {
            return ResponseEntity.status(401).build();
        }
        AccessSnapshot s = accessPolicy.resolve(ctx.userId(), ctx.organizationId().value());
        SubscriptionInfo sub = s.subscription();
        SubscriptionView subView = sub == null ? null : new SubscriptionView(
                sub.status(), sub.planCode(), sub.planName(), sub.trialEndsAt(),
                sub.currentPeriodEnd(), sub.gatewayLinked(), sub.cancelAtPeriodEnd());
        return ResponseEntity.ok(new AccessResponse(s.userId(), s.organizationId(), s.name(),
                s.email(), s.role(), s.superAdmin(), s.licenseMode().name(), subView,
                s.modules(), s.limits(), AccessPolicyService.MODULE_PREFIXES, READ_ONLY_ROLES));
    }
}
