import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { Order, OrderQuery, OrderStats } from '../../types/index.ts';

export const orderResolvers = {
  Query: {
    orders: async (_: any, { query }: { query?: OrderQuery }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const page = query?.page || 1;
        const perPage = query?.perPage || 20;
        
        const filters: string[] = [];
        if (query?.status) filters.push(`status="${query.status}"`);
        if (query?.payment_method) filters.push(`payment_method="${query.payment_method}"`);
        if (query?.order_source) filters.push(`order_source="${query.order_source}"`);
        if (query?.order_type) filters.push(`order_type="${query.order_type}"`);
        if (query?.user_id) filters.push(`user_id="${query.user_id}"`);
        if (query?.search) {
          filters.push(`(order_number~"${query.search}" || user_id.email~"${query.search}" || user_id.name~"${query.search}")`);
        }
        
        const options: any = {
          expand: 'user_id'
        };
        
        if (filters.length > 0) {
          options.filter = filters.join(' && ');
        }
        
        if (query?.sortBy) {
          const sortOrder = query.sortOrder === 'asc' ? '' : '-';
          options.sort = `${sortOrder}${query.sortBy}`;
        } else {
          options.sort = '-id';
        }
        
        const result = await pb.collection('orders').getList<Order>(page, perPage, options);
        
        return {
          items: result.items,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            total: result.totalItems,
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            hasNext: result.page < result.totalPages,
            hasPrev: result.page > 1
          }
        };
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        throw new Error('Failed to fetch orders');
      }
    },

    order: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('orders').getOne<Order>(id, {
          expand: 'user_id'
        });
      } catch (error) {
        console.error('Failed to fetch order:', error);
        return null;
      }
    },

    orderStats: async (): Promise<OrderStats> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const orders = await pb.collection('orders').getFullList<Order>();
        
        const stats: OrderStats = {
          total: orders.length,
          pending_payment: 0,
          paid: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          completed: 0,
          cancelled: 0,
          refunding: 0,
          refunded: 0,
          total_amount: 0,
          avg_amount: 0,
          payment_methods: {},
          order_sources: {},
          order_types: {}
        };

        let totalAmount = 0;

        orders.forEach(order => {
          // 统计状态
          const status = order.status.toLowerCase().replace(/\s+/g, '_');
          if (stats.hasOwnProperty(status)) {
            (stats as any)[status]++;
          }
          
          // 统计金额
          if (order.total_amount) {
            totalAmount += order.total_amount;
          }
          
          // 统计支付方式
          if (order.payment_method) {
            stats.payment_methods[order.payment_method] = (stats.payment_methods[order.payment_method] || 0) + 1;
          }
          
          // 统计订单来源
          if (order.order_source) {
            stats.order_sources[order.order_source] = (stats.order_sources[order.order_source] || 0) + 1;
          }
          
          // 统计订单类型
          if (order.order_type) {
            stats.order_types[order.order_type] = (stats.order_types[order.order_type] || 0) + 1;
          }
        });

        stats.total_amount = totalAmount;
        stats.avg_amount = orders.length > 0 ? totalAmount / orders.length : 0;

        return stats;
      } catch (error) {
        console.error('Failed to fetch order stats:', error);
        throw new Error('Failed to fetch order stats');
      }
    },
  },

  Mutation: {
    updateOrderStatus: async (_: any, { id, status, notes }: { id: string; status: string; notes?: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const updateData: any = { status };
        if (notes) updateData.notes = notes;
        
        if (status === '已发货') {
          updateData.shipped_at = new Date().toISOString();
        } else if (status === '已送达') {
          updateData.delivered_at = new Date().toISOString();
        }
        
        return await pb.collection('orders').update<Order>(id, updateData);
      } catch (error) {
        console.error('Failed to update order status:', error);
        throw new Error('Failed to update order status');
      }
    },

    updateOrderLogistics: async (_: any, { id, logistics }: { id: string; logistics: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('orders').update<Order>(id, {
          logistics_info: logistics
        });
      } catch (error) {
        console.error('Failed to update order logistics:', error);
        throw new Error('Failed to update order logistics');
      }
    },
  }
}; 