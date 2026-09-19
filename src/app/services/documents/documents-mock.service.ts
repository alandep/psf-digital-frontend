import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IDocumentsService } from './documents-service.interface';
import {
  DocumentSummary,
  UploadTicket,
  DownloadTicket,
  IniciarUpload
} from './documents-types';

// In-memory mock mirroring the backend document seed so the gateway works
// offline (default mode).
@Injectable({
  providedIn: 'root'
})
export class DocumentsMockService implements IDocumentsService {
  private readonly wait = 300;

  private readonly seed: DocumentSummary[] = [
    {
      id: 'DOC-0001',
      type: 'INVOICE',
      title: 'Commercial Invoice EXP-2024-0001',
      originalFilename: 'commercial-invoice-exp-2024-0001.pdf',
      mediaType: 'application/pdf',
      sizeBytes: 184320,
      uploadStatus: 'UPLOADED',
      scanStatus: 'CLEAN',
      createdAt: new Date().toISOString()
    },
    {
      id: 'DOC-0002',
      type: 'PACKING_LIST',
      title: 'Packing List EXP-2024-0001',
      originalFilename: 'packing-list-exp-2024-0001.pdf',
      mediaType: 'application/pdf',
      sizeBytes: 96256,
      uploadStatus: 'PENDING',
      scanStatus: 'PENDING',
      createdAt: new Date().toISOString()
    }
  ];

  listar(type?: string, exportId?: string): Observable<DocumentSummary[]> {
    let rows = [...this.seed];
    if (type) {
      rows = rows.filter((d) => d.type === type);
    }
    // exportId is not tracked in the mock seed; returned as-is for parity.
    void exportId;
    return of(rows).pipe(delay(this.wait));
  }

  porId(id: string): Observable<DocumentSummary> {
    const found = this.seed.find((d) => d.id === id) ?? this.seed[0];
    return of({ ...found }).pipe(delay(this.wait));
  }

  iniciarUpload(cmd: IniciarUpload): Observable<UploadTicket> {
    const documentId = `DOC-${Date.now()}`;
    const ticket: UploadTicket = {
      documentId,
      uploadUrl: `https://storage.mock/upload/${documentId}`,
      storageKey: `documentos/${cmd.type}/${documentId}`,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString()
    };
    return of(ticket).pipe(delay(this.wait));
  }

  confirmarUpload(id: string, sizeBytes: number, sha256: string): Observable<DocumentSummary> {
    void sha256;
    const base = this.seed.find((d) => d.id === id) ?? this.seed[0];
    const updated: DocumentSummary = {
      ...base,
      id,
      sizeBytes,
      uploadStatus: 'UPLOADED',
      scanStatus: 'PENDING'
    };
    return of(updated).pipe(delay(this.wait));
  }

  gerarDownload(id: string): Observable<DownloadTicket> {
    const ticket: DownloadTicket = {
      downloadUrl: `https://storage.mock/download/${id}?sig=mock`,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString()
    };
    return of(ticket).pipe(delay(this.wait));
  }
}
