package com.eip.modules.admin.adapter.in.bff;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.admin.domain.port.in.ConsultarOnboardingUseCase;
import com.eip.modules.admin.domain.port.in.ConsultarOnboardingUseCase.OnboardingProgress;
import com.eip.modules.admin.domain.port.in.ConsultarOnboardingUseCase.TrialState;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints for the logged-home trial banner + onboarding checklist. Both
 * are tenant-scoped to the CURRENT org (session + RLS); any authenticated user
 * may read their own org state, so no extra @PreAuthorize is needed beyond the
 * BFF chain's authentication requirement.
 */
@RestController
@RequestMapping("/bff/onboarding")
@RequiredArgsConstructor
public class OnboardingBffController {

    private final ConsultarOnboardingUseCase useCase;

    @GetMapping("/trial")
    public TrialState trial() {
        return useCase.trial();
    }

    @GetMapping("/status")
    public OnboardingProgress status() {
        return useCase.progress();
    }
}