package com.eip.modules.admin.adapter.in.bff;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.admin.application.PasswordResetService;
import com.eip.modules.admin.application.PasswordResetService.ResetRequestResult;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

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
@RequiredArgsConstructor
public class PasswordResetBffController {

    private final PasswordResetService service;

    public record ForgotRequest(String identifier) {
    }

    public record ResetRequest(String token, String newPassword) {
    }

    @PostMapping("/forgot")
    public Map<String, Object> forgot(@RequestBody ForgotRequest req, HttpServletRequest http) {
        ResetRequestResult result = service.requestReset(req.identifier(), http.getRemoteAddr());
        Map<String, Object> body = new LinkedHashMap<>();
        // Neutral, anti-enumeration message regardless of whether a user exists.
        body.put("message", "Se o identificador existir, enviaremos instrucoes para definir a senha.");
        // DEV convenience (no email yet): expose the activation link when found.
        if (result.userFound() && result.token() != null) {
            body.put("activationLink", "/definir-senha?token=" + result.token());
            body.put("token", result.token());
        }
        return body;
    }

    @PostMapping("/reset")
    public Map<String, Object> reset(@RequestBody ResetRequest req) {
        service.resetPassword(req.token(), req.newPassword());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("ok", true);
        body.put("message", "Senha definida com sucesso. Voce ja pode acessar com seu CPF e a nova senha.");
        return body;
    }
}