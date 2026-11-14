package com.eip.modules.identity.application;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.OptionalLong;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.eip.modules.identity.domain.model.AppUser;
import com.eip.modules.identity.domain.model.SecurityEventType;
import com.eip.modules.identity.domain.model.TotpFactor;
import com.eip.modules.identity.domain.port.out.AuthAuditPort;
import com.eip.modules.identity.domain.port.out.MfaRepositoryPort;
import com.eip.modules.identity.domain.port.out.UserRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * MFA use cases: TOTP authenticator enrollment/verification/removal and
 * single-use recovery codes. Secrets are encrypted with {@link SecretCipher};
 * recovery codes are stored only as hashes. Codes and secrets are never logged.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MfaService {

    static final String ISSUER = "EIP";

    private final MfaRepositoryPort mfaRepository;
    private final UserRepositoryPort userRepository;
    private final AuthAuditPort auditPort;
    private final SecretCipher cipher;

    /**
     * MFA state of a user.
     *
     * @param totpActive             whether an authenticator app is active
     * @param recoveryCodesRemaining unused recovery codes
     */
    public record MfaStatus(boolean totpActive, int recoveryCodesRemaining) {
    }

    /**
     * Data needed by the SPA to render the enrollment QR code.
     *
     * @param secret      Base32 secret (for manual entry)
     * @param otpauthUri  provisioning URI (QR code content)
     */
    public record TotpEnrollment(String secret, String otpauthUri) {
    }

    /** @return the MFA status of the user. */
    public MfaStatus status(UUID userId) {
        boolean active = hasActiveTotp(userId);
        return new MfaStatus(active, active ? mfaRepository.remainingRecoveryCodes(userId) : 0);
    }

    /** @return {@code true} when the user has a confirmed TOTP authenticator. */
    public boolean hasActiveTotp(UUID userId) {
        return mfaRepository.findTotp(userId).map(TotpFactor::active).orElse(false);
    }

    /** Starts (or restarts) the enrollment of an authenticator app. */
    public TotpEnrollment startTotpEnrollment(UUID userId) {
        if (hasActiveTotp(userId)) {
            throw new BusinessRuleException(
                    "Autenticador ja configurado. Desative-o antes de configurar um novo.");
        }
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));
        String secret = TotpCodec.newSecretBase32();
        mfaRepository.savePending(userId, cipher.encrypt(secret), cipher.keyVersion());
        return new TotpEnrollment(secret, TotpCodec.otpauthUri(ISSUER, user.email(), secret));
    }

    /**
     * Confirms the enrollment with a first valid code, activating the factor.
     *
     * @return the freshly generated recovery codes (shown once)
     */
    public List<String> confirmTotpEnrollment(UUID userId, String code, String ip) {
        TotpFactor factor = mfaRepository.findTotp(userId).orElse(null);
        if (factor != null && factor.active()) {
            throw new BusinessRuleException(
                    "Autenticador ja configurado. Desative-o antes de configurar um novo.");
        }
        Optional<String> secret = factor == null ? Optional.empty() : decrypt(factor);
        if (secret.isEmpty()) {
            throw new BusinessRuleException("Inicie a configuracao do autenticador novamente.");
        }
        OptionalLong step = TotpCodec.verify(secret.get(), code, factor.lastUsedStep(), Instant.now());
        if (step.isEmpty()) {
            throw new BusinessRuleException(
                    "Codigo invalido. Confira o horario do celular e tente novamente.");
        }
        List<String> codes = RecoveryCodes.generate();
        mfaRepository.activate(userId, step.getAsLong(), hashes(userId, codes));
        auditPort.syncMembershipMfaFlag(userId, true);
        auditPort.recordEvent(userId, null, SecurityEventType.MFA_ENABLED, ip);
        return codes;
    }

    /** Verifies a TOTP code against the active factor, advancing the replay window on success. */
    public boolean verifyTotp(UUID userId, String code) {
        TotpFactor factor = mfaRepository.findTotp(userId).orElse(null);
        if (factor == null || !factor.active()) {
            return false;
        }
        Optional<String> secret = decrypt(factor);
        if (secret.isEmpty()) {
            return false;
        }
        OptionalLong step = TotpCodec.verify(secret.get(), code, factor.lastUsedStep(), Instant.now());
        if (step.isEmpty()) {
            return false;
        }
        mfaRepository.updateLastStep(userId, step.getAsLong());
        return true;
    }

    /** Consumes a recovery code. The caller records {@code RECOVERY_CODE_USED}. */
    public boolean verifyRecovery(UUID userId, String code) {
        if (RecoveryCodes.normalize(code).isEmpty()) {
            return false;
        }
        return mfaRepository.consumeRecoveryCode(userId, RecoveryCodes.hash(userId, code));
    }

    /** Removes the authenticator after proving possession (TOTP or recovery code). */
    public void disableTotp(UUID userId, String code, String ip) {
        if (!hasActiveTotp(userId)) {
            throw new BusinessRuleException("O aplicativo autenticador nao esta ativo.");
        }
        if (!verifyTotp(userId, code) && !verifyRecovery(userId, code)) {
            throw new BusinessRuleException("Codigo invalido.");
        }
        mfaRepository.disable(userId);
        auditPort.syncMembershipMfaFlag(userId, false);
        auditPort.recordEvent(userId, null, SecurityEventType.MFA_DISABLED, ip);
    }

    /** Replaces all recovery codes. Requires an active authenticator. */
    public List<String> regenerateRecoveryCodes(UUID userId, String ip) {
        if (!hasActiveTotp(userId)) {
            throw new BusinessRuleException(
                    "Ative o aplicativo autenticador antes de gerar codigos de recuperacao.");
        }
        List<String> codes = RecoveryCodes.generate();
        mfaRepository.replaceRecoveryCodes(userId, hashes(userId, codes));
        auditPort.recordEvent(userId, null, SecurityEventType.RECOVERY_CODES_REGENERATED, ip);
        return codes;
    }

    private Optional<String> decrypt(TotpFactor factor) {
        try {
            return Optional.of(cipher.decrypt(factor.secretCiphertext()));
        } catch (IllegalStateException ex) {
            // Wrong/rotated key or corrupted value; never log the ciphertext itself.
            log.warn("Nao foi possivel decifrar o segredo TOTP: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private static List<String> hashes(UUID userId, List<String> codes) {
        return codes.stream().map(c -> RecoveryCodes.hash(userId, c)).toList();
    }
}
