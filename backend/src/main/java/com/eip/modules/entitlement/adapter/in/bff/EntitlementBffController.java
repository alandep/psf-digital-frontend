package com.eip.modules.entitlement.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.entitlement.domain.port.in.ConsultarEntitlementsUseCase;
import com.eip.modules.entitlement.domain.port.in.ConsultarEntitlementsUseCase.EntitlementView;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoint exposing the entitlements applied to the CURRENT organization so
 * the frontend can parameterize the UI (show/hide modules, display limits).
 * Reads are naturally tenant-scoped by RLS + the request's org context.
 */
@RestController
@RequestMapping("/bff/entitlements")
@RequiredArgsConstructor
public class EntitlementBffController {

    private final ConsultarEntitlementsUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('entitlements', 'view')")
    public List<EntitlementView> current() {
        OrganizationContext ctx = OrganizationContextHolder.currentOrNull();
        if (ctx == null) {
            return List.of();
        }
        return useCase.listar(ctx.organizationId().value());
    }
}