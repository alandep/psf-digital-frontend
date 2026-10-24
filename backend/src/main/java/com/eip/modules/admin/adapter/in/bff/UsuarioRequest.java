package com.eip.modules.admin.adapter.in.bff;

/** Create/update request for a user in the current organization. */
public record UsuarioRequest(
        String name,
        String email,
        String role,
        String status,
        String departamento,
        String phone,
        boolean mfaEnabled) {
}