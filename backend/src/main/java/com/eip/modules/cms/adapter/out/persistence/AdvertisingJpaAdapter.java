package com.eip.modules.cms.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.eip.modules.cms.domain.model.AdCampaign;
import com.eip.modules.cms.domain.model.Advertiser;
import com.eip.modules.cms.domain.port.out.AdvertisingRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Persistence adapter implementing {@link AdvertisingRepositoryPort} over JPA.
 */
@Component
@RequiredArgsConstructor
public class AdvertisingJpaAdapter implements AdvertisingRepositoryPort {

    private final AdvertiserJpaRepository advertiserJpa;
    private final AdCampaignJpaRepository campaignJpa;
    private final AdvertiserMapper advertiserMapper;
    private final AdCampaignMapper campaignMapper;

    @Override
    public List<Advertiser> advertisers() {
        return advertiserJpa.findAll().stream().map(advertiserMapper::toDomain).toList();
    }

    @Override
    public List<AdCampaign> campaigns(String status) {
        List<AdCampaignEntity> rows = (status == null || status.isBlank())
                ? campaignJpa.findAll()
                : campaignJpa.findByStatus(status.trim().toUpperCase());
        return rows.stream().map(campaignMapper::toDomain).toList();
    }

    @Override
    public Optional<AdCampaign> campaignById(UUID id) {
        return campaignJpa.findById(id).map(campaignMapper::toDomain);
    }

    @Override
    public Advertiser saveAdvertiser(Advertiser advertiser) {
        AdvertiserEntity existing = advertiserJpa.findById(advertiser.id()).orElse(null);
        AdvertiserEntity entity = advertiserMapper.toEntity(advertiser, existing);
        return advertiserMapper.toDomain(advertiserJpa.saveAndFlush(entity));
    }

    @Override
    public AdCampaign saveCampaign(AdCampaign campaign) {
        AdCampaignEntity existing = campaignJpa.findById(campaign.id()).orElse(null);
        AdCampaignEntity entity = campaignMapper.toEntity(campaign, existing);
        return campaignMapper.toDomain(campaignJpa.saveAndFlush(entity));
    }
}
