package com.eip.modules.cms.domain.model;

import java.util.UUID;

/**
 * Curated official/external link. GLOBAL catalog (not tenant-scoped). Pure
 * domain — no Spring/JPA.
 */
public record OfficialLink(
        UUID id,
        String category,
        String name,
        String description,
        String url,
        String country,
        int displayOrder,
        boolean active) {
}
