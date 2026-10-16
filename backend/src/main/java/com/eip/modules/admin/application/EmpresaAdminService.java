package com.eip.modules.admin.application;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.admin.adapter.out.persistence.AdminOrgEntitlementEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminOrgEntitlementJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminOrganizationEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminOrganizationJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminPlanFeatureEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminPlanFeatureJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminSubscriptionEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminSubscriptionJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.LegalEntityEntity;
import com.eip.modules.admin.adapter.out.persistence.LegalEntityJpaRepository;
import com.eip.modules.admin.domain.port.in.GerenciarEmpresasUseCase;
import com.eip.modules.admin.domain.port.out.TenantProvisioningPort;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;
import com.eip.platform.tenant.OrganizationId;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Orchestrates empresa (tenant) lifecycle for the admin screen. An empresa maps
 * to an Organization + its LegalEntity (identity, not RLS), plus a Subscription
 * and an entitlement snapshot (both RLS-scoped). Creation also provisions a GCP
 * tenant via {@link TenantProvisioningPort}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmpresaAdminService implements GerenciarEmpresasUseCase {

    private final AdminOrganizationJpaRepository orgRepo;
    private final LegalEntityJpaRepository legalRepo;
    private final AdminSubscriptionJpaRepository subRepo;
    private final AdminPlanFeatureJpaRepository planFeatureRepo;
    private final AdminOrgEntitlementJpaRepository orgEntitlementRepo;
    private final TenantProvisioningPort tenantProvisioning;

    private static final Map<String, String> PLAN_ALIASES = Map.ofEntries(
            Map.entry("STARTER", "START"),
            Map.entry("START", "START"),
            Map.entry("PROFESSIONAL", "PRO"),
            Map.entry("PRO", "PRO"),
            Map.entry("BUSINESS", "BUSINESS"),
            Map.entry("ENTERPRISE", "ENTERPRISE"));

    private static final Map<String, String> PLAN_NAMES = Map.of(
            "START", "EIP Start",
            "BUSINESS", "EIP Business",
            "PRO", "EIP Pro",
            "ENTERPRISE", "EIP Enterprise");

    private static final Map<String, BigDecimal> PLAN_AMOUNTS = Map.of(
            "START", new BigDecimal("1290.00"),
            "BUSINESS", new BigDecimal("2490.00"),
            "PRO", new BigDecimal("4490.00"),
            "ENTERPRISE", new BigDecimal("6990.00"));

    private static String normalizePlan(String plano) {
        if (plano == null || plano.isBlank()) {
            return "BUSINESS";
        }
        return PLAN_ALIASES.getOrDefault(plano.trim().toUpperCase(), "BUSINESS");
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaView> listar() {
        List<EmpresaView> result = new ArrayList<>();
        for (AdminOrganizationEntity org : orgRepo.findAll()) {
            LegalEntityEntity legal = legalRepo.findFirstByOrganizationId(org.getId()).orElse(null);
            result.add(toView(org, legal, null));
        }
        return result;
    }

    @Override
    @Transactional
    public EmpresaView criar(CriarEmpresaCommand c) {
        String planCode = normalizePlan(c.plano());
        UUID orgId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        AdminOrganizationEntity org = new AdminOrganizationEntity();
        org.setId(orgId);
        org.setName(c.nomeFantasia() != null && !c.nomeFantasia().isBlank()
                ? c.nomeFantasia() : c.razaoSocial());
        org.setStatus("ACTIVE");
        org.setCreatedAt(now);
        String gcpTenantId = tenantProvisioning.provisionTenant(orgId, org.getName());
        org.setGcpTenantId(gcpTenantId);
        orgRepo.save(org);

        LegalEntityEntity legal = new LegalEntityEntity();
        legal.setId(UUID.randomUUID());
        legal.setOrganizationId(orgId);
        legal.setCnpj(c.cnpj());
        legal.setRazaoSocial(c.razaoSocial());
        legal.setNomeFantasia(c.nomeFantasia());
        legal.setTipo(c.tipo());
        legal.setPais(c.pais());
        legal.setEstado(c.estado());
        legal.setCidade(c.cidade());
        legal.setResponsavel(c.responsavel());
        legal.setEmail(c.email());
        legal.setTelefone(c.telefone());
        legal.setCreatedAt(now);
        legalRepo.save(legal);

        applyTenantScopedData(orgId, planCode, now);

        log.info("Empresa criada: org={} plano={} gcpTenant={}", orgId, planCode, gcpTenantId);
        return toView(org, legal, planCode);
    }

    @Override
    @Transactional
    public EmpresaView atualizar(UUID id, AtualizarEmpresaCommand c) {
        AdminOrganizationEntity org = orgRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa nao encontrada: " + id));
        LegalEntityEntity legal = legalRepo.findFirstByOrganizationId(id).orElseGet(() -> {
            LegalEntityEntity le = new LegalEntityEntity();
            le.setId(UUID.randomUUID());
            le.setOrganizationId(id);
            le.setCreatedAt(OffsetDateTime.now());
            return le;
        });
        if (c.nomeFantasia() != null) {
            org.setName(!c.nomeFantasia().isBlank() ? c.nomeFantasia() : org.getName());
        }
        orgRepo.save(org);

        legal.setCnpj(c.cnpj());
        legal.setRazaoSocial(c.razaoSocial());
        legal.setNomeFantasia(c.nomeFantasia());
        legal.setTipo(c.tipo());
        legal.setPais(c.pais());
        legal.setEstado(c.estado());
        legal.setCidade(c.cidade());
        legal.setResponsavel(c.responsavel());
        legal.setEmail(c.email());
        legal.setTelefone(c.telefone());
        legalRepo.save(legal);

        String planCode = normalizePlan(c.plano());
        applyTenantScopedData(id, planCode, OffsetDateTime.now());

        return toView(org, legal, planCode);
    }

    @Override
    @Transactional
    public EmpresaView alterarStatus(UUID id, String status) {
        AdminOrganizationEntity org = orgRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa nao encontrada: " + id));
        org.setStatus(mapStatusToOrg(status));
        orgRepo.save(org);
        LegalEntityEntity legal = legalRepo.findFirstByOrganizationId(id).orElse(null);
        return toView(org, legal, null);
    }

    private void applyTenantScopedData(UUID orgId, String planCode, OffsetDateTime now) {
        OrganizationContext previous = OrganizationContextHolder.currentOrNull();
        try {
            OrganizationContextHolder.set(OrganizationContext.authenticated(
                    OrganizationId.of(orgId.toString()),
                    previous != null ? previous.userId() : null));

            AdminSubscriptionEntity sub = subRepo.findFirstByOrganizationId(orgId)
                    .orElseGet(AdminSubscriptionEntity::new);
            if (sub.getId() == null) {
                sub.setId(UUID.randomUUID());
                sub.setCreatedAt(now);
            }
            sub.setOrganizationId(orgId);
            sub.setPlanCode(planCode);
            sub.setPlanName(PLAN_NAMES.getOrDefault(planCode, planCode));
            sub.setBillingInterval("MONTHLY");
            sub.setAmount(PLAN_AMOUNTS.getOrDefault(planCode, BigDecimal.ZERO));
            sub.setStatus("ACTIVE");
            sub.setCurrentPeriodStart(now);
            sub.setCurrentPeriodEnd(now.plusDays(30));
            sub.setCancelAtPeriodEnd(false);
            sub.setUpdatedAt(now);
            subRepo.save(sub);

            List<AdminPlanFeatureEntity> features = planFeatureRepo.findByPlanCode(planCode);
            for (AdminPlanFeatureEntity f : features) {
                AdminOrgEntitlementEntity e = new AdminOrgEntitlementEntity();
                e.setOrganizationId(orgId);
                e.setFeatureKey(f.getFeatureKey());
                e.setEnabled(f.isEnabled());
                e.setLimitValue(f.getLimitValue());
                e.setAppliedPlan(planCode);
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

    private EmpresaView toView(AdminOrganizationEntity org, LegalEntityEntity legal, String planCode) {
        List<String> modulos = new ArrayList<>();
        if (planCode != null) {
            for (AdminPlanFeatureEntity f : planFeatureRepo.findByPlanCode(planCode)) {
                if (f.getFeatureKey().startsWith("mod.") && f.isEnabled()) {
                    modulos.add(f.getFeatureKey().substring("mod.".length()));
                }
            }
        }
        return new EmpresaView(
                org.getId(),
                legal != null ? legal.getRazaoSocial() : org.getName(),
                legal != null ? legal.getNomeFantasia() : org.getName(),
                legal != null ? legal.getCnpj() : null,
                legal != null ? legal.getTipo() : null,
                mapStatusToUi(org.getStatus()),
                legal != null ? legal.getPais() : null,
                legal != null ? legal.getEstado() : null,
                legal != null ? legal.getCidade() : null,
                legal != null ? legal.getResponsavel() : null,
                legal != null ? legal.getEmail() : null,
                legal != null ? legal.getTelefone() : null,
                planCode,
                org.getGcpTenantId(),
                org.getCreatedAt(),
                modulos);
    }

    private static String mapStatusToOrg(String uiStatus) {
        if (uiStatus == null) {
            return "ACTIVE";
        }
        return switch (uiStatus.toUpperCase()) {
            case "ATIVA" -> "ACTIVE";
            case "SUSPENSA" -> "SUSPENDED";
            case "BLOQUEADA" -> "BLOCKED";
            case "EM_ONBOARDING" -> "ONBOARDING";
            default -> uiStatus.toUpperCase();
        };
    }

    private static String mapStatusToUi(String orgStatus) {
        if (orgStatus == null) {
            return "ATIVA";
        }
        return switch (orgStatus.toUpperCase()) {
            case "ACTIVE" -> "ATIVA";
            case "SUSPENDED" -> "SUSPENSA";
            case "BLOCKED" -> "BLOQUEADA";
            case "ONBOARDING" -> "EM_ONBOARDING";
            default -> "ATIVA";
        };
    }
}
