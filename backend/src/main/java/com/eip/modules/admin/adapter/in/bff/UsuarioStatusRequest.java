package com.eip.modules.admin.adapter.in.bff;

/** Status-change request (ATIVO/INATIVO/BLOQUEADO/PENDENTE). */
public record UsuarioStatusRequest(String status) {
}