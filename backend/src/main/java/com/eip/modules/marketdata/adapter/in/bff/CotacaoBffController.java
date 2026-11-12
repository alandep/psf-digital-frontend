package com.eip.modules.marketdata.adapter.in.bff;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.marketdata.domain.port.in.ConsultarCotacaoUseCase;
import com.eip.modules.marketdata.domain.port.in.ConsultarCotacaoUseCase.CotacaoView;

import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints for market quotes against BRL (toolbar, exchange screen,
 * simulators, copilot). Global market data (no tenant scope), so no
 * {@code @PreAuthorize}: the BFF chain already requires authentication for
 * every {@code /bff/**} call, which also keeps the free upstream sources from
 * being exposed to anonymous traffic.
 */
@RestController
@RequestMapping("/bff/mercado")
@RequiredArgsConstructor
public class CotacaoBffController {

    private final ConsultarCotacaoUseCase useCase;

    /** Single quote, e.g. {@code /bff/mercado/cotacao/usd}. */
    @GetMapping("/cotacao/{moeda}")
    public CotacaoView cotacao(@PathVariable String moeda) {
        return useCase.cotacao(moeda);
    }

    /** Batch quotes, e.g. {@code /bff/mercado/cotacoes?moedas=USD,EUR,GBP}. */
    @GetMapping("/cotacoes")
    public List<CotacaoView> cotacoes(@RequestParam("moedas") List<String> moedas) {
        return useCase.cotacoes(moedas);
    }

    /** Currencies available for quoting. */
    @GetMapping("/moedas")
    public Set<String> moedas() {
        return useCase.moedasSuportadas();
    }
}