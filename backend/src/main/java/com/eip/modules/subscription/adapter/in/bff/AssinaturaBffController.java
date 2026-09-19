package com.eip.modules.subscription.adapter.in.bff;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.subscription.domain.port.in.CheckoutUseCase;
import com.eip.modules.subscription.domain.port.in.CheckoutUseCase.CheckoutView;
import com.eip.modules.subscription.domain.port.in.ManageSubscriptionUseCase;
import com.eip.modules.subscription.domain.port.in.ManageSubscriptionUseCase.InvoiceView;
import com.eip.modules.subscription.domain.port.in.ManageSubscriptionUseCase.PlanView;
import com.eip.modules.subscription.domain.port.in.ManageSubscriptionUseCase.SubscriptionView;
import com.eip.modules.subscription.domain.port.in.ManageSubscriptionUseCase.UsageView;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints backing the organization billing screens
 * (front {@code saasBillingMockService}).
 */
@RestController
@RequestMapping("/bff/assinatura")
@RequiredArgsConstructor
public class AssinaturaBffController {

    private final ManageSubscriptionUseCase manageUseCase;
    private final CheckoutUseCase checkoutUseCase;

    @GetMapping
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public SubscriptionView current() {
        return manageUseCase.current();
    }

    @GetMapping("/planos")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public List<PlanView> planos() {
        return manageUseCase.plans();
    }

    @GetMapping("/uso")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public List<UsageView> uso() {
        return manageUseCase.usage();
    }

    @GetMapping("/faturas")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public List<InvoiceView> faturas() {
        return manageUseCase.invoices();
    }

    @PostMapping("/plano")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public SubscriptionView alterarPlano(@RequestBody AlterarPlanoRequest request) {
        return manageUseCase.changePlan(request.planCode());
    }

    @PostMapping("/cancelar")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public SubscriptionView cancelar(@RequestBody CancelarRequest request) {
        return manageUseCase.cancel(request != null ? request.reason() : null);
    }

    @PostMapping("/reativar")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public SubscriptionView reativar() {
        return manageUseCase.reactivate();
    }

    @PostMapping("/checkout")
    @PreAuthorize("@rbac.can('admin/assinatura','create')")
    public CheckoutView checkout(@RequestBody CheckoutRequest request) {
        return checkoutUseCase.startCheckout(request.planCode(), request.interval());
    }

    /** Request to switch the current subscription to another plan. */
    public record AlterarPlanoRequest(@NotBlank String planCode) {
    }

    /** Request to cancel the current subscription (optional reason). */
    public record CancelarRequest(String reason) {
    }

    /** Request to start a checkout session. */
    public record CheckoutRequest(@NotBlank String planCode, String interval) {
    }
}
