// MOCK service for Publicidade / Monetização. In-memory mutable state.
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AdCampaign, AdCampaignStatus, Advertiser } from '../types/ad-campaign';

@Injectable({ providedIn: 'root' })
export class AdvertisingMockService {
  private wait = 400;

  private advertisers: Advertiser[] = [
    { id: 'ADV-1', tradeName: 'MSC', cnpj: '11.111.111/0001-11', status: 'ACTIVE' },
    { id: 'ADV-2', tradeName: 'Maersk', cnpj: '22.222.222/0001-22', status: 'ACTIVE' },
    { id: 'ADV-3', tradeName: 'DHL', cnpj: '33.333.333/0001-33', status: 'ACTIVE' },
    { id: 'ADV-4', tradeName: 'Localiza', cnpj: '44.444.444/0001-44', status: 'INACTIVE' },
  ];

  private note = 'Anúncio exibido como PATROCINADO, apenas em EIP Intelligence.';

  private campaigns: AdCampaign[] = [
    {
      id: 'CMP-1', advertiser: 'MSC', name: 'Rotas Ásia 2026', placement: 'Home → Intelligence',
      startAt: new Date(new Date().setDate(new Date().getDate() - 10)),
      endAt: new Date(new Date().setDate(new Date().getDate() + 20)),
      status: 'ACTIVE', impressions: 48200, clicks: 1240, ctr: 2.57, revenue: 18400, note: this.note,
    },
    {
      id: 'CMP-2', advertiser: 'Maersk', name: 'Frete Marítimo Premium', placement: 'Intelligence → feed',
      startAt: new Date(new Date().setDate(new Date().getDate() - 5)),
      endAt: new Date(new Date().setDate(new Date().getDate() + 25)),
      status: 'ACTIVE', impressions: 32100, clicks: 890, ctr: 2.77, revenue: 12600, note: this.note,
    },
    {
      id: 'CMP-3', advertiser: 'DHL', name: 'Express Export', placement: 'Newsletter',
      startAt: new Date(new Date().setDate(new Date().getDate() - 30)),
      endAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      status: 'ENDED', impressions: 51000, clicks: 1530, ctr: 3.0, revenue: 21000, note: this.note,
    },
    {
      id: 'CMP-4', advertiser: 'Localiza', name: 'Frota Corporativa', placement: 'Home → Intelligence',
      startAt: new Date(new Date().setDate(new Date().getDate() + 2)),
      endAt: new Date(new Date().setDate(new Date().getDate() + 40)),
      status: 'PENDING_APPROVAL', impressions: 0, clicks: 0, ctr: 0, revenue: 0, note: this.note,
    },
    {
      id: 'CMP-5', advertiser: 'MSC', name: 'Black Friday Logística', placement: 'Newsletter',
      startAt: new Date(new Date().setDate(new Date().getDate() - 3)),
      endAt: new Date(new Date().setDate(new Date().getDate() + 10)),
      status: 'PAUSED', impressions: 12400, clicks: 210, ctr: 1.69, revenue: 3200, note: this.note,
    },
    {
      id: 'CMP-6', advertiser: 'Maersk', name: 'Contêineres Refrigerados', placement: 'Intelligence → feed',
      startAt: new Date(new Date().setDate(new Date().getDate() + 5)),
      endAt: new Date(new Date().setDate(new Date().getDate() + 35)),
      status: 'DRAFT', impressions: 0, clicks: 0, ctr: 0, revenue: 0, note: this.note,
    },
  ];

  private ms<T>(payload: T): Observable<T> {
    return of(payload).pipe(delay(this.wait));
  }

  getAdvertisers(): Observable<Advertiser[]> {
    return this.ms([...this.advertisers]);
  }

  getCampaigns(): Observable<AdCampaign[]> {
    return this.ms([...this.campaigns]);
  }

  setStatus(id: string, status: AdCampaignStatus): Observable<AdCampaign[]> {
    this.campaigns = this.campaigns.map((c) => (c.id === id ? { ...c, status } : c));
    return this.ms([...this.campaigns]);
  }
}
