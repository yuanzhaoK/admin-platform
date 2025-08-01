/**
 * 用户登录态管理系统
 * 基于 Redis + JWT 的混合认证方案
 */

import { create, verify, decode, Header, Payload } from "djwt";
import { redisCache } from '../cache/redis-cache.ts';
import { AuthenticatedUser } from './auth-middleware.ts';

// JWT 配置
const JWT_CONFIG = {
  SECRET: Deno.env.get('JWT_SECRET') || 'super-secret-key-change-in-production',
  ACCESS_TOKEN_TTL: 15 * 60, // 15分钟
  REFRESH_TOKEN_TTL: 7 * 24 * 60 * 60, // 7天
  ISSUER: 'mall-platform',
  AUDIENCE: 'mall-platform-users',
};

// Session 配置
const SESSION_CONFIG = {
  MAX_CONCURRENT_SESSIONS: 3, // 最多并发会话数
  SESSION_TTL: 24 * 60 * 60, // 24小时
  IDLE_TIMEOUT: 30 * 60, // 30分钟无活动超时
  REFRESH_THRESHOLD: 5 * 60, // token 还有5分钟过期时自动刷新
};

// Redis 键前缀
const REDIS_KEYS = {
  SESSION: 'session:',
  USER_SESSIONS: 'user_sessions:',
  REFRESH_TOKEN: 'refresh_token:',
  BLACKLIST: 'token_blacklist:',
  LOGIN_ATTEMPTS: 'login_attempts:',
  DEVICE_FINGERPRINT: 'device:',
};

// 用户信息接口
export interface UserInfo {
  id: string;
  email: string;
  username?: string;
  role: 'admin' | 'member';
  permissions: string[];
  status: 'active' | 'suspended' | 'pending';
}

// 设备信息接口
export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os?: string;
  browser?: string;
  ip: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
  };
}

// Session 数据接口
export interface SessionData {
  sessionId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  refreshToken: string;
}

// JWT Payload 接口
export interface JWTPayload extends Payload {
  userId: string;
  sessionId: string;
  role: string;
  permissions: string[];
  deviceId: string;
}

// 认证结果接口
export interface AuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: AuthenticatedUser;
  session?: SessionData;
  error?: string;
}

export class SessionManager {
  private static instance: SessionManager;
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private async getSecretKey(purpose:KeyUsage[]): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_CONFIG.SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      purpose
    );
  }

  /**
   * 创建用户会话
   */
  async createSession(user: AuthenticatedUser, deviceInfo: DeviceInfo): Promise<AuthResult> {
    try {
      // 检查并清理过期会话
      await this.cleanupExpiredSessions(user.id);
      
      // 检查并发会话限制
      const activeSessions = await this.getActiveSessions(user.id);
      if (activeSessions.length >= SESSION_CONFIG.MAX_CONCURRENT_SESSIONS) {
        // 移除最旧的会话
        await this.removeOldestSession(user.id);
      }

      // 生成会话ID和token
      const sessionId = this.generateSessionId();
      const refreshToken = this.generateRefreshToken();
      
      // 创建session数据
      const session: SessionData = {
        sessionId,
        userId: user.id,
        deviceInfo,
        createdAt: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + SESSION_CONFIG.SESSION_TTL * 1000),
        isActive: true,
        refreshToken,
      };

      // 生成访问token
      const accessToken = await this.generateAccessToken(user, session);

      // 保存到Redis
      await Promise.all([
        this.saveSession(session),
        this.saveRefreshToken(refreshToken, sessionId),
        this.addUserSession(user.id, sessionId),
        this.saveDeviceFingerprint(deviceInfo),
      ]);

      return {
        success: true,
        accessToken,
        refreshToken,
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_TTL,
        user,
        session,
      };
    } catch (error) {
      console.error('创建会话失败:', error);
      return {
        success: false,
        error: '会话创建失败',
      };
    }
  }

  /**
   * 验证访问token
   */
  async verifyAccessToken(token: string): Promise<{ valid: boolean; payload?: JWTPayload; session?: SessionData }> {
    try {
      // 检查token是否在黑名单中
      if (await this.isTokenBlacklisted(token)) {
        return { valid: false };
      }

      // 验证JWT token
      // 使用 CryptoKey 作为 verify 的密钥参数
      const key = await this.getSecretKey(["verify"]);
      const payload = await verify(token, key) as JWTPayload;

      // 验证token基本信息
      if (!payload.sessionId || !payload.userId) {
        return { valid: false };
      }

      // 获取session信息
      const session = await this.getSession(payload.sessionId);
      if (!session || !session.isActive) {
        return { valid: false };
      }

      // 检查session是否过期
      if (new Date() > session.expiresAt) {
        await this.deactivateSession(session.sessionId);
        return { valid: false };
      }

      // 更新最后活动时间
      await this.updateLastActivity(session.sessionId);

      return {
        valid: true,
        payload,
        session,
      };
    } catch (error) {
      console.error('Token验证失败:', error);
      return { valid: false };
    }
  }

  /**
   * 刷新访问token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResult> {
    try {
      // 验证refresh token
      const sessionId = await this.getSessionByRefreshToken(refreshToken);
      if (!sessionId) {
        return { success: false, error: 'Invalid refresh token' };
      }

      const session = await this.getSession(sessionId);
      if (!session || !session.isActive) {
        return { success: false, error: 'Session expired' };
      }

      // 检查session是否过期
      if (new Date() > session.expiresAt) {
        await this.deactivateSession(sessionId);
        return { success: false, error: 'Session expired' };
      }

      // 获取用户信息（这里需要从数据库获取最新用户信息）
      const user = await this.getUserInfo(session.userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // 生成新的访问token
      const accessToken = await this.generateAccessToken(user, session);
      
      // 更新最后活动时间
      await this.updateLastActivity(sessionId);

      return {
        success: true,
        accessToken,
        refreshToken, // refresh token 保持不变
        expiresIn: JWT_CONFIG.ACCESS_TOKEN_TTL,
        user,
        session,
      };
    } catch (error) {
      console.error('Token刷新失败:', error);
      return { success: false, error: 'Token refresh failed' };
    }
  }

  /**
   * 登出用户
   */
  async logout(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return false;
      }

      // 将token加入黑名单
      await this.blacklistSession(sessionId);
      
      // 删除session相关数据
      await Promise.all([
        this.deactivateSession(sessionId),
        this.removeRefreshToken(session.refreshToken),
        this.removeUserSession(session.userId, sessionId),
      ]);

      return true;
    } catch (error) {
      console.error('登出失败:', error);
      return false;
    }
  }

  /**
   * 登出用户所有设备
   */
  async logoutAllDevices(userId: string): Promise<boolean> {
    try {
      const sessions = await this.getActiveSessions(userId);
      
      // 并发处理所有会话登出
      await Promise.all(
        sessions.map(session => this.logout(session.sessionId))
      );

      return true;
    } catch (error) {
      console.error('全设备登出失败:', error);
      return false;
    }
  }

  /**
   * 获取用户活跃会话
   */
  async getActiveSessions(userId: string): Promise<SessionData[]> {
    try {
      const sessionIds = await redisCache.get('USER_SESSIONS', userId) as string[] || [];
      const sessions: SessionData[] = [];

      for (const sessionId of sessionIds) {
        const session = await this.getSession(sessionId);
        if (session && session.isActive && new Date() <= session.expiresAt) {
          sessions.push(session);
        }
      }

      return sessions;
    } catch (error) {
      console.error('获取活跃会话失败:', error);
      return [];
    }
  }

  /**
   * 强制下线特定会话
   */
  async forceLogout(sessionId: string, reason: string = 'Admin action'): Promise<boolean> {
    try {
      await this.blacklistSession(sessionId, reason);
      return await this.logout(sessionId);
    } catch (error) {
      console.error('强制下线失败:', error);
      return false;
    }
  }

  /**
   * 检查登录尝试限制
   */
  async checkLoginAttempts(identifier: string, ip: string): Promise<{ allowed: boolean; remaining: number; resetTime?: Date }> {
    const key = `${identifier}:${ip}`;
    const attempts = await redisCache.get('LOGIN_ATTEMPTS', key) as number || 0;
    const maxAttempts = 5;
    const lockoutTime = 15 * 60; // 15分钟

    if (attempts >= maxAttempts) {
      const ttl = await redisCache.ttl('LOGIN_ATTEMPTS', key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + ttl * 1000),
      };
    }

    return {
      allowed: true,
      remaining: maxAttempts - attempts,
    };
  }

  /**
   * 记录登录尝试
   */
  async recordLoginAttempt(identifier: string, ip: string, success: boolean): Promise<void> {
    const key = `${identifier}:${ip}`;
    
    if (success) {
      // 登录成功，清除失败记录
      await redisCache.del('LOGIN_ATTEMPTS', key);
    } else {
      // 登录失败，增加计数
      const attempts = await redisCache.get('LOGIN_ATTEMPTS', key) as number || 0;
      await redisCache.set('LOGIN_ATTEMPTS', key, attempts + 1, 15 * 60);
    }
  }

  // ==================== 私有方法 ====================

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private generateRefreshToken(): string {
    return `refresh_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async generateAccessToken(user: AuthenticatedUser, session: SessionData): Promise<string> {
    const payload: JWTPayload = {
      iss: JWT_CONFIG.ISSUER,
      aud: JWT_CONFIG.AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + JWT_CONFIG.ACCESS_TOKEN_TTL,
      iat: Math.floor(Date.now() / 1000),
      userId: user.id,
      sessionId: session.sessionId,
      role: user.role,
      permissions: user.permissions,
      deviceId: session.deviceInfo.deviceId,
    };

    return await create({ alg: "HS256", typ: "JWT" }, payload, await this.getSecretKey(["sign", "verify"]));
  }

  private async saveSession(session: SessionData): Promise<void> {
    await redisCache.set('SESSION', session.sessionId, session, SESSION_CONFIG.SESSION_TTL);
  }

  private async getSession(sessionId: string): Promise<SessionData | null> {
    return await redisCache.get('SESSION', sessionId);
  }

  private async saveRefreshToken(refreshToken: string, sessionId: string): Promise<void> {
    await redisCache.set('REFRESH_TOKEN', refreshToken, sessionId, JWT_CONFIG.REFRESH_TOKEN_TTL);
  }

  private async getSessionByRefreshToken(refreshToken: string): Promise<string | null> {
    return await redisCache.get('REFRESH_TOKEN', refreshToken);
  }

  private async removeRefreshToken(refreshToken: string): Promise<void> {
    await redisCache.del('REFRESH_TOKEN', refreshToken);
  }

  private async addUserSession(userId: string, sessionId: string): Promise<void> {
    const sessions = await redisCache.get('USER_SESSIONS', userId) as string[] || [];
    sessions.push(sessionId);
    await redisCache.set('USER_SESSIONS', userId, sessions, SESSION_CONFIG.SESSION_TTL);
  }

  private async removeUserSession(userId: string, sessionId: string): Promise<void> {
    const sessions = await redisCache.get('USER_SESSIONS', userId) as string[] || [];
    const filtered = sessions.filter(id => id !== sessionId);
    await redisCache.set('USER_SESSIONS', userId, filtered, SESSION_CONFIG.SESSION_TTL);
  }

  private async updateLastActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.lastActivity = new Date();
      await this.saveSession(session);
    }
  }

  private async deactivateSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.isActive = false;
      await this.saveSession(session);
    }
  }

  private async blacklistSession(sessionId: string, reason: string = 'Logout'): Promise<void> {
    await redisCache.set('BLACKLIST', sessionId, { reason, timestamp: Date.now() }, JWT_CONFIG.REFRESH_TOKEN_TTL);
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const decoded = decode(token);
      if (decoded && decoded[1] && (decoded[1] as JWTPayload).sessionId) {
        const sessionId = (decoded[1] as JWTPayload).sessionId;
        return await redisCache.exists('BLACKLIST', sessionId);
      }
      return false;
    } catch {
      return false;
    }
  }

  private async removeOldestSession(userId: string): Promise<void> {
    const sessions = await this.getActiveSessions(userId);
    if (sessions.length > 0) {
      // 按创建时间排序，移除最旧的
      sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      await this.logout(sessions[0].sessionId);
    }
  }

  private async cleanupExpiredSessions(userId: string): Promise<void> {
    const sessionIds = await redisCache.get('USER_SESSIONS', userId) as string[] || [];
    const validSessions: string[] = [];

    for (const sessionId of sessionIds) {
      const session = await this.getSession(sessionId);
      if (session && session.isActive && new Date() <= session.expiresAt) {
        validSessions.push(sessionId);
      } else if (session) {
        // 清理过期会话
        await this.deactivateSession(sessionId);
      }
    }

    await redisCache.set('USER_SESSIONS', userId, validSessions, SESSION_CONFIG.SESSION_TTL);
  }

  private async saveDeviceFingerprint(deviceInfo: DeviceInfo): Promise<void> {
    await redisCache.set('DEVICE_FINGERPRINT', deviceInfo.deviceId, deviceInfo, 30 * 24 * 60 * 60); // 30天
  }

  private async getUserInfo(userId: string): Promise<AuthenticatedUser | null> {
    // 这里需要从PocketBase获取最新用户信息
    // 暂时返回null，实际实现时需要集成PocketBase查询
    return null;
  }
}

// 导出单例实例
export const sessionManager = SessionManager.getInstance();