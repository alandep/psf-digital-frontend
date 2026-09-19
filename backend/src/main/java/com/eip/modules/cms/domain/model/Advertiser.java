package com.eip.modules.cms.domain.model;

import java.util.UUID;

/**
 * Advertiser directory entry. GLOBAL (not tenant-scoped). Pure domain — no
 * Spring/JPA.
 */
public record Advertiser(
        UUID id,
        String legalName,
        String tradeName,
        String cnpj,
        String website,
        AdvertiserStatus status) {
}
