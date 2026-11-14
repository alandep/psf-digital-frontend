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
    void trialLicenseDependsOnEndDate() {
        OffsetDateTime now = OffsetDateTime.now();
        SubscriptionInfo active = new SubscriptionInfo("TRIALING", "BUSINESS", "B",
                now.plusDays(3), null);
        SubscriptionInfo expired = new SubscriptionInfo("TRIALING", "BUSINESS", "B",
                now.minusDays(1), null);
        assertThat(AccessPolicyService.licenseModeOf(active, now)).isEqualTo(LicenseMode.FULL);
        assertThat(AccessPolicyService.licenseModeOf(expired, now)).isEqualTo(LicenseMode.BILLING_ONLY);
        assertThat(AccessPolicyService.licenseModeOf(null, now)).isEqualTo(LicenseMode.FULL);
        assertThat(AccessPolicyService.licenseModeOf(
                new SubscriptionInfo("PAST_DUE", "P", "P", null, null), now))
                .isEqualTo(LicenseMode.READ_ONLY);
        assertThat(AccessPolicyService.licenseModeOf(
                new SubscriptionInfo("CANCELED", "P", "P", null, null), now))
                .isEqualTo(LicenseMode.NONE);
    }
}
