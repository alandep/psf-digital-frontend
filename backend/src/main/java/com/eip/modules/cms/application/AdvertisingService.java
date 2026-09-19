package com.eip.modules.cms.application;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.cms.domain.model.AdCampaign;
import com.eip.modules.cms.domain.model.AdCampaignStatus;
import com.eip.modules.cms.domain.model.Advertiser;
import com.eip.modules.cms.domain.model.AdvertiserStatus;
import com.eip.modules.cms.domain.port.in.GerenciarPublicidadeUseCase;
import com.eip.modules.cms.domain.port.out.AdvertisingRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Application service for advertisers and advertising campaigns.
 *
 * <p>Advertising is GLOBAL: this service does NOT read the tenant organization
 * context, since {@code advertiser}/{@code ad_campaign} are not RLS-scoped.
 */
@Service
@RequiredArgsConstructor
public class AdvertisingService implements GerenciarPublicidadeUseCase {

    private final AdvertisingRepositoryPort repo;

    @Override
    @Transactional(readOnly = true)
    public List<AdvertiserView> anunciantes() {
        return repo.advertisers().stream().map(AdvertiserView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampaignView> campanhas(String status) {
        return repo.campaigns(status).stream().map(CampaignView::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdMetrics metricasResumo() {
        List<AdCampaign> all = repo.campaigns(null);
        long ativas = all.stream().filter(c -> c.status() == AdCampaignStatus.ACTIVE).count();
        long impressoes = all.stream().mapToLong(AdCampaign::impressions).sum();
        long cliques = all.stream().mapToLong(AdCampaign::clicks).sum();
        BigDecimal receita = all.stream()
                .map(c -> c.revenue() == null ? BigDecimal.ZERO : c.revenue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new AdMetrics(ativas, impressoes, cliques, receita);
    }

    @Override
    @Transactional
    public AdvertiserView criarAnunciante(CriarAnuncianteCommand cmd) {
        if (cmd.tradeName() == null || cmd.tradeName().isBlank()) {
            throw new BusinessRuleException("Nome fantasia do anunciante e obrigatorio");
        }
        Advertiser a = new Advertiser(UUID.randomUUID(), cmd.legalName(), cmd.tradeName(),
                cmd.cnpj(), cmd.website(), AdvertiserStatus.ACTIVE);
        return AdvertiserView.from(repo.saveAdvertiser(a));
    }

    @Override
    @Transactional
    public CampaignView criarCampanha(CriarCampanhaCommand cmd) {
        AdCampaign c = AdCampaign.novo(
                cmd.advertiserId(),
                cmd.name(),
                cmd.placement(),
                CmsSupport.parseDate(cmd.startAt()),
                CmsSupport.parseDate(cmd.endAt()),
                cmd.targetUrl());
        return CampaignView.from(repo.saveCampaign(c));
    }

    @Override
    @Transactional
    public CampaignView ativar(UUID id) {
        AdCampaign c = loadCampaign(id);
        c.ativar();
        return CampaignView.from(repo.saveCampaign(c));
    }

    @Override
    @Transactional
    public CampaignView pausar(UUID id) {
        AdCampaign c = loadCampaign(id);
        c.pausar();
        return CampaignView.from(repo.saveCampaign(c));
    }

    @Override
    @Transactional
    public CampaignView encerrar(UUID id) {
        AdCampaign c = loadCampaign(id);
        c.encerrar();
        return CampaignView.from(repo.saveCampaign(c));
    }

    private AdCampaign loadCampaign(UUID id) {
        return repo.campaignById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campanha nao encontrada: " + id));
    }
}
