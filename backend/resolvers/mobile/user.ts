import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { User } from '../../types/index.ts';

export const mobileUserResolvers = {
  Query: {
    appUser: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('users').getOne<User>(id);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },
  },

  Mutation: {
    mobileLogin: async (_: any, { input }: { input: { identity: string; password: string } }) => {
      try {
        console.log('🔐 Attempting login with:', input.identity);
        const pb = pocketbaseClient.getClient();
        const authData = await pb.collection('users').authWithPassword(
          input.identity,
          input.password,
        );

        console.log('✅ Login successful:', authData.record.email);

        if (!pb.authStore.isValid || !pb.authStore.token) {
          console.error('❌ Invalid response from PocketBase:', authData, pb.authStore);
          throw new Error('Invalid response from authentication service');
        }

        return {
          token: pb.authStore.token,
          record: {
            id: authData.record.id,
            identity: authData.record.email,
            email: authData.record.email,
            username: authData.record.username || '',
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
  },
};