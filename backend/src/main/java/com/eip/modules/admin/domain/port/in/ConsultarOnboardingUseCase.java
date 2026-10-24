package com.eip.modules.admin.domain.port.in;

import java.util.List;

/**
 * Inbound port for the trial banner + onboarding checklist shown on the logged
 * home. All data is computed REAL-TIME for the CURRENT organization (RLS-scoped),
 * never mocked.
 */
public interface ConsultarOnboardingUseCase {

    /** The current org trial state (derived from its subscription). */
    TrialState trial();

    /** The current org onboarding checklist + completion percentage. */
    OnboardingProgress progress();

    /** @param active whether a trial is currently running
     *  @param daysRemaining whole days until the trial ends (>= 0)
     *  @param planName human-readable plan name */
    record TrialState(boolean active, long daysRemaining, String planName) {
    }

    /** A single onboarding checklist item. */
    record OnboardingStep(String key, String label, boolean done) {
    }

    /** Onboarding checklist with computed percentage. */
    record OnboardingProgress(int percent, List<OnboardingStep> steps, boolean completed) {
    }
}