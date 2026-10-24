package com.eip.modules.admin.adapter.in.bff;

import java.util.List;

/** Bulk import payload (parsed CSV rows) for the current organization. */
public record ImportarUsuariosRequest(List<UsuarioRequest> usuarios) {
}