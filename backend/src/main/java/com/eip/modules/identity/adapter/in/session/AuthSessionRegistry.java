package com.eip.modules.identity.adapter.in.session;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import lombok.extern.slf4j.Slf4j;

/**
 * In-memory registry of authenticated HTTP sessions, backing the "Sessoes
 * ativas" screen (list / revoke). Sessions are registered when the login flow
 * completes and removed when the container destroys them. Spring Boot
 * registers this {@link HttpSessionListener} automatically.
 *
 * <p>Sessions are identified to the SPA by an opaque {@code publicId} derived
 * from the servlet session id, so the real session id never leaves the server.
 * TODO: back this with a shared store when running more than one instance.
 */
@Slf4j
@Component
public class AuthSessionRegistry implements HttpSessionListener {

    private static final int PUBLIC_ID_LENGTH = 24;

    /** Keyed by servlet session id. */
    private final ConcurrentHashMap<String, SessionInfo> sessions = new ConcurrentHashMap<>();

    /** Metadata of an authenticated session. */
    public static final class SessionInfo {
        private final String publicId;
        private final UUID userId;
        private final HttpSession session;
        private final String userAgent;
        private final String ip;
        private final Instant createdAt;
        private volatile Instant lastSeen;

        SessionInfo(String publicId, UUID userId, HttpSession session, String userAgent,
                    String ip, Instant createdAt) {
            this.publicId = publicId;
            this.userId = userId;
            this.session = session;
            this.userAgent = userAgent;
            this.ip = ip;
            this.createdAt = createdAt;
            this.lastSeen = createdAt;
        }

        public String publicId() {
            return publicId;
        }

        public UUID userId() {
            return userId;
        }

        public HttpSession session() {
            return session;
        }

        public String userAgent() {
            return userAgent;
        }

        public String ip() {
            return ip;
        }

        public Instant createdAt() {
            return createdAt;
        }

        public Instant lastSeen() {
            return lastSeen;
        }
    }

    /** Registers a freshly authenticated session. */
    public void register(HttpSession session, UUID userId, HttpServletRequest request) {
        if (session == null || userId == null) {
            return;
        }
        String ip = clientIp(request);
        String userAgent = request == null ? null : request.getHeader("User-Agent");
        sessions.put(session.getId(), new SessionInfo(publicIdOf(session.getId()), userId,
                session, userAgent, ip, Instant.now()));
    }

    /** Updates the last-seen instant of a registered session. */
    public void touch(String sessionId) {
        if (sessionId == null) {
            return;
        }
        SessionInfo info = sessions.get(sessionId);
        if (info != null) {
            info.lastSeen = Instant.now();
        }
    }

    /** @return the user's active sessions, most recently used first. */
    public List<SessionInfo> sessionsOf(UUID userId) {
        return sessions.values().stream()
                .filter(s -> s.userId.equals(userId))
                .sorted(Comparator.comparing(SessionInfo::lastSeen).reversed())
                .toList();
    }

    /** @return the public id of a servlet session. */
    public String publicIdOf(String sessionId) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(sessionId.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest).substring(0, PUBLIC_ID_LENGTH);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponivel", ex);
        }
    }

    /**
     * Invalidates the session with the given public id, only when it belongs to the user.
     *
     * @return {@code true} when a session was revoked
     */
    public boolean revoke(UUID userId, String publicId) {
        for (var entry : sessions.entrySet()) {
            SessionInfo info = entry.getValue();
            if (info.userId.equals(userId) && info.publicId.equals(publicId)) {
                sessions.remove(entry.getKey());
                invalidateQuietly(info.session);
                return true;
            }
        }
        return false;
    }

    /** Revokes every session of the user except {@code currentSessionId}. @return revoked count */
    public int revokeOthers(UUID userId, String currentSessionId) {
        int revoked = 0;
        for (var entry : sessions.entrySet()) {
            SessionInfo info = entry.getValue();
            if (info.userId.equals(userId) && !entry.getKey().equals(currentSessionId)) {
                sessions.remove(entry.getKey());
                invalidateQuietly(info.session);
                revoked++;
            }
        }
        return revoked;
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent event) {
        sessions.remove(event.getSession().getId());
    }

    /** @return first {@code X-Forwarded-For} value, else the remote address. */
    public static String clientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty()) {
                return first;
            }
        }
        return request.getRemoteAddr();
    }

    private static void invalidateQuietly(HttpSession session) {
        try {
            session.invalidate();
        } catch (IllegalStateException ex) {
            log.debug("Sessao ja invalidada");
        }
    }
}
