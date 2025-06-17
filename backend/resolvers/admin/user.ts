import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { User } from '../../types/index.ts';

export const userResolvers = {
  Query: {
    // 用户查询
    users: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const users = await pb.collection('users').getFullList<User>();
        console.log('✅ Successfully fetched users:', users.length);
        return users;
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // 返回空数组而不是抛出错误，以符合 non-nullable schema
        return [];
      }
    },

    user: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('users').getOne<User>(id);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    }
  },

  Mutation: {
    // 认证变更
    login: async (_: any, { input }: { input: { identity: string; password: string } }) => {
      try {
        console.log('🔐 Attempting login with:', input.identity);
        
        // 直接使用 fetch 调用 PocketBase API
        const response = await fetch('http://localhost:8090/api/collections/_superusers/auth-with-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identity: input.identity, // 使用 identity 字段
            password: input.password
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ PocketBase API error:', response.status, errorText);
          throw new Error(`Authentication failed: ${response.status}`);
        }
        
        const authData = await response.json();
        console.log('✅ Login successful:', authData.record.email);
        
        if (!authData.token || !authData.record) {
          console.error('❌ Invalid response from PocketBase:', authData);
          throw new Error('Invalid response from authentication service');
        }
        
        return {
          token: authData.token,
          record: {
            id: authData.record.id,
            email: authData.record.email,
            name: authData.record.name || '',
            avatar: authData.record.avatar || '',
            role: 'admin', // 超级用户角色
            created: authData.record.created,
            updated: authData.record.updated,
            collectionId: authData.record.collectionId,
            collectionName: authData.record.collectionName,
            emailVisibility: authData.record.emailVisibility || false,
            verified: authData.record.verified || true
          }
        };
      } catch (error) {
        console.error('❌ Login failed with error:', error);
        // 确保抛出错误而不是返回null
        throw new Error(error instanceof Error ? error.message : 'Authentication failed');
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
  }
}; 