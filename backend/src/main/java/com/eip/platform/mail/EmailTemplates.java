package com.eip.platform.mail;

/** pt-BR transactional e-mail bodies (kept dependency-free and inline-styled). */
public final class EmailTemplates {

    private EmailTemplates() {
    }

    public record Rendered(String subject, String text, String html) {
    }

    public static Rendered mfaCode(String name, String code, int validMinutes) {
        String text = "Ola, " + safeName(name) + ".\n\n"
                + "Seu codigo de verificacao do EIP e: " + code + "\n"
                + "Ele vale por " + validMinutes + " minutos e so pode ser usado uma vez.\n\n"
                + "Se voce nao tentou entrar, ignore este e-mail e troque sua senha.";
        String body = "<p>Ol&aacute;, " + esc(safeName(name)) + ".</p>"
                + "<p>Seu c&oacute;digo de verifica&ccedil;&atilde;o do EIP &eacute;:</p>"
                + "<p style=\"font-size:32px;letter-spacing:8px;font-weight:700;margin:16px 0\">"
                + esc(code) + "</p>"
                + "<p>Ele vale por " + validMinutes + " minutos e s&oacute; pode ser usado uma vez.</p>"
                + "<p style=\"color:#666\">Se voc&ecirc; n&atilde;o tentou entrar, ignore este e-mail "
                + "e troque sua senha.</p>";
        return new Rendered("Seu codigo de verificacao EIP: " + code, text, wrap(body));
    }

    public static Rendered activation(String name, String link, boolean firstAccess) {
        String subject = firstAccess ? "Ative seu acesso ao EIP" : "Redefina sua senha do EIP";
        String intro = firstAccess
                ? "Voce foi convidado para o EIP. Defina sua senha para ativar o acesso."
                : "Recebemos um pedido para redefinir sua senha do EIP.";
        String text = "Ola, " + safeName(name) + ".\n\n" + intro + "\n\n" + link + "\n\n"
                + "O link vale por 48 horas e so pode ser usado uma vez. "
                + "Se voce nao solicitou, ignore este e-mail.";
        String body = "<p>Ol&aacute;, " + esc(safeName(name)) + ".</p><p>"
                + (firstAccess
                        ? "Voc&ecirc; foi convidado para o EIP. Defina sua senha para ativar o acesso."
                        : "Recebemos um pedido para redefinir sua senha do EIP.")
                + "</p><p><a href=\"" + esc(link) + "\" style=\"background:#1565c0;color:#fff;"
                + "padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block\">"
                + (firstAccess ? "Definir senha" : "Redefinir senha") + "</a></p>"
                + "<p style=\"color:#666\">O link vale por 48 horas e s&oacute; pode ser usado uma vez. "
                + "Se voc&ecirc; n&atilde;o solicitou, ignore este e-mail.</p>";
        return new Rendered(subject, text, wrap(body));
    }

    /** Internal notification to the sales team about a demo request. */
    public static Rendered demoRequest(String name, String email, String phone, String company,
            String cnpj, String message, String origin) {
        String subject = "Nova solicitação de demonstração EIP: " + safeName(company);
        String text = "Nova solicitação de demonstração recebida.\n\n"
                + "Nome: " + safeName(name) + "\n"
                + "E-mail: " + safeName(email) + "\n"
                + "Telefone: " + safeName(phone) + "\n"
                + "Empresa: " + safeName(company) + "\n"
                + "CNPJ: " + safeName(cnpj) + "\n"
                + "Origem: " + safeName(origin) + "\n\n"
                + "Mensagem:\n" + safeName(message);
        String body = "<p>Nova solicita&ccedil;&atilde;o de demonstra&ccedil;&atilde;o recebida.</p>"
                + "<table style=\"border-collapse:collapse\">"
                + row("Nome", name) + row("E-mail", email) + row("Telefone", phone)
                + row("Empresa", company) + row("CNPJ", cnpj) + row("Origem", origin)
                + "</table>"
                + "<p><strong>Mensagem:</strong><br>" + esc(safeName(message)).replace("\n", "<br>")
                + "</p>";
        return new Rendered(subject, text, wrap(body));
    }

    private static String row(String label, String value) {
        return "<tr><td style=\"padding:4px 12px 4px 0;color:#666\">" + esc(label)
                + "</td><td style=\"padding:4px 0\">" + esc(safeName(value)) + "</td></tr>";
    }

    private static String wrap(String inner) {
        return "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;"
                + "padding:24px;color:#222\"><h2 style=\"color:#1565c0\">EIP</h2>" + inner + "</div>";
    }

    private static String safeName(String name) {
        return name == null || name.isBlank() ? "" : name.trim();
    }

    private static String esc(String v) {
        return v == null ? "" : v.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;");
    }
}