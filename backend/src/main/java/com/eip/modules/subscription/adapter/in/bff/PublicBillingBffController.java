package com.eip.modules.subscription.adapter.in.bff;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.subscription.application.BillingCommands.CheckoutCommand;
import com.eip.modules.subscription.application.BillingCommands.DemoCommand;
import com.eip.modules.subscription.application.BillingService;
import com.eip.modules.subscription.application.BillingViews.CheckoutResult;
import com.eip.modules.subscription.application.BillingViews.CouponView;
import com.eip.modules.subscription.application.BillingViews.PackView;
import com.eip.modules.subscription.application.BillingViews.PlanView;
import com.eip.modules.subscription.application.CouponService;
import com.eip.modules.subscription.application.DemoRequestService;
import com.eip.modules.subscription.application.PlanCatalogService;
import com.eip.platform.security.BffSessionBinder;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Public (pre-login) billing endpoints under {@code /bff/public/signup}
 * (billing contract, 4.1). Permitted and CSRF-exempt in {@code SecurityConfig}.
 * The checkout binds the new tenant to the session exactly like the signup.
 */
@RestController
@RequestMapping("/bff/public/signup")
@RequiredArgsConstructor
public class PublicBillingBffController {

    private final PlanCatalogService catalog;
    private final CouponService coupons;
    private final DemoRequestService demoRequests;
    private final BillingService billing;
    private final BffSessionBinder sessionBinder;

    /** Checkout response (billing contract, 4.1). */
    public record CheckoutResponse(UUID organizationId, String planCode, String interval,
            BigDecimal amount, OffsetDateTime trialEnd, LocalDate nextDueDate,
            String paymentMethod, String cardBrand, String cardLast4) {
    }

    @GetMapping("/planos")
    public List<PlanView> planos() {
        return catalog.plans();
    }

    @GetMapping("/pacotes")
    public List<PackView> pacotes() {
        return catalog.packs();
    }

    @GetMapping("/cupom/{code}")
    public CouponView cupom(@PathVariable("code") String code,
            @RequestParam(name = "plan", required = false) String plan,
            @RequestParam(name = "interval", required = false) String interval) {
        return coupons.validate(code, plan, interval);
    }

    @PostMapping("/demo")
    public Map<String, Boolean> demo(@RequestBody DemoCommand request, HttpServletRequest http) {
        demoRequests.request(request, ClientInfoResolver.ip(http));
        return Map.of("ok", Boolean.TRUE);
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@RequestBody CheckoutCommand request,
            HttpServletRequest http, HttpServletResponse response) {
        CheckoutResult r = billing.checkout(request, ClientInfoResolver.of(http));
        sessionBinder.bind(http, response, r.organizationId().toString(), r.userId().toString());
        return new CheckoutResponse(r.organizationId(), r.planCode(), r.interval(), r.amount(),
                r.trialEnd(), r.nextDueDate(), r.paymentMethod(), r.cardBrand(), r.cardLast4());
    }
}
