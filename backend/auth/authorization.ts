import { AuthenticatedUser } from '../middleware/auth.ts';
import { Role } from './permissions.ts';

export class AuthorizationService {
  private readonly roles: Record<string, Role>;


  static hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
    const userRoles = user.roles;
    const userPermissions = userRoles.flatMap(role => role.permissions);

    return userPermissions.some(p => p.resource === permission.resource && p.action === permission.action && p.scope === permission.scope);
  }
}