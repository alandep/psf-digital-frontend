// Types for Leads (CRM) + channel conversion (MOCK).
export type LeadSource = 'HOME' | 'DEMO' | 'PRICING' | 'INTELLIGENCE' | 'EVENT' | 'REFERRAL';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'TRIAL' | 'CUSTOMER' | 'LOST';

export interface Lead {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  source: LeadSource;
  origin: string;
  status: LeadStatus;
  createdAt: Date;
}

export interface ChannelConversion {
  channel: string;
  leads: number;
  trials: number;
  customers: number;
  conversionPercent: number;
}
