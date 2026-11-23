package com.eip.platform.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.eip.platform.security.AccessPolicyService.AccessSnapshot;
import com.eip.platform.security.AccessPolicyService.SubscriptionInfo;
import com.eip.platform.security.LicenseGate.LicenseMode;

/** Pure unit tests for the access rules (a-e) of {@link AccessPolicyService#can}. */
class AccessPolicyRulesTest {

    private static AccessSnapshot snap(String role, boolean superAdmin, LicenseMode mode,
            Map<String, Boolean> modules) {
        return new AccessSnapshot(UUID.randomUUID(), UUID.randomUUID(), "N", "n@x.com", role,
                superAdmin, mode, null, modules, Map.of());
    }

    private static AccessSnapshot snap(String role, LicenseMode mode) {
        return snap(role, false, mode, Map.of());
    }

    @Test
    void noActiveMembershipDeniesEverything() {
        AccessSnapshot s = snap(null, true, LicenseMode.FULL, Map.of());
        assertThat(AccessPolicyService.can(s, "exportacoes/lista", "view")).isFalse();
        assertThat(AccessPolicyService.can(s, "super-admin/x", "view")).isFalse();
    }

    @Test
    void superAdminScreensRequireSuperAdmin() {
        assertThat(AccessPolicyService.can(snap("ADMINISTRADOR", LicenseMode.FULL),
                "super-admin/empresas", "view")).isFalse();
        assertThat(AccessPolicyService.can(snap("ANALISTA", true, LicenseMode.FULL, Map.of()),
                "super-admin/empresas", "view")).isTrue();
    }

    @Test
    void billingScreenAlwaysOpenForAdminEvenWhenLicenseBlocked() {
        for (LicenseMode mode : LicenseMode.values()) {
            AccessSnapshot admin = snap("ADMINISTRADOR", mode);
            assertThat(AccessPolicyService.can(admin, "admin/assinatura", "edit")).isTrue();
        }
        assertThat(AccessPolicyService.can(snap("ANALISTA", LicenseMode.NONE),
                "admin/assinatura", "view")).isFalse();
    }

    @Test
    void licenseModesRestrictActions() {
        assertThat(AccessPolicyService.can(snap("ADMINISTRADOR", LicenseMode.NONE),
                "exportacoes/lista", "view")).isFalse();
        assertThat(AccessPolicyService.can(snap("ADMINISTRADOR", LicenseMode.BILLING_ONLY),
                "exportacoes/lista", "view")).isFalse();
        AccessSnapshot ro = snap("ADMINISTRADOR", LicenseMode.READ_ONLY);
        assertThat(AccessPolicyService.can(ro, "exportacoes/lista", "view")).isTrue();
        assertThat(AccessPolicyService.can(ro, "exportacoes/lista", "create")).isFalse();
    }

    @Test
    void disabledModuleDeniesPrefixedScreensOnly() {
        AccessSnapshot s = snap("ADMINISTRADOR", false, LicenseMode.FULL,
                Map.of("mod.finance", false, "mod.export", true));
        assertThat(AccessPolicyService.can(s, "financeiro/contas", "view")).isFalse();
        assertThat(AccessPolicyService.can(s, "rentabilidade/x", "view")).isFalse();
        assertThat(AccessPolicyService.can(s, "exportacoes/lista", "view")).isTrue();
        assertThat(AccessPolicyService.can(s, "dashboard", "view")).isTrue();
    }

    @Test
    void roleRules() {
        assertThat(AccessPolicyService.can(snap("ADMINISTRADOR", LicenseMode.FULL),
                "admin/usuarios", "edit")).isTrue();
        for (String role : new String[] {"VISUALIZADOR", "LEITOR"}) {
            AccessSnapshot s = snap(role, LicenseMode.FULL);
            assertThat(AccessPolicyService.can(s, "exportacoes/lista", "view")).isTrue();
            assertThat(AccessPolicyService.can(s, "exportacoes/lista", "create")).isFalse();
            assertThat(AccessPolicyService.can(s, "admin/usuarios", "view")).isFalse();
        }
        AccessSnapshot analista = snap("ANALISTA", LicenseMode.FULL);
        assertThat(AccessPolicyService.can(analista, "exportacoes/lista", "create")).isTrue();
        assertThat(AccessPolicyService.can(analista, "admin/usuarios", "view")).isFalse();
        assertThat(AccessPolicyService.can(analista, "entitlements", "view")).isTrue();
        assertThat(AccessPolicyService.can(snap("VISUALIZADOR", LicenseMode.FULL),
                "entitlements", "view")).isTrue();
    }

    @Test
    void dataExportScreenAlwaysOpenForAdminOnly() {
        for (LicenseMode mode : LicenseMode.values()) {
            assertThat(AccessPolicyService.can(snap("ADMINISTRADOR", mode),
                    "admin/exportar-dados", "view")).isTrue();
        }
        assertThat(AccessPolicyService.can(snap("ANALISTA", LicenseMode.FULL),
                "admin/exportar-dados", "view")).isFalse();
    }

    private static SubscriptionInfo sub(String status, OffsetDateTime trialEnd,
            OffsetDateTime periodEnd, boolean gatewayLinked) {
        return new SubscriptionInfo(status, "BUSINESS", "EIP Business", trialEnd, periodEnd,
                gatewayLinked, false);
    }

    @Test
    void trialLicenseDependsOnEndDateAndGatewayLink() {
        OffsetDateTime now = OffsetDateTime.now();
        assertThat(AccessPolicyService.licenseModeOf(sub("TRIALING", now.plusDays(3), null, false), now))
                .isEqualTo(LicenseMode.FULL);
        assertThat(AccessPolicyService.licenseModeOf(sub("TRIALING", now.minusDays(1), null, false), now))
                .isEqualTo(LicenseMode.BILLING_ONLY);
        // Linked to the gateway: 3 more days of FULL, then READ_ONLY.
        assertThat(AccessPolicyService.licenseModeOf(sub("TRIALING", now.minusDays(2), null, true), now))
                .isEqualTo(LicenseMode.FULL);
        assertThat(AccessPolicyService.licenseModeOf(sub("TRIALING", now.minusDays(4), null, true), now))
                .isEqualTo(LicenseMode.READ_ONLY);
        // Trial end falls back to the period end.
        assertThat(AccessPolicyService.licenseModeOf(sub("TRIALING", null, now.plusHours(1), false), now))
                .isEqualTo(LicenseMode.FULL);
        assertThat(AccessPolicyService.licenseModeOf(null, now)).isEqualTo(LicenseMode.FULL);
    }

    @Test
    void statusLicenseModes() {
        OffsetDateTime now = OffsetDateTime.now();
        assertThat(AccessPolicyService.licenseModeOf(sub("ACTIVE", null, null, true), now))
                .isEqualTo(LicenseMode.FULL);
        assertThat(AccessPolicyService.licenseModeOf(sub("PAST_DUE", null, null, true), now))
                .isEqualTo(LicenseMode.READ_ONLY);
        assertThat(AccessPolicyService.licenseModeOf(sub("GRACE_PERIOD", null, null, true), now))
                .isEqualTo(LicenseMode.READ_ONLY);
        assertThat(AccessPolicyService.licenseModeOf(sub("SUSPENDED", null, null, true), now))
                .isEqualTo(LicenseMode.BILLING_ONLY);
        assertThat(AccessPolicyService.licenseModeOf(sub("CANCELED", null, now.plusDays(5), false), now))
                .isEqualTo(LicenseMode.FULL);
        assertThat(AccessPolicyService.licenseModeOf(sub("CANCELED", null, now.minusDays(1), false), now))
                .isEqualTo(LicenseMode.READ_ONLY);
        assertThat(AccessPolicyService.licenseModeOf(sub("CANCELED", null, null, false), now))
                .isEqualTo(LicenseMode.READ_ONLY);
        assertThat(AccessPolicyService.licenseModeOf(sub("TERMINATED", null, null, false), now))
                .isEqualTo(LicenseMode.NONE);
    }
}
