package com.eip.modules.export.adapter.in.bff;

import java.security.Principal;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.export.domain.port.in.NcmClassificationUseCase;
import com.eip.modules.export.domain.port.in.NcmClassificationUseCase.NcmClassificationView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** BFF endpoints for NCM classification listing and persistence. */
@RestController
@RequestMapping("/bff/ncm-classificacoes")
@RequiredArgsConstructor
public class NcmClassificationBffController {

    private final NcmClassificationUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','view')")
    public List<NcmClassificationView> listar() {
        return useCase.listar();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('exportacoes/gerenciar','create')")
    public NcmClassificationView salvar(@Valid @RequestBody SalvarNcmClassificationRequest request,
                                        Principal principal) {
        return useCase.salvar(request.toCommand(principal != null ? principal.getName() : "sistema"));
    }
}
