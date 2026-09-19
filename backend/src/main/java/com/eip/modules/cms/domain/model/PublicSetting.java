package com.eip.modules.cms.domain.model;

/**
 * Institutional key/value setting. GLOBAL (not tenant-scoped). {@code type} is
 * PUBLIC or PRIVATE. Pure domain — no Spring/JPA.
 */
public record PublicSetting(String key, String value, String type) {
}
