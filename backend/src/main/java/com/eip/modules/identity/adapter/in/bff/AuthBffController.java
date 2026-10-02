package com.eip.modules.identity.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.identity.application.AuthService;
import com.eip.modules.identity.application.AuthService.AuthChallenge;
import com.eip.modules.identity.domain.model.AuthState;
import com.eip.modules.organization.application.OrganizationQueryService.OrganizationOption;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the SPA's stepped authentication flow. These run
 * pre-authentication and are permitted in {@code SecurityConfig} under
 * {@code /bff/auth/**}. Once the flow reaches {@code AUTHENTICATED} the selected
 * organization and user are bound to the HTTP session.
 */
@RestController
@RequestMapping("/bff/auth")
@RequiredArgsConstructor
public class AuthBffController {

    /** Session attribute holding the selected organization id (as String). */
    public static final String SESSION_ORG = "EIP_ORG";
    /** Session attribute holding the authenticated user id (as String). */
    public static final String SESSION_USER = "EIP_USER";

    private final AuthService authService;

    private final HttpSessionSecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    // --- Request records -------------------------------------------------

    public record IdentifyRequest(String identifier) {
    }

    public record LoginRequest(String challengeId, String password) {
    }

    public record MfaRequest(String challengeId, String code) {
    }

    public record SelectOrganizationRequest(String challengeId, UUID organizationId) {
    }

    // --- Response records ------------------------------------------------

    public record OrgDto(String id, String razaoSocial, String cnpjMasked, String role) {
    }

    public record AuthResponse(String authenticationState, String challengeId, String userName,
                               String cpfMasked, List<OrgDto> organizations, String message) {
    }

    public record MeResponse(String userId, String organizationId) {
    }

    /** Step 1 — identify by CPF/email, returns {@code PASSWORD_REQUIRED}. */
    @PostMapping("/identify")
    public AuthResponse identify(@RequestBody IdentifyRequest request) {
        return toResponse(authService.identify(request.identifier()));
    }

    /** Step 2 — verify password, returns {@code MFA_REQUIRED} or an error. */
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return toResponse(authService.verifyPassword(request.challengeId(), request.password()));
    }

    /** Step 3 — verify MFA. May reach {@code AUTHENTICATED} directly when the
     * user has exactly one organization (auto-selection); bind the session then. */
    @PostMapping("/mfa/verify")
    public AuthResponse verifyMfa(@RequestBody MfaRequest request,
                                  HttpServletRequest httpRequest,
                                  HttpServletResponse httpResponse) {
        AuthChallenge challenge = authService.verifyMfa(request.challengeId(), request.code());
        if (challenge.state() == AuthState.AUTHENTICATED
                && challenge.organizations() != null
                && !challenge.organizations().isEmpty()) {
            UUID organizationId = challenge.organizations().get(0).organizationId();
            bindSession(httpRequest, httpResponse, request.challengeId(), organizationId);
        }
        return toResponse(challenge);
    }

    /**
     * Step 4 — select the organization. On {@code AUTHENTICATED} the org + user
     * are bound to the HTTP session for subsequent requests.
     */
    @PostMapping("/select-organization")
    public AuthResponse selectOrganization(@RequestBody SelectOrganizationRequest request,
                                           HttpServletRequest httpRequest,
                                           HttpServletResponse httpResponse) {
        AuthChallenge challenge =
                authService.selectOrganization(request.challengeId(), request.organizationId());
        if (challenge.state() == AuthState.AUTHENTICATED) {
            bindSession(httpRequest, httpResponse, request.challengeId(), request.organizationId());
        }
        return toResponse(challenge);
    }

    /** Invalidates the current session (logout). */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Binds the authenticated user + organization to a fresh HTTP session,
     * establishes a Spring SecurityContext (persisted in the session so the
     * standard SecurityContextHolderFilter restores it on later requests), and
     * discards the in-flight challenge. Called on every path that reaches
     * {@code AUTHENTICATED}.
     */
    private void bindSession(HttpServletRequest httpRequest, HttpServletResponse httpResponse,
                             String challengeId, UUID organizationId) {
        UUID userId = authService.userIdOf(challengeId).orElse(null);
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(SESSION_ORG, organizationId.toString());
        if (userId != null) {
            session.setAttribute(SESSION_USER, userId.toString());
        }
        // Establish a Spring SecurityContext and persist it in the session so
        // authorization (.authenticated() / @PreAuthorize) recognizes the user
        // on subsequent requests.
        String principal = userId != null ? userId.toString() : organizationId.toString();
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);
        authService.discard(challengeId);
    }

    /** @return the current session's user/org, or 401 when no session is bound. */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Object user = session.getAttribute(SESSION_USER);
        Object org = session.getAttribute(SESSION_ORG);
        if (user == null || org == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(new MeResponse(user.toString(), org.toString()));
    }

    private AuthResponse toResponse(AuthChallenge challenge) {
        List<OrgDto> orgs = challenge.organizations() == null ? List.of()
                : challenge.organizations().stream().map(this::toOrgDto).toList();
        return new AuthResponse(
                challenge.state().name(),
                challenge.challengeId(),
                challenge.userName(),
                challenge.cpfMasked(),
                orgs,
                challenge.message());
    }

    private OrgDto toOrgDto(OrganizationOption option) {
        return new OrgDto(
                option.organizationId().toString(),
                option.razaoSocial(),
                option.cnpjMasked(),
                option.role());
    }
}
