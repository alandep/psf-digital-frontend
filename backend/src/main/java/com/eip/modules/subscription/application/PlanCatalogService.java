package com.eip.modules.subscription.application;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eip.modules.subscription.application.BillingViews.PackView;
import com.eip.modules.subscription.application.BillingViews.PlanLimits;
import com.eip.modules.subscription.application.BillingViews.PlanView;
import com.eip.modules.subscription.domain.model.BillingInterval;
import com.eip.modules.subscription.domain.port.out.PlanRepositoryPort;
import com.eip.modules.subscription.domain.port.out.PlanRepositoryPort.PlanData;
import com.eip.modules.subscription.domain.port.out.PlanRepositoryPort.PlanFeatureData;
import com.eip.platform.error.BusinessRuleException;

import lombok.RequiredArgsConstructor;

/**
 * Plan catalog (prices from {@code plan}, modules/limits from {@code plan_feature})
 * and the add-on pack catalog (billing contract, section 1).
 */
@Service
@RequiredArgsConstructor
public class PlanCatalogService {

    public static final String ENTERPRISE = "ENTERPRISE";
    static final String ENTERPRISE_MESSAGE = "Plano Enterprise é contratado com nosso time comercial.";

    /** Add-on packs: one-off payment, valid until the end of the current cycle. */
    public static final List<PackView> PACKS = List.of(
            new PackView("AI_PACK", "EIP AI Pack",
                    "+10.000 créditos de IA e +2.000 páginas OCR, válidos até o fim do ciclo atual.",
                    new BigDecimal("390.00"), 10_000, 2_000, false),
            new PackView("AI_PACK_PLUS", "EIP AI Pack Plus",
                    "+30.000 créditos de IA e +6.000 páginas OCR, válidos até o fim do ciclo atual.",
                    new BigDecimal("790.00"), 30_000, 6_000, true));

    private final PlanRepositoryPort planRepo;

    @Transactional(readOnly = true)
    public List<PlanView> plans() {
        List<PlanView> out = new ArrayList<>();
        for (PlanData p : planRepo.activePlans()) {
            out.add(toView(p, planRepo.features(p.code())));
        }
        out.sort(Comparator.comparing(PlanView::monthlyPrice,
                Comparator.nullsLast(Comparator.<BigDecimal>naturalOrder())));
        return out;
    }

    public List<PackView> packs() {
        return PACKS;
    }

    public Optional<PackView> pack(String code) {
        if (code == null) {
            return Optional.empty();
        }
        String c = code.trim().toUpperCase(Locale.ROOT);
        return PACKS.stream().filter(p -> p.code().equals(c)).findFirst();
    }

    /** Plan that can be contracted self-service (ENTERPRISE is sales-only). */
    @Transactional(readOnly = true)
    public PlanData contractablePlan(String code) {
        String c = code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
        if (ENTERPRISE.equals(c)) {
            throw new BusinessRuleException(ENTERPRISE_MESSAGE);
        }
        return planRepo.byCode(c)
                .orElseThrow(() -> new BusinessRuleException("Plano não encontrado: " + code));
    }

    /** Full price of a plan for the interval. */
    public static BigDecimal price(PlanData plan, BillingInterval interval) {
        return interval == BillingInterval.ANNUAL ? plan.annualPrice() : plan.monthlyPrice();
    }

    static PlanView toView(PlanData p, List<PlanFeatureData> features) {
        Long ai = null;
        Long ocr = null;
        Long storage = null;
        List<String> modules = new ArrayList<>();
        for (PlanFeatureData f : features) {
            String key = f.featureKey();
            if (key.startsWith("mod.")) {
                if (f.enabled()) {
                    modules.add(key.substring("mod.".length()));
                }
            } else if ("limit.ai_credits".equals(key)) {
                ai = limit(f);
            } else if ("limit.ocr_pages".equals(key)) {
                ocr = limit(f);
            } else if ("limit.storage_gb".equals(key)) {
                storage = limit(f);
            }
        }
        return new PlanView(p.code(), p.name(), p.description(), p.monthlyPrice(),
                p.annualPrice(), p.highlighted(), new PlanLimits(ai, ocr, storage, null),
                List.copyOf(modules));
    }

    private static Long limit(PlanFeatureData f) {
        if (!f.enabled()) {
            return 0L;
        }
        return f.limitValue() == null ? null : f.limitValue().longValue();
    }
}
