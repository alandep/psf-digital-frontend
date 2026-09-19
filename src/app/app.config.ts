import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

import { routes } from './app.routes';
import { BffService } from './services/bff.service';
import { NotificationService } from './services/notification.service';
import { NCMClassificationMockService } from '../services/ncm-classification-mock.service';
import { exportacaoServiceProvider } from './services/exportacao/exportacao-service.token';
import { authFlowServiceProvider } from './services/auth-flow/auth-flow.token';
import { subscriptionServiceProvider } from './services/subscription/subscription-service.token';
import { documentsServiceProvider } from './services/documents/documents-service.token';
import { logisticsServiceProvider } from './services/logistics/logistics-service.token';
import { pagamentosServiceProvider } from './services/finance/pagamentos-service.token';
import { cambioServiceProvider } from './services/finance/cambio-service.token';
import { hedgeServiceProvider } from './services/finance/hedge-service.token';
import { credentialsInterceptor } from './http/credentials.interceptor';
import { csrfInterceptor } from './http/csrf.interceptor';
import { errorInterceptor } from './http/error.interceptor';

// Registra o locale pt-BR para pipes de data/numero do Angular.
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([credentialsInterceptor, csrfInterceptor, errorInterceptor])
    ),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    BffService,
    NotificationService,
    NCMClassificationMockService,
    exportacaoServiceProvider,
    authFlowServiceProvider,
    subscriptionServiceProvider,
    documentsServiceProvider,
    logisticsServiceProvider,
    pagamentosServiceProvider,
    cambioServiceProvider,
    hedgeServiceProvider,
  ],
};
