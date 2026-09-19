import { Observable } from 'rxjs';
import {
  DocumentSummary,
  UploadTicket,
  DownloadTicket,
  IniciarUpload
} from './documents-types';

// Gateway interface for the generic documents module (/bff/documentos).
export interface IDocumentsService {
  listar(type?: string, exportId?: string): Observable<DocumentSummary[]>;
  porId(id: string): Observable<DocumentSummary>;
  iniciarUpload(cmd: IniciarUpload): Observable<UploadTicket>;
  confirmarUpload(id: string, sizeBytes: number, sha256: string): Observable<DocumentSummary>;
  gerarDownload(id: string): Observable<DownloadTicket>;
}
