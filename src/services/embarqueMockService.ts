import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Embarque, Container, Rota, PortoInfo, EmbarqueFilters } from '../types/embarque';

@Injectable({
  providedIn: 'root'
})
export class EmbarqueMockService {

  private embarques: Embarque[] = [
    {
      shipment_id: '550e8400-e29b-41d4-a716-446655440001',
      shipment_number: 'SHIP-2026-0001',
      contract_id: '550e8400-e29b-41d4-a716-446655440000',
      exporter_name: 'Agro Export Brasil Ltda',
      importer_name: 'China Commodities Import Co',
      commodity: 'Soja',
      quantity: 58000,
      unit: 'MT',
      vessel_name: 'MSC Mediterranean',
      container_count: 2320,
      booking_number: 'MSC240407001',
      port_origin: 'Santos - SP',
      port_destination: 'Shanghai - China',
      departure_date: new Date('2026-04-15'),
      arrival_date: new Date('2026-05-17'),
      shipment_status: 'Booked',
      delay_risk_score: 12,
      tracking_status: 'On Time',
      last_update: new Date(),
      incoterm: 'FOB',
      transport_mode: 'Marítimo',
      vessel_imo: 'IMO9365058',
      shipping_company: 'MSC Mediterranean Shipping Company',
      bill_of_lading: 'MSC-BL-240407001',
      freight_type: 'FCL',
      containers: [
        {
          container_number: 'MSCU1234567',
          container_type: '40HQ',
          seal_number: 'MSC001234',
          tare_weight: 3950,
          gross_weight: 67200,
          net_weight: 63250,
          stuffing_date: new Date('2026-04-12')
        }
      ],
      transshipment_port: 'Ningbo - China',
      route_description: 'Rota direta Santos-Shanghai via Estreito de Malaca',
      etd: new Date('2026-04-15T14:00:00'),
      eta: new Date('2026-05-17T08:00:00'),
      delay_days: 0,
      tracking_url: 'https://tracking.msc.com/MSC240407001',
      due_number: 'DUE26040001',
      ruc_number: 'RUC26040001',
      invoice_number: 'INV-2026-0001',
      packing_list_number: 'PL-2026-0001',
      certificate_phytosanitary: 'FITO-2026-0001',
      mapa_clearance: true,
      vigiagro_status: 'Approved',
      ai_route_suggestion: 'Rota otimizada: Santos → Shanghai (32 dias) - Economia de 8% em combustível',
      ai_port_suggestion: 'Santos',
      ai_eta_prediction: new Date('2026-05-17T06:30:00'),
      ai_delay_risk_score: 12,
      ai_cost_optimization: 45000,
      ai_best_shipping_company: 'MSC Mediterranean Shipping Company',
      ai_alerts: [
        { tipo: 'info', mensagem: 'Clima favorável previsto para toda a viagem' },
        { tipo: 'warning', mensagem: 'Congestionamento leve previsto no Porto de Shanghai' }
      ],
      ai_auto_tracking: true,
      freight_cost: 850000,
      insurance_cost: 125000,
      port_charges: 75000,
      total_logistic_cost: 1050000,
      created_at: new Date('2026-04-07T10:00:00'),
      created_by: 'user_001',
      updated_at: new Date(),
      updated_by: 'user_001'
    },
    {
      shipment_id: '550e8400-e29b-41d4-a716-446655440002',
      shipment_number: 'SHIP-2026-0002',
      contract_id: '550e8400-e29b-41d4-a716-446655440001',
      exporter_name: 'Brasil Coffee Export',
      importer_name: 'European Coffee Importers GmbH',
      commodity: 'Café',
      quantity: 1200,
      unit: 'MT',
      vessel_name: 'Hamburg Express',
      container_count: 60,
      booking_number: 'HAP240407002',
      port_origin: 'Santos - SP',
      port_destination: 'Hamburg - Germany',
      departure_date: new Date('2026-04-20'),
      arrival_date: new Date('2026-05-05'),
      shipment_status: 'Planned',
      delay_risk_score: 8,
      tracking_status: 'On Time',
      last_update: new Date(),
      incoterm: 'CIF',
      transport_mode: 'Marítimo',
      vessel_imo: 'IMO9287456',
      shipping_company: 'Hapag-Lloyd AG',
      freight_type: 'FCL',
      containers: [
        {
          container_number: 'HLXU9876543',
          container_type: '20GP',
          seal_number: 'HL005678',
          tare_weight: 2200,
          gross_weight: 22200,
          net_weight: 20000,
          stuffing_date: new Date('2026-04-18')
        }
      ],
      route_description: 'Rota Atlântica Santos-Hamburg',
      etd: new Date('2026-04-20T16:00:00'),
      eta: new Date('2026-05-05T10:00:00'),
      delay_days: 0,
      ai_route_suggestion: 'Rota alternativa via Roterdã pode reduzir 2 dias',
      ai_port_suggestion: 'Santos',
      ai_eta_prediction: new Date('2026-05-05T08:00:00'),
      ai_delay_risk_score: 8,
      ai_cost_optimization: 15000,
      ai_best_shipping_company: 'Hapag-Lloyd AG',
      ai_alerts: [
        { tipo: 'info', mensagem: 'Documentação coffee ICO em ordem' }
      ],
      ai_auto_tracking: true,
      freight_cost: 180000,
      insurance_cost: 25000,
      port_charges: 15000,
      total_logistic_cost: 220000,
      created_at: new Date('2026-04-07T11:00:00'),
      created_by: 'user_002',
      updated_at: new Date(),
      updated_by: 'user_002'
    },
    {
      shipment_id: '550e8400-e29b-41d4-a716-446655440003',
      shipment_number: 'SHIP-2026-0003',
      contract_id: '550e8400-e29b-41d4-a716-446655440002',
      exporter_name: 'Minas Steel Export',
      importer_name: 'USA Steel Imports Inc',
      commodity: 'Minério de Ferro',
      quantity: 75000,
      unit: 'MT',
      vessel_name: 'Iron Duke',
      container_count: 0,
      booking_number: 'VAL240407003',
      port_origin: 'Vitória - ES',
      port_destination: 'Norfolk - USA',
      departure_date: new Date('2026-04-25'),
      arrival_date: new Date('2026-05-10'),
      shipment_status: 'In Transit',
      delay_risk_score: 15,
      tracking_status: 'Risk',
      last_update: new Date(),
      incoterm: 'FOB',
      transport_mode: 'Marítimo',
      vessel_imo: 'IMO9456789',
      shipping_company: 'Vale Shipping',
      freight_type: 'Bulk',
      route_description: 'Rota Atlântica Vitória-Norfolk',
      etd: new Date('2026-04-25T12:00:00'),
      eta: new Date('2026-05-10T14:00:00'),
      ata: new Date('2026-05-12T16:00:00'),
      delay_days: 2,
      tracking_url: 'https://tracking.vale.com/VAL240407003',
      ai_route_suggestion: 'Rota atual adequada para bulk carrier',
      ai_port_suggestion: 'Vitória',
      ai_eta_prediction: new Date('2026-05-12T15:00:00'),
      ai_delay_risk_score: 15,
      ai_cost_optimization: 0,
      ai_best_shipping_company: 'Vale Shipping',
      ai_alerts: [
        { tipo: 'warning', mensagem: 'Atraso de 2 dias devido ao clima adverso' },
        { tipo: 'info', mensagem: 'Navio aguardando janela de tempo para entrada no porto' }
      ],
      ai_auto_tracking: true,
      freight_cost: 1200000,
      insurance_cost: 85000,
      port_charges: 125000,
      total_logistic_cost: 1410000,
      created_at: new Date('2026-04-07T12:00:00'),
      created_by: 'user_003',
      updated_at: new Date(),
      updated_by: 'user_003'
    }
  ];

  private rotas: Rota[] = [
    {
      id: '1',
      nome: 'Santos - Shanghai',
      porto_origem: 'Santos - SP',
      porto_destino: 'Shanghai - China',
      tempo_estimado_dias: 32,
      custo_estimado: 850000,
      risco_atraso: 12
    },
    {
      id: '2',
      nome: 'Santos - Hamburg',
      porto_origem: 'Santos - SP',
      porto_destino: 'Hamburg - Germany',
      tempo_estimado_dias: 15,
      custo_estimado: 180000,
      risco_atraso: 8
    },
    {
      id: '3',
      nome: 'Vitória - Norfolk',
      porto_origem: 'Vitória - ES',
      porto_destino: 'Norfolk - USA',
      tempo_estimado_dias: 15,
      custo_estimado: 1200000,
      risco_atraso: 15
    }
  ];

  private portos: PortoInfo[] = [
    {
      codigo: 'BRSST',
      nome: 'Santos - SP',
      pais: 'Brasil',
      congestionamento_atual: 25,
      tempo_medio_operacao: 3
    },
    {
      codigo: 'BRVIX',
      nome: 'Vitória - ES', 
      pais: 'Brasil',
      congestionamento_atual: 15,
      tempo_medio_operacao: 2
    },
    {
      codigo: 'CNSHA',
      nome: 'Shanghai - China',
      pais: 'China',
      congestionamento_atual: 45,
      tempo_medio_operacao: 4
    },
    {
      codigo: 'DEHAM',
      nome: 'Hamburg - Germany',
      pais: 'Alemanha',
      congestionamento_atual: 20,
      tempo_medio_operacao: 2
    },
    {
      codigo: 'USNFK',
      nome: 'Norfolk - USA',
      pais: 'Estados Unidos',
      congestionamento_atual: 30,
      tempo_medio_operacao: 3
    }
  ];

  getEmbarques(filters?: EmbarqueFilters): Observable<Embarque[]> {
    let filteredEmbarques = [...this.embarques];

    if (filters) {
      if (filters.shipment_status) {
        filteredEmbarques = filteredEmbarques.filter(e => e.shipment_status === filters.shipment_status);
      }
      if (filters.tracking_status) {
        filteredEmbarques = filteredEmbarques.filter(e => e.tracking_status === filters.tracking_status);
      }
      if (filters.exporter_name) {
        filteredEmbarques = filteredEmbarques.filter(e => 
          e.exporter_name.toLowerCase().includes(filters.exporter_name!.toLowerCase()));
      }
      if (filters.commodity) {
        filteredEmbarques = filteredEmbarques.filter(e => 
          e.commodity.toLowerCase().includes(filters.commodity!.toLowerCase()));
      }
      if (filters.port_origin) {
        filteredEmbarques = filteredEmbarques.filter(e => 
          e.port_origin.toLowerCase().includes(filters.port_origin!.toLowerCase()));
      }
      if (filters.port_destination) {
        filteredEmbarques = filteredEmbarques.filter(e => 
          e.port_destination.toLowerCase().includes(filters.port_destination!.toLowerCase()));
      }
    }

    return of(filteredEmbarques).pipe(delay(500));
  }

  getEmbarqueById(id: string): Observable<Embarque | undefined> {
    const embarque = this.embarques.find(e => e.shipment_id === id);
    return of(embarque).pipe(delay(300));
  }

  createEmbarque(embarque: Partial<Embarque>): Observable<Embarque> {
    const newEmbarque: Embarque = {
      shipment_id: this.generateId(),
      shipment_number: this.generateShipmentNumber(),
      created_at: new Date(),
      updated_at: new Date(),
      last_update: new Date(),
      created_by: 'current_user',
      updated_by: 'current_user',
      ...embarque
    } as Embarque;

    this.embarques.push(newEmbarque);
    return of(newEmbarque).pipe(delay(800));
  }

  updateEmbarque(id: string, updates: Partial<Embarque>): Observable<Embarque> {
    const index = this.embarques.findIndex(e => e.shipment_id === id);
    if (index !== -1) {
      this.embarques[index] = {
        ...this.embarques[index],
        ...updates,
        updated_at: new Date(),
        last_update: new Date(),
        updated_by: 'current_user'
      };
      return of(this.embarques[index]).pipe(delay(600));
    }
    throw new Error('Embarque não encontrado');
  }

  deleteEmbarque(id: string): Observable<boolean> {
    const index = this.embarques.findIndex(e => e.shipment_id === id);
    if (index !== -1) {
      this.embarques.splice(index, 1);
      return of(true).pipe(delay(400));
    }
    return of(false).pipe(delay(400));
  }

  getRotas(): Observable<Rota[]> {
    return of(this.rotas).pipe(delay(300));
  }

  getPortos(): Observable<PortoInfo[]> {
    return of(this.portos).pipe(delay(300));
  }

  getAIRouteSuggestion(origem: string, destino: string, commodity: string): Observable<any> {
    const suggestion = {
      rota_recomendada: `${origem} → ${destino}`,
      tempo_estimado: 32,
      economia_estimada: 45000,
      risco_atraso: 12,
      motivo: 'Rota otimizada considerando clima, congestionamento portuário e custo de combustível',
      alternativas: [
        { rota: `${origem} → Singapura → ${destino}`, tempo: 35, custo_extra: 25000 },
        { rota: `${origem} → Suez → ${destino}`, tempo: 38, custo_extra: 35000 }
      ]
    };
    return of(suggestion).pipe(delay(1000));
  }

  getTimelineTracking(shipmentId: string): Observable<any[]> {
    const timeline = [
      {
        data: new Date('2026-04-07T10:00:00'),
        evento: 'Embarque Criado',
        status: 'completed',
        descricao: 'Embarque registrado no sistema'
      },
      {
        data: new Date('2026-04-10T14:00:00'),
        evento: 'Booking Confirmado',
        status: 'completed',
        descricao: 'Reserva confirmada com a transportadora'
      },
      {
        data: new Date('2026-04-12T08:00:00'),
        evento: 'Containers Carregados',
        status: 'completed',
        descricao: 'Containers stuffed e lacrados'
      },
      {
        data: new Date('2026-04-15T14:00:00'),
        evento: 'Navio Partiu',
        status: 'current',
        descricao: 'Navio deixou o Porto de Santos'
      },
      {
        data: new Date('2026-05-17T08:00:00'),
        evento: 'Chegada Prevista',
        status: 'pending',
        descricao: 'Chegada prevista no Porto de Shanghai'
      }
    ];
    return of(timeline).pipe(delay(400));
  }

  generateDocuments(shipmentId: string): Observable<any[]> {
    const documents = [
      {
        tipo: 'Invoice Comercial',
        numero: 'INV-2026-0001',
        status: 'generated',
        url: '/api/documents/invoice/INV-2026-0001.pdf'
      },
      {
        tipo: 'Packing List',
        numero: 'PL-2026-0001',
        status: 'generated',
        url: '/api/documents/packing/PL-2026-0001.pdf'
      },
      {
        tipo: 'Bill of Lading',
        numero: 'MSC-BL-240407001',
        status: 'pending',
        url: null
      },
      {
        tipo: 'DU-E (Siscomex)',
        numero: 'DUE26040001',
        status: 'generated',
        url: '/api/documents/due/DUE26040001.pdf'
      }
    ];
    return of(documents).pipe(delay(1200));
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateShipmentNumber(): string {
    const year = new Date().getFullYear();
    const count = this.embarques.length + 1;
    return `SHIP-${year}-${count.toString().padStart(4, '0')}`;
  }
}