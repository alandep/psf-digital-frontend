export type ConfigCategory = 'GERAL' | 'SEGURANÇA' | 'NOTIFICAÇÕES' | 'INTEGRAÇÕES' | 'DOCUMENTOS' | 'FINANCEIRO' | 'LOGÍSTICA' | 'IA';
export type ConfigType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'DATE' | 'JSON';

export interface ConfigItem {
  id: string;
  key: string;
  label: string;
  description: string;
  category: ConfigCategory;
  type: ConfigType;
  value: any;
  defaultValue: any;
  options?: string[];
  required: boolean;
  lastModified: Date;
  modifiedBy: string;
}

export interface ConfigGroup {
  category: ConfigCategory;
  icon: string;
  label: string;
  description: string;
  items: ConfigItem[];
}
