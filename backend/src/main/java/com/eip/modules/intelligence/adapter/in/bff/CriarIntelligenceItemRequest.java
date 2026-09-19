package com.eip.modules.intelligence.adapter.in.bff;

import com.eip.modules.intelligence.domain.port.in.CurarConteudoUseCase.CriarItemCommand;

import jakarta.validation.constraints.NotBlank;

/**
 * BFF request payload for creating a curated intelligence item in the CMS.
 */
public record CriarIntelligenceItemRequest(
        @NotBlank String type,
        @NotBlank String title,
        String slug,
        String summary,
        String content,
        String sourceName,
        String country,
        String sector,
        String commodity,
        String impactLevel,
        boolean aiGenerated,
        String aiAnalysis) {

    /** Maps this request to the use-case command. */
    public CriarItemCommand toCommand() {
        return new CriarItemCommand(
                type, title, slug, summary, content, sourceName, country, sector,
                commodity, impactLevel, aiGenerated, aiAnalysis);
    }
}
