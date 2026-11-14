package com.eip.platform.mail;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * Chooses the {@link EmailSender}: SMTP when {@code eip.mail.enabled=true} and a
 * {@code spring.mail.host} is configured, otherwise the logging fallback.
 * Fails fast at startup when delivery is enabled but the SMTP relay is
 * misconfigured (missing host, or missing credentials with SMTP AUTH).
 */
@Configuration
public class MailConfig {

    @Bean
    public EmailSender emailSender(
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${eip.mail.enabled:false}") boolean enabled,
            @Value("${eip.mail.from:no-reply@localhost}") String from,
            @Value("${eip.mail.from-name:EIP}") String fromName,
            @Value("${eip.mail.log-body:false}") boolean logBody,
            @Value("${spring.mail.host:}") String host,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${spring.mail.properties.mail.smtp.auth:false}") boolean smtpAuth) {
        if (!enabled) {
            return new LoggingEmailSender(logBody);
        }
        if (host == null || host.isBlank()) {
            throw new IllegalStateException(
                    "eip.mail.enabled=true exige spring.mail.host (EIP_MAIL_HOST) configurado.");
        }
        if (smtpAuth && (isBlank(username) || isBlank(password))) {
            throw new IllegalStateException(
                    "EIP_MAIL_USER/EIP_MAIL_PASSWORD obrigatorios com SMTP autenticado "
                            + "(ex.: chave SMTP do Brevo)");
        }
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            throw new IllegalStateException(
                    "eip.mail.enabled=true exige spring.mail.host (EIP_MAIL_HOST) configurado.");
        }
        return new SmtpEmailSender(sender, from, fromName, logBody);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
