package com.eip.modules.subscription.adapter.in.bff;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eip.modules.subscription.application.BillingCommands.ActivateCommand;
import com.eip.modules.subscription.application.BillingCommands.CancelCommand;
import com.eip.modules.subscription.application.BillingCommands.ChangePlanCommand;
import com.eip.modules.subscription.application.BillingCommands.PackPurchaseCommand;
import com.eip.modules.subscription.application.BillingCommands.PaymentInput;
import com.eip.modules.subscription.application.BillingService;
import com.eip.modules.subscription.application.BillingViews.InvoicePdf;
import com.eip.modules.subscription.application.BillingViews.InvoiceView;
import com.eip.modules.subscription.application.BillingViews.PackPurchaseView;
import com.eip.modules.subscription.application.BillingViews.PackView;
import com.eip.modules.subscription.application.BillingViews.PixView;
import com.eip.modules.subscription.application.BillingViews.PlanView;
import com.eip.modules.subscription.application.BillingViews.SubscriptionView;
import com.eip.modules.subscription.application.BillingViews.UsageView;
import com.eip.modules.subscription.application.PlanCatalogService;
import com.eip.platform.billing.UsageQuotaService.UsageEntry;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

/**
 * BFF endpoints of the organization billing screens (billing contract, 4.2).
 * RBAC screen {@code admin/assinatura} (always open to ADMINISTRADOR).
 */
@RestController
@RequestMapping("/bff/assinatura")
@RequiredArgsConstructor
public class AssinaturaBffController {

    private final BillingService billing;
    private final PlanCatalogService catalog;

    @GetMapping
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public SubscriptionView current() {
        return billing.current();
    }

    @GetMapping("/planos")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public List<PlanView> planos() {
        return catalog.plans();
    }

    @GetMapping("/pacotes")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public List<PackView> pacotes() {
        return catalog.packs();
    }

    @GetMapping("/uso")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public UsageView uso() {
        return billing.usage();
    }

    @GetMapping("/uso/extrato")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public List<UsageEntry> extrato(@RequestParam(name = "feature", defaultValue = "AI") String feature,
            @RequestParam(name = "limit", required = false) Integer limit) {
        return billing.usageStatement(feature, limit);
    }

    @GetMapping("/faturas")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public List<InvoiceView> faturas() {
        return billing.invoices();
    }

    @GetMapping("/faturas/{id}/pdf")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public ResponseEntity<byte[]> faturaPdf(@PathVariable("id") UUID id) {
        InvoicePdf pdf = billing.invoicePdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(pdf.filename()).build().toString())
                .body(pdf.content());
    }

    @GetMapping("/faturas/{id}/pix")
    @PreAuthorize("@rbac.can('admin/assinatura','view')")
    public PixView faturaPix(@PathVariable("id") UUID id) {
        return billing.invoicePix(id);
    }

    @PostMapping("/ativar")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public SubscriptionView ativar(@RequestBody ActivateCommand request, HttpServletRequest http) {
        return billing.activate(request, ClientInfoResolver.of(http));
    }

    @PostMapping("/plano")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public SubscriptionView alterarPlano(@RequestBody ChangePlanCommand request) {
        return billing.changePlan(request);
    }

    @PostMapping("/forma-pagamento")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public SubscriptionView formaPagamento(@RequestBody PaymentInput request,
            HttpServletRequest http) {
        return billing.changePaymentMethod(request, ClientInfoResolver.of(http));
    }

    @PostMapping("/cancelar")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public SubscriptionView cancelar(@RequestBody CancelCommand request) {
        return billing.cancel(request);
    }

    @PostMapping("/reativar")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public SubscriptionView reativar(HttpServletRequest http) {
        return billing.reactivate(ClientInfoResolver.of(http));
    }

    @PostMapping("/pacotes")
    @PreAuthorize("@rbac.can('admin/assinatura','edit')")
    public PackPurchaseView comprarPacote(@RequestBody PackPurchaseCommand request,
            HttpServletRequest http) {
        return billing.purchasePack(request, ClientInfoResolver.of(http));
    }
}
