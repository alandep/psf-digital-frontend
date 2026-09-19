package com.eip.modules.intelligence.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.intelligence.domain.port.in.ConsultarAlertasUseCase;
import com.eip.modules.intelligence.domain.port.in.ConsultarAlertasUseCase.AlertView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the tenant intelligence alerts screens.
 */
@RestController
@RequestMapping("/bff/intelligence/alertas")
@RequiredArgsConstructor
public class AlertBffController {

    private final ConsultarAlertasUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('intelligence/alertas','view')")
    public List<AlertView> listar() {
        return useCase.listar();
    }

    @PostMapping("/{id}/lida")
    @PreAuthorize("@rbac.can('intelligence/alertas','edit')")
    public AlertView marcarLida(@PathVariable UUID id) {
        return useCase.marcarLida(id);
    }

    @GetMapping("/nao-lidas")
    @PreAuthorize("@rbac.can('intelligence/alertas','view')")
    public long naoLidas() {
        return useCase.naoLidas();
    }
}
