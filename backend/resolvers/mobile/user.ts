import { GraphQLError } from "https://deno.land/x/graphql_deno@v15.0.0/mod.ts";

import type { Member } from '../../types/member/member.ts';
import { pocketbaseClient } from '../../config/pocketbase.ts';

export const mobileUserResolvers = {
  Query: {
    appUser: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('members').getOne<Member>(id);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
      }
    },
    // 移动端用户信息
    appProfile: async (_parent: any, _args: any, context: any) => {
      try {
        const { user } = context;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const userProfile = await pb.collection('members').getOne(user.id);
        
        return {
          ...userProfile,
          identity: userProfile.email || userProfile.username,
          points: userProfile.points || 0,
          growth_value: userProfile.growth_value || 0,
          level: userProfile.level || 1,
          vip_status: userProfile.vip_status || 'normal',
          balance: userProfile.balance || 0,
        };
      } catch (error) {
        console.error('Error fetching app profile:', error);
        throw new GraphQLError('获取用户信息失败');
      }
    },
  },

  Mutation: {
    mobileLogin: async (_: any, { input }: { input: { identity: string; password: string } }) => {
      try {
        console.log('🔐 Attempting login with:', input.identity);
        const pb = pocketbaseClient.getClient();
        const authData = await pb.collection('members').authWithPassword(
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