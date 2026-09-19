// Types for Conteúdo Institucional / Public Settings (MOCK).
export interface PublicSettings {
  companyLegalName: string;
  companyCnpj: string;
  companyAddress: string;
  mission: string;
  vision: string;
  values: string;
  supportEmail: string;
  commercialEmail: string;
  phone: string;
}

export interface OfficialLinkAdmin {
  id: string;
  category: string;
  name: string;
  url: string;
  country: string;
  displayOrder: number;
  active: boolean;
}
