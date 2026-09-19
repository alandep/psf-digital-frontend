// MOCK service for Conteúdo Institucional / Public Settings. In-memory mutable.
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PublicSettings, OfficialLinkAdmin } from '../types/public-settings';

@Injectable({ providedIn: 'root' })
export class PublicSettingsMockService {
  private wait = 400;

  private settings: PublicSettings = {
    companyLegalName: 'EIP — Export Intelligence Platform',
    companyCnpj: '',
    companyAddress: '',
    mission: 'Simplificar o comércio exterior com inteligência, dados e automação para exportadores brasileiros.',
    vision: 'Ser a plataforma de referência em inteligência para exportação na América Latina.',
    values: 'Transparência, confiança, foco no cliente, dados oficiais e melhoria contínua.',
    supportEmail: 'suporte@eip.exemplo',
    commercialEmail: 'comercial@eip.exemplo',
    phone: '(11) 4000-0000',
  };

  private links: OfficialLinkAdmin[] = [
    { id: 'LK-1', category: 'BRAZIL', name: 'Portal Único Siscomex', url: 'https://www.gov.br/siscomex/pt-br/paginas/portal-unico-siscomex', country: 'Brasil', displayOrder: 1, active: true },
    { id: 'LK-2', category: 'CUSTOMS', name: 'Receita Federal — Exportação', url: 'https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/exportacao-portal-unico', country: 'Brasil', displayOrder: 2, active: true },
    { id: 'LK-3', category: 'PORTS', name: 'ANTAQ — Portos', url: 'https://www.gov.br/antaq/pt-br/assuntos/instalacoes-portuarias/portos', country: 'Brasil', displayOrder: 3, active: true },
    { id: 'LK-4', category: 'FOREIGN_TRADE', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br', country: 'Brasil', displayOrder: 4, active: true },
    { id: 'LK-5', category: 'REGULATORY', name: 'MAPA — Ministério da Agricultura', url: 'https://www.gov.br/agricultura', country: 'Brasil', displayOrder: 5, active: true },
    { id: 'LK-6', category: 'INTERNATIONAL', name: 'World Trade Organization — WTO/OMC', url: 'https://www.wto.org', country: 'Internacional', displayOrder: 6, active: true },
    { id: 'LK-7', category: 'INTERNATIONAL', name: 'World Customs Organization — WCO/OMA', url: 'https://www.wcoomd.org', country: 'Internacional', displayOrder: 7, active: true },
    { id: 'LK-8', category: 'INTERNATIONAL', name: 'International Maritime Organization — IMO', url: 'https://www.imo.org', country: 'Internacional', displayOrder: 8, active: false },
  ];

  private ms<T>(payload: T): Observable<T> {
    return of(payload).pipe(delay(this.wait));
  }

  getSettings(): Observable<PublicSettings> {
    return this.ms({ ...this.settings });
  }

  saveSettings(s: PublicSettings): Observable<PublicSettings> {
    this.settings = { ...s };
    return this.ms({ ...this.settings });
  }

  getOfficialLinks(): Observable<OfficialLinkAdmin[]> {
    return this.ms([...this.links]);
  }

  toggleLink(id: string): Observable<OfficialLinkAdmin[]> {
    this.links = this.links.map((l) => (l.id === id ? { ...l, active: !l.active } : l));
    return this.ms([...this.links]);
  }
}
