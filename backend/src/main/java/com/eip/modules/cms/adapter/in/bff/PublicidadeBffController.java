package com.eip.modules.cms.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.cms.domain.port.in.GerenciarPublicidadeUseCase;
import com.eip.modules.cms.domain.port.in.GerenciarPublicidadeUseCase.AdMetrics;
import com.eip.modules.cms.domain.port.in.GerenciarPublicidadeUseCase.AdvertiserView;
import com.eip.modules.cms.domain.port.in.GerenciarPublicidadeUseCase.CampaignView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Admin BFF endpoints backing the advertising screens (super-admin).
 */
@RestController
@RequestMapping("/bff/cms/publicidade")
@RequiredArgsConstructor
public class PublicidadeBffController {

    private final GerenciarPublicidadeUseCase useCase;

    @GetMapping("/anunciantes")
    @PreAuthorize("@rbac.can('super-admin/publicidade','view')")
    public List<AdvertiserView> anunciantes() {
        return useCase.anunciantes();
    }

    @GetMapping("/campanhas")
    @PreAuthorize("@rbac.can('super-admin/publicidade','view')")
    public List<CampaignView> campanhas(@RequestParam(required = false) String status) {
        return useCase.campanhas(status);
    }

    @GetMapping("/metricas")
    @PreAuthorize("@rbac.can('super-admin/publicidade','view')")
    public AdMetrics metricas() {
        return useCase.metricasResumo();
    }

    @PostMapping("/anunciantes")
    @PreAuthorize("@rbac.can('super-admin/publicidade','create')")
    public AdvertiserView criarAnunciante(@Valid @RequestBody CriarAnuncianteRequest request) {
        return useCase.criarAnunciante(request.toCommand());
    }

    @PostMapping("/campanhas")
    @PreAuthorize("@rbac.can('super-admin/publicidade','create')")
    public CampaignView criarCampanha(@Valid @RequestBody CriarCampanhaRequest request) {
        return useCase.criarCampanha(request.toCommand());
    }

    @PostMapping("/campanhas/{id}/ativar")
    @PreAuthorize("@rbac.can('super-admin/publicidade','edit')")
    public CampaignView ativar(@PathVariable UUID id) {
        return useCase.ativar(id);
    }

    @PostMapping("/campanhas/{id}/pausar")
    @PreAuthorize("@rbac.can('super-admin/publicidade','edit')")
    public CampaignView pausar(@PathVariable UUID id) {
        return useCase.pausar(id);
    }

    @PostMapping("/campanhas/{id}/encerrar")
    @PreAuthorize("@rbac.can('super-admin/publicidade','edit')")
    public CampaignView encerrar(@PathVariable UUID id) {
        return useCase.encerrar(id);
    }
}
