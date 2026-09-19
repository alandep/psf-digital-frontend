/**
 * CMS &amp; Admin module: institutional public settings, curated official links
 * and advertising (advertisers + campaigns), plus per-tenant access profiles
 * (roles) and in-app notifications. Follows a hexagonal architecture — a pure
 * domain core, an application layer of use cases, inbound BFF adapters and
 * outbound JPA persistence adapters.
 *
 * <p>Institutional settings ({@code public_setting}), official links
 * ({@code official_link}) and advertising ({@code advertiser}/
 * {@code ad_campaign}) are GLOBAL (not tenant-scoped, no RLS); public reads of
 * settings and active links are reachable without authentication under
 * {@code /bff/public/**}. Access profiles ({@code access_profile}) and
 * notifications ({@code app_notification}) are tenant-scoped by
 * {@code organization_id} under RLS. Money uses {@link java.math.BigDecimal},
 * campaign dates use {@link java.time.LocalDate} and timestamps use
 * {@link java.time.OffsetDateTime}. Access-profile writes emit domain events
 * through the transactional outbox.
 */
@ApplicationModule(displayName = "Cms")
package com.eip.modules.cms;

import org.springframework.modulith.ApplicationModule;
