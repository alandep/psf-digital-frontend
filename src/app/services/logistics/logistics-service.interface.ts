import { Observable } from 'rxjs';
import { Embarque, Rota, PortoInfo, EmbarqueFilters } from '../../../types/embarque';

// Gateway interface for the logistica/embarque module. Method names and return
// types mirror EmbarqueMockService EXACTLY (Observable vs sync) so the embarque
// screens (lista, form, detalhes) can swap the concrete service without any
// other change.
export interface ILogisticsService {
  getEmbarques(filters?: EmbarqueFilters): Observable<Embarque[]>;
  getEmbarqueById(id: string): Observable<Embarque | undefined>;
  createEmbarque(embarque: Partial<Embarque>): Observable<Embarque>;
  updateEmbarque(id: string, updates: Partial<Embarque>): Observable<Embarque>;
  deleteEmbarque(id: string): Observable<boolean>;

  getRotas(): Observable<Rota[]>;
  getPortos(): Observable<PortoInfo[]>;

  getAIRouteSuggestion(origem: string, destino: string, commodity: string): Observable<any>;
  getTimelineTracking(shipmentId: string): Observable<any[]>;
  generateDocuments(shipmentId: string): Observable<any[]>;
}
