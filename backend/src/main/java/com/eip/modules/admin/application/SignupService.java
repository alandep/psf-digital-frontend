package com.eip.modules.admin.application;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.admin.adapter.out.persistence.AdminAppUserEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminAppUserJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminMembershipEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminMembershipJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminOrgEntitlementEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminOrgEntitlementJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminOrganizationEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminOrganizationJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminPlanFeatureEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminPlanFeatureJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminSubscriptionEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminSubscriptionJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminUserCredentialEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminUserCredentialJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.LegalEntityEntity;
import com.eip.modules.admin.adapter.out.persistence.LegalEntityJpaRepository;
import com.eip.modules.admin.domain.port.out.TenantProvisioningPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.eip.platform.tenant.OrganizationId;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Public self-service signup ("Experimentar Gratis"). Provisions a brand-new
 * tenant and its first admin user atomically: app_user + user_credential +
 * organization (+ GCP tenant) + legal_entity + organization_membership +
 * a TRIALING subscription (14 days, BUSINESS) + the plan entitlement snapshot.
 *
 * <p>RLS: identity/organization tables are not RLS-scoped; the subscription and
 * entitlement rows are RLS-forced, so they are written while the thread''s org
 * context is bound to the new org (see {@link #applyTenantScopedData}).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SignupService {

    /** Plan assigned to self-service trials (14-day BUSINESS). */
    private static final String TRIAL_PLAN = "BUSINESS";
    private static final int TRIAL_DAYS = 14;

    private final AdminAppUserJpaRepository userRepo;
    private final AdminUserCredentialJpaRepository credentialRepo;
    private final AdminOrganizationJpaRepository orgRepo;
    private final LegalEntityJpaRepository legalRepo;
    private final AdminMembershipJpaRepository membershipRepo;
    private final AdminSubscriptionJpaRepository subRepo;
    private final AdminPlanFeatureJpaRepository planFeatureRepo;
    private final AdminOrgEntitlementJpaRepository orgEntitlementRepo;
    private final TenantProvisioningPort tenantProvisioning;
    private final PasswordEncoder passwordEncoder;

    /** Input for a signup. */
    public record SignupCommand(
            String name, String cpf, String email, String phone, String password,
            String cnpj, String razaoSocial, String nomeFantasia, String segmento,
            List<String> goals) {
    }

    /** Result: the created tenant + user, for the controller to bind the session. */
    public record SignupResult(UUID organizationId, UUID userId, String gcpTenantId,
                               OffsetDateTime trialEnd) {
    }

    /** @return whether a CNPJ is still available (not already registered). */
    @Transactional(readOnly = true)
    public boolean cnpjAvailable(String cnpj) {
        String digits = digitsOnly(cnpj);
        if (digits.isEmpty()) {
            return true;
        }
        return legalRepo.findAll().stream()
                .noneMatch(le -> digits.equals(digitsOnly(le.getCnpj())));
    }

    @Transactional
    public SignupResult signup(SignupCommand c) {
        validate(c);

        String email = c.email().trim().toLowerCase();
        if (userRepo.findByEmail(email).isPresent()) {
            throw new BusinessRuleException("Ja existe uma conta com este e-mail.");
        }
        if (!cnpjAvailable(c.cnpj())) {
            throw new BusinessRuleException("Esta empresa (CNPJ) ja possui uma organizacao no EIP.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        UUID userId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        OffsetDateTime trialEnd = now.plusDays(TRIAL_DAYS);

        // 1) User (identity, not RLS).
        AdminAppUserEntity user = new AdminAppUserEntity();
        user.setId(userId);
        user.setName(c.name());
        user.setEmail(email);
        user.setCpfLookupHash(cpfHash(c.cpf()));
        user.setPhone(digitsOnly(c.phone()));
        user.setStatus("ACTIVE");
        user.setCreatedAt(now);
        userRepo.save(user);

        AdminUserCredentialEntity cred = new AdminUserCredentialEntity();
        cred.setUserId(userId);
        cred.setPasswordHash(passwordEncoder.encode(c.password()));
        cred.setMustChangePassword(false);
        cred.setFailedAttempts(0);
        cred.setUpdatedAt(now);
        credentialRepo.save(cred);

        // 2) Organization (identity, not RLS) + GCP tenant provisioning.
        AdminOrganizationEntity org = new AdminOrganizationEntity();
        org.setId(orgId);
        org.setName(c.nomeFantasia() != null && !c.nomeFantasia().isBlank()
                ? c.nomeFantasia() : c.razaoSocial());
        org.setOwnerUserId(userId);
        org.setStatus("ACTIVE");
        org.setCreatedAt(now);
        String gcpTenantId = tenantProvisioning.provisionTenant(orgId, org.getName());
        org.setGcpTenantId(gcpTenantId);
        orgRepo.save(org);

        // 3) Legal entity (identity, not RLS).
        LegalEntityEntity legal = new LegalEntityEntity();
        legal.setId(UUID.randomUUID());
        legal.setOrganizationId(orgId);
        legal.setCnpj(c.cnpj());
        legal.setRazaoSocial(c.razaoSocial());
        legal.setNomeFantasia(c.nomeFantasia());
        legal.setSegmento(c.segmento());
        legal.setPais("Brasil");
        legal.setResponsavel(c.name());
        legal.setEmail(email);
        legal.setTelefone(digitsOnly(c.phone()));
        legal.setCreatedAt(now);
        legalRepo.save(legal);

        // 4) Membership: the signup user is the org ADMIN.
        AdminMembershipEntity membership = new AdminMembershipEntity();
        membership.setId(UUID.randomUUID());
        membership.setOrganizationId(orgId);
        membership.setUserId(userId);
        membership.setRole("ADMINISTRADOR");
        membership.setStatus("ACTIVE");
        membership.setJoinedAt(now);
        membershipRepo.save(membership);

        // 5) Subscription (TRIALING) + entitlement snapshot (RLS-scoped).
        applyTenantScopedData(orgId, now, trialEnd);

        log.info("Signup concluido: user={} org={} plano={} gcpTenant={}",
                userId, orgId, TRIAL_PLAN, gcpTenantId);
        return new SignupResult(orgId, userId, gcpTenantId, trialEnd);
    }

    private void applyTenantScopedData(UUID orgId, OffsetDateTime now, OffsetDateTime trialEnd) {
        OrganizationContext previous = OrganizationContextHolder.currentOrNull();
        try {
            OrganizationContextHolder.set(OrganizationContext.authenticated(
                    OrganizationId.of(orgId.toString()), null));

            AdminSubscriptionEntity sub = new AdminSubscriptionEntity();
            sub.setId(UUID.randomUUID());
            sub.setOrganizationId(orgId);
            sub.setPlanCode(TRIAL_PLAN);
            sub.setPlanName("EIP Business");
            sub.setBillingInterval("MONTHLY");
            sub.setAmount(new BigDecimal("2490.00"));
            sub.setStatus("TRIALING");
            sub.setCurrentPeriodStart(now);
            sub.setCurrentPeriodEnd(trialEnd);
            sub.setCancelAtPeriodEnd(false);
            sub.setCreatedAt(now);
            sub.setUpdatedAt(now);
            subRepo.save(sub);

            List<AdminPlanFeatureEntity> features = planFeatureRepo.findByPlanCode(TRIAL_PLAN);
            for (AdminPlanFeatureEntity f : features) {
                AdminOrgEntitlementEntity e = new AdminOrgEntitlementEntity();
                e.setOrganizationId(orgId);
                e.setFeatureKey(f.getFeatureKey());
                e.setEnabled(f.isEnabled());
                e.setLimitValue(f.getLimitValue());
                e.setAppliedPlan(TRIAL_PLAN);
                e.setUpdatedAt(now);
                orgEntitlementRepo.save(e);
            }
        } finally {
            if (previous != null) {
                OrganizationContextHolder.set(previous);
            } else {
                OrganizationContextHolder.clear();
            }
        }
    }

    private void validate(SignupCommand c) {
        if (isBlank(c.name())) {
            throw new BusinessRuleException("Nome e obrigatorio.");
        }
        if (isBlank(c.email()) || !c.email().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new BusinessRuleException("E-mail invalido.");
        }
        if (isBlank(c.password()) || c.password().length() < 8) {
            throw new BusinessRuleException("A senha deve ter ao menos 8 caracteres.");
        }
        if (!isValidCpf(c.cpf())) {
            throw new BusinessRuleException("CPF invalido.");
        }
        if (!isValidCnpj(c.cnpj())) {
            throw new BusinessRuleException("CNPJ invalido.");
        }
        if (isBlank(c.razaoSocial())) {
            throw new BusinessRuleException("Razao social e obrigatoria.");
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String digitsOnly(String s) {
        return s == null ? "" : s.replaceAll("\\D", "");
    }

    /** Deterministic SHA-256 lookup hash of the CPF digits (matches the security model). */
    private static String cpfHash(String cpf) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(digitsOnly(cpf).getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception ex) {
            return digitsOnly(cpf);
        }
    }

    /** Validates a Brazilian CPF (11 digits + check digits). */
    static boolean isValidCpf(String raw) {
        String cpf = digitsOnly(raw);
        if (cpf.length() != 11 || cpf.chars().distinct().count() == 1) {
            return false;
        }
        int[] d = cpf.chars().map(ch -> ch - '0').toArray();
        for (int t = 9; t < 11; t++) {
            int sum = 0;
            for (int i = 0; i < t; i++) {
                sum += d[i] * ((t + 1) - i);
            }
            int check = (sum * 10) % 11;
            if (check == 10) {
                check = 0;
            }
            if (check != d[t]) {
                return false;
            }
        }
        return true;
    }

    /** Validates a Brazilian CNPJ (14 digits + check digits). */
    static boolean isValidCnpj(String raw) {
        String cnpj = digitsOnly(raw);
        if (cnpj.length() != 14 || cnpj.chars().distinct().count() == 1) {
            return false;
        }
        int[] d = cnpj.chars().map(ch -> ch - '0').toArray();
        int[] w1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] w2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int sum1 = 0;
        for (int i = 0; i < 12; i++) {
            sum1 += d[i] * w1[i];
        }
        int c1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);
        if (c1 != d[12]) {
            return false;
        }
        int sum2 = 0;
        for (int i = 0; i < 13; i++) {
            sum2 += d[i] * w2[i];
        }
        int c2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);
        return c2 == d[13];
    }
}
