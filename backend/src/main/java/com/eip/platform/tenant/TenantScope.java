package com.eip.platform.tenant;

import java.util.UUID;
import java.util.function.Supplier;

import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import jakarta.persistence.EntityManager;

/**
 * Executa um trecho de codigo no escopo de uma organizacao (tenant) no MEIO de
 * uma transacao ja aberta, mantendo o contexto da thread e a configuracao
 * {@code app.current_organization} do banco (usada pelas policies RLS)
 * sincronizados.
 *
 * <p>O {@link RlsAspect} so aplica a configuracao no INICIO de um metodo
 * {@code @Transactional}; trocar apenas o {@link OrganizationContextHolder} no
 * meio da transacao nao atualiza o banco e os inserts em tabelas RLS falham
 * ("new row violates row-level security policy") quando o usuario do banco nao
 * e superuser.
 *
 * <p>Semantica de {@code runAs}:
 * <ul>
 *   <li>DEVE ser chamado dentro de uma transacao ativa; caso contrario lanca
 *       {@link IllegalStateException}.</li>
 *   <li>Salva o contexto anterior, define o contexto da organizacao informada e
 *       vincula a configuracao no banco.</li>
 *   <li>Executa o trabalho e, somente em caso de sucesso, faz
 *       {@code flush()} para que inserts/updates pendentes sejam gravados
 *       enquanto a configuracao ainda pertence a esta organizacao.</li>
 *   <li>No {@code finally}, restaura o contexto anterior (ou limpa) e
 *       re-vincula a configuracao do banco para a organizacao anterior, ou
 *       para vazio quando nao havia contexto (as policies usam
 *       {@code NULLIF(..., '')}).</li>
 * </ul>
 */
@Component
public class TenantScope {

    private final EntityManager entityManager;
    private final RlsConnectionPreparer preparer;

    public TenantScope(EntityManager entityManager, RlsConnectionPreparer preparer) {
        this.entityManager = entityManager;
        this.preparer = preparer;
    }

    public <T> T runAs(UUID organizationId, UUID userId, Supplier<T> work) {
        if (organizationId == null) {
            throw new IllegalArgumentException("organizationId must not be null");
        }
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException(
                    "TenantScope.runAs exige uma transacao ativa");
        }
        OrganizationContext previous = OrganizationContextHolder.currentOrNull();
        try {
            OrganizationContextHolder.set(OrganizationContext.authenticated(
                    OrganizationId.of(organizationId.toString()), userId));
            bind(organizationId.toString());

            T result = work.get();
            // Grava pendencias enquanto o setting ainda pertence a esta organizacao.
            entityManager.flush();
            return result;
        } finally {
            if (previous != null) {
                OrganizationContextHolder.set(previous);
                bind(previous.organizationId().asString());
            } else {
                OrganizationContextHolder.clear();
                bind("");
            }
        }
    }

    public void runAs(UUID organizationId, UUID userId, Runnable work) {
        runAs(organizationId, userId, () -> {
            work.run();
            return null;
        });
    }

    private void bind(String organizationId) {
        entityManager.unwrap(Session.class)
                .doWork(connection -> preparer.prepare(connection, organizationId));
    }
}
