package com.eip.modules.subscription.adapter.out.pdf;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.Test;

import com.eip.modules.subscription.domain.port.out.InvoicePdfPort.InvoiceDocument;

/** Renders real PDFs with OpenPDF (no Spring). */
class InvoicePdfRendererTest {

    private static final String PNG_1X1 =
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

    private final InvoicePdfRenderer renderer = new InvoicePdfRenderer();

    private static InvoiceDocument doc(String status, String billingType, String pixImage) {
        return new InvoiceDocument("EIP - Export Intelligence Platform", "12345678000195",
                "Av. Paulista, 1000 - São Paulo/SP", "financeiro@iaexport.com.br",
                "Exportadora Açaí Ltda.", "11222333000181", "contato@acai.com.br",
                "EIP-202612-ABC123", OffsetDateTime.parse("2026-11-24T10:00:00-03:00"),
                LocalDate.of(2026, 12, 5), null, status, billingType,
                "EIP Business - assinatura mensal", "2026-12", new BigDecimal("2490.00"),
                "https://sandbox.asaas.com/i/pay_1", "https://sandbox.asaas.com/b/pdf/pay_1",
                pixImage, pixImage != null ? "00020126580014br.gov.bcb.pix0136abc" : null,
                OffsetDateTime.now());
    }

    @Test
    void rendersOpenPixInvoice() {
        byte[] pdf = renderer.render(doc("OPEN", "PIX", PNG_1X1));
        assertThat(new String(pdf, 0, 4, StandardCharsets.US_ASCII)).isEqualTo("%PDF");
        assertThat(pdf.length).isGreaterThan(1024);
    }

    @Test
    void rendersPaidCardInvoice() {
        byte[] pdf = renderer.render(doc("PAID", "CREDIT_CARD", null));
        assertThat(new String(pdf, 0, 4, StandardCharsets.US_ASCII)).isEqualTo("%PDF");
        assertThat(pdf.length).isGreaterThan(1024);
    }

    @Test
    void formatsPtBr() {
        assertThat(InvoicePdfRenderer.brl(new BigDecimal("1790.00"))).isEqualTo("R$ 1.790,00");
        assertThat(InvoicePdfRenderer.formatCnpj("11222333000181")).isEqualTo("11.222.333/0001-81");
        assertThat(InvoicePdfRenderer.statusLabel("OVERDUE")).isEqualTo("Vencida");
        assertThat(InvoicePdfRenderer.billingTypeLabel("BOLETO")).isEqualTo("Boleto bancário");
    }
}
