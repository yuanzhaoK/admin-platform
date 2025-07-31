import { AuthenticatedUser } from '../middleware/auth.ts';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | '*';
  scope: 'own' | 'team' | 'all';
  condition?: (user: AuthenticatedUser, resource: any) => boolean;
}
export interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[]; // 角色继承
}
