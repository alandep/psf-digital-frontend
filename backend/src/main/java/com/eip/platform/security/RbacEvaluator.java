package com.eip.platform.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Permission evaluator exposed to SpEL as {@code @rbac}, e.g.
 * {@code @PreAuthorize("@rbac.can('orders', 'create')")}.
 *
 * <p><strong>First implementation (mock-permissive):</strong> any authenticated
 * principal is granted every screen/action, matching the current front-end mock
 * profile (ADMIN full access). The signature and lookup shape are intentionally
 * stable so the internals can later consult a real permission store.
 */
@Component("rbac")
public class RbacEvaluator {

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
        // TODO: replace with a real lookup against the persisted role/permission
        //       matrix scoped to the current organization (screenId + action).
        return authenticated;
    }
}
