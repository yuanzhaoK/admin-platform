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
        const pb = pocketbaseClient.getClient();
        const authData = await pb.collection('_superusers').authWithPassword(
          input.identity,
          input.password,
        );

        console.log('✅ Login successful:', authData.record.email);

        if (!pb.authStore.isValid || !pb.authStore.token) {
          console.error('❌ Invalid response from PocketBase:', authData);
          throw new Error('Invalid response from authentication service');
        }

        return {
          token: pb.authStore.token,
          record: {
            id: authData.record.id,
            email: authData.record.email,
            name: authData.record.name || '',
            avatar: authData.record.avatar || '',
            role: pb.authStore.isSuperuser ? 'admin' : 'user', // 超级用户角色
            created: authData.record.created,
            updated: authData.record.updated,
            collectionId: authData.record.collectionId,
            collectionName: authData.record.collectionName,
            emailVisibility: authData.record.emailVisibility || false,
            verified: authData.record.verified || true
          }
        };
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
  }
}; 