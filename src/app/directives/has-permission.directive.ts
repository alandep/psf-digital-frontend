import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthProfileService } from '../../services/authProfileService';
import { PermissionAction } from '../../types/perfil-acesso';

// Accepted input shapes for *appHasPermission.
type PermissionInput =
  | string // 'route' (=> view) or 'route:action'
  | { screen: string; action?: PermissionAction };

/**
 * Structural directive that shows its element only when the current profile is
 * allowed to perform the requested action on the given screen.
 *
 * Usage:
 *   *appHasPermission="'financeiro/pagamentos:edit'"
 *   *appHasPermission="{ screen: 'financeiro/pagamentos', action: 'edit' }"
 *   *appHasPermission="'financeiro/pagamentos'"  // defaults to canView
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private auth = inject(AuthProfileService);

  private sub?: Subscription;
  private screen = '';
  private action: PermissionAction = 'view';
  private visible = false;

  @Input('appHasPermission') set appHasPermission(value: PermissionInput) {
    if (typeof value === 'string') {
      const [screen, action] = value.split(':');
      this.screen = (screen || '').trim();
      this.action = (action?.trim() as PermissionAction) || 'view';
    } else if (value && typeof value === 'object') {
      this.screen = value.screen || '';
      this.action = value.action || 'view';
    }
    this.evaluate();
  }

  ngOnInit(): void {
    // Re-evaluate whenever the profile changes.
    this.sub = this.auth.profile$.subscribe(() => this.evaluate());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private evaluate(): void {
    if (!this.screen) {
      this.render(false);
      return;
    }
    const screenId = this.auth.routeToScreenId(this.screen);
    const allowed = this.auth.can(screenId, this.action);
    this.render(allowed);
  }

  private render(allowed: boolean): void {
    if (allowed && !this.visible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.visible = true;
    } else if (!allowed && this.visible) {
      this.viewContainer.clear();
      this.visible = false;
    }
  }
}
