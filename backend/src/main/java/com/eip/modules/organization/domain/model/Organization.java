package com.eip.modules.organization.domain.model;

import java.util.UUID;

/**
 * Pure domain representation of an organization (tenant).
 *
 * @param id     the organization identifier
 * @param name   the organization display / legal name
 * @param status lifecycle status (e.g. {@code ACTIVE})
 */
public record Organization(UUID id, String name, String status) {
}
