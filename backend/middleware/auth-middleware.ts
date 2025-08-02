/**
 * 认证中间件
 * 集成 JWT + Redis Session 管理
 */

import { sessionManager, SessionData, JWTPayload } from './session-manager.ts';
import { pocketbaseClient } from '../config/pocketbase.ts';
import { User } from '../types/user.ts';
import { Member } from '../types/member/member.ts';
export interface AuthenticatedUser<T>{
  status: string;
  id: string;
  email: string;
  role: 'admin' | 'member';
  permissions: string[];
  record: T;
  pb_token: string;
}
// GraphQL 上下文接口
export interface AuthContext {
  user: AuthenticatedUser<User | Member> | null;
  session: SessionData | null;
  isAuthenticated: boolean;
  permissions: string[];
  deviceInfo: {
    ip: string;
    userAgent: string;
    deviceId?: string;
  };
  request: Request;
  pocketbase: typeof pocketbaseClient;
}

export class AuthMiddleware {
  /**
   * 创建 GraphQL 认证上下文
   */
  static async createAuthContext(request: Request): Promise<AuthContext> {
    const deviceInfo = this.extractDeviceInfo(request);
    
    // 初始化默认上下文
    const context: AuthContext = {
      user: null,
      session: null,
      isAuthenticated: false,
      permissions: [],
      deviceInfo,
      request,
      pocketbase: pocketbaseClient,
    };

    try {
      // 提取并验证 token
      const token = this.extractToken(request);
      if (!token) {
        return context;
      }

      // 验证访问 token
      const verification = await sessionManager.verifyAccessToken(token);
      if (!verification.valid || !verification.payload || !verification.session) {
        return context;
      }

      // 获取最新用户信息
      const user = await this.getUserFromPocketBase(verification.payload.userId, verification.payload.role);
      if (!user) {
        return context;
      }

      // 检查用户状态
      if (user.status !== 'active') {
        // 用户被禁用，强制登出
        await sessionManager.forceLogout(verification.session.sessionId, 'User account suspended');
        return context;
      }

      // 检查 token 是否需要刷新
      const shouldRefresh = this.shouldRefreshToken(verification.payload);
      if (shouldRefresh) {
        // 异步刷新 token（不阻塞当前请求）
        this.refreshTokenAsync(verification.session.refreshToken);
      }

      // 配置 PocketBase 认证
      await this.configurePocketBaseAuth(user as AuthenticatedUser<User | Member>, verification.session);

      // 更新上下文
      context.user = user as AuthenticatedUser<User | Member>;
      context.session = verification.session;
      context.isAuthenticated = true;
      context.permissions = user.permissions;

      return context;
    } catch (error) {
      console.error('认证上下文创建失败:', error);
      return context;
    }
  }

  /**
   * 权限检查中间件
   */
  static requireAuth() {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const context = args[2] as AuthContext; // GraphQL context
        
        if (!context.isAuthenticated || !context.user) {
          throw new Error('Authentication required');
        }
        
        return method.apply(this, args);
      };
    };
  }

  /**
   * 角色检查中间件
   */
  static requireRole(...roles: string[]) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const context = args[2] as AuthContext;
        
        if (!context.isAuthenticated || !context.user) {
          throw new Error('Authentication required');
        }
        
        if (!roles.includes(context.user.role)) {
          throw new Error(`Access denied. Required roles: ${roles.join(', ')}`);
        }
        
        return method.apply(this, args);
      };
    };
  }

  /**
   * 权限检查中间件
   */
  static requirePermission(...permissions: string[]) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const context = args[2] as AuthContext;
        
        if (!context.isAuthenticated || !context.user) {
          throw new Error('Authentication required');
        }
        
        const hasPermission = permissions.some(permission => 
          context.permissions.includes(permission) || 
          context.permissions.includes('*')
        );
        
        if (!hasPermission) {
          throw new Error(`Access denied. Required permissions: ${permissions.join(', ')}`);
        }
        
        return method.apply(this, args);
      };
    };
  }

  /**
   * 频率限制中间件
   */
  static rateLimit(windowMs: number, maxRequests: number) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;
      const requestCounts = new Map<string, { count: number; resetTime: number }>();
      
      descriptor.value = async function (...args: any[]) {
        const context = args[2] as AuthContext;
        const key = context.user?.id || context.deviceInfo.ip;
        const now = Date.now();
        
        const record = requestCounts.get(key);
        
        if (!record || now > record.resetTime) {
          // 新窗口或过期，重置计数
          requestCounts.set(key, { count: 1, resetTime: now + windowMs });
        } else if (record.count >= maxRequests) {
          // 超过限制
          throw new Error('Rate limit exceeded');
        } else {
          // 增加计数
          record.count++;
        }
        
        return method.apply(this, args);
      };
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 从请求头提取 token
   */
  private static extractToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.slice(7);
  }

  /**
   * 提取设备信息
   */
  private static extractDeviceInfo(request: Request) {
    return {
      ip: request.headers.get('X-Forwarded-For') || 
          request.headers.get('X-Real-IP') || 
          request.headers.get('CF-Connecting-IP') || 
          'unknown',
      userAgent: request.headers.get('User-Agent') || '',
      deviceId: request.headers.get('X-Device-ID') || undefined,
    };
  }

  /**
   * 从 PocketBase 获取用户信息
   */
  private static async getUserFromPocketBase<T>(userId: string, role: string): Promise<AuthenticatedUser<T> | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const collection = role === 'admin' ? '_superusers' : 'members';
      const user = await pb.collection(collection).getOne(userId) as unknown as User;
      
      if (!user) return null;

      // 根据角色获取权限
      const permissions = this.getUserPermissions(role, user);

      return {
        id: user.id,
        email: user.email,
        role: role as 'admin' | 'member',
        permissions,
        status: user.status as string,
        record: user as T // 修复: 添加缺失的 status 字段
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 获取用户权限
   */
  private static getUserPermissions(role: string, userData: any): string[] {
    // 基础权限映射
    const rolePermissions = {
      'admin': ['*'], // 管理员拥有所有权限
      'member': [
        'user:read:own',
        'user:update:own',
        'order:read:own',
        'order:create:own',
        'product:read:all',
      ],
    };

    const basePermissions = rolePermissions[role as keyof typeof rolePermissions] || [];
    
    // 可以根据用户的具体数据添加额外权限
    const extraPermissions: string[] = [];
    
    
    // 示例：特殊权限标记
    if (userData.special_permissions) {
      extraPermissions.push(...userData.special_permissions);
    }

    return [...basePermissions, ...extraPermissions];
  }

  /**
   * 配置 PocketBase 认证
   */
  private static async configurePocketBaseAuth(user: AuthenticatedUser<User | Member>, session: SessionData): Promise<void> {
    try {
      await pocketbaseClient.authenticateAsUser(
        {
          id: user.id,
          email: user.email,
        },
        user.role === 'admin' ? 'admin' : 'member'
      );
    } catch (error) {
      console.warn('PocketBase 认证配置失败:', error);
    }
  }

  /**
   * 检查是否需要刷新 token
   */
  private static shouldRefreshToken(payload: JWTPayload): boolean {
    const expiresIn = payload.exp! - Math.floor(Date.now() / 1000);
    return expiresIn <= 5 * 60; // 5分钟内过期时刷新
  }

  /**
   * 异步刷新 token
   */
  private static async refreshTokenAsync(refreshToken: string): Promise<void> {
    try {
      const result = await sessionManager.refreshAccessToken(refreshToken);
      if (result.success) {
        console.log('Token 自动刷新成功');
      }
    } catch (error) {
      console.error('Token 自动刷新失败:', error);
    }
  }
}

// 导出认证装饰器
export const { requireAuth, requireRole, requirePermission, rateLimit } = AuthMiddleware;