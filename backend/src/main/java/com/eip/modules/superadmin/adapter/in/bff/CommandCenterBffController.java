package com.eip.modules.superadmin.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.superadmin.domain.model.FunnelStage;
import com.eip.modules.superadmin.domain.model.SaasMetrics;
import com.eip.modules.superadmin.domain.model.TenantSummary;
import com.eip.modules.superadmin.domain.model.UnitEconomics;
import com.eip.modules.superadmin.domain.port.in.ConsultarMetricasUseCase;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the Super Admin command center (SaaS metrics, tenants,
 * commercial funnel and unit economics). All read-only.
 */
@RestController
@RequestMapping("/bff/super-admin/saas")
@RequiredArgsConstructor
public class CommandCenterBffController {

    private final ConsultarMetricasUseCase useCase;

    @GetMapping("/metricas")
    @PreAuthorize("@rbac.can('super-admin/saas','view')")
    public SaasMetrics metricas() {
        return useCase.metricas();
    }

    @GetMapping("/tenants")
    @PreAuthorize("@rbac.can('super-admin/saas','view')")
    public List<TenantSummary> tenants() {
        return useCase.tenants();
    }

    @GetMapping("/funil")
    @PreAuthorize("@rbac.can('super-admin/saas','view')")
    public List<FunnelStage> funil() {
        return useCase.funil();
    }

    @GetMapping("/unit-economics")
    @PreAuthorize("@rbac.can('super-admin/saas','view')")
    public List<UnitEconomics> unitEconomics() {
        return useCase.unitEconomics();
    }
}
