// Types for Publicidade / Monetização (MOCK).
export type AdCampaignStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface AdCampaign {
  id: string;
  advertiser: string;
  name: string;
  placement: string;
  startAt: Date;
  endAt: Date;
  status: AdCampaignStatus;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  note?: string;
}

export interface Advertiser {
  id: string;
  tradeName: string;
  cnpj: string;
  status: 'ACTIVE' | 'INACTIVE';
}
