// MOCK service for Leads (CRM) + channel conversion. In-memory mutable state.
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Lead, LeadStatus, ChannelConversion } from '../types/lead';

@Injectable({ providedIn: 'root' })
export class LeadsMockService {
  private wait = 400;

  private leads: Lead[] = [
    { id: 'L-01', name: 'Ana Souza', companyName: 'AgroExport Ltda', email: 'ana@agroexport.com', phone: '(11) 90000-0001', source: 'EVENT', origin: 'CAMARU_2026', status: 'QUALIFIED', createdAt: new Date(new Date().setDate(new Date().getDate() - 3)) },
    { id: 'L-02', name: 'Bruno Lima', companyName: 'Café Premium SA', email: 'bruno@cafepremium.com', phone: '(31) 90000-0002', source: 'HOME', origin: 'GOOGLE', status: 'NEW', createdAt: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: 'L-03', name: 'Carla Dias', companyName: 'LogiMar', email: 'carla@logimar.com', phone: '(13) 90000-0003', source: 'DEMO', origin: 'LINKEDIN', status: 'TRIAL', createdAt: new Date(new Date().setDate(new Date().getDate() - 6)) },
    { id: 'L-04', name: 'Diego Alves', companyName: 'SojaBrasil', email: 'diego@sojabrasil.com', phone: '(62) 90000-0004', source: 'PRICING', origin: 'GOOGLE', status: 'CONTACTED', createdAt: new Date(new Date().setDate(new Date().getDate() - 2)) },
    { id: 'L-05', name: 'Elaine Costa', companyName: 'FrigoSul', email: 'elaine@frigosul.com', phone: '(51) 90000-0005', source: 'REFERRAL', origin: 'REFERRAL', status: 'CUSTOMER', createdAt: new Date(new Date().setDate(new Date().getDate() - 20)) },
    { id: 'L-06', name: 'Felipe Rocha', companyName: 'ExportaJá', email: 'felipe@exportaja.com', phone: '(11) 90000-0006', source: 'INTELLIGENCE', origin: 'DIRECT', status: 'QUALIFIED', createdAt: new Date(new Date().setDate(new Date().getDate() - 4)) },
    { id: 'L-07', name: 'Gabriela Nunes', companyName: 'Terra Grãos', email: 'gabriela@terragraos.com', phone: '(65) 90000-0007', source: 'EVENT', origin: 'FEMEC_2027', status: 'NEW', createdAt: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: 'L-08', name: 'Henrique Melo', companyName: 'PortoLog', email: 'henrique@portolog.com', phone: '(13) 90000-0008', source: 'HOME', origin: 'GOOGLE', status: 'LOST', createdAt: new Date(new Date().setDate(new Date().getDate() - 15)) },
    { id: 'L-09', name: 'Isabela Ramos', companyName: 'Frutas do Vale', email: 'isabela@frutasdovale.com', phone: '(54) 90000-0009', source: 'PRICING', origin: 'LINKEDIN', status: 'TRIAL', createdAt: new Date(new Date().setDate(new Date().getDate() - 7)) },
    { id: 'L-10', name: 'João Prado', companyName: 'MetalExport', email: 'joao@metalexport.com', phone: '(31) 90000-0010', source: 'DEMO', origin: 'DIRECT', status: 'CONTACTED', createdAt: new Date(new Date().setDate(new Date().getDate() - 5)) },
    { id: 'L-11', name: 'Karen Faria', companyName: 'BioAgro', email: 'karen@bioagro.com', phone: '(62) 90000-0011', source: 'REFERRAL', origin: 'REFERRAL', status: 'CUSTOMER', createdAt: new Date(new Date().setDate(new Date().getDate() - 30)) },
    { id: 'L-12', name: 'Lucas Barros', companyName: 'Grãos & Cia', email: 'lucas@graosecia.com', phone: '(65) 90000-0012', source: 'INTELLIGENCE', origin: 'DIRECT', status: 'NEW', createdAt: new Date() },
  ];

  private channels: ChannelConversion[] = [
    { channel: 'Google', leads: 500, trials: 80, customers: 16, conversionPercent: 3.2 },
    { channel: 'LinkedIn', leads: 120, trials: 30, customers: 11, conversionPercent: 9.2 },
    { channel: 'Camaru', leads: 50, trials: 22, customers: 8, conversionPercent: 16.0 },
    { channel: 'Indicação', leads: 30, trials: 18, customers: 12, conversionPercent: 40.0 },
    { channel: 'Direto', leads: 80, trials: 20, customers: 5, conversionPercent: 6.3 },
    { channel: 'Newsletter', leads: 60, trials: 12, customers: 4, conversionPercent: 6.7 },
  ];

  private ms<T>(payload: T): Observable<T> {
    return of(payload).pipe(delay(this.wait));
  }

  getLeads(): Observable<Lead[]> {
    return this.ms([...this.leads]);
  }

  updateStatus(id: string, status: LeadStatus): Observable<Lead[]> {
    this.leads = this.leads.map((l) => (l.id === id ? { ...l, status } : l));
    return this.ms([...this.leads]);
  }

  getChannelConversion(): Observable<ChannelConversion[]> {
    return this.ms([...this.channels]);
  }
}
