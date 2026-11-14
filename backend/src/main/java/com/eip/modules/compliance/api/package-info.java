/**
 * Public API of the Compliance module (Spring Modulith named interface "alerts").
 * Exposes {@link com.eip.modules.compliance.api.ComplianceAlertCountPort} for the
 * Export dashboard; all other Compliance packages remain module-internal.
 */
@NamedInterface("alerts")
package com.eip.modules.compliance.api;

import org.springframework.modulith.NamedInterface;
