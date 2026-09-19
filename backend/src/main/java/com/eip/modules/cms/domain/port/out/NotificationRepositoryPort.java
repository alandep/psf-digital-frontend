package com.eip.modules.cms.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.cms.domain.model.AppNotification;

/**
 * Outbound port: persistence for the tenant in-app notification.
 */
public interface NotificationRepositoryPort {

    List<AppNotification> listar(UUID org);

    Optional<AppNotification> porId(UUID id, UUID org);

    AppNotification salvar(AppNotification notification);

    long countUnread(UUID org);

    void marcarTodasLidas(UUID org);
}
