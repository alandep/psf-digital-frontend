package com.eip.modules.cms.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.eip.platform.error.BusinessRuleException;

/**
 * Advertising campaign aggregate root. GLOBAL (not tenant-scoped). Pure domain
 * — no Spring/JPA. Lifecycle transitions are guarded; {@code ENDED} is terminal.
 */
public final class AdCampaign {

    private final UUID id;
    private final UUID advertiserId;
    private final String name;
    private final String placement;
    private final LocalDate startAt;
    private final LocalDate endAt;
    private AdCampaignStatus status;
    private final String targetUrl;
    private final int impressions;
    private final int clicks;
    private final BigDecimal revenue;

    public AdCampaign(UUID id, UUID advertiserId, String name, String placement,
                      LocalDate startAt, LocalDate endAt, AdCampaignStatus status,
                      String targetUrl, int impressions, int clicks, BigDecimal revenue) {
        this.id = id;
        this.advertiserId = advertiserId;
        this.name = name;
        this.placement = placement;
        this.startAt = startAt;
        this.endAt = endAt;
        this.status = status;
        this.targetUrl = targetUrl;
        this.impressions = impressions;
        this.clicks = clicks;
        this.revenue = revenue;
    }

    /** Creates a new campaign in {@code DRAFT}. */
    public static AdCampaign novo(UUID advertiserId, String name, String placement,
                                  LocalDate startAt, LocalDate endAt, String targetUrl) {
        if (advertiserId == null) {
            throw new BusinessRuleException("Anunciante da campanha e obrigatorio");
        }
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("Nome da campanha e obrigatorio");
        }
        return new AdCampaign(UUID.randomUUID(), advertiserId, name, placement,
                startAt, endAt, AdCampaignStatus.DRAFT, targetUrl, 0, 0, BigDecimal.ZERO);
    }

    /**
     * Activates the campaign.
     *
     * @throws BusinessRuleException if the campaign has already ended
     */
    public void ativar() {
        if (status == AdCampaignStatus.ENDED) {
            throw new BusinessRuleException("Campanha encerrada nao pode ser ativada");
        }
        this.status = AdCampaignStatus.ACTIVE;
    }

    /**
     * Pauses the campaign.
     *
     * @throws BusinessRuleException if the campaign has already ended
     */
    public void pausar() {
        if (status == AdCampaignStatus.ENDED) {
            throw new BusinessRuleException("Campanha encerrada nao pode ser pausada");
        }
        this.status = AdCampaignStatus.PAUSED;
    }

    /** Ends the campaign (terminal). */
    public void encerrar() {
        this.status = AdCampaignStatus.ENDED;
    }

    public UUID id() {
        return id;
    }

    public UUID advertiserId() {
        return advertiserId;
    }

    public String name() {
        return name;
    }

    public String placement() {
        return placement;
    }

    public LocalDate startAt() {
        return startAt;
    }

    public LocalDate endAt() {
        return endAt;
    }

    public AdCampaignStatus status() {
        return status;
    }

    public String targetUrl() {
        return targetUrl;
    }

    public int impressions() {
        return impressions;
    }

    public int clicks() {
        return clicks;
    }

    public BigDecimal revenue() {
        return revenue;
    }
}
