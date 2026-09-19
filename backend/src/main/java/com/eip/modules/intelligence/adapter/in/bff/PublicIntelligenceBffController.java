package com.eip.modules.intelligence.adapter.in.bff;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.intelligence.domain.port.in.ConsultarFeedUseCase;
import com.eip.modules.intelligence.domain.port.in.ConsultarFeedUseCase.FeedItemView;
import com.eip.modules.intelligence.domain.port.in.ConsultarFeedUseCase.ItemDetailView;

import lombok.RequiredArgsConstructor;

/**
 * PUBLIC BFF endpoints for the curated intelligence feed. Reachable without
 * authentication ({@code /bff/public/**} is permitted by SecurityConfig).
 */
@RestController
@RequestMapping("/bff/public/intelligence")
@RequiredArgsConstructor
public class PublicIntelligenceBffController {

    private final ConsultarFeedUseCase useCase;

    @GetMapping
    public List<FeedItemView> feed(@RequestParam(required = false) String type) {
        return useCase.feed(type);
    }

    @GetMapping("/{slug}")
    public ItemDetailView porSlug(@PathVariable String slug) {
        return useCase.porSlug(slug);
    }
}
