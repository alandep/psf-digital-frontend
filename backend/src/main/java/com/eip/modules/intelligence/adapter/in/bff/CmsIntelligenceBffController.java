package com.eip.modules.intelligence.adapter.in.bff;

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

import com.eip.modules.intelligence.domain.port.in.CurarConteudoUseCase;
import com.eip.modules.intelligence.domain.port.in.CurarConteudoUseCase.CmsItemView;
import com.eip.modules.intelligence.domain.port.in.CurarConteudoUseCase.CmsStats;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the CMS intelligence curation screens (super-admin).
 */
@RestController
@RequestMapping("/bff/cms/intelligence")
@RequiredArgsConstructor
public class CmsIntelligenceBffController {

    private final CurarConteudoUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('super-admin/cms-intelligence','view')")
    public List<CmsItemView> listar(@RequestParam(required = false) String reviewStatus) {
        return useCase.listar(reviewStatus);
    }

    @GetMapping("/stats")
    @PreAuthorize("@rbac.can('super-admin/cms-intelligence','view')")
    public CmsStats stats() {
        return useCase.stats();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('super-admin/cms-intelligence','create')")
    public CmsItemView criar(@Valid @RequestBody CriarIntelligenceItemRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/aprovar")
    @PreAuthorize("@rbac.can('super-admin/cms-intelligence','edit')")
    public CmsItemView aprovar(@PathVariable UUID id) {
        return useCase.aprovar(id);
    }

    @PostMapping("/{id}/rejeitar")
    @PreAuthorize("@rbac.can('super-admin/cms-intelligence','edit')")
    public CmsItemView rejeitar(@PathVariable UUID id) {
        return useCase.rejeitar(id);
    }

    @PostMapping("/{id}/publicar")
    @PreAuthorize("@rbac.can('super-admin/cms-intelligence','edit')")
    public CmsItemView publicar(@PathVariable UUID id) {
        return useCase.publicar(id);
    }

    @PostMapping("/{id}/arquivar")
    @PreAuthorize("@rbac.can('super-admin/cms-intelligence','edit')")
    public CmsItemView arquivar(@PathVariable UUID id) {
        return useCase.arquivar(id);
    }
}
