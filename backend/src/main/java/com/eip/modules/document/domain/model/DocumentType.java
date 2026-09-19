package com.eip.modules.document.domain.model;

/**
 * Business category of a document. Backs the front's invoice / packingList /
 * billOfLading / certificados / contracts screens.
 */
public enum DocumentType {
    INVOICE,
    PACKING_LIST,
    BILL_OF_LADING,
    CERTIFICATE,
    CONTRACT,
    OTHER
}
