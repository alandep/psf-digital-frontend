package com.eip.modules.admin.adapter.in.bff;

import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.admin.application.SignupService;
import com.eip.modules.admin.application.SignupService.SignupCommand;
import com.eip.modules.admin.application.SignupService.SignupResult;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

/**
 * Public self-service signup endpoints for the "Experimentar Gratis" flow.
 * Permitted pre-authentication in {@code SecurityConfig} under
 * {@code /bff/public/**}. On a successful signup the brand-new tenant + user are
 * bound to the HTTP session (reusing the same session attributes as
 * {@code AuthBffController}) so the SPA lands authenticated on the trial.
 */
@RestController
@RequestMapping("/bff/public/signup")
@RequiredArgsConstructor
public class SignupBffController {

    /** Must match AuthBffController session attribute names. */
    private static final String SESSION_ORG = "EIP_ORG";
    private static final String SESSION_USER = "EIP_USER";

    private final SignupService signupService;

    private final HttpSessionSecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

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

        bindSession(httpRequest, httpResponse,
                result.organizationId().toString(), result.userId().toString());

        return new SignupResponse(
                result.organizationId().toString(),
                result.userId().toString(),
                result.gcpTenantId(),
                result.trialEnd() != null ? result.trialEnd().toString() : null,
                "ACTIVE",
                "START_ONBOARDING");
    }

    /**
     * Binds the freshly created user + org to a new HTTP session and persists a
     * Spring SecurityContext, so the SPA is authenticated immediately after
     * signup (mirrors AuthBffController#bindSession).
     */
    private void bindSession(HttpServletRequest httpRequest, HttpServletResponse httpResponse,
                             String organizationId, String userId) {
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(SESSION_ORG, organizationId);
        session.setAttribute(SESSION_USER, userId);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userId, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);
    }
}