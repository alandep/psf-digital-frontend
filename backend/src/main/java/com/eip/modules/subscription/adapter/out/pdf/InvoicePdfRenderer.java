package com.eip.modules.subscription.adapter.out.pdf;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.eip.modules.subscription.domain.port.out.InvoicePdfPort;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

/**
 * OpenPDF renderer of the A4 "Segunda via de fatura". Standard Helvetica
 * (WinAnsi) covers pt-BR accents, so no font is embedded.
 */
@Component
public class InvoicePdfRenderer implements InvoicePdfPort {

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private static final Locale PT_BR = Locale.of("pt", "BR");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final Color BRAND = new Color(0x0D, 0x3B, 0x66);
    private static final Color ACCENT = new Color(0xE8, 0xF0, 0xF8);
    private static final Color MUTED = new Color(0x55, 0x5F, 0x6B);
    private static final Color BORDER = new Color(0xD5, 0xDC, 0xE4);

    private static final Font TITLE = new Font(Font.HELVETICA, 16, Font.BOLD, Color.WHITE);
    private static final Font SUBTITLE = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.WHITE);
    private static final Font H2 = new Font(Font.HELVETICA, 11, Font.BOLD, BRAND);
    private static final Font LABEL = new Font(Font.HELVETICA, 8, Font.NORMAL, MUTED);
    private static final Font VALUE = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
    private static final Font VALUE_BOLD = new Font(Font.HELVETICA, 10, Font.BOLD, Color.BLACK);
    private static final Font TABLE_HEAD = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font TOTAL = new Font(Font.HELVETICA, 14, Font.BOLD, BRAND);
    private static final Font LINK = new Font(Font.HELVETICA, 10, Font.UNDERLINE, new Color(0x15, 0x65, 0xC0));
    private static final Font SMALL = new Font(Font.HELVETICA, 8, Font.NORMAL, MUTED);
    private static final Font MONO = new Font(Font.COURIER, 7, Font.NORMAL, Color.BLACK);

    @Override
    public byte[] render(InvoiceDocument d) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 36, 36);
        try {
            PdfWriter.getInstance(doc, out);
            doc.addTitle("Segunda via de fatura " + nvl(d.number()));
            doc.addAuthor(nvl(d.issuerName()));
            doc.open();
            header(doc);
            parties(doc, d);
            meta(doc, d);
            items(doc, d);
            instructions(doc, d);
            footer(doc, d);
            doc.close();
        } catch (DocumentException ex) {
            throw new IllegalStateException("Falha ao gerar o PDF da fatura", ex);
        }
        return out.toByteArray();
    }

    // ------------------------------------------------------------------ sections

    private static void header(Document doc) throws DocumentException {
        PdfPTable bar = new PdfPTable(1);
        bar.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(BRAND);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(14);
        cell.addElement(new Paragraph("EIP — Export Intelligence Platform", TITLE));
        cell.addElement(new Paragraph("Segunda via de fatura", SUBTITLE));
        bar.addCell(cell);
        bar.setSpacingAfter(14);
        doc.add(bar);
    }

    private static void parties(Document doc, InvoiceDocument d) throws DocumentException {
        PdfPTable t = new PdfPTable(2);
        t.setWidthPercentage(100);
        t.setWidths(new float[] {1f, 1f});
        PdfPCell issuer = box();
        issuer.addElement(new Paragraph("Emitente", H2));
        issuer.addElement(new Paragraph(nvl(d.issuerName()), VALUE_BOLD));
        addIfPresent(issuer, "CNPJ: ", formatCnpj(d.issuerCnpj()));
        addIfPresent(issuer, "", d.issuerAddress());
        addIfPresent(issuer, "E-mail: ", d.issuerEmail());
        PdfPCell customer = box();
        customer.addElement(new Paragraph("Cliente", H2));
        customer.addElement(new Paragraph(nvl(d.customerName()), VALUE_BOLD));
        addIfPresent(customer, "CNPJ: ", formatCnpj(d.customerCnpj()));
        addIfPresent(customer, "E-mail: ", d.customerEmail());
        t.addCell(issuer);
        t.addCell(customer);
        t.setSpacingAfter(12);
        doc.add(t);
    }

    private static void meta(Document doc, InvoiceDocument d) throws DocumentException {
        PdfPTable t = new PdfPTable(3);
        t.setWidthPercentage(100);
        t.addCell(field("Número", nvl(d.number())));
        t.addCell(field("Emissão", formatDateTime(d.issuedAt())));
        t.addCell(field("Vencimento", formatDate(d.dueDate())));
        t.addCell(field("Pagamento", d.paidAt() != null ? formatDateTime(d.paidAt()) : "—"));
        t.addCell(field("Status", statusLabel(d.status())));
        t.addCell(field("Forma de pagamento", billingTypeLabel(d.billingType())));
        t.setSpacingAfter(14);
        doc.add(t);
    }

    private static void items(Document doc, InvoiceDocument d) throws DocumentException {
        doc.add(new Paragraph("Itens", H2));
        PdfPTable t = new PdfPTable(3);
        t.setWidthPercentage(100);
        t.setWidths(new float[] {5f, 2f, 2f});
        t.setSpacingBefore(6);
        t.addCell(head("Descrição", Element.ALIGN_LEFT));
        t.addCell(head("Período", Element.ALIGN_CENTER));
        t.addCell(head("Valor", Element.ALIGN_RIGHT));
        t.addCell(body(nvl(d.description()), Element.ALIGN_LEFT));
        t.addCell(body(formatPeriod(d.period()), Element.ALIGN_CENTER));
        t.addCell(body(brl(d.amount()), Element.ALIGN_RIGHT));

        PdfPCell totalLabel = new PdfPCell(new Phrase("Total", TOTAL));
        totalLabel.setColspan(2);
        totalLabel.setBackgroundColor(ACCENT);
        totalLabel.setBorderColor(BORDER);
        totalLabel.setPadding(8);
        PdfPCell totalValue = new PdfPCell(new Phrase(brl(d.amount()), TOTAL));
        totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalValue.setBackgroundColor(ACCENT);
        totalValue.setBorderColor(BORDER);
        totalValue.setPadding(8);
        t.addCell(totalLabel);
        t.addCell(totalValue);
        t.setSpacingAfter(16);
        doc.add(t);
    }

    private static void instructions(Document doc, InvoiceDocument d) throws DocumentException {
        doc.add(new Paragraph("Instruções de pagamento", H2));
        boolean open = "OPEN".equals(d.status()) || "OVERDUE".equals(d.status());
        if ("PAID".equals(d.status())) {
            doc.add(new Paragraph("Fatura paga. Obrigado!", VALUE));
        } else if (!open) {
            doc.add(new Paragraph("Esta fatura não está disponível para pagamento.", VALUE));
        }
        if (d.invoiceUrl() != null) {
            Paragraph p = new Paragraph();
            p.add(new Chunk("Fatura online: ", VALUE));
            Chunk link = new Chunk(d.invoiceUrl(), LINK);
            link.setAnchor(d.invoiceUrl());
            p.add(link);
            p.setSpacingBefore(4);
            doc.add(p);
        }
        if (open && "PIX".equals(d.billingType()) && d.pixEncodedImage() != null) {
            try {
                Image qr = Image.getInstance(Base64.getDecoder().decode(d.pixEncodedImage()));
                qr.scaleAbsolute(150, 150);
                qr.setSpacingBefore(8);
                doc.add(new Paragraph("Pague com Pix escaneando o QR Code:", VALUE));
                doc.add(qr);
            } catch (Exception ex) {
                doc.add(new Paragraph("QR Code Pix indisponível; use o código abaixo.", SMALL));
            }
            if (d.pixPayload() != null) {
                doc.add(new Paragraph("Pix copia e cola:", VALUE_BOLD));
                Paragraph payload = new Paragraph(d.pixPayload(), MONO);
                payload.setSpacingAfter(6);
                doc.add(payload);
            }
        }
        if (open && "BOLETO".equals(d.billingType()) && d.bankSlipUrl() != null) {
            Paragraph p = new Paragraph();
            p.add(new Chunk("Boleto bancário: ", VALUE));
            Chunk link = new Chunk(d.bankSlipUrl(), LINK);
            link.setAnchor(d.bankSlipUrl());
            p.add(link);
            p.setSpacingBefore(4);
            doc.add(p);
        }
    }

    private static void footer(Document doc, InvoiceDocument d) throws DocumentException {
        OffsetDateTime generated = d.generatedAt() != null ? d.generatedAt() : OffsetDateTime.now();
        Paragraph p = new Paragraph("Documento gerado eletronicamente em "
                + DATE_TIME.format(generated.atZoneSameInstant(ZONE)) + " (horário de Brasília).",
                SMALL);
        p.setSpacingBefore(24);
        p.setAlignment(Element.ALIGN_CENTER);
        doc.add(p);
    }

    // ------------------------------------------------------------------ cells

    private static PdfPCell box() {
        PdfPCell c = new PdfPCell();
        c.setBorderColor(BORDER);
        c.setPadding(10);
        return c;
    }

    private static void addIfPresent(PdfPCell cell, String prefix, String value) {
        if (value != null && !value.isBlank()) {
            cell.addElement(new Paragraph(prefix + value, VALUE));
        }
    }

    private static PdfPCell field(String label, String value) {
        PdfPCell c = new PdfPCell();
        c.setBorderColor(BORDER);
        c.setPadding(6);
        c.addElement(new Paragraph(label, LABEL));
        c.addElement(new Paragraph(value, VALUE_BOLD));
        return c;
    }

    private static PdfPCell head(String text, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, TABLE_HEAD));
        c.setBackgroundColor(BRAND);
        c.setBorderColor(BRAND);
        c.setPadding(6);
        c.setHorizontalAlignment(align);
        return c;
    }

    private static PdfPCell body(String text, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, VALUE));
        c.setBorderColor(BORDER);
        c.setPadding(6);
        c.setHorizontalAlignment(align);
        return c;
    }

    // ------------------------------------------------------------------ formatting

    static String brl(BigDecimal value) {
        NumberFormat nf = NumberFormat.getCurrencyInstance(PT_BR);
        return nf.format(value == null ? BigDecimal.ZERO : value).replace('\u00A0', ' ');
    }

    static String formatCnpj(String raw) {
        if (raw == null) {
            return null;
        }
        String d = raw.replaceAll("\\D", "");
        if (d.length() != 14) {
            return raw;
        }
        return d.substring(0, 2) + "." + d.substring(2, 5) + "." + d.substring(5, 8) + "/"
                + d.substring(8, 12) + "-" + d.substring(12);
    }

    static String statusLabel(String status) {
        if (status == null) {
            return "—";
        }
        return switch (status) {
            case "OPEN" -> "Em aberto";
            case "PAID" -> "Paga";
            case "OVERDUE" -> "Vencida";
            case "REFUNDED" -> "Estornada";
            case "CANCELED" -> "Cancelada";
            case "FAILED" -> "Falhou";
            default -> status;
        };
    }

    static String billingTypeLabel(String type) {
        if (type == null) {
            return "—";
        }
        return switch (type) {
            case "CREDIT_CARD" -> "Cartão de crédito";
            case "PIX" -> "Pix";
            case "BOLETO" -> "Boleto bancário";
            default -> type;
        };
    }

    private static String formatDate(LocalDate date) {
        return date == null ? "—" : DATE.format(date);
    }

    private static String formatDateTime(OffsetDateTime dt) {
        return dt == null ? "—" : DATE_TIME.format(dt.atZoneSameInstant(ZONE));
    }

    private static String formatPeriod(String period) {
        if (period != null && period.matches("\\d{4}-\\d{2}")) {
            return period.substring(5) + "/" + period.substring(0, 4);
        }
        return nvl(period);
    }

    private static String nvl(String v) {
        return v == null || v.isBlank() ? "—" : v;
    }
}
