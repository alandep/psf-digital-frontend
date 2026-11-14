package com.eip.modules.identity.adapter.in.bff;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.eip.modules.identity.adapter.in.session.AuthSessionRegistry;
import com.eip.modules.identity.adapter.in.session.AuthSessionRegistry.SessionInfo;
import com.eip.modules.identity.application.AuthService;
import com.eip.modules.identity.application.MfaService;
import com.eip.modules.identity.application.MfaService.TotpEnrollment;
import com.eip.modules.identity.application.SecurityOverviewService;
import com.eip.modules.identity.application.SecurityOverviewService.SecurityEventItem;
import com.eip.modules.identity.application.SecurityOverviewService.SecurityOverview;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints of the user's "Seguranca" screen: overview, authenticator app
 * (TOTP) enrollment/removal, recovery codes, password change, active sessions
 * and security events. Runs on the authenticated, CSRF-protected BFF chain; the
 * user is always taken from the HTTP session, never from the request.
 */
@RestController
@RequestMapping("/bff/seguranca")
@RequiredArgsConstructor
public class SegurancaBffController {

    private final SecurityOverviewService overviewService;
    private final MfaService mfaService;
    private final AuthService authService;
    private final AuthSessionRegistry sessionRegistry;

    // --- Request / response records ---------------------------------------

    public record CodeRequest(String code) {
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {
    }

    public record ConfirmTotpResponse(boolean ok, List<String> recoveryCodes) {
    }

    public record OkResponse(boolean ok) {
    }

    public record RecoveryCodesResponse(List<String> recoveryCodes) {
    }

    public record PasswordChangedResponse(boolean ok, String message) {
    }

    public record SessionDto(String id, String device, String os, String ip, boolean current,
                             Instant lastSeen, Instant createdAt) {
    }

    public record RevokedResponse(int revoked) {
    }

    // --- Endpoints ---------------------------------------------------------

    @GetMapping("/overview")
    public SecurityOverview overview(HttpServletRequest request) {
        return overviewService.overview(currentUser(request));
    }

    @PostMapping("/mfa/totp/enroll")
    public TotpEnrollment enrollTotp(HttpServletRequest request) {
        return mfaService.startTotpEnrollment(currentUser(request));
    }

    @PostMapping("/mfa/totp/confirm")
    public ConfirmTotpResponse confirmTotp(@RequestBody CodeRequest body, HttpServletRequest request) {
        List<String> codes = mfaService.confirmTotpEnrollment(
                currentUser(request), body == null ? null : body.code(), clientIp(request));
        return new ConfirmTotpResponse(true, codes);
    }

    @PostMapping("/mfa/totp/disable")
    public OkResponse disableTotp(@RequestBody CodeRequest body, HttpServletRequest request) {
        mfaService.disableTotp(currentUser(request), body == null ? null : body.code(), clientIp(request));
        return new OkResponse(true);
    }

    @PostMapping("/mfa/recovery-codes")
    public RecoveryCodesResponse regenerateRecoveryCodes(HttpServletRequest request) {
        return new RecoveryCodesResponse(
                mfaService.regenerateRecoveryCodes(currentUser(request), clientIp(request)));
    }

    @PostMapping("/password")
    public PasswordChangedResponse changePassword(@RequestBody ChangePasswordRequest body,
                                                  HttpServletRequest request) {
        if (body == null) {
            throw new BusinessRuleException("Senha atual incorreta.");
        }
        authService.changePassword(currentUser(request), body.currentPassword(),
                body.newPassword(), clientIp(request));
        return new PasswordChangedResponse(true, "Senha alterada com sucesso.");
    }

    @GetMapping("/sessions")
    public List<SessionDto> sessions(HttpServletRequest request) {
        UUID userId = currentUser(request);
        String currentId = request.getSession(false).getId();
        return sessionRegistry.sessionsOf(userId).stream()
                .map(s -> toDto(s, currentId))
                .toList();
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> revokeSession(@PathVariable("id") String id, HttpServletRequest request) {
        UUID userId = currentUser(request);
        HttpSession current = request.getSession(false);
        if (sessionRegistry.publicIdOf(current.getId()).equals(id)) {
            throw new BusinessRuleException("Use Sair para encerrar a sessao atual.");
        }
        if (!sessionRegistry.revoke(userId, id)) {
            throw new ResourceNotFoundException("Sessao nao encontrada.");
        }
        authService.auditSessionRevoked(userId, currentOrg(current), clientIp(request));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions/revoke-others")
    public RevokedResponse revokeOthers(HttpServletRequest request) {
        UUID userId = currentUser(request);
        HttpSession current = request.getSession(false);
        int revoked = sessionRegistry.revokeOthers(userId, current.getId());
        if (revoked > 0) {
            authService.auditSessionRevoked(userId, currentOrg(current), clientIp(request));
        }
        return new RevokedResponse(revoked);
    }

    @GetMapping("/events")
    public List<SecurityEventItem> events(HttpServletRequest request) {
        return overviewService.events(currentUser(request));
    }

    // --- Helpers -----------------------------------------------------------

    private static UUID currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object user = session == null ? null : session.getAttribute(AuthBffController.SESSION_USER);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessao nao autenticada");
        }
        try {
            return UUID.fromString(user.toString());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessao nao autenticada");
        }
    }

    private static UUID currentOrg(HttpSession session) {
        Object org = session.getAttribute(AuthBffController.SESSION_ORG);
        if (org == null) {
            return null;
        }
        try {
            return UUID.fromString(org.toString());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static String clientIp(HttpServletRequest request) {
        return AuthSessionRegistry.clientIp(request);
    }

    private static SessionDto toDto(SessionInfo info, String currentSessionId) {
        return new SessionDto(
                info.publicId(),
                browserOf(info.userAgent()),
                osOf(info.userAgent()),
                info.ip(),
                info.session().getId().equals(currentSessionId),
                info.lastSeen(),
                info.createdAt());
    }

    static String browserOf(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Navegador";
        }
        String ua = userAgent.toLowerCase(Locale.ROOT);
        if (ua.contains("edg/") || ua.contains("edga/") || ua.contains("edgios/")) {
            return "Edge";
        }
        if (ua.contains("opr/") || ua.contains("opera")) {
            return "Opera";
        }
        if (ua.contains("firefox/") || ua.contains("fxios/")) {
            return "Firefox";
        }
        if (ua.contains("chrome/") || ua.contains("crios/")) {
            return "Chrome";
        }
        if (ua.contains("safari/")) {
            return "Safari";
        }
        return "Navegador";
    }

    static String osOf(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) {
            return "Desconhecido";
        }
        String ua = userAgent.toLowerCase(Locale.ROOT);
        if (ua.contains("windows")) {
            return "Windows";
        }
        if (ua.contains("android")) {
            return "Android";
        }
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ipod")) {
            return "iOS";
        }
        if (ua.contains("mac os") || ua.contains("macintosh")) {
            return "macOS";
        }
        if (ua.contains("linux") || ua.contains("x11")) {
            return "Linux";
        }
        return "Desconhecido";
    }
}
