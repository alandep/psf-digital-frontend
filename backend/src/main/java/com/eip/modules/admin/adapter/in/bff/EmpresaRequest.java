package com.eip.modules.admin.adapter.in.bff;

/** Request body for creating/updating an empresa from the admin screen. */
public record EmpresaRequest(
        String razaoSocial,
        String nomeFantasia,
        String cnpj,
        String tipo,
        String pais,
        String estado,
        String cidade,
        String responsavel,
        String email,
        String telefone,
        String plano) {
}