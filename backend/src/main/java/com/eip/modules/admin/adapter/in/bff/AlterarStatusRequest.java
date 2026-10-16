package com.eip.modules.admin.adapter.in.bff;

/** Request body for changing an empresa status (ATIVA/SUSPENSA/BLOQUEADA/EM_ONBOARDING). */
public record AlterarStatusRequest(String status) {
}