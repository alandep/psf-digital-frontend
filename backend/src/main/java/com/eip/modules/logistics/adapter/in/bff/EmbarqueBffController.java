package com.eip.modules.logistics.adapter.in.bff;

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

import com.eip.modules.logistics.domain.port.in.GerenciarEmbarquesUseCase;
import com.eip.modules.logistics.domain.port.in.GerenciarEmbarquesUseCase.EmbarqueResumo;
import com.eip.modules.logistics.domain.port.in.GerenciarEmbarquesUseCase.EmbarqueView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the shipment (embarque) management screens.
 */
@RestController
@RequestMapping("/bff/logistica/embarques")
@RequiredArgsConstructor
public class EmbarqueBffController {

    private final GerenciarEmbarquesUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('logistica/embarque','view')")
    public List<EmbarqueResumo> listar(@RequestParam(required = false) String status) {
        return useCase.listar(status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@rbac.can('logistica/embarque','view')")
    public EmbarqueView porId(@PathVariable UUID id) {
        return useCase.porId(id);
    }

    @PostMapping
    @PreAuthorize("@rbac.can('logistica/embarque','create')")
    public EmbarqueView criar(@RequestBody CriarEmbarqueRequest request) {
        return useCase.criar(request.toCommand());
    }

    @PostMapping("/{id}/transito")
    @PreAuthorize("@rbac.can('logistica/embarque','edit')")
    public EmbarqueView iniciarTransito(@PathVariable UUID id) {
        return useCase.iniciarTransito(id);
    }

    @PostMapping("/{id}/concluir")
    @PreAuthorize("@rbac.can('logistica/embarque','edit')")
    public EmbarqueView concluir(@PathVariable UUID id) {
        return useCase.concluir(id);
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("@rbac.can('logistica/embarque','edit')")
    public EmbarqueView cancelar(@PathVariable UUID id) {
        return useCase.cancelar(id);
    }
}
