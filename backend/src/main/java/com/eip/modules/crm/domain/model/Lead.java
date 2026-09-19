package com.eip.modules.crm.domain.model;

import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Lead aggregate root. Pure domain: no framework or persistence annotations.
 *
 * <p>Moves along the conversion funnel via {@link #avancarStatus(LeadStatus)};
 * the {@link LeadStatus#CUSTOMER} and {@link LeadStatus#LOST} states are
 * terminal and cannot be reverted.
 */
public final class Lead {

    private final LeadId id;
    private final UUID organizationId;
    private final String name;
    private final String companyName;
    private final String email;
    private final String phone;
    private final LeadSource source;
    private final String origin;
    private LeadStatus status;
    private final long version;

    public Lead(LeadId id, UUID organizationId, String name, String companyName, String email,
                String phone, LeadSource source, String origin, LeadStatus status, long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.companyName = companyName;
        this.email = email;
        this.phone = phone;
        this.source = source;
        this.origin = origin;
        this.status = status;
        this.version = version;
    }

    /** Creates a new lead in the {@link LeadStatus#NEW} state. */
    public static Lead novo(UUID org, String name, String companyName, String email, String phone,
                            LeadSource source, String origin) {
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome do lead e obrigatorio");
        }
        return new Lead(
                LeadId.novo(),
                org,
                name,
                companyName,
                email,
                phone,
                source,
                origin,
                LeadStatus.NEW,
                0L);
    }

    /**
     * Advances the lead to a new funnel status.
     *
     * @throws BusinessRuleException if the lead is already in a terminal state
     *                               ({@link LeadStatus#CUSTOMER} or {@link LeadStatus#LOST})
     */
    public void avancarStatus(LeadStatus novo) {
        if (novo == null) {
            throw new BusinessRuleException("Novo status do lead e obrigatorio");
        }
        if (status == LeadStatus.CUSTOMER || status == LeadStatus.LOST) {
            throw new BusinessRuleException(
                    "Lead em estado terminal nao pode mudar de status: " + status);
        }
        this.status = novo;
    }

    /** Marks the lead as lost. */
    public void marcarPerdido() {
        if (status == LeadStatus.CUSTOMER) {
            throw new BusinessRuleException("Lead ja convertido nao pode ser marcado como perdido");
        }
        this.status = LeadStatus.LOST;
    }

    public LeadId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public String name() {
        return name;
    }

    public String companyName() {
        return companyName;
    }

    public String email() {
        return email;
    }

    public String phone() {
        return phone;
    }

    public LeadSource source() {
        return source;
    }

    public String origin() {
        return origin;
    }

    public LeadStatus status() {
        return status;
    }

    public long version() {
        return version;
    }
}
