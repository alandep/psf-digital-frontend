package com.eip.modules.admin.adapter.in.bff;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.admin.application.PasswordResetService;
import com.eip.modules.admin.application.PasswordResetService.ResetRequestResult;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Public password activation / reset endpoints under {@code /bff/auth/password}.
 * This path is permitted pre-authentication and CSRF-exempt (see SecurityConfig
 * {@code /bff/auth/**}), so an invited user with no password yet can set their
 * first password. The SPA already calls these two routes.
 *
 * <p>Until transactional email is wired, {@code /forgot} returns the activation
 * link so an admin can hand it to the user. It is ALWAYS answered 200 with a
 * neutral payload to avoid account enumeration; the link is present only when a
 * matching user was found.
 */
@RestController
@RequestMapping("/bff/auth/password")
public class PasswordResetBffController {

    private final PasswordResetService service;
    private final boolean exposeDevLinks;

    public PasswordResetBffController(PasswordResetService service,
                                      @Value("${eip.auth.expose-dev-links:false}") boolean exposeDevLinks) {
        this.service = service;
        this.exposeDevLinks = exposeDevLinks;
    }

    public record ForgotRequest(String identifier) {
    }

    public record ResetRequest(String token, String newPassword) {
    }

    @PostMapping("/forgot")
    public Map<String, Object> forgot(@RequestBody ForgotRequest req, HttpServletRequest http) {
        ResetRequestResult result = service.requestReset(req.identifier(), clientIp(http));
        Map<String, Object> body = new LinkedHashMap<>();
        // Neutral, anti-enumeration message regardless of whether a user exists.
        body.put("message", "Se encontrarmos uma conta correspondente, enviaremos as instruções para o e-mail cadastrado.");
        // DEV only: expose the activation link (never the raw token field).
        if (exposeDevLinks && result.token() != null) {
            body.put("activationLink", "/definir-senha?token=" + result.token());
        }
        return body;
    }

    @PostMapping("/reset")
    public Map<String, Object> reset(@RequestBody ResetRequest req) {
        service.resetPassword(req.token(), req.newPassword());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ok", true);
        body.put("message", "Senha definida com sucesso. Você já pode acessar com seu CPF e a nova senha.");
        return body;
    }

    private static String clientIp(HttpServletRequest http) {
        String forwarded = http.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return http.getRemoteAddr();
    }
}