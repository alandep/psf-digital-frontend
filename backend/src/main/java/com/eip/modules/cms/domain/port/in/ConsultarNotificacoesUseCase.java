package com.eip.modules.cms.domain.port.in;

import java.util.List;
import java.util.UUID;

import com.eip.modules.cms.domain.model.AppNotification;

/**
 * Inbound port: consult and manage tenant in-app notifications. Tenant-scoped.
 */
public interface ConsultarNotificacoesUseCase {

    List<NotificationView> listar();

    NotificationView marcarLida(UUID id);

    long naoLidas();

    void marcarTodasLidas();

    /** Read view of a notification. */
    record NotificationView(
            UUID id,
            String type,
            String title,
            String body,
            boolean read) {

        public static NotificationView from(AppNotification n) {
            return new NotificationView(n.id(), n.type(), n.title(), n.body(), n.read());
        }
    }
}
