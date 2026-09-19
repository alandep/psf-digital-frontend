package com.eip.modules.cms.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.cms.domain.port.in.ConsultarNotificacoesUseCase;
import com.eip.modules.cms.domain.port.in.ConsultarNotificacoesUseCase.NotificationView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the tenant notification centre.
 */
@RestController
@RequestMapping("/bff/notificacoes")
@RequiredArgsConstructor
public class NotificacoesBffController {

    private final ConsultarNotificacoesUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('notificacoes/centro','view')")
    public List<NotificationView> listar() {
        return useCase.listar();
    }

    @PostMapping("/{id}/lida")
    @PreAuthorize("@rbac.can('notificacoes/centro','edit')")
    public NotificationView marcarLida(@PathVariable UUID id) {
        return useCase.marcarLida(id);
    }

    @PostMapping("/lidas")
    @PreAuthorize("@rbac.can('notificacoes/centro','edit')")
    public void marcarTodasLidas() {
        useCase.marcarTodasLidas();
    }

    @GetMapping("/nao-lidas")
    @PreAuthorize("@rbac.can('notificacoes/centro','view')")
    public UnreadCount naoLidas() {
        return new UnreadCount(useCase.naoLidas());
    }

    /** Response payload for the unread-notification count. */
    public record UnreadCount(long count) {
    }
}
