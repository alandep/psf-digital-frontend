package com.eip.modules.compliance.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public CertificacaoView criar(@Valid @RequestBody CriarCertificacaoRequest request) {
        return useCase.criar(request.toCommand());
    }
}
