package com.eip.modules.intelligence.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.intelligence.domain.port.in.GerenciarWatchlistUseCase;
import com.eip.modules.intelligence.domain.port.in.GerenciarWatchlistUseCase.WatchlistView;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the tenant watchlist screens.
 */
@RestController
@RequestMapping("/bff/intelligence/watchlist")
@RequiredArgsConstructor
public class WatchlistBffController {

    private final GerenciarWatchlistUseCase useCase;

    @GetMapping
    @PreAuthorize("@rbac.can('intelligence/watchlist','view')")
    public List<WatchlistView> listar() {
        return useCase.listar();
    }

    @PostMapping
    @PreAuthorize("@rbac.can('intelligence/watchlist','create')")
    public WatchlistView adicionar(@Valid @RequestBody AdicionarWatchlistRequest request) {
        return useCase.adicionar(request.toCommand());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@rbac.can('intelligence/watchlist','edit')")
    public void remover(@PathVariable UUID id) {
        useCase.remover(id);
    }

    @PostMapping("/{id}/toggle")
    @PreAuthorize("@rbac.can('intelligence/watchlist','edit')")
    public WatchlistView alternar(@PathVariable UUID id) {
        return useCase.alternar(id);
    }
}
