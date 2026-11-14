/**
 * Public API of the Documents module (Spring Modulith named interface "storage").
 * {@link com.eip.modules.document.api.StoragePort} is the object-storage abstraction
 * other modules (e.g. AiHub OCR upload) may use; everything else stays internal.
 */
@NamedInterface("storage")
package com.eip.modules.document.api;

import org.springframework.modulith.NamedInterface;
