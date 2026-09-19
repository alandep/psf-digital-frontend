package com.eip.modules.compliance.adapter.in.bff;

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

import com.eip.modules.compliance.domain.port.in.GerenciarLicencasUseCase;
import com.eip.modules.compliance.domain.port.in.GerenciarLicencasUseCase.LicencaView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the license management screens.
 */
@RestController
@RequestMapping("/bff/compliance/licencas")
@RequiredArgsConstructor
public class LicencaBffController {

    private final GerenciarLicencasUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('compliance/painel','view')")
    public List<LicencaView> listar(@RequestParam(required = false) String status) {
        return useCase.listar(status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('compliance/painel','view')")
    public LicencaView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('compliance/painel','create')")
    public LicencaView criar(@Valid @RequestBody CriarLicencaRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/renovar")
    @PreAuthorize("@rbac.can('compliance/painel','edit')")
    public LicencaView renovar(@PathVariable UUID id,
                               @Valid @RequestBody RenovarLicencaRequest request) {
        return useCase.renovar(id, request.toCommand());
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("@rbac.can('compliance/painel','edit')")
    public LicencaView cancelar(@PathVariable UUID id) {
        return useCase.cancelar(id);
    }
}
