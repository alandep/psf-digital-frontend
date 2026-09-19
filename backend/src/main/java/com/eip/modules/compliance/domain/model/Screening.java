package com.eip.modules.compliance.domain.model;

import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Screening aggregate root (sanctions / PEP / watchlist check). Pure domain: no
 * framework or persistence annotations. Lifecycle transitions are guarded.
 */
public final class Screening {

    private final ScreeningId id;
    private final UUID organizationId;
    private final String entityName;
    private final String entityType;
    private final String document;
    private ScreeningStatus status;
    private RiskLevel riskLevel;
    private final String listsChecked;
    private String resultSummary;
    private final long version;

    public Screening(ScreeningId id, UUID organizationId, String entityName, String entityType,
                     String document, ScreeningStatus status, RiskLevel riskLevel,
                     String listsChecked, String resultSummary, long version) {
        this.id = id;
        this.organizationId = organizationId;
        this.entityName = entityName;
        this.entityType = entityType;
        this.document = document;
        this.status = status;
        this.riskLevel = riskLevel;
        this.listsChecked = listsChecked;
        this.resultSummary = resultSummary;
        this.version = version;
    }

    /** Creates a new pending screening. */
    public static Screening novo(UUID org, String entityName, String entityType, String document,
                                 String listsChecked) {
        if (entityName == null || entityName.isBlank()) {
            throw new BusinessRuleException("Nome da entidade e obrigatorio");
        }
        return new Screening(
                ScreeningId.novo(),
                org,
                entityName,
                entityType,
                document,
                ScreeningStatus.PENDENTE,
                null,
                listsChecked,
                null,
                0L);
    }

    /**
     * Starts the analysis.
     *
     * @throws BusinessRuleException if the screening is not pending
     */
    public void iniciarAnalise() {
        if (status != ScreeningStatus.PENDENTE) {
            throw new BusinessRuleException("Somente screening PENDENTE pode iniciar analise");
        }
        this.status = ScreeningStatus.EM_ANALISE;
    }

    /**
     * Approves the screening with a risk classification.
     *
     * @throws BusinessRuleException if the screening is not under analysis
     */
    public void aprovar(RiskLevel riskLevel, String summary) {
        if (status != ScreeningStatus.EM_ANALISE) {
            throw new BusinessRuleException("Somente screening EM_ANALISE pode ser aprovado");
        }
        if (riskLevel == null) {
            throw new BusinessRuleException("Nivel de risco e obrigatorio na aprovacao");
        }
        this.status = ScreeningStatus.APROVADO;
        this.riskLevel = riskLevel;
        this.resultSummary = summary;
    }

    /**
     * Rejects the screening.
     *
     * @throws BusinessRuleException if the screening is not under analysis
     */
    public void reprovar(String summary) {
        if (status != ScreeningStatus.EM_ANALISE) {
            throw new BusinessRuleException("Somente screening EM_ANALISE pode ser reprovado");
        }
        this.status = ScreeningStatus.REPROVADO;
        this.resultSummary = summary;
    }

    public ScreeningId id() {
        return id;
    }

    public UUID organizationId() {
        return organizationId;
    }

    public String entityName() {
        return entityName;
    }

    public String entityType() {
        return entityType;
    }

    public String document() {
        return document;
    }

    public ScreeningStatus status() {
        return status;
    }

    public RiskLevel riskLevel() {
        return riskLevel;
    }

    public String listsChecked() {
        return listsChecked;
    }

    public String resultSummary() {
        return resultSummary;
    }

    public long version() {
        return version;
    }
}
