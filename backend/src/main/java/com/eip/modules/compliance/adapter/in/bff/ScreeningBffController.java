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

import com.eip.modules.compliance.domain.port.in.GerenciarScreeningUseCase;
import com.eip.modules.compliance.domain.port.in.GerenciarScreeningUseCase.ScreeningView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the sanctions/PEP screening screens.
 */
@RestController
@RequestMapping("/bff/compliance/screening")
@RequiredArgsConstructor
public class ScreeningBffController {

    private final GerenciarScreeningUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('compliance/painel','view')")
    public List<ScreeningView> listar(@RequestParam(required = false) String status) {
        return useCase.listar(status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('compliance/painel','view')")
    public ScreeningView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('compliance/painel','create')")
    public ScreeningView criar(@Valid @RequestBody CriarScreeningRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/analisar")
    @PreAuthorize("@rbac.can('compliance/painel','edit')")
    public ScreeningView analisar(@PathVariable UUID id) {
        return useCase.iniciarAnalise(id);
    }

    @PostMapping("/{id}/aprovar")
    @PreAuthorize("@rbac.can('compliance/painel','edit')")
    public ScreeningView aprovar(@PathVariable UUID id,
                                 @Valid @RequestBody AprovarScreeningRequest request) {
        return useCase.aprovar(id, request.toCommand());
    }

    @PostMapping("/{id}/reprovar")
    @PreAuthorize("@rbac.can('compliance/painel','edit')")
    public ScreeningView reprovar(@PathVariable UUID id,
                                  @RequestBody ReprovarScreeningRequest request) {
        return useCase.reprovar(id, request.toCommand());
    }
}
