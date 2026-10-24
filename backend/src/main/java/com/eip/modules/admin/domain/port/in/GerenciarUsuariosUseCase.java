package com.eip.modules.admin.domain.port.in;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Inbound port for the admin "Gestao de Usuarios" screen. All operations are
 * scoped to the CURRENT organization: a user is an app_user plus its membership
 * (role/status/department/mfa) in that org. Creating a user provisions the
 * app_user (if new) and its membership; status changes flip the membership.
 */
public interface GerenciarUsuariosUseCase {

    List<UsuarioView> listar();

    UserMetrics metricas();

    UsuarioView criar(CriarUsuarioCommand command);

    List<UsuarioView> importar(List<CriarUsuarioCommand> commands);

    UsuarioView atualizar(UUID userId, AtualizarUsuarioCommand command);

    UsuarioView alterarStatus(UUID userId, String status);

    /** Issues a password-reset token for the user (returns true when created). */
    boolean resetarSenha(UUID userId);

    /** Read view mirroring the frontend AdminUser shape (UI status/role vocab). */
    record UsuarioView(
            UUID id,
            String name,
            String email,
            String role,
            String status,
            String empresa,
            String departamento,
            OffsetDateTime ultimoAcesso,
            OffsetDateTime dataCriacao,
            boolean mfaEnabled,
            int loginCount,
            String phone) {
    }

    /** Aggregate counts for the metric cards. */
    record UserMetrics(
            long totalUsers, long ativos, long inativos,
            long bloqueados, long pendentes, long mfaHabilitado) {
    }

    /** Create/invite command. role/status use the UI vocabulary. */
    record CriarUsuarioCommand(
            String name, String email, String role,
            String departamento, String phone, boolean mfaEnabled) {
    }

    /** Update command for editable fields. */
    record AtualizarUsuarioCommand(
            String name, String email, String role, String status,
            String departamento, String phone, boolean mfaEnabled) {
    }
}