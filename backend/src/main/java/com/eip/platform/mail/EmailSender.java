package com.eip.platform.mail;

/**
 * Outbound e-mail port used by transactional flows (MFA codes, invitations,
 * password reset). Implementations must never block the caller on network I/O
 * and must never throw: delivery failures are logged.
 */
public interface EmailSender {

    /**
     * Sends a multipart (text + html) message asynchronously.
     *
     * @param to       recipient address
     * @param subject  subject line
     * @param textBody plain-text alternative
     * @param htmlBody html body
     */
    void send(String to, String subject, String textBody, String htmlBody);

    /** @return {@code true} when a real SMTP relay is configured and used. */
    boolean isDeliveryEnabled();
}