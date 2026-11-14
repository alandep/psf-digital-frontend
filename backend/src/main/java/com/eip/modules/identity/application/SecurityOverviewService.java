package com.eip.modules.identity.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.eip.modules.identity.domain.model.SecurityEventType;
import com.eip.modules.identity.domain.model.SecurityEventView;
import com.eip.modules.identity.domain.port.out.AuthAuditPort;
import com.eip.modules.identity.domain.port.out.CredentialRepositoryPort;
import com.eip.modules.identity.domain.port.out.UserRepositoryPort;

import lombok.RequiredArgsConstructor;

/**
 * Read side of the "Seguranca" screen: credential/MFA overview and the user's
 * recent security events with pt-BR labels.
 */
@Service
@RequiredArgsConstructor
public class SecurityOverviewService {

    static final int EVENTS_LIMIT = 50;

    private final CredentialRepositoryPort credentialRepository;
    private final UserRepositoryPort userRepository;
    private final AuthAuditPort auditPort;
    private final MfaService mfaService;

    /**
     * Security overview of the current user.
     *
     * @param passwordChangedAt       last password change ({@code null} if unknown)
     * @param mfaStatus               {@code ENABLED} when an authenticator app is active, else {@code DISABLED}
     * @param authenticatorConfigured whether an authenticator app is active
     * @param recoveryCodesRemaining  unused recovery codes
     * @param emailMfa                e-mail codes are always available as a second factor
     * @param emailMasked             masked e-mail receiving the codes
     */
    public record SecurityOverview(OffsetDateTime passwordChangedAt, String mfaStatus,
                                   boolean authenticatorConfigured, int recoveryCodesRemaining,
                                   boolean emailMfa, String emailMasked) {
    }

    /**
     * A security event ready for display.
     *
     * @param id         event id
     * @param type       event code
     * @param label      pt-BR description
     * @param ip         client IP (may be {@code null})
     * @param occurredAt when it happened
     */
    public record SecurityEventItem(String id, String type, String label, String ip,
                                    OffsetDateTime occurredAt) {
    }

    /** @return the security overview of the user. */
    public SecurityOverview overview(UUID userId) {
        MfaService.MfaStatus status = mfaService.status(userId);
        OffsetDateTime changedAt = credentialRepository.passwordChangedAt(userId).orElse(null);
        String emailMasked = userRepository.findById(userId)
                .map(u -> Digests.maskEmail(u.email()))
                .orElse(null);
        return new SecurityOverview(
                changedAt,
                status.totpActive() ? "ENABLED" : "DISABLED",
                status.totpActive(),
                status.recoveryCodesRemaining(),
                true,
                emailMasked);
    }

    /** @return the last {@value #EVENTS_LIMIT} security events of the user, newest first. */
    public List<SecurityEventItem> events(UUID userId) {
        return auditPort.recentEvents(userId, EVENTS_LIMIT).stream()
                .map(SecurityOverviewService::toItem)
                .toList();
    }

    private static SecurityEventItem toItem(SecurityEventView view) {
        return new SecurityEventItem(
                view.id() == null ? null : view.id().toString(),
                view.type(),
                label(view.type()),
                view.ip(),
                view.occurredAt());
    }

    /** @return the pt-BR label of an event type (the type itself when unknown). */
    static String label(String type) {
        if (type == null) {
            return "";
        }
        return switch (type) {
            case SecurityEventType.LOGIN_SUCCEEDED -> "Login realizado";
            case SecurityEventType.LOGIN_FAILED -> "Tentativa de login com senha incorreta";
            case SecurityEventType.ACCOUNT_LOCKED -> "Conta bloqueada por excesso de tentativas";
            case SecurityEventType.MFA_SUCCEEDED -> "Verificação em duas etapas concluída";
            case SecurityEventType.MFA_FAILED -> "Código de verificação inválido";
            case SecurityEventType.MFA_EMAIL_SENT -> "Código de verificação enviado por e-mail";
            case SecurityEventType.RECOVERY_CODE_USED -> "Código de recuperação utilizado";
            case SecurityEventType.MFA_ENABLED -> "Aplicativo autenticador ativado";
            case SecurityEventType.MFA_DISABLED -> "Aplicativo autenticador desativado";
            case SecurityEventType.MFA_RESET_BY_ADMIN -> "MFA redefinido pelo administrador";
            case SecurityEventType.RECOVERY_CODES_REGENERATED -> "Novos códigos de recuperação gerados";
            case SecurityEventType.PASSWORD_CHANGED -> "Senha alterada";
            case SecurityEventType.PASSWORD_RESET_REQUESTED -> "Recuperação de senha solicitada";
            case SecurityEventType.SESSION_REVOKED -> "Sessão encerrada";
            case SecurityEventType.LOGOUT -> "Logout";
            default -> type;
        };
    }
}
