// Tipos e interfaces do módulo "Perfis de Acesso" (Access Profiles)

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

export interface ScreenFeature {
  screenId: string;
  screenName: string;
  route: string;
  icon: string;
  actions: PermissionAction[];
}

export interface ModuleCatalog {
  moduleId: string;
  moduleName: string;
  icon: string;
  screens: ScreenFeature[];
}

export interface ProfilePermission {
  screenId: string;
  actions: PermissionAction[];
}

export interface AccessProfile {
  id: string;
  name: string;
  description: string;
  color: string;
  system: boolean;
  usersCount: number;
  permissions: ProfilePermission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileMetrics {
  totalPerfis: number;
  perfisSistema: number;
  perfisCustom: number;
  totalTelas: number;
}

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'Visualizar',
  create: 'Criar',
  edit: 'Editar',
  delete: 'Excluir',
  export: 'Exportar'
};
