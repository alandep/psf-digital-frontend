/**
 * Organization module read-side application services.
 *
 * <p>Exposed as the {@code query-api} named interface so other modules (notably
 * Identity, during the login/organization-selection flow) may depend on
 * {@code OrganizationQueryService} without reaching into the module's other
 * internals. All other Organization packages remain module-internal.
 */
@NamedInterface("query-api")
package com.eip.modules.organization.application;

import org.springframework.modulith.NamedInterface;
