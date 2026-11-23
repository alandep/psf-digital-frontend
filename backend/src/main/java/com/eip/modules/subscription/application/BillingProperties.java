package com.eip.modules.subscription.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Billing configuration ({@code eip.billing.*}).
 *
 * @param trialDays  length of the trial offered at checkout (default 14)
 * @param salesEmail recipient of commercial demo requests
 * @param issuer     invoice issuer printed on the "segunda via" PDF
 */
@ConfigurationProperties(prefix = "eip.billing")
public record BillingProperties(Integer trialDays, String salesEmail, Issuer issuer) {

    public static final int DEFAULT_TRIAL_DAYS = 14;

    public BillingProperties {
        if (trialDays == null || trialDays <= 0) {
            trialDays = DEFAULT_TRIAL_DAYS;
        }
        if (salesEmail == null || salesEmail.isBlank()) {
            salesEmail = "comercial@iaexport.com.br";
        }
        if (issuer == null) {
            issuer = new Issuer(null, null, null, null);
        }
    }

    /** Issuer block of the invoice PDF. */
    public record Issuer(String name, String cnpj, String address, String email) {

        public Issuer {
            if (name == null || name.isBlank()) {
                name = "EIP - Export Intelligence Platform";
            }
        }
    }
}
