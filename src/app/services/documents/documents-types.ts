// Front-facing types matching the backend's generic document model
// (/bff/documentos). These back a FUTURE generic documents view and are the
// integration point; the 4 rich document screens keep their own domain models.

export interface DocumentSummary {
  id: string;
  type: string;
  title: string;
  originalFilename: string;
  mediaType: string;
  sizeBytes: number | null;
  uploadStatus: string;
  scanStatus: string;
  createdAt: string;
}

export interface UploadTicket {
  documentId: string;
  uploadUrl: string;
  storageKey: string;
  expiresAt: string;
}

export interface DownloadTicket {
  downloadUrl: string;
  expiresAt: string;
}

export interface IniciarUpload {
  type: string;
  title: string;
  originalFilename: string;
  mediaType: string;
  exportId?: string;
  legalEntityId?: string;
}
