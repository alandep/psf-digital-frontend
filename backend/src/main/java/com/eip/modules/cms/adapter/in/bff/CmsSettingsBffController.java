package com.eip.modules.cms.adapter.in.bff;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.cms.domain.port.in.ConsultarConfiguracoesUseCase;
import com.eip.modules.cms.domain.port.in.ConsultarConfiguracoesUseCase.SettingView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Admin BFF endpoints for institutional settings (super-admin).
 */
@RestController
@RequestMapping("/bff/cms/settings")
@RequiredArgsConstructor
public class CmsSettingsBffController {

    private final ConsultarConfiguracoesUseCase useCase;

    @PostMapping
    @PreAuthorize("@rbac.can('super-admin/institucional','edit')")
    public SettingView salvar(@Valid @RequestBody SalvarSettingRequest request) {
        return useCase.salvar(request.toCommand());
    }
}
