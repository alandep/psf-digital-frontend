package com.eip.platform.error;

/**
 * Raised when an external gateway (e.g. the payment provider) is unreachable,
 * rejects our credentials or fails on its side. Maps to HTTP 503 with a stable,
 * user-facing message; the technical cause is kept only for server logs.
 */
public class GatewayUnavailableException extends DomainException {

    public static final String DEFAULT_CODE = "PAYMENT_GATEWAY_UNAVAILABLE";

    public static final String DEFAULT_MESSAGE =
            "Serviço de pagamentos indisponível no momento. Tente novamente em instantes.";

    public GatewayUnavailableException(Throwable cause) {
        super(DEFAULT_CODE, DEFAULT_MESSAGE, cause);
    }

    public GatewayUnavailableException() {
        super(DEFAULT_CODE, DEFAULT_MESSAGE);
    }
}
