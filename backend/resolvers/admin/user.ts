import { pocketbaseClient } from '../../config/pocketbase.ts';
import { AuthContext } from '../../middleware/auth-middleware.ts';
import { authService } from '../../services/auth-service.ts';
import type { User } from '../../types/index.ts';

export const userResolvers = {
  Query: {
    // 用户查询 - 返回用户列表
    users: async (_: any, { query }: { query?: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 构建查询参数
        const page = query?.page || 1;
        const perPage = query?.perPage || 20;
        
        let filter = '';
        if (query?.search) {
          filter = `(email ~ "${query.search}" || name ~ "${query.search}")`;
        }
        if (query?.role) {
          filter = filter ? `${filter} && role = "${query.role}"` : `role = "${query.role}"`;
        }
        if (query?.status) {
          filter = filter ? `${filter} && status = "${query.status}"` : `status = "${query.status}"`;
        }
        if (query?.verified !== undefined) {
          filter = filter ? `${filter} && verified = ${query.verified}` : `verified = ${query.verified}`;
        }

        const options: any = {
          sort: query?.sortOrder === 'desc' ? `-${query?.sortBy || 'created'}` : `${query?.sortBy || 'created'}`,
        };
        if (filter) {
          options.filter = filter;
        }

        const response = await pb.collection('users').getList<User>(page, perPage, options);
        
        console.log('✅ Successfully fetched users:', response.items.length);
        
        return {
          items: response.items,
          pagination: {
            page: response.page,
            perPage: response.perPage,
            totalItems: response.totalItems,
            totalPages: response.totalPages
          }
        };
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // 返回空结果而不是抛出错误
        return {
          items: [],
          pagination: {
            page: 1,
            perPage: 20,
            totalItems: 0,
            totalPages: 0
          }
        };
      }
    },

    // 获取单个用户
    user: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('users').getOne<User>(id);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },

    // 获取用户统计信息
    userStats: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取用户统计信息
        const totalUsers = await pb.collection('users').getFullList<User>();
        
        const stats = {
          total: totalUsers.length,
          active: totalUsers.filter(u => u.status === 'active').length,
          inactive: totalUsers.filter(u => u.status === 'inactive').length,
          suspended: totalUsers.filter(u => u.status === 'suspended').length,
          verified: totalUsers.filter(u => u.verified).length,
          unverified: totalUsers.filter(u => !u.verified).length,
          admins: totalUsers.filter(u => u.role === 'admin').length,
          regular_users: totalUsers.filter(u => u.role === 'user').length,
          new_this_month: totalUsers.filter(u => {
            const created = new Date(u.created);
            const now = new Date();
            return created.getMonth() === now.getMonth() && 
                  created.getFullYear() === now.getFullYear();
          }).length
        };
        
        return stats;
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        return {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0,
          verified: 0,
          unverified: 0,
          admins: 0,
          regular_users: 0,
          new_this_month: 0
        };
      }
    },

    // 搜索用户
    async searchUsers (_: any, { keyword, limit }: { keyword: string; limit: number }, context: AuthContext) {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const users = await pb.collection('users').getFullList<User>({
          filter: `(email ~ "${keyword}" || name ~ "${keyword}")`,
          sort: '-created',
          $autoCancel: false
        });
        
        return users.slice(0, limit);
      } catch (error) {
        console.error('Failed to search users:', error);
        return [];
      }
    }
  },

  Mutation: {
    // 认证变更
    login: async (_: any, { input }: { input: { identity: string; password: string } }, context: AuthContext) => {
      try {
        console.log('🔐 Attempting login with:', input.identity);

        const authResult = await authService.login({
          identity: input.identity,
          password: input.password,
          deviceInfo: {
            deviceId: context.deviceInfo.deviceId || `web_${Date.now()}`,
            deviceType: 'desktop',
            ip: context.deviceInfo.ip,
            userAgent: context.deviceInfo.userAgent,
          },
        });
        if (authResult.success) {
          return {
            token: authResult.accessToken,
            refreshToken: authResult.refreshToken,
            record: authResult.user,
          };
        } else {
          return null;
        }

      } catch (error) {
        console.error('Failed to login:', error);
        return null;
      }
    },

    logout: async () => {
      try {
        const pb = pocketbaseClient.getClient();
        pb.authStore.clear();
        console.log('✅ Logout successful');
        return true;
      } catch (error) {
        console.error('Logout failed:', error);
        return false;
      }
    },

    // 创建用户
    createUser: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const user = await pb.collection('users').create<User>(input);
        console.log('✅ Successfully created user:', user.email);
        
        return user;
      } catch (error) {
        console.error('Failed to create user:', error);
        throw new Error('创建用户失败');
      }
    },

    // 更新用户
    updateUser: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const user = await pb.collection('users').update<User>(id, input);
        console.log('✅ Successfully updated user:', user.email);
        
        return user;
      } catch (error) {
        console.error('Failed to update user:', error);
        throw new Error('更新用户失败');
      }
    },

    // 删除用户
    deleteUser: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('users').delete(id);
        console.log('✅ Successfully deleted user:', id);
        
        return {
          success: true,
          message: '用户删除成功'
        };
      } catch (error) {
        console.error('Failed to delete user:', error);
        return {
          success: false,
          message: '删除用户失败'
        };
      }
    }
  }
};
