import PocketBase from 'pocketbase';

/**
 * 全局管理员上下文 - 管理 Super Admin 权限的 PocketBase 客户端
 * 提供单例模式的管理员客户端，用于需要超级用户权限的操作
 */
export class AdminContext {
  private static instance: AdminContext;
  private adminPb: PocketBase | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  
  // 配置信息
  private readonly config = {
    url: Deno.env.get('POCKETBASE_URL') || 'http://47.111.142.237:8090',
    email: Deno.env.get('POCKETBASE_ADMIN_EMAIL') || 'ahukpyu@outlook.com',
    password: Deno.env.get('POCKETBASE_ADMIN_PASSWORD') || 'kpyu1512..@',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  private constructor() {}

  /**
   * 获取 AdminContext 单例实例
   */
  public static getInstance(): AdminContext {
    if (!AdminContext.instance) {
      AdminContext.instance = new AdminContext();
    }
    return AdminContext.instance;
  }

  /**
   * 初始化管理员客户端
   * 使用懒加载模式，只有在首次访问时才进行初始化
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // 防止重复初始化
    if (this.isInitializing) {
      if (this.initPromise) {
        await this.initPromise;
      }
      return;
    }

    this.isInitializing = true;
    
    this.initPromise = this.performInitialization();
    
    try {
      await this.initPromise;
      this.isInitialized = true;
      console.log('✅ AdminContext initialized successfully');
    } catch (error) {
      console.error('❌ AdminContext initialization failed:', error);
      throw error;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  /**
   * 执行实际的初始化操作
   */
  private async performInitialization(): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(`🔐 AdminContext 初始化尝试 ${attempt}/${this.config.retryAttempts}...`);
        
        // 创建新的 PocketBase 客户端
        this.adminPb = new PocketBase(this.config.url);
        
        // 配置请求超时
        this.adminPb.beforeSend = (url, options) => {
          options.signal = AbortSignal.timeout(this.config.timeout);
          options.headers = {
            ...options.headers,
            'X-Request-Source': 'admin-context',
            'X-Request-Time': Date.now().toString(),
          };
          return { url, options };
        };

        // 执行管理员认证
        await this.adminPb.collection('_superusers').authWithPassword(
          this.config.email,
          this.config.password
        );

        // 验证认证是否成功
        if (!this.adminPb.authStore.isValid || !this.adminPb.authStore.model) {
          throw new Error('Admin authentication failed - invalid auth store');
        }

        console.log(`✅ Admin authentication successful: ${this.adminPb.authStore.model.email}`);
        return; // 成功后退出重试循环

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ AdminContext 初始化尝试 ${attempt} 失败:`, lastError.message);

        // 清理失败的客户端
        this.adminPb = null;

        if (attempt < this.config.retryAttempts) {
          console.log(`⏳ ${this.config.retryDelay}ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw new Error(`AdminContext 初始化失败，已尝试${this.config.retryAttempts}次: ${lastError?.message}`);
  }

  /**
   * 获取管理员 PocketBase 客户端
   * 自动处理懒加载初始化
   */
  public async getAdminClient(): Promise<PocketBase> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.adminPb) {
      throw new Error('AdminContext not properly initialized');
    }

    // 检查认证状态是否仍然有效
    if (!this.adminPb.authStore.isValid) {
      console.warn('⚠️ Admin auth store invalid, re-initializing...');
      this.isInitialized = false;
      await this.initialize();
    }

    return this.adminPb!;
  }

  /**
   * 执行需要管理员权限的操作
   * 提供便捷的包装方法
   */
  public async executeAsAdmin<T>(
    operation: (adminPb: PocketBase) => Promise<T>
  ): Promise<T> {
    const adminPb = await this.getAdminClient();
    return await operation(adminPb);
  }

  /**
   * 对指定用户执行 impersonate 操作
   * @param collection 集合名称 (如: 'members', '_superusers')
   * @param userId 用户ID
   * @param duration 持续时间（秒）
   */
  public async impersonateUser(
    collection: string,
    userId: string,
    duration: number = 3600
  ): Promise<PocketBase> {
    return this.executeAsAdmin(async (adminPb) => {
      console.log(`🔄 Impersonating user ${userId} from collection ${collection}...`);
      const impersonateClient = await adminPb.collection(collection).impersonate(userId, duration);
      console.log(`✅ Impersonation successful for ${userId}`);
      return impersonateClient;
    });
  }

  /**
   * 检查管理员客户端的健康状态
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.adminPb) return false;
      await this.adminPb.health.check();
      return this.adminPb.authStore.isValid;
    } catch {
      return false;
    }
  }

  /**
   * 强制重新初始化管理员客户端
   * 用于处理连接断开等异常情况
   */
  public async forceReinitialize(): Promise<void> {
    console.log('🔄 Force reinitializing AdminContext...');
    this.isInitialized = false;
    this.adminPb = null;
    await this.initialize();
  }

  /**
   * 获取当前管理员用户信息
   */
  public getCurrentAdminUser(): any | null {
    return this.adminPb?.authStore.model || null;
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    if (this.adminPb) {
      this.adminPb.authStore.clear();
      this.adminPb = null;
    }
    this.isInitialized = false;
    console.log('🧹 AdminContext cleaned up');
  }
}

// 导出单例实例
export const adminContext = AdminContext.getInstance();

// 导出便捷方法
export const getAdminClient = () => adminContext.getAdminClient();
export const executeAsAdmin = <T>(operation: (adminPb: PocketBase) => Promise<T>) => 
  adminContext.executeAsAdmin(operation);
export const impersonateUser = (collection: string, userId: string, duration?: number) =>
  adminContext.impersonateUser(collection, userId, duration);
