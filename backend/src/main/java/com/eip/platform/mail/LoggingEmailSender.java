package com.eip.platform.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Fallback sender used when no SMTP relay is configured. It never delivers
 * anything. The message body (which may carry a one-time code or link) is only
 * logged when {@code eip.mail.log-body=true}, which must stay off in production.
 */
public class LoggingEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailSender.class);

    private final boolean logBody;

    public LoggingEmailSender(boolean logBody) {
        this.logBody = logBody;
    }

    @Override
    public void send(String to, String subject, String textBody, String htmlBody) {
        if (logBody) {
            log.info("[EMAIL-DEV] to={} subject={}\n{}", to, subject, textBody);
        } else {
            log.warn("E-mail NAO enviado (SMTP nao configurado): to={} subject={}",
                    mask(to), subject);
        }
    }

    @Override
    public boolean isDeliveryEnabled() {
        return false;
    }

    static String mask(String email) {
        if (email == null) {
            return null;
        }
        int at = email.indexOf('@');
        return at <= 1 ? "***" : email.charAt(0) + "***" + email.substring(at);
    }
}