package com.eip.modules.finance.application;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.finance.domain.model.RentabilidadeAnalise;
import com.eip.modules.finance.domain.port.in.GerenciarRentabilidadeUseCase;
import com.eip.modules.finance.domain.port.out.RentabilidadeAnaliseRepositoryPort;
import com.eip.platform.error.BusinessRuleException;
import com.eip.platform.error.ResourceNotFoundException;
import com.eip.platform.tenant.OrganizationContext;
import com.eip.platform.tenant.OrganizationContextHolder;

import lombok.RequiredArgsConstructor;

/**
 * Application service for saved profitability analyses. Every method is
 * transactional so the RLS aspect binds the tenant to the session.
 */
@Service
@RequiredArgsConstructor
public class RentabilidadeService implements GerenciarRentabilidadeUseCase {

    static final int LIMITE_LISTAGEM = 100;

    /** numeric(9,4) holds |x| &lt; 100000. */
    private static final BigDecimal MAX_MARGEM = new BigDecimal("99999");
    /** numeric(18,2) holds |x| &lt; 10^16. */
    private static final BigDecimal MAX_LUCRO = new BigDecimal("9999999999999999");

    private final RentabilidadeAnaliseRepositoryPort repo;

    @Override
    @Transactional(readOnly = true)
    public List<RentabilidadeAnalise> listar() {
        UUID org = OrganizationContextHolder.current().organizationId().value();
        return repo.listarRecentes(org, LIMITE_LISTAGEM);
    }

    @Override
    @Transactional
    public RentabilidadeAnalise criar(CriarAnaliseCommand cmd) {
        if (cmd.payloadJson() == null || cmd.payloadJson().isBlank()) {
            throw new BusinessRuleException("O conteúdo da análise é obrigatório.");
        }
        if (cmd.margem() != null && cmd.margem().abs().compareTo(MAX_MARGEM) > 0) {
            throw new BusinessRuleException("Margem fora do intervalo permitido.");
        }
        if (cmd.lucroBrl() != null && cmd.lucroBrl().abs().compareTo(MAX_LUCRO) > 0) {
            throw new BusinessRuleException("Lucro fora do intervalo permitido.");
        }
        OrganizationContext ctx = OrganizationContextHolder.current();
        RentabilidadeAnalise nova = new RentabilidadeAnalise(
                UUID.randomUUID(),
                ctx.organizationId().value(),
                ctx.userId(),
                cmd.exportacaoRef(),
                cmd.produto(),
                cmd.score(),
                cmd.margem(),
                cmd.lucroBrl(),
                cmd.payloadJson(),
                null);
        return repo.salvar(nova);
    }

    @Override
    @Transactional
    public void excluir(UUID id) {
        UUID org = OrganizationContextHolder.current().organizationId().value();
        if (!repo.excluir(id, org)) {
            throw new ResourceNotFoundException("Análise não encontrada: " + id);
        }
    }
}
