package com.eip.modules.admin.adapter.in.bff;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.admin.application.SignupService;
import com.eip.modules.admin.application.SignupService.SignupCommand;
import com.eip.modules.admin.application.SignupService.SignupResult;
import com.eip.platform.security.BffSessionBinder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Public self-service signup endpoints for the "Experimentar Gratis" flow.
 * Permitted pre-authentication in {@code SecurityConfig} under
 * {@code /bff/public/**}. On a successful signup the brand-new tenant + user are
 * bound to the HTTP session (see {@link BffSessionBinder}) so the SPA lands
 * authenticated on the trial.
 */
@RestController
@RequestMapping("/bff/public/signup")
@RequiredArgsConstructor
public class SignupBffController {

    private final SignupService signupService;
    private final BffSessionBinder sessionBinder;

    public record CheckCnpjResponse(boolean available) {
    }

    public record SignupResponse(String organizationId, String userId, String gcpTenantId,
                                 String trialEnd, String trialStatus, String nextAction) {
    }

    @PostMapping("/check-cnpj")
    public CheckCnpjResponse checkCnpj(@RequestBody CheckCnpjRequest request) {
        return new CheckCnpjResponse(signupService.cnpjAvailable(request.cnpj()));
    }

    @PostMapping
    public SignupResponse signup(@RequestBody SignupRequest req,
                                 HttpServletRequest httpRequest,
                                 HttpServletResponse httpResponse) {
        SignupResult result = signupService.signup(new SignupCommand(
                req.name(), req.cpf(), req.email(), req.phone(), req.password(),
                req.cnpj(), req.razaoSocial(), req.nomeFantasia(), req.segmento(),
                req.goals() == null ? List.of() : req.goals()));

        sessionBinder.bind(httpRequest, httpResponse,
                result.organizationId().toString(), result.userId().toString());

        return new SignupResponse(
                result.organizationId().toString(),
                result.userId().toString(),
                result.gcpTenantId(),
                result.trialEnd() != null ? result.trialEnd().toString() : null,
                "ACTIVE",
                "START_ONBOARDING");
    }
}
