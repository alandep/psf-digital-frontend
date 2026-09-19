package com.eip.modules.cms.adapter.in.bff;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.cms.domain.port.in.ConsultarLinksOficiaisUseCase;
import com.eip.modules.cms.domain.port.in.ConsultarLinksOficiaisUseCase.OfficialLinkView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Admin BFF endpoints for the official links catalog (super-admin).
 */
@RestController
@RequestMapping("/bff/cms/official-links")
@RequiredArgsConstructor
public class CmsLinksBffController {

    private final ConsultarLinksOficiaisUseCase useCase;

    @PostMapping
    @PreAuthorize("@rbac.can('super-admin/institucional','edit')")
    public OfficialLinkView criar(@Valid @RequestBody CriarLinkRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/toggle")
    @PreAuthorize("@rbac.can('super-admin/institucional','edit')")
    public OfficialLinkView alternar(@PathVariable UUID id) {
        return useCase.alternar(id);
    }
}
