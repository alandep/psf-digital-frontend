package com.eip.modules.reference.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.reference.adapter.out.persistence.BrCityJpaRepository;
import com.eip.modules.reference.adapter.out.persistence.BrStateJpaRepository;
import com.eip.modules.reference.domain.port.in.ConsultarLocalidadesUseCase;

import lombok.RequiredArgsConstructor;

/** Application service listing Brazilian state/city reference data. Pure reference data — no tenant context. */
@Service
@RequiredArgsConstructor
public class LocalidadeService implements ConsultarLocalidadesUseCase {

    private final BrStateJpaRepository stateRepo;
    private final BrCityJpaRepository cityRepo;

    @Override
    @Transactional(readOnly = true)
    public List<EstadoView> listarEstados() {
        return stateRepo.findAllByOrderByNameAsc().stream()
                .map(e -> new EstadoView(e.getUf(), e.getIbgeCode(), e.getName()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CidadeView> listarCidadesPorUf(String uf) {
        if (uf == null || uf.isBlank()) {
            return List.of();
        }
        return cityRepo.findByUfOrderByNameAsc(uf.trim().toUpperCase()).stream()
                .map(c -> new CidadeView(c.getIbgeCode(), c.getUf(), c.getName()))
                .toList();
    }
}
