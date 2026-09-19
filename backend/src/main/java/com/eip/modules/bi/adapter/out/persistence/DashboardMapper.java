package com.eip.modules.bi.adapter.out.persistence;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.bi.domain.model.Dashboard;
import com.eip.modules.bi.domain.model.DashboardId;
import com.eip.modules.bi.domain.model.Widget;

/**
 * Hand-written mapper between the dashboard aggregate and JPA entities.
 */
@Component
public class DashboardMapper {

    /**
     * Maps a domain aggregate to a persistable entity.
     *
     * @param existing an entity fetched from the store, or {@code null} for a new insert
     */
    public DashboardEntity toEntity(Dashboard domain, DashboardEntity existing) {
        DashboardEntity entity = existing != null ? existing : new DashboardEntity();
        boolean isNew = existing == null;
        if (isNew) {
            entity.setId(domain.id().value());
            entity.setCreatedAt(OffsetDateTime.now());
            entity.setVersion(domain.version());
        }
        entity.setOrganizationId(domain.organizationId());
        entity.setUserId(domain.userId());
        entity.setName(domain.name());
        entity.setDescription(domain.description());
        entity.setLayout(domain.layout());
        entity.setDefault(domain.isDefault());
        entity.setUpdatedAt(OffsetDateTime.now());
        syncWidgets(domain, entity);
        return entity;
    }

    private void syncWidgets(Dashboard domain, DashboardEntity entity) {
        // Replace-all strategy: orphanRemoval clears the previous rows, the new
        // domain widgets are re-inserted.
        entity.getWidgets().clear();
        for (Widget w : domain.widgets()) {
            DashboardWidgetEntity we = new DashboardWidgetEntity();
            we.setId(w.id() != null ? w.id() : UUID.randomUUID());
            we.setDashboard(entity);
            we.setOrganizationId(domain.organizationId());
            we.setTipo(w.tipo());
            we.setTitulo(w.titulo());
            we.setConfig(w.config());
            we.setOrdem(w.ordem());
            we.setCreatedAt(OffsetDateTime.now());
            entity.getWidgets().add(we);
        }
    }

    /** Maps a persisted entity back to the domain aggregate. */
    public Dashboard toDomain(DashboardEntity entity) {
        List<Widget> widgets = new ArrayList<>();
        for (DashboardWidgetEntity w : entity.getWidgets()) {
            widgets.add(new Widget(
                    w.getId(),
                    w.getTipo(),
                    w.getTitulo(),
                    w.getConfig(),
                    w.getOrdem()));
        }
        return new Dashboard(
                DashboardId.of(entity.getId()),
                entity.getOrganizationId(),
                entity.getUserId(),
                entity.getName(),
                entity.getDescription(),
                entity.getLayout(),
                entity.isDefault(),
                entity.getVersion(),
                widgets);
    }
}
