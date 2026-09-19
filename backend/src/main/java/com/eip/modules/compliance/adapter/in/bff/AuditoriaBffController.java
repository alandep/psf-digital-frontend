package com.eip.modules.compliance.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.compliance.domain.port.in.ConsultarAuditoriaUseCase;
import com.eip.modules.compliance.domain.port.in.ConsultarAuditoriaUseCase.AuditView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the audit-trail consultation screens.
 */
@RestController
@RequestMapping("/bff/compliance/auditoria")
@RequiredArgsConstructor
public class AuditoriaBffController {

    private final ConsultarAuditoriaUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('compliance/painel','view')")
    public List<AuditView> listar(@RequestParam(required = false) String resourceType) {
        return useCase.listar(resourceType);
    }
}
