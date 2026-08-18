import { Observable } from 'rxjs';
import {
  Exportacao,
  ExportacaoFilterOptions,
  ExportacaoDashboard,
  AIAssistantMessage,
  SiscomexIntegration,
  AISuggestion,
  ExportacaoDocumento
} from '../../../types/exportacao';

export interface IExportacaoService {
  // CRUD
  getExportacoes(filters?: ExportacaoFilterOptions): Observable<Exportacao[]>;
  getExportacaoById(id: string): Observable<Exportacao | null>;
  createExportacao(exportacao: Partial<Exportacao>): Observable<Exportacao>;
  updateExportacao(id: string, exportacao: Partial<Exportacao>): Observable<Exportacao>;
  deleteExportacao(id: string): Observable<boolean>;

  // Dashboard & Details
  getDashboardData(): Observable<ExportacaoDashboard>;
  getExportacaoDetails(exportId: string): Observable<any>;

  // AI & Automation
  createExportacaoByNLP(text: string): Observable<Exportacao>;
  processOCRDocument(file: File): Observable<Exportacao>;
  generateExportWithAI(basicData: any): Observable<Exportacao>;
  getMasterData(): Observable<any>;
  getAISuggestions(formData: any): Observable<any[]>;
  getAIResponse(query: string): Observable<{message: string, suggestions?: AISuggestion[]}>;
  runAIAnalysis(exportId: string): Observable<any>;
  processAIQuery(query: string, contextExportId?: string): Observable<AIAssistantMessage[]>;

  // Validation & Compliance
  validateExportacao(exportId: string): Observable<{valid: boolean, errors: string[]}>;
  validateCompliance(exportId: string): Observable<{valid: boolean, errors: string[], warnings: string[]}>;

  // Documents
  generateDocuments(exportId: string): Observable<boolean>;
  regenerateDocument(exportId: string, documentId: string): Observable<ExportacaoDocumento>;

  // Siscomex
  sendToSiscomex(exportId: string): Observable<SiscomexIntegration>;
  checkSiscomexStatus(dueNumber: string): Observable<SiscomexIntegration>;

  // Utilities
  getCountries(): Observable<string[]>;
  getProducts(): Observable<{id: string, name: string, ncm: string}[]>;
  getPorts(): Observable<{origin: string[], destination: string[]}>;
}
