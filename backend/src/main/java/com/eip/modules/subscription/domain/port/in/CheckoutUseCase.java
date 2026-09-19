package com.eip.modules.subscription.domain.port.in;

/**
 * Inbound port for starting a checkout session. Mock implementation returns a
 * Stripe-like URL and creates/updates a pending (trialing) subscription.
 */
public interface CheckoutUseCase {

    CheckoutView startCheckout(String planCode, String interval);

    record CheckoutView(String checkoutUrl, String subscriptionStatus) {
    }
}
