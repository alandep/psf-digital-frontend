package com.eip.modules.admin.domain.port.in;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Inbound port for the "Gestão de Empresas" admin screen. An empresa is an
 * Organization plus its LegalEntity, a Subscription on the chosen plan and the
 * entitlement snapshot for that plan. Creation also provisions a GCP tenant.
 */
public interface GerenciarEmpresasUseCase {

    List<EmpresaView> listar();

    EmpresaView criar(CriarEmpresaCommand command);

    EmpresaView atualizar(UUID id, AtualizarEmpresaCommand command);

    EmpresaView alterarStatus(UUID id, String status);

    /** Read view mirroring the frontend Empresa shape. */
    record EmpresaView(
            UUID id,
            String razaoSocial,
            String nomeFantasia,
            String cnpj,
            String tipo,
            String status,
            String pais,
            String estado,
            String cidade,
            String responsavel,
            String email,
            String telefone,
            String plano,
            String gcpTenantId,
            OffsetDateTime dataAdesao,
            List<String> modulosAtivos) {
    }

    /** Create command. {@code plano} is a plan code (START/BUSINESS/PRO/ENTERPRISE) or UI label. */
    record CriarEmpresaCommand(
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

    /** Update command for editable empresa fields (plan change re-applies entitlements). */
    record AtualizarEmpresaCommand(
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
}