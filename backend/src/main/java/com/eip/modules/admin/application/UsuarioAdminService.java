package com.eip.modules.admin.application;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.admin.adapter.out.persistence.AdminAppUserEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminAppUserJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminMembershipEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminMembershipJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.AdminUserCredentialEntity;
import com.eip.modules.admin.adapter.out.persistence.AdminUserCredentialJpaRepository;
import com.eip.modules.admin.adapter.out.persistence.LegalEntityEntity;
import com.eip.modules.admin.adapter.out.persistence.LegalEntityJpaRepository;
import com.eip.modules.admin.domain.port.in.GerenciarUsuariosUseCase;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Manages the users of the CURRENT organization for the admin screen. A user is
 * an app_user plus its organization_membership in this org (role/status/
 * department/mfa live on the membership, since a user may belong to several
 * orgs). Identity tables are not RLS-scoped, so queries are explicitly filtered
 * by the current org id obtained from the request context.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioAdminService implements GerenciarUsuariosUseCase {

    private final AdminAppUserJpaRepository userRepo;
    private final AdminUserCredentialJpaRepository credentialRepo;
    private final AdminMembershipJpaRepository membershipRepo;
    private final LegalEntityJpaRepository legalRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioView> listar() {
        UUID org = requireOrg();
        String empresa = empresaName(org);
        List<UsuarioView> result = new ArrayList<>();
        for (AdminMembershipEntity m : membershipRepo.findByOrganizationId(org)) {
            AdminAppUserEntity u = userRepo.findById(m.getUserId()).orElse(null);
            if (u == null) {
                continue;
            }
            result.add(toView(u, m, empresa));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public UserMetrics metricas() {
        List<UsuarioView> users = listar();
        long total = users.size();
        long ativos = users.stream().filter(u -> "ATIVO".equals(u.status())).count();
        long inativos = users.stream().filter(u -> "INATIVO".equals(u.status())).count();
        long bloqueados = users.stream().filter(u -> "BLOQUEADO".equals(u.status())).count();
        long pendentes = users.stream().filter(u -> "PENDENTE".equals(u.status())).count();
        long mfa = users.stream().filter(UsuarioView::mfaEnabled).count();
        return new UserMetrics(total, ativos, inativos, bloqueados, pendentes, mfa);
    }

    @Override
    @Transactional
    public UsuarioView criar(CriarUsuarioCommand c) {
        UUID org = requireOrg();
        validateCreate(c);
        String email = c.email().trim().toLowerCase();

        AdminAppUserEntity user = userRepo.findByEmail(email).orElse(null);
        OffsetDateTime now = OffsetDateTime.now();
        if (user == null) {
            user = new AdminAppUserEntity();
            user.setId(UUID.randomUUID());
            user.setName(c.name());
            user.setEmail(email);
            user.setPhone(digits(c.phone()));
            user.setStatus("ACTIVE");
            user.setCreatedAt(now);
            user.setLoginCount(0);
            userRepo.save(user);

            // Temporary random password; the user sets a real one via reset link.
            AdminUserCredentialEntity cred = new AdminUserCredentialEntity();
            cred.setUserId(user.getId());
            cred.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            cred.setMustChangePassword(true);
            cred.setFailedAttempts(0);
            cred.setUpdatedAt(now);
            credentialRepo.save(cred);
        } else {
            // Existing user being added to this org: keep name/phone in sync.
            user.setName(c.name());
            if (c.phone() != null && !c.phone().isBlank()) {
                user.setPhone(digits(c.phone()));
            }
            userRepo.save(user);
        }

        if (membershipRepo.findByOrganizationIdAndUserId(org, user.getId()).isPresent()) {
            throw new BusinessRuleException("Este usuario ja pertence a sua empresa.");
        }

        AdminMembershipEntity m = new AdminMembershipEntity();
        m.setId(UUID.randomUUID());
        m.setOrganizationId(org);
        m.setUserId(user.getId());
        m.setRole(c.role() == null || c.role().isBlank() ? "ANALISTA" : c.role().trim().toUpperCase());
        m.setStatus("PENDING"); // invited; becomes ACTIVE on first login
        m.setDepartment(c.departamento());
        m.setMfaEnabled(c.mfaEnabled());
        m.setJoinedAt(now);
        membershipRepo.save(m);

        log.info("Usuario adicionado a org {}: user={} role={}", org, user.getId(), m.getRole());
        return toView(user, m, empresaName(org));
    }

    @Override
    @Transactional
    public List<UsuarioView> importar(List<CriarUsuarioCommand> commands) {
        List<UsuarioView> created = new ArrayList<>();
        for (CriarUsuarioCommand c : commands) {
            try {
                created.add(criar(c));
            } catch (RuntimeException ex) {
                log.warn("Linha de importacao ignorada ({}): {}", c.email(), ex.getMessage());
            }
        }
        return created;
    }

    @Override
    @Transactional
    public UsuarioView atualizar(UUID userId, AtualizarUsuarioCommand c) {
        UUID org = requireOrg();
        AdminMembershipEntity m = membershipRepo.findByOrganizationIdAndUserId(org, userId)
                .orElseThrow(() -> new BusinessRuleException("Usuario nao encontrado nesta empresa."));
        AdminAppUserEntity u = userRepo.findById(userId)
                .orElseThrow(() -> new BusinessRuleException("Usuario nao encontrado."));

        if (c.name() != null && !c.name().isBlank()) {
            u.setName(c.name());
        }
        if (c.phone() != null) {
            u.setPhone(digits(c.phone()));
        }
        userRepo.save(u);

        if (c.role() != null && !c.role().isBlank()) {
            m.setRole(c.role().trim().toUpperCase());
        }
        if (c.status() != null && !c.status().isBlank()) {
            m.setStatus(uiToMembershipStatus(c.status()));
        }
        m.setDepartment(c.departamento());
        m.setMfaEnabled(c.mfaEnabled());
        membershipRepo.save(m);

        return toView(u, m, empresaName(org));
    }

    @Override
    @Transactional
    public UsuarioView alterarStatus(UUID userId, String status) {
        UUID org = requireOrg();
        AdminMembershipEntity m = membershipRepo.findByOrganizationIdAndUserId(org, userId)
                .orElseThrow(() -> new BusinessRuleException("Usuario nao encontrado nesta empresa."));
        m.setStatus(uiToMembershipStatus(status));
        membershipRepo.save(m);
        AdminAppUserEntity u = userRepo.findById(userId).orElseThrow();
        return toView(u, m, empresaName(org));
    }

    @Override
    @Transactional
    public boolean resetarSenha(UUID userId) {
        UUID org = requireOrg();
        // Ensure the user belongs to the admin's org before issuing a reset.
        membershipRepo.findByOrganizationIdAndUserId(org, userId)
                .orElseThrow(() -> new BusinessRuleException("Usuario nao encontrado nesta empresa."));
        AdminUserCredentialEntity cred = credentialRepo.findById(userId)
                .orElseGet(() -> {
                    AdminUserCredentialEntity c = new AdminUserCredentialEntity();
                    c.setUserId(userId);
                    c.setFailedAttempts(0);
                    return c;
                });
        // Force a password change on next login; a real impl also emails a token.
        cred.setMustChangePassword(true);
        cred.setUpdatedAt(OffsetDateTime.now());
        credentialRepo.save(cred);
        log.info("Reset de senha solicitado para user={} (org={})", userId, org);
        return true;
    }

    // --- helpers -----------------------------------------------------------

    private UUID requireOrg() {
        OrganizationContext ctx = OrganizationContextHolder.currentOrNull();
        if (ctx == null) {
            throw new BusinessRuleException("Sessao sem organizacao.");
        }
        return ctx.organizationId().value();
    }

    private String empresaName(UUID org) {
        return legalRepo.findFirstByOrganizationId(org)
                .map(LegalEntityEntity::getNomeFantasia)
                .filter(n -> n != null && !n.isBlank())
                .orElseGet(() -> legalRepo.findFirstByOrganizationId(org)
                        .map(LegalEntityEntity::getRazaoSocial)
                        .orElse("Minha Empresa"));
    }

    private void validateCreate(CriarUsuarioCommand c) {
        if (c.name() == null || c.name().isBlank()) {
            throw new BusinessRuleException("Nome e obrigatorio.");
        }
        if (c.email() == null || !c.email().matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new BusinessRuleException("E-mail invalido.");
        }
    }

    private static String digits(String s) {
        return s == null ? "" : s.replaceAll("\\D", "");
    }

    private UsuarioView toView(AdminAppUserEntity u, AdminMembershipEntity m, String empresa) {
        return new UsuarioView(
                u.getId(),
                u.getName(),
                u.getEmail(),
                m.getRole(),
                membershipToUiStatus(m.getStatus()),
                empresa,
                m.getDepartment(),
                u.getLastLoginAt(),
                u.getCreatedAt(),
                m.isMfaEnabled(),
                u.getLoginCount(),
                formatPhone(u.getPhone()));
    }

    /** Membership status -> UI status vocabulary. */
    private static String membershipToUiStatus(String s) {
        if (s == null) {
            return "PENDENTE";
        }
        return switch (s.toUpperCase()) {
            case "ACTIVE" -> "ATIVO";
            case "INACTIVE" -> "INATIVO";
            case "BLOCKED" -> "BLOQUEADO";
            case "PENDING" -> "PENDENTE";
            default -> "PENDENTE";
        };
    }

    /** UI status -> membership status. */
    private static String uiToMembershipStatus(String s) {
        if (s == null) {
            return "PENDING";
        }
        return switch (s.toUpperCase()) {
            case "ATIVO" -> "ACTIVE";
            case "INATIVO" -> "INACTIVE";
            case "BLOQUEADO" -> "BLOCKED";
            case "PENDENTE" -> "PENDING";
            default -> "PENDING";
        };
    }

    /** Best-effort BR phone formatting for display. */
    private static String formatPhone(String digits) {
        if (digits == null) {
            return "";
        }
        String d = digits.replaceAll("\\D", "");
        if (d.length() == 11) {
            return "(" + d.substring(0, 2) + ") " + d.substring(2, 7) + "-" + d.substring(7);
        }
        if (d.length() == 10) {
            return "(" + d.substring(0, 2) + ") " + d.substring(2, 6) + "-" + d.substring(6);
        }
        return digits;
    }
}
