package com.eip.modules.cms.domain.port.in;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.eip.modules.cms.domain.model.AdCampaign;
import com.eip.modules.cms.domain.model.Advertiser;

/**
 * Inbound port: manage advertisers and advertising campaigns. Content is
 * GLOBAL — no tenant context.
 */
public interface GerenciarPublicidadeUseCase {

    List<AdvertiserView> anunciantes();

    List<CampaignView> campanhas(String status);

    AdMetrics metricasResumo();

    AdvertiserView criarAnunciante(CriarAnuncianteCommand cmd);

    CampaignView criarCampanha(CriarCampanhaCommand cmd);

    CampaignView ativar(UUID id);

    CampaignView pausar(UUID id);

    CampaignView encerrar(UUID id);

    /** Command to create an advertiser. */
    record CriarAnuncianteCommand(String legalName, String tradeName, String cnpj, String website) {
    }

    /** Command to create a campaign. */
    record CriarCampanhaCommand(
            UUID advertiserId,
            String name,
            String placement,
            String startAt,
            String endAt,
            String targetUrl) {
    }

    /** Aggregate advertising metrics. */
    record AdMetrics(
            long campanhasAtivas,
            long impressoesTotais,
            long cliquesTotais,
            BigDecimal receitaTotal) {
    }

    /** Read view of an advertiser. */
    record AdvertiserView(
            UUID id,
            String legalName,
            String tradeName,
            String cnpj,
            String website,
            String status) {

        public static AdvertiserView from(Advertiser a) {
            return new AdvertiserView(a.id(), a.legalName(), a.tradeName(), a.cnpj(),
                    a.website(), a.status() == null ? null : a.status().name());
        }
    }

    /** Read view of a campaign. */
    record CampaignView(
            UUID id,
            UUID advertiserId,
            String name,
            String placement,
            String startAt,
            String endAt,
            String status,
            String targetUrl,
            int impressions,
            int clicks,
            BigDecimal revenue) {

        public static CampaignView from(AdCampaign c) {
            return new CampaignView(
                    c.id(),
                    c.advertiserId(),
                    c.name(),
                    c.placement(),
                    c.startAt() == null ? null : c.startAt().toString(),
                    c.endAt() == null ? null : c.endAt().toString(),
                    c.status() == null ? null : c.status().name(),
                    c.targetUrl(),
                    c.impressions(),
                    c.clicks(),
                    c.revenue());
        }
    }
}
