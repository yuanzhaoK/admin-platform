import { pocketbaseClient } from '../../config/pocketbase.ts';

// 移动端会员解析器
export const mobileMemberResolvers = {
  Query: {
    appMember: async (_: any, __: any, context: any) => {
      try {
        const pb = await pocketbaseClient.getClient();
        const userId = context.user?.id;
        
        if (!userId) {
          throw new Error('用户未登录');
        }

        const member = await pb.collection('members').getFirstListItem(
          `user = "${userId}"`,
          { expand: 'level' }
        );

        return member;
      } catch (error) {
        console.error('获取会员信息失败:', error);
        throw new Error('获取会员信息失败');
      }
    },

    appMemberAddresses: async (_: any, __: any, context: any) => {
      try {
        const pb = await pocketbaseClient.getClient();
        const userId = context.user?.id;
        
        if (!userId) {
          throw new Error('用户未登录');
        }

        const addresses = await pb.collection('addresses').getFullList({
          filter: `user = "${userId}"`,
          sort: '-is_default,-created',
        });

        return {
          addresses,
          total: addresses.length,
        };
      } catch (error) {
        console.error('获取用户地址失败:', error);
        throw new Error('获取用户地址失败');
      }
    },

    appMemberCart: async (_: any, __: any, context: any) => {
      try {
        const pb = await pocketbaseClient.getClient();
        const userId = context.user?.id;
        
        if (!userId) {
          throw new Error('用户未登录');
        }

        const cartItems = await pb.collection('cart_items').getFullList({
          filter: `user = "${userId}"`,
          expand: 'product',
          sort: '-created',
        });

        const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

        return {
          items: cartItems,
          total,
          item_count: cartItems.length,
        };
      } catch (error) {
        console.error('获取购物车失败:', error);
        throw new Error('获取购物车失败');
      }
    },

    memberOrders: async (_: any, { query }: any, context: any) => {
      try {
        const pb = await pocketbaseClient.getClient();
        const userId = context.user?.id;
        
        if (!userId) {
          throw new Error('用户未登录');
        }

        const page = query?.page || 1;
        const perPage = query?.perPage || 10;

        const orders = await pb.collection('orders').getList(page, perPage, {
          filter: `user = "${userId}"`,
          sort: '-created',
          expand: 'items.product',
        });

        return {
          items: orders.items,
          pagination: {
            page: orders.page,
            perPage: orders.perPage,
            totalItems: orders.totalItems,
            totalPages: orders.totalPages,
          },
        };
      } catch (error) {
        console.error('获取订单列表失败:', error);
        throw new Error('获取订单列表失败');
      }
    },
  },

  Mutation: {
    addAddress: async (_: any, { input }: any, context: any) => {
      try {
        const pb = await pocketbaseClient.getClient();
        const userId = context.user?.id;
        
        if (!userId) {
          throw new Error('用户未登录');
        }

        // 如果设置为默认地址，清除其他默认地址
        if (input.is_default) {
          const defaultAddresses = await pb.collection('addresses').getFullList({
            filter: `user = "${userId}" && is_default = true`,
          });
          
          for (const addr of defaultAddresses) {
            await pb.collection('addresses').update(addr.id, { is_default: false });
          }
        }

        const address = await pb.collection('addresses').create({
          ...input,
          user: userId,
          created: new Date().toISOString(),
        });

        return address;
      } catch (error) {
        console.error('添加地址失败:', error);
        throw new Error('添加地址失败');
      }
    },

    updateAddress: async (_: any, { id, input }: any, context: any) => {
      try {
        const pb = await pocketbaseClient.getClient();
        const userId = context.user?.id;
        
        if (!userId) {
          throw new Error('用户未登录');
        }

        // 验证地址属于当前用户
        const address = await pb.collection('addresses').getOne(id);
        if (address.user !== userId) {
          throw new Error('无权修改此地址');
        }

        // 如果设置为默认地址，清除其他默认地址
        if (input.is_default) {
          const defaultAddresses = await pb.collection('addresses').getFullList({
            filter: `user = "${userId}" && is_default = true && id != "${id}"`,
          });
          
          for (const addr of defaultAddresses) {
            await pb.collection('addresses').update(addr.id, { is_default: false });
          }
        }

        const updatedAddress = await pb.collection('addresses').update(id, {
          ...input,
          updated: new Date().toISOString(),
        });

        return updatedAddress;
      } catch (error) {
        console.error('更新地址失败:', error);
        throw new Error('更新地址失败');
      }
    },

    appDeleteAddress: async (_: any, { id }: any, context: any) => {
      try {
        const pb = await pocketbaseClient.getClient();
        const userId = context.user?.id;
        
        if (!userId) {
          throw new Error('用户未登录');
        }

        // 验证地址属于当前用户
        const address = await pb.collection('addresses').getOne(id);
        if (address.user !== userId) {
          throw new Error('无权删除此地址');
        }

        await pb.collection('addresses').delete(id);

        return { success: true, message: '地址删除成功' };
      } catch (error) {
        console.error('删除地址失败:', error);
        throw new Error('删除地址失败');
      }
    },
  },
};
