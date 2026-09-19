package com.eip.modules.superadmin.adapter.in.bff;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.superadmin.domain.port.in.ConsultarEventosUseCase;
import com.eip.modules.superadmin.domain.port.in.ConsultarEventosUseCase.EventTypeCount;
import com.eip.modules.superadmin.domain.port.in.ConsultarEventosUseCase.ProductEventView;
import com.eip.modules.superadmin.domain.port.in.RegistrarEventoUseCase;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints for the tenant-scoped product analytics ledger: list events,
 * count by type and record a new event.
 */
@RestController
@RequestMapping("/bff/super-admin/eventos-produto")
@RequiredArgsConstructor
public class ProductEventsBffController {

    private final ConsultarEventosUseCase consultar;
    private final RegistrarEventoUseCase registrar;

    @GetMapping
    @PreAuthorize("@rbac.can('super-admin/eventos-produto','view')")
    public List<ProductEventView> eventos(@RequestParam(required = false) String event) {
        return consultar.eventos(event);
    }

    @GetMapping("/contagem")
    @PreAuthorize("@rbac.can('super-admin/eventos-produto','view')")
    public List<EventTypeCount> contagem() {
        return consultar.contagemPorTipo();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    @PreAuthorize("@rbac.can('super-admin/eventos-produto','create')")
    public void registrar(@Valid @RequestBody RegistrarEventoRequest request) {
        registrar.registrar(request.event(), request.properties());
    }
}
