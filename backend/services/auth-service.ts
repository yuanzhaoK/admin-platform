import { AuthResult, DeviceInfo, sessionManager } from '../middleware/session-manager.ts';
import { pocketbaseClient } from '../config/pocketbase.ts';
import { AuthenticatedUser } from '../middleware/auth-middleware.ts';
// 登录请求接口
export interface LoginRequest {
  identity: string; // 邮箱、用户名或手机号
  password: string;
  deviceInfo: DeviceInfo;
  rememberMe?: boolean;
  captcha?: string;
}

export class AuthService {
  async login<T>(request: LoginRequest, type: 'admin' | 'member'='admin'): Promise<AuthResult<T>> {
    const { identity, password, deviceInfo } = request;
    try {
      const loginCheck = await sessionManager.checkLoginAttempts(identity, deviceInfo.ip);
      if(!loginCheck.allowed){
        return {
          success: false,
          error: `Too many login attempts. Try again after ${loginCheck.resetTime?.toLocaleString()}`,
        };
      }

        // 记录登录尝试
        await sessionManager.recordLoginAttempt(identity, deviceInfo.ip, false);
        const user = await this.authenticateUser(identity, password, type) as unknown as AuthenticatedUser<T>;
        if (!user) {
          await sessionManager.recordLoginAttempt(identity, deviceInfo.ip, false);
          return {
            success: false,
            error: 'Invalid credentials',
          };
        }
        // 检查用户状态
      if (user.status !== 'active') {
        return {
          success: false,
          error: 'Account is suspended or inactive',
        };
      }
      const enhancedDeviceInfo = await this.enhanceDeviceInfo(deviceInfo);
      const authResult = await sessionManager.createSession(user, enhancedDeviceInfo);
      if(authResult.success){
        await sessionManager.recordLoginAttempt(identity, deviceInfo.ip, true);
        await this.recordLoginSuccess(user, enhancedDeviceInfo);


          // 清理旧的设备记录（保留最近10个设备）
          await this.cleanupOldDevices(user.id);
      }
      return authResult;
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: 'Login failed due to server error',
      };
    }
  }
  cleanupOldDevices(id: string) {
    console.log('清理旧的设备记录', id);
  }
  recordLoginSuccess<T>(user: AuthenticatedUser<T>, enhancedDeviceInfo: DeviceInfo) {
    console.log('记录登录成功', user, enhancedDeviceInfo);
  }
  private async authenticateUser(identity: string, password: string, type: 'admin' | 'member') {
    const pb = pocketbaseClient.getClient();
    if(type === 'admin'){
    try {
      const adminAuth = await pb.collection('_superusers').authWithPassword(identity, password);
      const impersonateClient = await pb.collection("_superusers").impersonate(adminAuth.record.id, 3600)
      if(adminAuth.record){
        return {
          id: adminAuth.record.id,
          email: adminAuth.record.email,
          username: adminAuth.record.name || adminAuth.record.email,
          role: 'admin',
          permissions: ['*'],
          status: 'active',
          record: adminAuth.record,
          impersonateClient
        };
      }
    } catch (error) {
      console.error('Failed to authenticate user:', error);
      return null;
    }
  }else{
    try {
      const memberAuth = await pb.collection('members').authWithPassword(identity, password);
      const impersonateClient = await pb.collection("members").impersonate(memberAuth.record.id, 3600)
      if(memberAuth.record){
        return {
          id: memberAuth.record.id,
          email: memberAuth.record.email,
          username: memberAuth.record.username || memberAuth.record.email,
          role: 'member',
          permissions: ['*'],
          status: 'active',
          record: memberAuth.record,
          avatar: pb.files.getURL(memberAuth.record, memberAuth.record.avatar) || '',
          pb_token: memberAuth.token,
          impersonateClient
        };
      }
    } catch (error) {
      console.error('Failed to authenticate user:', error);
      return null;
    }
  } 
  }


  private async enhanceDeviceInfo(deviceInfo: DeviceInfo): Promise<DeviceInfo> {
    // 这里可以调用 IP 地理位置服务获取位置信息
    // 也可以解析 User-Agent 获取更详细的设备信息
    
    return {
      ...deviceInfo,
      // 可以添加位置信息、设备识别等
    };
  }
}

// 导出单例实例
export const authService = new AuthService();