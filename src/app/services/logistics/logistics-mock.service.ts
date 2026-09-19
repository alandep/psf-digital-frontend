import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ILogisticsService } from './logistics-service.interface';
import { EmbarqueMockService } from '../../../services/embarqueMockService';
import { Embarque, Rota, PortoInfo, EmbarqueFilters } from '../../../types/embarque';

// Mock adapter: delegates every method to EmbarqueMockService so behavior is
// identical to the pre-gateway state.
@Injectable({
  providedIn: 'root'
})
export class LogisticsMockAdapter implements ILogisticsService {
  private readonly mock = inject(EmbarqueMockService);

  getEmbarques(filters?: EmbarqueFilters): Observable<Embarque[]> {
    return this.mock.getEmbarques(filters);
  }

  getEmbarqueById(id: string): Observable<Embarque | undefined> {
    return this.mock.getEmbarqueById(id);
  }

  createEmbarque(embarque: Partial<Embarque>): Observable<Embarque> {
    return this.mock.createEmbarque(embarque);
  }

  updateEmbarque(id: string, updates: Partial<Embarque>): Observable<Embarque> {
    return this.mock.updateEmbarque(id, updates);
  }

  deleteEmbarque(id: string): Observable<boolean> {
    return this.mock.deleteEmbarque(id);
  }

  getRotas(): Observable<Rota[]> {
    return this.mock.getRotas();
  }

  getPortos(): Observable<PortoInfo[]> {
    return this.mock.getPortos();
  }

  getAIRouteSuggestion(origem: string, destino: string, commodity: string): Observable<any> {
    return this.mock.getAIRouteSuggestion(origem, destino, commodity);
  }

  getTimelineTracking(shipmentId: string): Observable<any[]> {
    return this.mock.getTimelineTracking(shipmentId);
  }

  generateDocuments(shipmentId: string): Observable<any[]> {
    return this.mock.generateDocuments(shipmentId);
  }
}
