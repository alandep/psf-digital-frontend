package com.eip.modules.compliance.adapter.in.bff;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.compliance.domain.port.in.ConsultarCertificacoesUseCase;
import com.eip.modules.compliance.domain.port.in.ConsultarCertificacoesUseCase.CertificacaoView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the certification screens.
 */
@RestController
@RequestMapping("/bff/compliance/certificacoes")
@RequiredArgsConstructor
public class CertificacaoBffController {

    private final ConsultarCertificacoesUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('compliance/painel','view')")
    public List<CertificacaoView> listar(@RequestParam(required = false) String status) {
        return useCase.listar(status);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('compliance/painel','create')")
    public CertificacaoView criar(@Valid @RequestBody CriarCertificacaoRequest request, Principal principal) {
        return useCase.criar(request.toCommand(principal != null ? principal.getName() : "sistema"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.can('compliance/painel','edit')")
    public CertificacaoView atualizar(@PathVariable UUID id,
                                      @Valid @RequestBody CriarCertificacaoRequest request,
                                      Principal principal) {
        return useCase.atualizar(id, request.toCommand(principal != null ? principal.getName() : "sistema"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@rbac.can('compliance/painel','edit')")
    public void excluir(@PathVariable UUID id) {
        useCase.excluir(id);
    }
}
