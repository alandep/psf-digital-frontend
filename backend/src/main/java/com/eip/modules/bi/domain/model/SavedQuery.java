package com.eip.modules.bi.domain.model;

import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Saved data-explorer query aggregate root. Pure domain.
 *
 * <p>The {@code saved_query} table has no optimistic-lock column, so this
 * aggregate carries no {@code version} field.
 */
public final class SavedQuery {

    private final SavedQueryId id;
    private final UUID organizationId;
    private final UUID userId;
    private String name;
    private final String dataset;
    private String queryJson;

    public SavedQuery(SavedQueryId id, UUID organizationId, UUID userId, String name,
                      String dataset, String queryJson) {
        this.id = id;
        this.organizationId = organizationId;
        this.userId = userId;
        this.name = name;
        this.dataset = dataset;
        this.queryJson = queryJson;
    }

    /** Creates a new saved query. */
    public static SavedQuery nova(UUID org, UUID userId, String name, String dataset,
                                  String queryJson) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome da consulta e obrigatorio");
        }
        return new SavedQuery(SavedQueryId.novo(), org, userId, name, dataset, queryJson);
    }

    /** Updates the name and query definition. */
    public void atualizar(String name, String queryJson) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome da consulta e obrigatorio");
        }
        this.name = name;
        this.queryJson = queryJson;
    }

    public SavedQueryId id() {
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

    public String dataset() {
        return dataset;
    }

    public String queryJson() {
        return queryJson;
    }
}
