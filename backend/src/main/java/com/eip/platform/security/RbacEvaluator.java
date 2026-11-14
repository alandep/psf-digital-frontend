package com.eip.platform.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

/**
 * Permission evaluator exposed to SpEL as {@code @rbac}, e.g.
 * {@code @PreAuthorize("@rbac.can('orders', 'create')")}.
 *
 * <p>Decisions are delegated to {@link AccessPolicyService}, which combines the
 * user's role, the organization's license mode and its plan entitlements.
 */
@Component("rbac")
public class RbacEvaluator {

    private static final Logger log = LoggerFactory.getLogger(RbacEvaluator.class);

    private final AccessPolicyService accessPolicy;

    public RbacEvaluator(AccessPolicyService accessPolicy) {
        this.accessPolicy = accessPolicy;
    }

    /**
     * @param screenId logical screen/resource id
     * @param action   action verb (e.g. {@code view}, {@code create}, {@code edit})
     * @return whether the current principal may perform {@code action} on {@code screenId}
     */
    public boolean can(String screenId, String action) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean authenticated = authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
        if (!authenticated) {
            log.debug("RBAC negado (nao autenticado): screen={} action={}", screenId, action);
            return false;
        }
        OrganizationContext ctx = OrganizationContextHolder.currentOrNull();
        if (ctx == null || ctx.userId() == null) {
            log.debug("RBAC negado (sem contexto): screen={} action={}", screenId, action);
            return false;
        }
        boolean allowed = AccessPolicyService.can(
                accessPolicy.resolve(ctx.userId(), ctx.organizationId().value()), screenId, action);
        if (!allowed) {
            log.debug("RBAC negado: screen={} action={}", screenId, action);
        }
        return allowed;
    }
}
