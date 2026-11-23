package com.eip.modules.subscription.application;

/**
 * Inputs of the billing flows (JSON request bodies of the billing contract,
 * section 4). Records carrying card data or passwords mask them in
 * {@code toString()} so they can never leak into logs.
 */
public final class BillingCommands {

    private BillingCommands() {
    }

    /** Raw card (never logged/persisted). */
    public record CardInput(String holderName, String number, String expiryMonth,
            String expiryYear, String ccv) {

        @Override
        public String toString() {
            return "CardInput[masked]";
        }
    }

    public record HolderInput(String nome, String cpfCnpj, String email, String telefone,
            String cep, String numero, String complemento) {
    }

    /** {@code metodo}: CREDIT_CARD, PIX or BOLETO. */
    public record PaymentInput(String metodo, CardInput cartao, HolderInput titular) {
    }

    public record CompanyInput(String cnpj, String razaoSocial, String nomeFantasia,
            String telefone, String email, String site, String segmento) {
    }

    public record AdminInput(String nome, String cpf, String email, String telefone,
            String senha) {

        @Override
        public String toString() {
            return "AdminInput[email=" + email + "]";
        }
    }

    /** {@code interval}: MONTHLY or ANNUAL. */
    public record PlanInput(String planCode, String interval, String coupon) {
    }

    public record AcceptanceInput(Boolean termos, Boolean privacidade, Boolean cobranca,
            String termsVersion, String privacyVersion) {
    }

    public record CheckoutCommand(CompanyInput empresa, AdminInput admin, PlanInput plano,
            PaymentInput pagamento, AcceptanceInput aceites) {
    }

    public record ActivateCommand(String planCode, String interval, String coupon,
            PaymentInput pagamento) {
    }

    public record ChangePlanCommand(String planCode, String interval) {
    }

    public record CancelCommand(String reason, String comment) {
    }

    public record PackPurchaseCommand(String addonCode, String metodo, Boolean usarCartaoSalvo,
            CardInput cartao, HolderInput titular) {
    }

    public record DemoCommand(String nome, String email, String telefone, String empresa,
            String cnpj, String mensagem, String origem) {
    }

    /** Caller network info (IP = first X-Forwarded-For value, else remote address). */
    public record ClientInfo(String ip, String userAgent) {
    }
}
