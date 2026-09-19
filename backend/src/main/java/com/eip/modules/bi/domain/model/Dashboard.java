package com.eip.modules.bi.domain.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Dashboard aggregate root. Pure domain: no framework or persistence annotations.
 *
 * <p>Holds a JSON {@code layout} (serialized to text) and an ordered list of
 * {@link Widget}s. Tenant-scoped by {@code organizationId}.
 */
public final class Dashboard {

    private final DashboardId id;
    private final UUID organizationId;
    private final UUID userId;
    private String name;
    private String description;
    private String layout;
    private boolean isDefault;
    private final long version;
    private final List<Widget> widgets;

    public Dashboard(DashboardId id, UUID organizationId, UUID userId, String name,
                     String description, String layout, boolean isDefault, long version,
                     List<Widget> widgets) {
        this.id = id;
        this.organizationId = organizationId;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.layout = layout;
        this.isDefault = isDefault;
        this.version = version;
        this.widgets = widgets == null ? new ArrayList<>() : new ArrayList<>(widgets);
    }

    /** Creates a new (non-default) dashboard. */
    public static Dashboard novo(UUID org, UUID userId, String name, String description,
                                 String layout, List<Widget> widgets) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome do dashboard e obrigatorio");
        }
        return new Dashboard(
                DashboardId.novo(),
                org,
                userId,
                name,
                description,
                layout,
                false,
                0L,
                widgets);
    }

    /** Renames the dashboard. */
    public void renomear(String name) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome do dashboard e obrigatorio");
        }
        this.name = name;
    }

    /** Updates the free-form description. */
    public void alterarDescricao(String description) {
        this.description = description;
    }

    /** Replaces the serialized JSON layout. */
    public void alterarLayout(String layout) {
        this.layout = layout;
    }

    /** Marks this dashboard as the organization default. */
    public void definirComoPadrao() {
        this.isDefault = true;
    }

    /** Clears the default flag on this dashboard. */
    public void removerPadrao() {
        this.isDefault = false;
    }

    /** Replaces the whole widget collection. */
    public void substituirWidgets(List<Widget> novos) {
        this.widgets.clear();
        if (novos != null) {
            this.widgets.addAll(novos);
        }
    }

    public DashboardId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public UUID userId() {
        return userId;
    }

    public String name() {
        return name;
    }

    public String description() {
        return description;
    }

    public String layout() {
        return layout;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public long version() {
        return version;
    }

    public List<Widget> widgets() {
        return Collections.unmodifiableList(widgets);
    }
}
