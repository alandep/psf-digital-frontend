package com.eip.modules.document.domain.model;

/**
 * Result of the antivirus / content scan performed on an uploaded file.
 */
public enum ScanStatus {
    PENDING,
    CLEAN,
    INFECTED
}
