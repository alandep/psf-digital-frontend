package com.eip.modules.admin.adapter.in.bff;

import java.util.List;

/** Public signup request body ("Experimentar Gratis"). */
public record SignupRequest(
        String name,
        String cpf,
        String email,
        String phone,
        String password,
        String cnpj,
        String razaoSocial,
        String nomeFantasia,
        String segmento,
        List<String> goals) {
}