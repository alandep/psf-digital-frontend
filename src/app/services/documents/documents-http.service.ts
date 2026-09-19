import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDocumentsService } from './documents-service.interface';
import { environment } from '../../../environments/environment';
import {
  DocumentSummary,
  UploadTicket,
  DownloadTicket,
  IniciarUpload
} from './documents-types';

// HTTP gateway for the generic documents module. Only used when
// environment.realApis.documents === true; otherwise the mock is provided.
@Injectable({
  providedIn: 'root'
})
export class DocumentsHttpService implements IDocumentsService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.bffBaseUrl}/bff/documentos`;

  listar(type?: string, exportId?: string): Observable<DocumentSummary[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    if (exportId) {
      params = params.set('exportId', exportId);
    }
    return this.http.get<DocumentSummary[]>(this.api, { params });
  }

  porId(id: string): Observable<DocumentSummary> {
    return this.http.get<DocumentSummary>(`${this.api}/${id}`);
  }

  iniciarUpload(cmd: IniciarUpload): Observable<UploadTicket> {
    return this.http.post<UploadTicket>(`${this.api}/upload/iniciar`, cmd);
  }

  confirmarUpload(id: string, sizeBytes: number, sha256: string): Observable<DocumentSummary> {
    return this.http.post<DocumentSummary>(`${this.api}/${id}/upload/confirmar`, {
      sizeBytes,
      sha256
    });
  }

  gerarDownload(id: string): Observable<DownloadTicket> {
    return this.http.get<DownloadTicket>(`${this.api}/${id}/download`);
  }
}
