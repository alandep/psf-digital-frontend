package com.eip.platform.mail;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;

/**
 * SMTP implementation (Brevo, Amazon SES, Mailgun, Mailpit...). Sends on a
 * virtual thread so SMTP latency never delays the HTTP request, and swallows
 * failures after logging them (the callers expose a "resend" action).
 */
public class SmtpEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailSender.class);

    private final JavaMailSender mailSender;
    private final String from;
    private final String fromName;
    private final boolean logBody;
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    public SmtpEmailSender(JavaMailSender mailSender, String from, String fromName,
                           boolean logBody) {
        this.logBody = logBody;
        this.mailSender = mailSender;
        this.from = from;
        this.fromName = fromName;
    }

    @Override
    public void send(String to, String subject, String textBody, String htmlBody) {
        if (logBody) {
            log.info("[EMAIL-DEV] to={} subject={}\n{}", to, subject, textBody);
        }
        executor.submit(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper =
                        new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
                helper.setFrom(from, fromName);
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(textBody, htmlBody);
                mailSender.send(message);
                log.info("E-mail enviado: to={} subject={}", LoggingEmailSender.mask(to), subject);
            } catch (Exception ex) {
                log.error("Falha ao enviar e-mail para {}: {}", LoggingEmailSender.mask(to),
                        ex.getMessage());
            }
        });
    }

    @Override
    public boolean isDeliveryEnabled() {
        return true;
    }
}