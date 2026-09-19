package com.eip.modules.cms.domain.port.out;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.eip.modules.cms.domain.model.AdCampaign;
import com.eip.modules.cms.domain.model.Advertiser;

/**
 * Outbound port: persistence for the GLOBAL advertising domain (advertisers +
 * campaigns).
 */
public interface AdvertisingRepositoryPort {

    List<Advertiser> advertisers();

    List<AdCampaign> campaigns(String status);

    Optional<AdCampaign> campaignById(UUID id);

    Advertiser saveAdvertiser(Advertiser advertiser);

    AdCampaign saveCampaign(AdCampaign campaign);
}
