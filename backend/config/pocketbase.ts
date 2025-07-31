import PocketBase from 'pocketbase';

// PocketBase client configuration - 外部服务器配置
const POCKETBASE_URL = Deno.env.get('POCKETBASE_URL') || 'http://47.111.142.237:8090';
const ADMIN_EMAIL = Deno.env.get('POCKETBASE_ADMIN_EMAIL') || 'ahukpyu@outlook.com';
const ADMIN_PASSWORD = Deno.env.get('POCKETBASE_ADMIN_PASSWORD') || 'kpyu1512..@';

// 连接配置 - 针对外部服务器优化
const CONNECTION_CONFIG = {
  timeout: 30000, // 30秒超时
  retryAttempts: 3,
  retryDelay: 1000, // 1秒重试延迟
  healthCheckInterval: 60000, // 60秒健康检查间隔
};

console.log(`🔗 PocketBase URL: ${POCKETBASE_URL}`);

// 请求队列管理器 - 优化远程连接
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 100; // 最小请求间隔100ms

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // 确保请求间隔
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => 
              setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
          }
          
          const result = await requestFn();
          this.lastRequestTime = Date.now();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      try {
        await request();
        // 添加小延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Queue request failed:', error);
      }
    }
    
    this.processing = false;
  }
}

export class PocketBaseClient {
  private pb: PocketBase;
  private isAuthenticated = false;
  private requestQueue = new RequestQueue();
  private healthCheckTimer?: number;
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  constructor() {
    this.pb = new PocketBase(POCKETBASE_URL);
    
    // 配置请求参数 - 针对外部服务器优化
    this.pb.beforeSend = (url, options) => {
      // 设置超时时间
      options.signal = AbortSignal.timeout(CONNECTION_CONFIG.timeout);
      
      // 添加请求头
      options.headers = {
        ...options.headers,
        'X-Request-Source': 'graphql-server',
        'X-Request-Time': Date.now().toString(),
        'X-Client-Version': '1.0.0',
      };
      
      return { url, options };
    };

    // 启动健康检查
    this.startHealthCheck();
  }

  private startHealthCheck() {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, CONNECTION_CONFIG.healthCheckInterval);
  }

  private async performHealthCheck() {
    try {
      await this.pb.health.check();
        if (this.connectionStatus !== 'connected') {
          this.connectionStatus = 'connected';
          console.log('✅ PocketBase连接恢复');
        }
    } catch (error) {
      if (this.connectionStatus !== 'disconnected') {
        this.connectionStatus = 'disconnected';
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('⚠️ PocketBase连接异常:', errorMessage);
      }
    }
  }

  async authenticate(): Promise<void> {
    if (this.isAuthenticated && this.pb.authStore.isValid) return;

    this.connectionStatus = 'connecting';
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= CONNECTION_CONFIG.retryAttempts; attempt++) {
      try {
        console.log(`🔐 PocketBase认证尝试 ${attempt}/${CONNECTION_CONFIG.retryAttempts}...`);
        
        await this.pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        
        this.isAuthenticated = true;
        this.connectionStatus = 'connected';
        console.log('✅ PocketBase认证成功 - 超级用户');
        return;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ 认证尝试 ${attempt} 失败:`, lastError.message);
        
        if (attempt < CONNECTION_CONFIG.retryAttempts) {
          console.log(`⏳ ${CONNECTION_CONFIG.retryDelay}ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, CONNECTION_CONFIG.retryDelay));
        }
      }
    }
    
    this.connectionStatus = 'disconnected';
    throw new Error(`PocketBase认证失败，已尝试${CONNECTION_CONFIG.retryAttempts}次: ${lastError?.message}`);
  }

  async ensureAuth(): Promise<void> {
    if (!this.pb.authStore.isValid) {
      await this.authenticate();
    }
  }

  /**
   * 根据当前登录用户完成认证
   * @param user 当前登录用户信息
   * @param userType 用户类型 - 'admin' 表示管理员，'member' 表示普通会员
   * @param credentials 用户凭据（可选，如果提供token则使用token认证）
   */
  async authenticateAsUser(
    user: { id: string; email?: string; token?: string }, 
    userType: 'admin' | 'member' = 'member',
    credentials?: { identity: string; password: string }
  ): Promise<void> {
    if (this.isAuthenticated && this.pb.authStore.isValid && this.pb.authStore.model?.id === user.id) {
      // 如果已经以相同用户身份认证，则无需重新认证
      return;
    }

    this.connectionStatus = 'connecting';
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= CONNECTION_CONFIG.retryAttempts; attempt++) {
      try {
        console.log(`🔐 用户认证尝试 ${attempt}/${CONNECTION_CONFIG.retryAttempts} - 用户ID: ${user.id}, 类型: ${userType}`);
        
        // 如果用户已有有效token，尝试使用token认证
        if (user.token) {
          console.log('🎫 尝试使用token认证...');
          
          // 创建符合PocketBase RecordModel格式的用户对象
          const userRecord = {
            ...user,
            collectionId: (user as any).collectionId || '',
            collectionName: (user as any).collectionName || (userType === 'admin' ? '_superusers' : 'members'),
            created: (user as any).created || '',
            updated: (user as any).updated || ''
          };
          
          this.pb.authStore.save(user.token, userRecord);
          
          // 验证token是否有效
          const isValid = await this.validateUserToken(user.id, userType);
          if (isValid) {
            this.isAuthenticated = true;
            this.connectionStatus = 'connected';
            console.log('✅ Token认证成功');
            return;
          } else {
            console.log('⚠️ Token无效，尝试密码认证...');
            this.pb.authStore.clear();
          }
        }
        
        // 如果没有token或token无效，使用密码认证
        if (credentials) {
          const collectionName = userType === 'admin' ? '_superusers' : 'members';
          console.log(`🔑 使用密码认证 - 集合: ${collectionName}`);
          
          const authData = await this.pb.collection(collectionName).authWithPassword(
            credentials.identity,
            credentials.password
          );
          
          // 验证认证用户是否匹配
          if (authData.record.id === user.id) {
            this.isAuthenticated = true;
            this.connectionStatus = 'connected';
            console.log(`✅ 用户认证成功 - ${userType}: ${authData.record.email || authData.record.username}`);
            return;
          } else {
            throw new Error('认证用户与请求用户不匹配');
          }
        } else {
          throw new Error('缺少认证凭据：需要token或密码');
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ 用户认证尝试 ${attempt} 失败:`, lastError.message);
        
        if (attempt < CONNECTION_CONFIG.retryAttempts) {
          console.log(`⏳ ${CONNECTION_CONFIG.retryDelay}ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, CONNECTION_CONFIG.retryDelay));
        }
      }
    }
    
    this.connectionStatus = 'disconnected';
    throw new Error(`用户认证失败，已尝试${CONNECTION_CONFIG.retryAttempts}次: ${lastError?.message}`);
  }

  /**
   * 验证用户token是否有效
   * @param userId 用户ID
   * @param userType 用户类型
   */
  private async validateUserToken(userId: string, userType: 'admin' | 'member'): Promise<boolean> {
    try {
      const collectionName = userType === 'admin' ? '_superusers' : 'members';
      const user = await this.pb.collection(collectionName).getOne(userId);
      return !!user && user.id === userId;
    } catch {
      return false;
    }
  }

  /**
   * 获取当前认证用户信息
   */
  getCurrentAuthUser(): any | null {
    return this.pb.authStore.model;
  }

  /**
   * 检查是否以指定用户身份认证
   */
  isAuthenticatedAs(userId: string): boolean {
    return this.isAuthenticated && this.pb.authStore.model?.id === userId;
  }

  /**
   * 从GraphQL context中获取用户信息并进行认证
   * @param context GraphQL context对象
   * @param requireAuth 是否要求必须有用户信息，默认为true
   */
  async authenticateFromContext(context: any, requireAuth: boolean = true): Promise<void> {
    const { user } = context || {};
    
    if (!user) {
      if (requireAuth) {
        throw new Error('用户未登录，无法进行认证');
      } else {
        // 如果不要求认证但没有用户信息，回退到管理员认证
        console.log('⚠️ 没有用户信息，回退到管理员认证');
        await this.ensureAuth();
        return;
      }
    }

    // 检查是否已经以该用户身份认证
    if (this.isAuthenticatedAs(user.id)) {
      console.log(`✅ 已经以用户 ${user.id} 身份认证`);
      return;
    }

    // 确定用户类型
    const userType = this.determineUserType(user);
    
    // 尝试使用token认证（如果有的话）
    try {
      await this.authenticateAsUser(
        {
          id: user.id,
          email: user.email || user.username,
          token: user.token || context.token
        },
        userType
      );
    } catch (error) {
      console.warn('用户认证失败，回退到管理员认证:', error);
      if (requireAuth) {
        throw error;
      } else {
        await this.ensureAuth();
      }
    }
  }

  /**
   * 确定用户类型
   * @param user 用户对象
   */
  private determineUserType(user: any): 'admin' | 'member' {
    // 根据用户角色或其他属性判断用户类型
    if (user.role === 'admin' || user.collectionName === '_superusers') {
      return 'admin';
    }
    return 'member';
  }

  getClient(): PocketBase {
    return this.pb;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionStatus;
  }

  // 排队执行PocketBase请求，避免并发冲突
  async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return this.requestQueue.add(requestFn);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pb.health.check();
      return true;
    } catch {
      return false;
    }
  }

  // 清理资源
  cleanup(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

// Singleton instance
export const pocketbaseClient = new PocketBaseClient(); 