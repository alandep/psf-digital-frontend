import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IExportacaoService } from './exportacao-service.interface';
import { ExportacaoMockService } from '../../../services/exportacaoMockService';
import {
  Exportacao,
  ExportacaoFilterOptions,
  ExportacaoDashboard,
  AIAssistantMessage,
  SiscomexIntegration,
  AISuggestion,
  ExportacaoDocumento
} from '../../../types/exportacao';

@Injectable({
  providedIn: 'root'
})
export class ExportacaoMockServiceAdapter implements IExportacaoService {
  private readonly mockService = inject(ExportacaoMockService);

  // CRUD
  getExportacoes(filters?: ExportacaoFilterOptions): Observable<Exportacao[]> {
    return this.mockService.getExportacoes(filters);
  }

  getExportacaoById(id: string): Observable<Exportacao | null> {
    return this.mockService.getExportacaoById(id);
  }

  createExportacao(exportacao: Partial<Exportacao>): Observable<Exportacao> {
    return this.mockService.createExportacao(exportacao);
  }

  updateExportacao(id: string, exportacao: Partial<Exportacao>): Observable<Exportacao> {
    return this.mockService.updateExportacao(id, exportacao);
  }

  deleteExportacao(id: string): Observable<boolean> {
    return this.mockService.deleteExportacao(id);
  }

  // Dashboard & Details
  getDashboardData(): Observable<ExportacaoDashboard> {
    return this.mockService.getDashboardData();
  }

  getExportacaoDetails(exportId: string): Observable<any> {
    return this.mockService.getExportacaoDetails(exportId);
  }

  // AI & Automation
  createExportacaoByNLP(text: string): Observable<Exportacao> {
    return this.mockService.createExportacaoByNLP(text);
  }

  processOCRDocument(file: File): Observable<Exportacao> {
    return this.mockService.processOCRDocument(file);
  }

  generateExportWithAI(basicData: any): Observable<Exportacao> {
    return this.mockService.generateExportWithAI(basicData);
  }

  getMasterData(): Observable<any> {
    return this.mockService.getMasterData();
  }

  getAISuggestions(formData: any): Observable<any[]> {
    return this.mockService.getAISuggestions(formData);
  }

  getAIResponse(query: string): Observable<{message: string, suggestions?: AISuggestion[]}> {
    return this.mockService.getAIResponse(query);
  }

  runAIAnalysis(exportId: string): Observable<any> {
    return this.mockService.runAIAnalysis(exportId);
  }

  processAIQuery(query: string, contextExportId?: string): Observable<AIAssistantMessage[]> {
    return this.mockService.processAIQuery(query, contextExportId);
  }

  // Validation & Compliance
  validateExportacao(exportId: string): Observable<{valid: boolean, errors: string[]}> {
    return this.mockService.validateExportacao(exportId);
  }

  validateCompliance(exportId: string): Observable<{valid: boolean, errors: string[], warnings: string[]}> {
    return this.mockService.validateCompliance(exportId);
  }

  // Documents
  generateDocuments(exportId: string): Observable<boolean> {
    return this.mockService.generateDocuments(exportId);
  }

  regenerateDocument(exportId: string, documentId: string): Observable<ExportacaoDocumento> {
    return this.mockService.regenerateDocument(exportId, documentId);
  }

  // Siscomex
  sendToSiscomex(exportId: string): Observable<SiscomexIntegration> {
    return this.mockService.sendToSiscomex(exportId);
  }

  checkSiscomexStatus(dueNumber: string): Observable<SiscomexIntegration> {
    return this.mockService.checkSiscomexStatus(dueNumber);
  }

  // Utilities
  getCountries(): Observable<string[]> {
    return this.mockService.getCountries();
  }

  getProducts(): Observable<{id: string, name: string, ncm: string}[]> {
    return this.mockService.getProducts();
  }

  getPorts(): Observable<{origin: string[], destination: string[]}> {
    return this.mockService.getPorts();
  }
}
