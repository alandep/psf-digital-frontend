package com.eip.platform.security;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.eip.platform.security.LicenseGate.LicenseMode;

/**
 * Central access policy: combines the user's role in the organization, the
 * organization's subscription (license mode) and its plan entitlements
 * (modules and numeric limits) into an {@link AccessSnapshot}, and decides
 * whether a screen/action is allowed.
 *
 * <p>Snapshots are cached for {@value #TTL_MILLIS} ms per (user, organization);
 * call {@link #evict(UUID)} after changing memberships, roles or plans.
 *
 * <p>Schema used: {@code organization_membership(organization_id, user_id, role,
 * status)}, {@code app_user(id, name, email)}, {@code subscription(organization_id,
 * status, plan_code, plan_name, trial_end, current_period_end, created_at)} and
 * {@code organization_entitlement(organization_id, feature_key, enabled,
 * limit_value)}. Tenant-scoped tables are read inside a transaction that sets
 * {@code app.current_organization} (FORCE RLS).
 */
@Service
public class AccessPolicyService {

    private static final Logger log = LoggerFactory.getLogger(AccessPolicyService.class);

    /** Snapshot cache time-to-live. */
    static final long TTL_MILLIS = 30_000L;

    private static final String ROLE_ADMIN = "ADMINISTRADOR";
    private static final Set<String> READ_ONLY_ROLES = Set.of("VISUALIZADOR", "LEITOR");

    /** Screen-id prefix -> plan feature key. Screens without a prefix need no module. */
    public static final Map<String, String> MODULE_PREFIXES;

    static {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("exportacoes/", "mod.export");
        m.put("documentos/", "mod.documents");
        m.put("compliance/", "mod.compliance");
        m.put("logistica/", "mod.logistics");
        m.put("financeiro/", "mod.finance");
        m.put("rentabilidade/", "mod.finance");
        m.put("crm/", "mod.crm");
        m.put("intelligence/", "mod.intelligence");
        m.put("ncm/", "mod.ncm");
        MODULE_PREFIXES = Collections.unmodifiableMap(m);
    }

    /** Subscription summary exposed to the client. */
    public record SubscriptionInfo(String status, String planCode, String planName,
            OffsetDateTime trialEndsAt, OffsetDateTime currentPeriodEnd) {
    }

    /**
     * Resolved access state of a user in an organization.
     *
     * @param role   upper-case membership role, or {@code null} without ACTIVE membership
     * @param limits feature limits; a {@code null} value means unlimited
     */
    public record AccessSnapshot(UUID userId, UUID organizationId, String name, String email,
            String role, boolean superAdmin, LicenseMode licenseMode,
            SubscriptionInfo subscription, Map<String, Boolean> modules,
            Map<String, BigDecimal> limits) {
    }

    private record CacheKey(UUID userId, UUID organizationId) {
    }

    private record CacheEntry(AccessSnapshot snapshot, long expiresAtMillis) {
    }

    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;
    private final Set<String> superAdminEmails;
    private final boolean superAdminAnyAdmin;
    private final Map<CacheKey, CacheEntry> cache = new ConcurrentHashMap<>();

    public AccessPolicyService(JdbcTemplate jdbc, PlatformTransactionManager txManager,
            @Value("${eip.security.super-admin-emails:}") String superAdminEmails,
            @Value("${eip.security.super-admin-any-admin:false}") boolean superAdminAnyAdmin) {
        this.jdbc = jdbc;
        this.tx = new TransactionTemplate(txManager);
        this.superAdminEmails = parseEmails(superAdminEmails);
        this.superAdminAnyAdmin = superAdminAnyAdmin;
    }

    /**
     * Resolves (with a 30 s cache) the access snapshot of {@code userId} in {@code orgId}.
     *
     * @param userId the user id; may be {@code null} (then the role is {@code null})
     * @param orgId  the organization id
     * @return the snapshot (never {@code null})
     */
    public AccessSnapshot resolve(UUID userId, UUID orgId) {
        CacheKey key = new CacheKey(userId, orgId);
        long now = System.currentTimeMillis();
        CacheEntry cached = cache.get(key);
        if (cached != null && cached.expiresAtMillis() > now) {
            return cached.snapshot();
        }
        AccessSnapshot snapshot = load(userId, orgId);
        cache.put(key, new CacheEntry(snapshot, now + TTL_MILLIS));
        return snapshot;
    }

    /** Drops every cached snapshot of the organization. */
    public void evict(UUID orgId) {
        cache.keySet().removeIf(k -> k.organizationId().equals(orgId));
    }

    private AccessSnapshot load(UUID userId, UUID orgId) {
        String name = null;
        String email = null;
        String role = null;
        if (userId != null) {
            var users = jdbc.queryForList("select name, email from app_user where id = ?", userId);
            if (!users.isEmpty()) {
                name = (String) users.get(0).get("name");
                email = (String) users.get(0).get("email");
            }
            var roles = jdbc.queryForList(
                    "select role from organization_membership "
                            + "where organization_id = ? and user_id = ? and status = 'ACTIVE'",
                    String.class, orgId, userId);
            if (!roles.isEmpty() && roles.get(0) != null) {
                role = roles.get(0).toUpperCase(Locale.ROOT);
            }
        }

        record Tenant(SubscriptionInfo sub, Map<String, Boolean> modules,
                Map<String, BigDecimal> limits) {
        }
        Tenant tenant = tx.execute(status -> {
            jdbc.queryForObject("select set_config('app.current_organization', ?, true)",
                    String.class, orgId.toString());
            SubscriptionInfo sub = loadSubscription(orgId);
            boolean trialActive = sub != null && "TRIALING".equals(sub.status())
                    && !isTrialExpired(sub.trialEndsAt(), sub.currentPeriodEnd(), OffsetDateTime.now());
            Map<String, Boolean> modules = new HashMap<>();
            Map<String, BigDecimal> limits = new HashMap<>();
            loadEntitlements(orgId, trialActive, modules, limits);
            return new Tenant(sub, modules, limits);
        });

        SubscriptionInfo sub = tenant.sub();
        LicenseMode mode = licenseModeOf(sub, OffsetDateTime.now());
        boolean superAdmin = (email != null && superAdminEmails.contains(email.toLowerCase(Locale.ROOT)))
                || (superAdminAnyAdmin && ROLE_ADMIN.equals(role));
        return new AccessSnapshot(userId, orgId, name, email, role, superAdmin, mode, sub,
                Collections.unmodifiableMap(tenant.modules()),
                Collections.unmodifiableMap(tenant.limits()));
    }

    private SubscriptionInfo loadSubscription(UUID orgId) {
        var rows = jdbc.query(
                "select status, plan_code, plan_name, trial_end, current_period_end "
                        + "from subscription where organization_id = ? "
                        + "order by created_at desc limit 1",
                (rs, i) -> new SubscriptionInfo(
                        rs.getString("status"),
                        rs.getString("plan_code"),
                        rs.getString("plan_name"),
                        rs.getObject("trial_end", OffsetDateTime.class),
                        rs.getObject("current_period_end", OffsetDateTime.class)),
                orgId);
        return rows.isEmpty() ? null : rows.get(0);
    }

    private void loadEntitlements(UUID orgId, boolean trialActive,
            Map<String, Boolean> modules, Map<String, BigDecimal> limits) {
        var rows = jdbc.queryForList(
                "select feature_key, enabled, limit_value from organization_entitlement "
                        + "where organization_id = ?", orgId);
        if (rows.isEmpty()) {
            // Legacy fail-open (see V32): every module enabled, no limits.
            for (String feature : MODULE_PREFIXES.values()) {
                modules.put(feature, Boolean.TRUE);
            }
            return;
        }
        for (var row : rows) {
            String key = (String) row.get("feature_key");
            boolean enabled = Boolean.TRUE.equals(row.get("enabled"));
            BigDecimal limit = (BigDecimal) row.get("limit_value");
            if (key.startsWith("mod.")) {
                modules.put(key, enabled || trialActive);
            } else if (key.startsWith("limit.")) {
                limits.put(key, enabled ? limit : BigDecimal.ZERO);
            }
        }
        if (trialActive) {
            for (String feature : MODULE_PREFIXES.values()) {
                modules.put(feature, Boolean.TRUE);
            }
        }
    }

    // ------------------------------------------------------------------ pure rules

    /**
     * Maps a subscription to the license mode.
     *
     * @param sub the latest subscription, or {@code null} (legacy tenant -> FULL)
     * @param now reference instant
     */
    static LicenseMode licenseModeOf(SubscriptionInfo sub, OffsetDateTime now) {
        if (sub == null) {
            log.debug("Organizacao sem assinatura: licenca FULL (legado)");
            return LicenseMode.FULL;
        }
        String status = sub.status() == null ? "" : sub.status().toUpperCase(Locale.ROOT);
        return switch (status) {
            case "ACTIVE" -> LicenseMode.FULL;
            case "TRIALING" -> isTrialExpired(sub.trialEndsAt(), sub.currentPeriodEnd(), now)
                    ? LicenseMode.BILLING_ONLY : LicenseMode.FULL;
            case "PAST_DUE", "GRACE_PERIOD" -> LicenseMode.READ_ONLY;
            case "SUSPENDED" -> LicenseMode.BILLING_ONLY;
            case "CANCELED", "TERMINATED" -> LicenseMode.NONE;
            default -> LicenseMode.FULL;
        };
    }

    /**
     * A trial is expired when its end (trial end, else period end) is in the past.
     * With no end date at all the trial is considered still running.
     */
    public static boolean isTrialExpired(OffsetDateTime trialEnd, OffsetDateTime periodEnd,
            OffsetDateTime now) {
        OffsetDateTime end = trialEnd != null ? trialEnd : periodEnd;
        return end != null && !end.isAfter(now);
    }

    /**
     * Pure permission decision (no I/O).
     *
     * @param s        the access snapshot
     * @param screenId logical screen id, e.g. {@code financeiro/lancamentos}
     * @param action   action verb (view, create, edit, ...)
     * @return whether the action is allowed
     */
    public static boolean can(AccessSnapshot s, String screenId, String action) {
        if (s == null || s.role() == null) {
            return false;
        }
        String screen = screenId == null ? "" : screenId;
        String act = action == null ? "" : action.toLowerCase(Locale.ROOT);
        String role = s.role();

        if (screen.startsWith("super-admin/")) {
            return s.superAdmin();
        }

        boolean billingScreen = "admin/assinatura".equals(screen);
        if (billingScreen && ROLE_ADMIN.equals(role)) {
            return true;
        }
        LicenseMode mode = s.licenseMode() == null ? LicenseMode.FULL : s.licenseMode();
        switch (mode) {
            case NONE, BILLING_ONLY -> {
                return false;
            }
            case READ_ONLY -> {
                if (!"view".equals(act)) {
                    return false;
                }
            }
            case FULL -> { }
        }

        for (Map.Entry<String, String> e : MODULE_PREFIXES.entrySet()) {
            if (screen.startsWith(e.getKey())) {
                if (s.modules() != null && Boolean.FALSE.equals(s.modules().get(e.getValue()))) {
                    return false;
                }
                break;
            }
        }

        if (ROLE_ADMIN.equals(role)) {
            return true;
        }
        if (screen.startsWith("admin/")) {
            return false;
        }
        if (READ_ONLY_ROLES.contains(role)) {
            return "view".equals(act);
        }
        if ("entitlements".equals(screen) && "view".equals(act)) {
            return true;
        }
        return true;
    }

    private static Set<String> parseEmails(String csv) {
        if (csv == null || csv.isBlank()) {
            return Set.of();
        }
        Set<String> out = new HashSet<>();
        for (String part : csv.split(",")) {
            String e = part.trim().toLowerCase(Locale.ROOT);
            if (!e.isEmpty()) {
                out.add(e);
            }
        }
        return Set.copyOf(out);
    }
}
