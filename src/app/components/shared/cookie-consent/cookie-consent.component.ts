// Global cookie consent banner (§65). Standalone, injected at app root.
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CookieConsentService } from '../../../../services/cookieConsentService';
import {
  CookiePreferencesDialogComponent,
  CookiePrefsData,
} from '../cookie-preferences-dialog/cookie-preferences-dialog.component';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div
      class="cc-bar"
      *ngIf="visible"
      role="dialog"
      aria-label="Aviso de cookies"
    >
      <div class="cc-inner">
        <p class="cc-text">
          Utilizamos cookies para operar a plataforma e, com seu consentimento, para analytics,
          preferências e marketing. Cookies essenciais são sempre ativos.
          <a routerLink="/legal/privacidade" class="cc-link">Saiba mais</a>
        </p>
        <div class="cc-actions">
          <button mat-stroked-button type="button" (click)="reject()">Rejeitar não essenciais</button>
          <button mat-stroked-button type="button" (click)="customize()">Personalizar</button>
          <button mat-flat-button color="primary" type="button" class="cc-accept" (click)="accept()">
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './cookie-consent.component.scss',
})
export class CookieConsentComponent implements OnInit, OnDestroy {
  visible = false;
  private sub?: Subscription;

  constructor(private consent: CookieConsentService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.sub = this.consent.consent$.subscribe((value) => {
      this.visible = value === null;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  reject(): void {
    this.consent.rejectNonEssential();
  }

  accept(): void {
    this.consent.acceptAll();
  }

  customize(): void {
    const current = this.consent.current;
    const data: CookiePrefsData = {
      analytics: current?.analytics ?? false,
      preferences: current?.preferences ?? false,
      marketing: current?.marketing ?? false,
    };
    const ref = this.dialog.open(CookiePreferencesDialogComponent, {
      data,
      panelClass: 'cookie-prefs-panel',
      autoFocus: false,
      width: '520px',
      maxWidth: '92vw',
    });
    ref.afterClosed().subscribe((result: CookiePrefsData | undefined) => {
      if (!result) {
        return;
      }
      this.consent.save(result);
    });
  }
}
