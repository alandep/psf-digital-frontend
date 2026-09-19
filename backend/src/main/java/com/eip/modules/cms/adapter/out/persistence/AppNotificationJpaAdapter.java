package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.AppNotification;
import com.eip.modules.cms.domain.port.out.NotificationRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link NotificationRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class AppNotificationJpaAdapter implements NotificationRepositoryPort {

    private final AppNotificationJpaRepository jpa;
    private final AppNotificationMapper mapper;

    @Override
    public List<AppNotification> listar(UUID org) {
        return jpa.findByOrganizationIdOrderByCreatedAtDesc(org).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public Optional<AppNotification> porId(UUID id, UUID org) {
        return jpa.findByIdAndOrganizationId(id, org).map(mapper::toDomain);
    }

    @Override
    public AppNotification salvar(AppNotification notification) {
        AppNotificationEntity existing = jpa
                .findByIdAndOrganizationId(notification.id(), notification.organizationId())
                .orElse(null);
        AppNotificationEntity entity = mapper.toEntity(notification, existing);
        return mapper.toDomain(jpa.saveAndFlush(entity));
    }

    @Override
    public long countUnread(UUID org) {
        return jpa.countByOrganizationIdAndReadFalse(org);
    }

    @Override
    public void marcarTodasLidas(UUID org) {
        jpa.markAllRead(org);
    }
}
