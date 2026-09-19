import { InjectionToken, Provider } from '@angular/core';
import { IDocumentsService } from './documents-service.interface';
import { DocumentsMockService } from './documents-mock.service';
import { DocumentsHttpService } from './documents-http.service';
import { environment } from '../../../environments/environment';

export const DOCUMENTS_SERVICE = new InjectionToken<IDocumentsService>('DocumentsService');

// Default (realApis.documents === false) keeps the mock. Flip the flag to
// route the generic documents gateway to the backend BFF.
export const documentsServiceProvider: Provider = {
  provide: DOCUMENTS_SERVICE,
  useClass: environment.realApis?.documents ? DocumentsHttpService : DocumentsMockService
};
