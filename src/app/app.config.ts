import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { BffService } from './services/bff.service';
import { NotificationService } from './services/notification.service';
import { NCMClassificationMockService } from '../services/ncm-classification-mock.service';
import { exportacaoServiceProvider } from './services/exportacao/exportacao-service.token';

// Registra o locale pt-BR para pipes de data/numero do Angular.
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    BffService,
    NotificationService,
    NCMClassificationMockService,
    exportacaoServiceProvider,
  ],
};
