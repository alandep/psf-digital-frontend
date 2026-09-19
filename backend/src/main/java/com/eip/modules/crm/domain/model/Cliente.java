package com.eip.modules.crm.domain.model;

import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * CRM customer aggregate root. Pure domain: no framework or persistence
 * annotations. The {@code crm_cliente} table carries no optimistic-lock
 * column, so this aggregate has no {@code version} field.
 */
public final class Cliente {

    private final ClienteId id;
    private final UUID organizationId;
    private final String name;
    private final String cnpj;
    private final String segmento;
    private final String pais;
    private ClienteStatus status;

    public Cliente(ClienteId id, UUID organizationId, String name, String cnpj, String segmento,
                   String pais, ClienteStatus status) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.cnpj = cnpj;
        this.segmento = segmento;
        this.pais = pais;
        this.status = status;
    }

    /** Creates a new customer in the {@link ClienteStatus#PROSPECT} state. */
    public static Cliente novo(UUID org, String name, String cnpj, String segmento, String pais) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome do cliente e obrigatorio");
        }
        return new Cliente(
                ClienteId.novo(),
                org,
                name,
                cnpj,
                segmento,
                pais,
                ClienteStatus.PROSPECT);
    }

    /** Activates the customer. */
    public void ativar() {
        this.status = ClienteStatus.ATIVO;
    }

    /** Deactivates the customer. */
    public void inativar() {
        this.status = ClienteStatus.INATIVO;
    }

    public ClienteId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public String name() {
        return name;
    }

    public String cnpj() {
        return cnpj;
    }

    public String segmento() {
        return segmento;
    }

    public String pais() {
        return pais;
    }

    public ClienteStatus status() {
        return status;
    }
}
